import mongoose from "mongoose";
import ContactUnlock from "./contactUnlock.model.js";
import Subscription from "./subscription.model.js";
import CreatorProfile from "../creator/profile/profile.model.js";
import Auth from "../auth/auth.model.js";
import { evaluateBrandEntitlement } from "./entitlement.service.js";
import createApiError from "../../utils/ApiError.js";

/**
 * Normalizes creator identifier to the Creator Auth ID.
 * Supports passing either Creator Auth ID or CreatorProfile ID.
 * 
 * @param {string|ObjectId} creatorId
 * @returns {Promise<mongoose.Types.ObjectId>}
 */
export const resolveCreatorAuthId = async (creatorId) => {
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
        throw createApiError(400, "Invalid creator ID format");
    }

    const objId = new mongoose.Types.ObjectId(creatorId);

    // 1. Check if objId is an Auth user with role 'creator'
    const creatorUser = await Auth.findOne({ _id: objId, role: "creator" }).select("_id role");
    if (creatorUser) {
        return creatorUser._id;
    }

    // 2. Check if objId is a CreatorProfile document
    const creatorProfile = await CreatorProfile.findById(objId).select("user");
    if (creatorProfile && creatorProfile.user) {
        return creatorProfile.user;
    }

    throw createApiError(404, "Creator not found");
};

/**
 * Filters creator contact information according to live consent settings.
 * If consent is false or revoked, hides contact details.
 * 
 * @param {Object} contactPrivacy - CreatorProfile.contactPrivacy subdocument
 * @returns {Object} { isConsentGiven, contactDetails }
 */
export const filterContactDetailsByConsent = (contactPrivacy = {}) => {
    const isConsentGiven = Boolean(contactPrivacy?.isConsentGiven);

    if (!isConsentGiven) {
        return {
            isConsentGiven: false,
            contactDetails: null,
            message: "Creator has not opted in to direct contact sharing or has revoked consent."
        };
    }

    return {
        isConsentGiven: true,
        contactDetails: {
            whatsappNumber: contactPrivacy.allowWhatsApp ? contactPrivacy.whatsappNumber || null : null,
            businessPhone: contactPrivacy.allowPhoneCall ? contactPrivacy.businessPhone || null : null,
            businessEmail: contactPrivacy.allowBusinessEmail ? contactPrivacy.businessEmail || null : null,
            allowedChannels: {
                whatsApp: Boolean(contactPrivacy.allowWhatsApp),
                phoneCall: Boolean(contactPrivacy.allowPhoneCall),
                businessEmail: Boolean(contactPrivacy.allowBusinessEmail)
            }
        },
        message: "Contact details retrieved successfully."
    };
};

/**
 * Checks whether a Brand has unlocked a Creator and returns consent-aware contact details.
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.brandId
 * @param {string|ObjectId} params.creatorId
 * @returns {Promise<Object>}
 */
export const checkCreatorUnlockStatusService = async ({ brandId, creatorId }) => {
    const creatorAuthId = await resolveCreatorAuthId(creatorId);

    const existingUnlock = await ContactUnlock.findOne({
        brand: brandId,
        creator: creatorAuthId
    });

    const creatorProfile = await CreatorProfile.findOne({ user: creatorAuthId }).select("contactPrivacy user");

    if (!existingUnlock) {
        const entitlement = await evaluateBrandEntitlement(brandId);
        return {
            isUnlocked: false,
            canUnlock: entitlement.canUnlockCreator,
            remainingQuota: entitlement.remainingContactQuota,
            hasConsent: Boolean(creatorProfile?.contactPrivacy?.isConsentGiven),
            contactDetails: null
        };
    }

    const consentEvaluation = filterContactDetailsByConsent(creatorProfile?.contactPrivacy);

    return {
        isUnlocked: true,
        unlockedAt: existingUnlock.unlockedAt,
        quotaPeriodKey: existingUnlock.quotaPeriodKey,
        ...consentEvaluation
    };
};

/**
 * Unlocks a Creator's contact information for a Brand.
 * Enforces all business rules:
 * 1. Checks if already unlocked: if already unlocked, consumes NO quota and returns details.
 * 2. Checks active subscription entitlement.
 * 3. Atomic reservation: safely handles concurrent requests without quota overspending.
 * 4. Respects live Creator consent at response time.
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.brandId - Authenticated Brand user ID
 * @param {string|ObjectId} params.creatorId - Target Creator ID
 * @returns {Promise<Object>}
 */
export const unlockCreatorContactService = async ({ brandId, creatorId }) => {
    if (!brandId) {
        throw createApiError(401, "Authentication required");
    }

    const creatorAuthId = await resolveCreatorAuthId(creatorId);

    // 1. Check existing unlock record (Permanent unlock rule: repeated unlock never consumes quota)
    const existingUnlock = await ContactUnlock.findOne({
        brand: brandId,
        creator: creatorAuthId
    });

    const creatorProfile = await CreatorProfile.findOne({ user: creatorAuthId }).select("contactPrivacy user");
    if (!creatorProfile) {
        throw createApiError(404, "Creator profile not found");
    }

    if (existingUnlock) {
        const consentEvaluation = filterContactDetailsByConsent(creatorProfile.contactPrivacy);
        return {
            isNewUnlock: false,
            alreadyUnlocked: true,
            unlockedAt: existingUnlock.unlockedAt,
            quotaPeriodKey: existingUnlock.quotaPeriodKey,
            ...consentEvaluation
        };
    }

    // 2. Validate Brand Entitlement & Quota Availability
    const entitlement = await evaluateBrandEntitlement(brandId);
    if (!entitlement.hasEntitlement) {
        throw createApiError(
            403,
            `An active subscription or free trial is required to unlock creator contact details. ${entitlement.reason}`
        );
    }

    if (entitlement.remainingContactQuota <= 0) {
        throw createApiError(
            403,
            "Contact unlock quota exhausted. Please upgrade your subscription plan or wait for your monthly quota reset."
        );
    }

    // 3. Determine Quota Period Key
    const isTrial = entitlement.isTrial;
    const now = new Date();
    const quotaPeriodKey = isTrial
        ? "trial"
        : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    // 4. Atomic Quota Reservation & Ledger Entry
    // We attempt a transaction if supported, with graceful atomic fallback
    let unlockRecord = null;
    let session = null;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // Atomically increment quota with concurrency ceiling check
        let updatedSubscription = null;
        if (isTrial) {
            updatedSubscription = await Subscription.findOneAndUpdate(
                {
                    brand: brandId,
                    "quotaState.trialQuotaUsed": { $lt: entitlement.totalContactQuota }
                },
                {
                    $inc: { "quotaState.trialQuotaUsed": 1 }
                },
                { session, returnDocument: "after" }
            );
        } else {
            updatedSubscription = await Subscription.findOneAndUpdate(
                {
                    brand: brandId,
                    "quotaState.monthlyQuotaUsed": { $lt: entitlement.totalContactQuota }
                },
                {
                    $inc: { "quotaState.monthlyQuotaUsed": 1 }
                },
                { session, returnDocument: "after" }
            );
        }

        if (!updatedSubscription) {
            await session.abortTransaction();
            throw createApiError(
                403,
                "Contact unlock quota exhausted by a concurrent request. Please upgrade to continue unlocking creators."
            );
        }

        // Insert ContactUnlock record inside transaction
        const [created] = await ContactUnlock.create(
            [
                {
                    brand: brandId,
                    creator: creatorAuthId,
                    subscription: entitlement.subscription._id,
                    quotaPeriodKey,
                    revealedChannels: {
                        whatsapp: Boolean(creatorProfile.contactPrivacy?.allowWhatsApp),
                        phone: Boolean(creatorProfile.contactPrivacy?.allowPhoneCall),
                        email: Boolean(creatorProfile.contactPrivacy?.allowBusinessEmail)
                    },
                    unlockedAt: now
                }
            ],
            { session }
        );
        unlockRecord = created;

        await session.commitTransaction();
    } catch (txError) {
        if (session && session.inTransaction()) {
            await session.abortTransaction();
        }

        // Handle duplicate key error (code 11000): parallel request for same creator succeeded
        if (txError.code === 11000) {
            const found = await ContactUnlock.findOne({ brand: brandId, creator: creatorAuthId });
            if (found) {
                const consentEvaluation = filterContactDetailsByConsent(creatorProfile.contactPrivacy);
                return {
                    isNewUnlock: false,
                    alreadyUnlocked: true,
                    unlockedAt: found.unlockedAt,
                    quotaPeriodKey: found.quotaPeriodKey,
                    ...consentEvaluation
                };
            }
        }

        // If transactions aren't supported on standalone engine, fallback to atomic update with manual rollback
        if (txError.message && (txError.message.includes("Transaction numbers are only allowed") || txError.message.includes("replica set"))) {
            return await executeAtomicUnlockFallback({
                brandId,
                creatorAuthId,
                isTrial,
                entitlement,
                quotaPeriodKey,
                creatorProfile,
                now
            });
        }

        throw txError;
    } finally {
        if (session) {
            await session.endSession();
        }
    }

    // 5. Return live consent-aware contact details
    const consentEvaluation = filterContactDetailsByConsent(creatorProfile.contactPrivacy);

    return {
        isNewUnlock: true,
        alreadyUnlocked: false,
        unlockedAt: unlockRecord.unlockedAt,
        quotaPeriodKey: unlockRecord.quotaPeriodKey,
        ...consentEvaluation
    };
};

/**
 * Atomic fallback algorithm for standalone MongoDB engines that do not support multi-document transactions.
 */
async function executeAtomicUnlockFallback({
    brandId,
    creatorAuthId,
    isTrial,
    entitlement,
    quotaPeriodKey,
    creatorProfile,
    now
}) {
    let updatedSubscription = null;
    if (isTrial) {
        updatedSubscription = await Subscription.findOneAndUpdate(
            {
                brand: brandId,
                "quotaState.trialQuotaUsed": { $lt: entitlement.totalContactQuota }
            },
            {
                $inc: { "quotaState.trialQuotaUsed": 1 }
            },
            { returnDocument: "after" }
        );
    } else {
        updatedSubscription = await Subscription.findOneAndUpdate(
            {
                brand: brandId,
                "quotaState.monthlyQuotaUsed": { $lt: entitlement.totalContactQuota }
            },
            {
                $inc: { "quotaState.monthlyQuotaUsed": 1 }
            },
            { returnDocument: "after" }
        );
    }

    if (!updatedSubscription) {
        throw createApiError(403, "Contact unlock quota exhausted. Please upgrade to continue unlocking creators.");
    }

    try {
        const unlockRecord = await ContactUnlock.create({
            brand: brandId,
            creator: creatorAuthId,
            subscription: entitlement.subscription._id,
            quotaPeriodKey,
            revealedChannels: {
                whatsapp: Boolean(creatorProfile.contactPrivacy?.allowWhatsApp),
                phone: Boolean(creatorProfile.contactPrivacy?.allowPhoneCall),
                email: Boolean(creatorProfile.contactPrivacy?.allowBusinessEmail)
            },
            unlockedAt: now
        });

        const consentEvaluation = filterContactDetailsByConsent(creatorProfile.contactPrivacy);
        return {
            isNewUnlock: true,
            alreadyUnlocked: false,
            unlockedAt: unlockRecord.unlockedAt,
            quotaPeriodKey: unlockRecord.quotaPeriodKey,
            ...consentEvaluation
        };
    } catch (createErr) {
        // Rollback quota increment on failure or duplicate key
        if (isTrial) {
            await Subscription.updateOne(
                { brand: brandId },
                { $inc: { "quotaState.trialQuotaUsed": -1 } }
            );
        } else {
            await Subscription.updateOne(
                { brand: brandId },
                { $inc: { "quotaState.monthlyQuotaUsed": -1 } }
            );
        }

        if (createErr.code === 11000) {
            const found = await ContactUnlock.findOne({ brand: brandId, creator: creatorAuthId });
            const consentEvaluation = filterContactDetailsByConsent(creatorProfile.contactPrivacy);
            return {
                isNewUnlock: false,
                alreadyUnlocked: true,
                unlockedAt: found?.unlockedAt || now,
                quotaPeriodKey: found?.quotaPeriodKey || quotaPeriodKey,
                ...consentEvaluation
            };
        }
        throw createErr;
    }
}

/**
 * Retrieves all creators unlocked by the authenticated Brand.
 * 
 * @param {string|ObjectId} brandId
 * @returns {Promise<Array>}
 */
export const getBrandUnlockedCreatorsService = async (brandId) => {
    const unlocks = await ContactUnlock.find({ brand: brandId })
        .populate({
            path: "creator",
            select: "name email isVerified"
        })
        .sort({ unlockedAt: -1 })
        .lean();

    const creatorAuthIds = unlocks.map((u) => u.creator?._id).filter(Boolean);

    const profiles = await CreatorProfile.find({ user: { $in: creatorAuthIds } })
        .select("user title category location profileImage socialLinks followerCount contactPrivacy isVerifiedBadge")
        .lean();

    const profileMap = new Map();
    profiles.forEach((p) => {
        profileMap.set(p.user.toString(), p);
    });

    return unlocks.map((unlock) => {
        const creatorIdStr = unlock.creator?._id?.toString();
        const profile = profileMap.get(creatorIdStr) || {};
        const consentData = filterContactDetailsByConsent(profile.contactPrivacy);

        return {
            unlockId: unlock._id,
            unlockedAt: unlock.unlockedAt,
            quotaPeriodKey: unlock.quotaPeriodKey,
            creator: {
                _id: unlock.creator?._id,
                name: unlock.creator?.name,
                isVerified: unlock.creator?.isVerified,
                isVerifiedBadge: profile.isVerifiedBadge,
                title: profile.title,
                category: profile.category,
                location: profile.location,
                profileImage: profile.profileImage,
                socialLinks: profile.socialLinks,
                followerCount: profile.followerCount
            },
            ...consentData
        };
    });
};

/**
 * Updates Creator's contact privacy and sharing consent settings.
 * 
 * @param {string|ObjectId} creatorAuthId
 * @param {Object} consentData
 * @returns {Promise<Object>}
 */
export const updateCreatorContactConsentService = async (creatorAuthId, consentData = {}) => {
    const profile = await CreatorProfile.findOne({ user: creatorAuthId });
    if (!profile) {
        throw createApiError(404, "Creator profile not found");
    }

    const {
        isConsentGiven,
        allowWhatsApp,
        allowPhoneCall,
        allowBusinessEmail,
        whatsappNumber,
        businessPhone,
        businessEmail
    } = consentData;

    const currentPrivacy = profile.contactPrivacy || {};

    profile.contactPrivacy = {
        isConsentGiven: typeof isConsentGiven === "boolean" ? isConsentGiven : currentPrivacy.isConsentGiven || false,
        allowWhatsApp: typeof allowWhatsApp === "boolean" ? allowWhatsApp : currentPrivacy.allowWhatsApp || false,
        allowPhoneCall: typeof allowPhoneCall === "boolean" ? allowPhoneCall : currentPrivacy.allowPhoneCall || false,
        allowBusinessEmail: typeof allowBusinessEmail === "boolean" ? allowBusinessEmail : currentPrivacy.allowBusinessEmail || false,
        whatsappNumber: typeof whatsappNumber === "string" ? whatsappNumber.trim() : currentPrivacy.whatsappNumber || "",
        businessPhone: typeof businessPhone === "string" ? businessPhone.trim() : currentPrivacy.businessPhone || "",
        businessEmail: typeof businessEmail === "string" ? businessEmail.trim().toLowerCase() : currentPrivacy.businessEmail || ""
    };

    await profile.save();

    return profile.contactPrivacy;
};

/**
 * Retrieves Creator's own contact privacy and sharing consent settings.
 * 
 * @param {string|ObjectId} creatorAuthId
 * @returns {Promise<Object>}
 */
export const getCreatorContactConsentService = async (creatorAuthId) => {
    const profile = await CreatorProfile.findOne({ user: creatorAuthId }).select("contactPrivacy");
    if (!profile) {
        throw createApiError(404, "Creator profile not found");
    }

    return profile.contactPrivacy || {
        isConsentGiven: false,
        allowWhatsApp: false,
        allowPhoneCall: false,
        allowBusinessEmail: false,
        whatsappNumber: "",
        businessPhone: "",
        businessEmail: ""
    };
};

export default {
    resolveCreatorAuthId,
    filterContactDetailsByConsent,
    checkCreatorUnlockStatusService,
    unlockCreatorContactService,
    getBrandUnlockedCreatorsService,
    updateCreatorContactConsentService,
    getCreatorContactConsentService
};
