import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;

// Validates and extracts the 32-byte AES key from environment variables.
const getEncryptionKey = () => {
    const keyHex = process.env.TOKEN_ENCRYPTION_KEY;

    if (!keyHex || typeof keyHex !== "string") {
        throw new Error("TOKEN_ENCRYPTION_KEY is required and must be defined in environment variables.");
    }

    const trimmedKey = keyHex.trim();

    if (!/^[0-9a-fA-F]{64}$/.test(trimmedKey)) {
        throw new Error("TOKEN_ENCRYPTION_KEY must be a valid 64-character hexadecimal string (32 bytes).");
    }

    return Buffer.from(trimmedKey, "hex");
};

// Encrypts plain text using AES-256-GCM with a unique 12-byte IV per encryption.
const encryptToken = (plainText) => {
    if (typeof plainText !== "string" || plainText.length === 0) {
        throw new Error("Invalid input: plainText must be a non-empty string.");
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let content = cipher.update(plainText, "utf8", "hex");
    content += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return {
        iv: iv.toString("hex"),
        content,
        tag: tag.toString("hex")
    };
};

// Decrypts ciphertext using AES-256-GCM and verifies the authentication tag.
const decryptToken = (encryptedData) => {
    if (!encryptedData || typeof encryptedData !== "object" || Array.isArray(encryptedData)) {
        throw new Error("Invalid input: encryptedData must be an object with iv, content, and tag.");
    }

    const { iv, content, tag } = encryptedData;

    if (typeof iv !== "string" || !/^[0-9a-fA-F]{24}$/.test(iv.trim())) {
        throw new Error("Invalid encryptedData: iv must be a 24-character hexadecimal string (12 bytes).");
    }

    if (typeof content !== "string" || content.trim().length === 0 || !/^[0-9a-fA-F]+$/.test(content.trim())) {
        throw new Error("Invalid encryptedData: content must be a non-empty hexadecimal string.");
    }

    if (typeof tag !== "string" || !/^[0-9a-fA-F]{32}$/.test(tag.trim())) {
        throw new Error("Invalid encryptedData: tag must be a 32-character hexadecimal string (16 bytes).");
    }

    const key = getEncryptionKey();

    try {
        const decipher = crypto.createDecipheriv(
            ALGORITHM,
            key,
            Buffer.from(iv.trim(), "hex")
        );

        decipher.setAuthTag(Buffer.from(tag.trim(), "hex"));

        let decrypted = decipher.update(content.trim(), "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        throw new Error("Decryption failed: Authentication tag verification failed or ciphertext has been tampered with.");
    }
};

export {
    encryptToken,
    decryptToken
};
