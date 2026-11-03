import Auth from "../auth/auth.model.js";
import BrandProfile from "../brand/profile/profile.model.js";
import Subscription from "./subscription.model.js";

// Common public/free consumer email domains to disregard when checking duplicate corporate identity
const PUBLIC_EMAIL_DOMAINS = new Set([
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.co.in",
    "yahoo.co.uk",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "me.com",
    "mac.com",
    "proton.me",
    "protonmail.com",
    "zoho.com",
    "aol.com",
    "mail.com",
    "gmx.com",
    "yandex.com"
]);

/**
 * Normalizes email or website URL to a clean domain hostname.
 * @param {string} input - Email or website URL
 * @returns {string|null} - Normalized domain (e.g. "acme.com") or null
 */
export const extractDomain = (input) => {
    if (!input || typeof input !== "string") return null;
    const trimmed = input.trim().toLowerCase();

    // If input is an email address
    if (trimmed.includes("@")) {
        const parts = trimmed.split("@");
        const domain = parts[parts.length - 1];
        return domain ? domain.trim() : null;
    }

    // If input is a URL or bare hostname
    try {
        const withProtocol = trimmed.startsWith("http://") || trimmed.startsWith("https://")
            ? trimmed
            : `https://${trimmed}`;
        const parsed = new URL(withProtocol);
        let hostname = parsed.hostname;
        if (hostname.startsWith("www.")) {
            hostname = hostname.slice(4);
        }
        return hostname || null;
    } catch {
        return null;
    }
};

/**
 * Normalizes company name for fuzzy comparison (lowercase alphanumeric only).
 * @param {string} name - Company name
 * @returns {string} - Alphanumeric string
 */
export const normalizeCompanyName = (name) => {
    if (!name || typeof name !== "string") return "";
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
};

/**
 * Evaluates business identity signals to detect potential trial abuse / duplicate brands.
 * In accordance with CreatorLink business policy:
 * 1. Genuine businesses are NEVER automatically rejected (isEligible always remains true).
 * 2. Multi-signal checks are performed: corporate email domain, website domain, company name.
 * 3. Does not rely on email alone and ignores public email providers.
 * 4. Flags potential duplicate cases with matched signals for Admin review.
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.brandId - Current brand user ID
 * @param {string} [params.email] - Brand account email
 * @param {string} [params.companyName] - Brand company name
 * @param {string} [params.website] - Brand website URL
 * @returns {Promise<{ isEligible: boolean, isFlagged: boolean, matchedSignals: string[], potentialDuplicateBrandIds: string[] }>}
 */
export const evaluateTrialEligibility = async ({ brandId, email, companyName, website }) => {
    const matchedSignals = [];
    const potentialDuplicateBrandIds = new Set();

    // 1. Check corporate email domain (ignoring public providers like gmail, yahoo, etc.)
    const emailDomain = extractDomain(email);
    if (emailDomain && !PUBLIC_EMAIL_DOMAINS.has(emailDomain)) {
        const emailRegex = new RegExp(`@${emailDomain.replace(/\./g, "\\.")}$`, "i");
        const matchingAuths = await Auth.find({
            _id: { $ne: brandId },
            role: "brand",
            email: emailRegex
        }).select("_id email").lean();

        if (matchingAuths.length > 0) {
            const matchIds = matchingAuths.map((a) => a._id);
            const priorSubs = await Subscription.find({
                brand: { $in: matchIds }
            }).select("brand status").lean();

            if (priorSubs.length > 0) {
                matchedSignals.push(`Duplicate corporate email domain: @${emailDomain}`);
                priorSubs.forEach((sub) => potentialDuplicateBrandIds.add(sub.brand.toString()));
            }
        }
    }

    // 2. Check website domain if available
    const websiteDomain = extractDomain(website);
    if (websiteDomain) {
        const websiteRegex = new RegExp(websiteDomain.replace(/\./g, "\\."), "i");
        const matchingProfiles = await BrandProfile.find({
            user: { $ne: brandId },
            website: websiteRegex
        }).select("user website companyName").lean();

        if (matchingProfiles.length > 0) {
            const matchUserIds = matchingProfiles.map((p) => p.user);
            const priorSubs = await Subscription.find({
                brand: { $in: matchUserIds }
            }).select("brand status").lean();

            if (priorSubs.length > 0) {
                matchedSignals.push(`Duplicate business website domain: ${websiteDomain}`);
                priorSubs.forEach((sub) => potentialDuplicateBrandIds.add(sub.brand.toString()));
            }
        }
    }

    // 3. Check normalized company name if provided and meaningful (>= 4 chars)
    const normalizedName = normalizeCompanyName(companyName);
    if (normalizedName && normalizedName.length >= 4) {
        const matchingProfiles = await BrandProfile.find({
            user: { $ne: brandId }
        }).select("user companyName").lean();

        for (const prof of matchingProfiles) {
            if (prof.companyName && normalizeCompanyName(prof.companyName) === normalizedName) {
                const subExists = await Subscription.exists({ brand: prof.user });
                if (subExists) {
                    matchedSignals.push(`Duplicate company name: "${companyName.trim()}"`);
                    potentialDuplicateBrandIds.add(prof.user.toString());
                    break;
                }
            }
        }
    }

    const isFlagged = matchedSignals.length > 0;

    return {
        isEligible: true, // Genuine businesses are never blocked automatically
        isFlagged,
        matchedSignals,
        potentialDuplicateBrandIds: Array.from(potentialDuplicateBrandIds)
    };
};

export default {
    extractDomain,
    normalizeCompanyName,
    evaluateTrialEligibility
};

