import crypto from "crypto";
import mongoose from "mongoose";
import InstagramOAuthState from "./instagramOAuthState.model.js";

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const STATE_PURPOSE_TAG = "instagram-oauth-state-signing-key-v1";
const MAX_STATE_STRING_LENGTH = 512;
const HEX_64_REGEX = /^[0-9a-fA-F]{64}$/;

// Securely derives a dedicated HMAC key for state signing without reusing TOKEN_ENCRYPTION_KEY.
const getSigningSecret = () => {
    if (process.env.OAUTH_STATE_SECRET && process.env.OAUTH_STATE_SECRET.trim().length >= 32) {
        return Buffer.from(process.env.OAUTH_STATE_SECRET.trim(), "utf8");
    }

    const masterSecret = process.env.ACCESS_TOKEN_SECRET;

    if (!masterSecret) {
        throw new Error("Unable to derive OAuth state signing key: ACCESS_TOKEN_SECRET is missing.");
    }

    // Derives a dedicated 32-byte key specifically scoped to Instagram OAuth state signing.
    return crypto
        .createHmac("sha256", masterSecret)
        .update(STATE_PURPOSE_TAG)
        .digest();
};

// Generates a cryptographically random, signed OAuth state and records it in MongoDB.
const generateOAuthState = async (creatorId, origin = "settings") => {
    if (!creatorId) {
        throw new Error("Invalid creatorId: creatorId is required to generate OAuth state.");
    }

    const creatorIdStr = creatorId.toString().trim();

    if (!mongoose.Types.ObjectId.isValid(creatorIdStr)) {
        throw new Error("Invalid creatorId: creatorId must be a valid MongoDB ObjectId.");
    }

    const cleanOrigin = origin === "onboarding" ? "onboarding" : "settings";

    // 1. Validate signing configuration BEFORE touching the database.
    // If the signing secret is invalid or missing, this throws immediately without leaving orphan records.
    const signingSecret = getSigningSecret();

    // 2. Generate 32 bytes (64 hex characters) of cryptographically secure randomness.
    const rawNonce = crypto.randomBytes(32).toString("hex");

    // 3. Hash nonce with SHA-256 for persistent database indexing.
    const nonceHash = crypto
        .createHash("sha256")
        .update(rawNonce)
        .digest("hex");

    // 4. Set strict 10-minute expiry timestamp.
    const expiresAt = new Date(Date.now() + STATE_TTL_MS);

    // 5. Persist state transaction in MongoDB with isConsumed: false.
    await InstagramOAuthState.create({
        creator: creatorIdStr,
        nonceHash,
        expiresAt,
        isConsumed: false
    });

    // 6. Build state payload.
    const payload = {
        c: creatorIdStr,
        n: rawNonce,
        exp: expiresAt.getTime(),
        o: cleanOrigin
    };

    // 7. Sign the canonical string representation with HMAC-SHA256.
    const serializedPayload = `${payload.c}:${payload.n}:${payload.exp}:${payload.o}`;
    const signature = crypto
        .createHmac("sha256", signingSecret)
        .update(serializedPayload)
        .digest("hex");

    // 8. Return URL-safe base64 string.
    return Buffer.from(
        JSON.stringify({
            ...payload,
            sig: signature
        }),
        "utf8"
    ).toString("base64url");
};

// Validates, verifies signature, and atomically consumes an incoming OAuth state string.
const consumeOAuthState = async (stateString) => {
    // 1. Guard against missing or excessively long state strings.
    if (typeof stateString !== "string" || stateString.trim().length === 0) {
        throw new Error("Invalid OAuth state: state parameter is missing or empty.");
    }

    const trimmedState = stateString.trim();

    if (trimmedState.length > MAX_STATE_STRING_LENGTH) {
        throw new Error("Invalid OAuth state: state parameter exceeds maximum allowed length.");
    }

    if (!/^[A-Za-z0-9_-]+$/.test(trimmedState)) {
        throw new Error("Malformed OAuth state parameter.");
    }

    // 2. Decode base64url payload.
    let parsedState;
    try {
        const decodedJson = Buffer.from(trimmedState, "base64url").toString("utf8");
        parsedState = JSON.parse(decodedJson);
    } catch {
        throw new Error("Malformed OAuth state parameter.");
    }

    if (!parsedState || typeof parsedState !== "object" || Array.isArray(parsedState)) {
        throw new Error("Invalid OAuth state: state payload must be a JSON object.");
    }

    const { c: creatorId, n: rawNonce, exp: expiresAtTime, o: rawOrigin, sig: signature } = parsedState;
    const origin = rawOrigin === "onboarding" ? "onboarding" : "settings";

    // 3. Strict field validations.
    if (!creatorId || typeof creatorId !== "string" || !mongoose.Types.ObjectId.isValid(creatorId.trim())) {
        throw new Error("Invalid OAuth state: creatorId must be a valid MongoDB ObjectId.");
    }

    if (!rawNonce || typeof rawNonce !== "string" || !HEX_64_REGEX.test(rawNonce.trim())) {
        throw new Error("Invalid OAuth state: rawNonce must be exactly 64 hexadecimal characters.");
    }

    if (!signature || typeof signature !== "string" || !HEX_64_REGEX.test(signature.trim())) {
        throw new Error("Invalid OAuth state: signature must be exactly 64 hexadecimal characters.");
    }

    if (typeof expiresAtTime !== "number" || !Number.isSafeInteger(expiresAtTime)) {
        throw new Error("Invalid OAuth state: expiresAt must be a valid safe integer timestamp.");
    }

    // 4. Reject expired states (current time >= expiry).
    const now = Date.now();
    if (now >= expiresAtTime) {
        throw new Error("OAuth state has expired. Please initiate Instagram connection again.");
    }

    // 5. Verify HMAC signature in constant time (supports both origin-scoped and legacy payloads).
    const signingSecret = getSigningSecret();
    const serializedPayloadWithOrigin = `${creatorId.trim()}:${rawNonce.trim()}:${expiresAtTime}:${origin}`;
    const serializedPayloadLegacy = `${creatorId.trim()}:${rawNonce.trim()}:${expiresAtTime}`;

    const serializedPayload = rawOrigin ? serializedPayloadWithOrigin : serializedPayloadLegacy;
    const expectedSignature = crypto
        .createHmac("sha256", signingSecret)
        .update(serializedPayload)
        .digest("hex");

    const providedSigBuffer = Buffer.from(signature.trim(), "hex");
    const expectedSigBuffer = Buffer.from(expectedSignature, "hex");

    if (
        providedSigBuffer.length !== expectedSigBuffer.length ||
        !crypto.timingSafeEqual(providedSigBuffer, expectedSigBuffer)
    ) {
        throw new Error("Invalid OAuth state signature. Potential CSRF or tampering detected.");
    }

    // 6. Compute nonce hash to locate MongoDB record.
    const nonceHash = crypto
        .createHash("sha256")
        .update(rawNonce.trim())
        .digest("hex");

    // 7. Atomically find and consume the state document.
    const consumedState = await InstagramOAuthState.findOneAndUpdate(
        {
            nonceHash,
            creator: creatorId.trim(),
            isConsumed: false,
            expiresAt: { $gt: new Date() }
        },
        {
            $set: {
                isConsumed: true,
                consumedAt: new Date()
            }
        },
        {
            returnDocument: "after"
        }
    );

    // 8. If atomic update failed, determine the exact security violation.
    if (!consumedState) {
        const existingRecord = await InstagramOAuthState.findOne({ nonceHash });

        if (existingRecord && existingRecord.isConsumed) {
            throw new Error("OAuth state has already been consumed (replay attack detected).");
        }

        if (existingRecord && existingRecord.expiresAt <= new Date()) {
            throw new Error("OAuth state has expired in database.");
        }

        throw new Error("OAuth state not found or unauthorized for this creator.");
    }

    return {
        creatorId: consumedState.creator.toString(),
        origin
    };
};

/**
 * Cryptographically verifies the signature on an OAuth state string and extracts the origin
 * ('onboarding' or 'settings') without consuming the state from the database.
 * If the signature is invalid, tampered, or missing, safely defaults to 'settings'.
 */
const getVerifiedOriginFromState = (stateString) => {
    if (!stateString || typeof stateString !== "string") return "settings";
    try {
        const decodedJson = Buffer.from(stateString.trim(), "base64url").toString("utf8");
        const parsed = JSON.parse(decodedJson);
        if (!parsed || !parsed.c || !parsed.n || !parsed.exp || !parsed.sig) return "settings";
        const origin = parsed.o === "onboarding" ? "onboarding" : "settings";
        const signingSecret = getSigningSecret();
        const payloadWithOrigin = `${parsed.c.trim()}:${parsed.n.trim()}:${parsed.exp}:${origin}`;
        const payloadLegacy = `${parsed.c.trim()}:${parsed.n.trim()}:${parsed.exp}`;
        const serialized = parsed.o ? payloadWithOrigin : payloadLegacy;
        const expectedSig = crypto.createHmac("sha256", signingSecret).update(serialized).digest("hex");
        const sigBuf = Buffer.from(parsed.sig.trim(), "hex");
        const expBuf = Buffer.from(expectedSig, "hex");
        if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
            return origin;
        }
    } catch {}
    return "settings";
};

export {
    getSigningSecret,
    generateOAuthState,
    consumeOAuthState,
    getVerifiedOriginFromState
};
