import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test-access-token-secret-32-chars-long";

test("CreatorProfile Instagram Data Sync & Metric Protection Suite", async (t) => {
    const CreatorProfile = (await import("../src/modules/creator/profile/profile.model.js")).default;
    const InstagramAccount = (await import("../src/modules/creator/instagram/instagram.model.js")).default;
    const Auth = (await import("../src/modules/auth/auth.model.js")).default;
    const Workspace = (await import("../src/modules/workspace/workspace.model.js")).default;
    const Booking = (await import("../src/modules/booking/booking.model.js")).default;
    const VerificationRequest = (await import("../src/modules/admin/verification/verification.model.js")).default;

    const {
        getMyProfileService,
        updateProfileService
    } = await import("../src/modules/creator/profile/profile.service.js");

    // Save originals
    const origCreatorProfileFindOne = CreatorProfile.findOne;
    const origCreatorProfileFindOneAndUpdate = CreatorProfile.findOneAndUpdate;
    const origCreatorProfileUpdateOne = CreatorProfile.updateOne;
    const origInstagramAccountFindOne = InstagramAccount.findOne;
    const origInstagramAccountExists = InstagramAccount.exists;
    const origAuthFindByIdAndUpdate = Auth.findByIdAndUpdate;
    const origWorkspaceCount = Workspace.countDocuments;
    const origBookingCount = Booking.countDocuments;
    const origVerificationFindOne = VerificationRequest.findOne;

    // Mock countDocuments and verification to avoid DB timeout
    Workspace.countDocuments = async () => 0;
    Booking.countDocuments = async () => 0;
    Auth.findByIdAndUpdate = async () => ({});
    const chainable = {
        populate: () => chainable,
        lean: async () => ({ status: "unsubmitted", user: "mock" })
    };
    VerificationRequest.findOne = () => chainable;
    const origAuthFindById = Auth.findById;
    Auth.findById = () => ({
        select: () => ({
            lean: async () => ({ _id: "mock", role: "creator" })
        })
    });

    t.after(() => {
        CreatorProfile.findOne = origCreatorProfileFindOne;
        CreatorProfile.findOneAndUpdate = origCreatorProfileFindOneAndUpdate;
        CreatorProfile.updateOne = origCreatorProfileUpdateOne;
        InstagramAccount.findOne = origInstagramAccountFindOne;
        InstagramAccount.exists = origInstagramAccountExists;
        Auth.findByIdAndUpdate = origAuthFindByIdAndUpdate;
        Auth.findById = origAuthFindById;
        Workspace.countDocuments = origWorkspaceCount;
        Booking.countDocuments = origBookingCount;
        VerificationRequest.findOne = origVerificationFindOne;
    });

    await t.test("Case 1: Connected account with null CreatorProfile metrics returns verified metrics, URL, and triggers DB sync", async () => {
        const testUserId = new mongoose.Types.ObjectId();
        let dbUpdatePayload = null;

        const mockProfileDoc = {
            user: { _id: testUserId, name: "Shivani Pawar", email: "shivani@example.com", role: "creator" },
            followerCount: null,
            engagementRate: null,
            socialLinks: { instagram: "", twitter: "" },
            instagramSyncVersion: null,
            toObject() {
                return JSON.parse(JSON.stringify(this));
            }
        };

        CreatorProfile.findOne = () => ({
            populate: async () => mockProfileDoc
        });

        InstagramAccount.findOne = (query) => {
            assert.strictEqual(query.creator.toString(), testUserId.toString());
            return {
                select: () => ({
                    lean: async () => ({
                        creator: testUserId,
                        status: "CONNECTED",
                        username: "samprakshii_infinity_solution",
                        followersCount: 25,
                        engagementRate: 8,
                        syncVersion: 1
                    })
                })
            };
        };

        CreatorProfile.updateOne = async (filter, update) => {
            assert.strictEqual(filter.user.toString(), testUserId.toString());
            dbUpdatePayload = update.$set;
            return { modifiedCount: 1 };
        };

        const result = await getMyProfileService(testUserId);

        assert.strictEqual(result.followerCount, 25);
        assert.strictEqual(result.engagementRate, 8);
        assert.strictEqual(result.socialLinks.instagram, "https://instagram.com/samprakshii_infinity_solution");
        assert.strictEqual(result.instagramSyncVersion, 1);
        assert.deepStrictEqual(result.instagramConnection, {
            isConnected: true,
            isExpired: false,
            status: "CONNECTED",
            username: "samprakshii_infinity_solution"
        });

        // Verify that self-healing update was dispatched to database
        assert.ok(dbUpdatePayload !== null, "CreatorProfile.updateOne should have been called");
        assert.strictEqual(dbUpdatePayload.followerCount, 25);
        assert.strictEqual(dbUpdatePayload.engagementRate, 8);
        assert.strictEqual(dbUpdatePayload["socialLinks.instagram"], "https://instagram.com/samprakshii_infinity_solution");
        assert.strictEqual(dbUpdatePayload.instagramSyncVersion, 1);
    });

    await t.test("Case 2: Connected account with existing matching metrics preserves metrics without DB write", async () => {
        const testUserId = new mongoose.Types.ObjectId();
        let dbUpdateCalled = false;

        const mockProfileDoc = {
            user: { _id: testUserId, name: "Shivani Pawar", email: "shivani@example.com", role: "creator" },
            followerCount: 25,
            engagementRate: 8,
            socialLinks: { instagram: "https://instagram.com/samprakshii_infinity_solution" },
            instagramSyncVersion: 1,
            toObject() {
                return JSON.parse(JSON.stringify(this));
            }
        };

        CreatorProfile.findOne = () => ({
            populate: async () => mockProfileDoc
        });

        InstagramAccount.findOne = () => ({
            select: () => ({
                lean: async () => ({
                    creator: testUserId,
                    status: "CONNECTED",
                    username: "samprakshii_infinity_solution",
                    followersCount: 25,
                    engagementRate: 8,
                    syncVersion: 1
                })
            })
        });

        CreatorProfile.updateOne = async () => {
            dbUpdateCalled = true;
            return { modifiedCount: 0 };
        };

        const result = await getMyProfileService(testUserId);

        assert.strictEqual(result.followerCount, 25);
        assert.strictEqual(result.engagementRate, 8);
        assert.strictEqual(result.socialLinks.instagram, "https://instagram.com/samprakshii_infinity_solution");
        assert.strictEqual(dbUpdateCalled, false, "No database write needed when profile already matches");
    });

    await t.test("Case 3: Expired account (status: 'EXPIRED') does not treat as active connection", async () => {
        const testUserId = new mongoose.Types.ObjectId();
        let dbUpdateCalled = false;

        const mockProfileDoc = {
            user: { _id: testUserId, name: "Shivani Pawar", email: "shivani@example.com", role: "creator" },
            followerCount: 25,
            engagementRate: 8,
            socialLinks: { instagram: "https://instagram.com/old_username" },
            instagramSyncVersion: 1,
            toObject() {
                return JSON.parse(JSON.stringify(this));
            }
        };

        CreatorProfile.findOne = () => ({
            populate: async () => mockProfileDoc
        });

        InstagramAccount.findOne = () => ({
            select: () => ({
                lean: async () => ({
                    creator: testUserId,
                    status: "EXPIRED",
                    username: "old_username",
                    followersCount: 25,
                    engagementRate: 8,
                    syncVersion: 1
                })
            })
        });

        CreatorProfile.updateOne = async () => {
            dbUpdateCalled = true;
            return { modifiedCount: 0 };
        };

        const result = await getMyProfileService(testUserId);

        assert.deepStrictEqual(result.instagramConnection, {
            isConnected: false,
            isExpired: true,
            status: "EXPIRED",
            username: "old_username"
        });
        assert.strictEqual(dbUpdateCalled, false, "Expired connection should not trigger active sync write");
    });

    await t.test("Case 4: Disconnected account returns null instagramConnection", async () => {
        const testUserId = new mongoose.Types.ObjectId();

        const mockProfileDoc = {
            user: { _id: testUserId, name: "Shivani Pawar", email: "shivani@example.com", role: "creator" },
            followerCount: null,
            engagementRate: null,
            socialLinks: { instagram: "" },
            instagramSyncVersion: null,
            toObject() {
                return JSON.parse(JSON.stringify(this));
            }
        };

        CreatorProfile.findOne = () => ({
            populate: async () => mockProfileDoc
        });

        InstagramAccount.findOne = () => ({
            select: () => ({
                lean: async () => null
            })
        });

        const result = await getMyProfileService(testUserId);

        assert.strictEqual(result.instagramConnection, null);
    });

    await t.test("Case 5: Creator without Instagram connection returns normal profile with null connection", async () => {
        const testUserId = new mongoose.Types.ObjectId();

        const mockProfileDoc = {
            user: { _id: testUserId, name: "Organic Creator", email: "organic@example.com", role: "creator" },
            followerCount: 500,
            engagementRate: 3.2,
            socialLinks: { instagram: "", twitter: "https://x.com/organic" },
            instagramSyncVersion: null,
            toObject() {
                return JSON.parse(JSON.stringify(this));
            }
        };

        CreatorProfile.findOne = () => ({
            populate: async () => mockProfileDoc
        });

        InstagramAccount.findOne = () => ({
            select: () => ({
                lean: async () => null
            })
        });

        const result = await getMyProfileService(testUserId);

        assert.strictEqual(result.followerCount, 500);
        assert.strictEqual(result.engagementRate, 3.2);
        assert.strictEqual(result.instagramConnection, null);
    });

    await t.test("Case 6: Profile update protects verified Instagram metrics & URL and preserves instagramConnection", async () => {
        const testUserId = new mongoose.Types.ObjectId();
        let executedUpdateOps = null;

        InstagramAccount.findOne = () => ({
            select: () => ({
                lean: async () => ({
                    creator: testUserId,
                    status: "CONNECTED",
                    username: "samprakshii_infinity_solution",
                    followersCount: 25,
                    engagementRate: 8
                })
            })
        });

        CreatorProfile.findOneAndUpdate = (query, update) => {
            executedUpdateOps = update.$set;
            return {
                populate: async () => ({
                    user: { _id: testUserId, name: "Shivani Pawar", email: "shivani@example.com", role: "creator" },
                    bio: executedUpdateOps.bio,
                    followerCount: 25, // Unchanged
                    engagementRate: 8,  // Unchanged
                    socialLinks: {
                        instagram: "https://instagram.com/samprakshii_infinity_solution",
                        twitter: executedUpdateOps["socialLinks.twitter"] || ""
                    },
                    toObject() {
                        return JSON.parse(JSON.stringify(this));
                    }
                })
            };
        };

        const updatePayload = {
            bio: "Updated bio text",
            followerCount: 999999, // Malicious or manual override attempt
            engagementRate: 99.9,  // Malicious or manual override attempt
            socialLinks: {
                instagram: "",       // Attempt to wipe verified URL
                twitter: "https://x.com/shivani"
            }
        };

        const result = await updateProfileService(testUserId, updatePayload);

        // 1. FollowerCount and engagementRate must NOT have been included in DB update ops
        assert.strictEqual(executedUpdateOps.followerCount, undefined, "followerCount must be stripped when Instagram is linked");
        assert.strictEqual(executedUpdateOps.engagementRate, undefined, "engagementRate must be stripped when Instagram is linked");

        // 2. Empty string instagram URL must NOT wipe the verified Instagram link
        assert.strictEqual(executedUpdateOps["socialLinks.instagram"], undefined, "Empty string Instagram link must not overwrite verified URL");
        assert.strictEqual(executedUpdateOps["socialLinks.twitter"], "https://x.com/shivani");

        // 3. Returned result must preserve instagramConnection
        assert.deepStrictEqual(result.instagramConnection, {
            isConnected: true,
            isExpired: false,
            status: "CONNECTED",
            username: "samprakshii_infinity_solution"
        });
        assert.strictEqual(result.followerCount, 25);
        assert.strictEqual(result.engagementRate, 8);
    });

    await t.test("Case 7: Connected creator submitting arbitrary fake Instagram URL cannot overwrite verified URL", async () => {
        const testUserId = new mongoose.Types.ObjectId();
        let executedUpdateOps = null;

        InstagramAccount.findOne = () => ({
            select: () => ({
                lean: async () => ({
                    creator: testUserId,
                    status: "CONNECTED",
                    username: "samprakshii_infinity_solution",
                    followersCount: 25,
                    engagementRate: 8
                })
            })
        });

        CreatorProfile.findOneAndUpdate = (query, update) => {
            executedUpdateOps = update.$set;
            return {
                populate: async () => ({
                    user: { _id: testUserId, name: "Shivani Pawar", email: "shivani@example.com", role: "creator" },
                    followerCount: 25, // Preserved in DB
                    engagementRate: 8,  // Preserved in DB
                    socialLinks: {
                        instagram: "https://instagram.com/samprakshii_infinity_solution", // Preserved in DB
                        twitter: executedUpdateOps["socialLinks.twitter"] || ""
                    },
                    toObject() {
                        return JSON.parse(JSON.stringify(this));
                    }
                })
            };
        };

        const updatePayload = {
            followerCount: 999999,
            engagementRate: 99.9,
            socialLinks: {
                instagram: "https://instagram.com/fake_account",
                twitter: "https://x.com/creator"
            }
        };

        const result = await updateProfileService(testUserId, updatePayload);

        // Verify: Follower count is not overwritten
        assert.strictEqual(executedUpdateOps.followerCount, undefined, "followerCount must not be included in update ops");
        assert.strictEqual(result.followerCount, 25, "Follower count must not be overwritten");

        // Verify: Engagement rate is not overwritten
        assert.strictEqual(executedUpdateOps.engagementRate, undefined, "engagementRate must not be included in update ops");
        assert.strictEqual(result.engagementRate, 8, "Engagement rate must not be overwritten");

        // Verify: Instagram URL is not overwritten
        assert.strictEqual(executedUpdateOps["socialLinks.instagram"], undefined, "socialLinks.instagram must not be included in update ops");
        assert.strictEqual(result.socialLinks.instagram, "https://instagram.com/samprakshii_infinity_solution", "Instagram URL must not be overwritten");

        // Verify: Twitter URL is successfully updated
        assert.strictEqual(executedUpdateOps["socialLinks.twitter"], "https://x.com/creator", "socialLinks.twitter must be updated in ops");
        assert.strictEqual(result.socialLinks.twitter, "https://x.com/creator", "Twitter URL must be successfully updated");
    });

    await t.test("Case 8: Connected account with incorrect non-empty Instagram URL updates response, syncs to DB, and preserves other social links", async () => {
        const testUserId = new mongoose.Types.ObjectId();
        let dbUpdatePayload = null;

        const mockProfileDoc = {
            user: { _id: testUserId, name: "Shivani Pawar", email: "shivani@example.com", role: "creator" },
            followerCount: 25,
            engagementRate: 8,
            socialLinks: {
                instagram: "https://instagram.com/wrong_or_stale_handle",
                twitter: "https://x.com/creator",
                youtube: "https://youtube.com/@creator"
            },
            instagramSyncVersion: 1,
            toObject() {
                return JSON.parse(JSON.stringify(this));
            }
        };

        CreatorProfile.findOne = () => ({
            populate: async () => mockProfileDoc
        });

        InstagramAccount.findOne = () => ({
            select: () => ({
                lean: async () => ({
                    creator: testUserId,
                    status: "CONNECTED",
                    username: "samprakshii_infinity_solution",
                    followersCount: 25,
                    engagementRate: 8,
                    syncVersion: 1
                })
            })
        });

        CreatorProfile.updateOne = async (filter, update) => {
            assert.strictEqual(filter.user.toString(), testUserId.toString());
            dbUpdatePayload = update.$set;
            return { modifiedCount: 1 };
        };

        const result = await getMyProfileService(testUserId);

        // Verify: Instagram URL is corrected to the verified username
        assert.strictEqual(result.socialLinks.instagram, "https://instagram.com/samprakshii_infinity_solution");
        // Verify: Other social links are not overwritten
        assert.strictEqual(result.socialLinks.twitter, "https://x.com/creator");
        assert.strictEqual(result.socialLinks.youtube, "https://youtube.com/@creator");

        // Verify: MongoDB sync payload contains the corrected Instagram URL and does not overwrite other links
        assert.ok(dbUpdatePayload !== null, "CreatorProfile.updateOne should have been called");
        assert.strictEqual(dbUpdatePayload["socialLinks.instagram"], "https://instagram.com/samprakshii_infinity_solution");
        assert.strictEqual(dbUpdatePayload["socialLinks.twitter"], undefined);
        assert.strictEqual(dbUpdatePayload["socialLinks.youtube"], undefined);
    });

    await t.test("Case 9: Connected account with updated Instagram username updates response, syncs to DB, and preserves other social links", async () => {
        const testUserId = new mongoose.Types.ObjectId();
        let dbUpdatePayload = null;

        const mockProfileDoc = {
            user: { _id: testUserId, name: "Shivani Pawar", email: "shivani@example.com", role: "creator" },
            followerCount: 25,
            engagementRate: 8,
            socialLinks: {
                instagram: "https://instagram.com/previous_username",
                facebook: "https://facebook.com/creator"
            },
            instagramSyncVersion: 1,
            toObject() {
                return JSON.parse(JSON.stringify(this));
            }
        };

        CreatorProfile.findOne = () => ({
            populate: async () => mockProfileDoc
        });

        InstagramAccount.findOne = () => ({
            select: () => ({
                lean: async () => ({
                    creator: testUserId,
                    status: "CONNECTED",
                    username: "new_verified_username",
                    followersCount: 25,
                    engagementRate: 8,
                    syncVersion: 2
                })
            })
        });

        CreatorProfile.updateOne = async (filter, update) => {
            assert.strictEqual(filter.user.toString(), testUserId.toString());
            dbUpdatePayload = update.$set;
            return { modifiedCount: 1 };
        };

        const result = await getMyProfileService(testUserId);

        // Verify: Instagram URL is updated to the new verified username
        assert.strictEqual(result.socialLinks.instagram, "https://instagram.com/new_verified_username");
        // Verify: Other social links are preserved
        assert.strictEqual(result.socialLinks.facebook, "https://facebook.com/creator");

        // Verify: MongoDB sync payload contains the new Instagram URL and syncVersion
        assert.ok(dbUpdatePayload !== null, "CreatorProfile.updateOne should have been called");
        assert.strictEqual(dbUpdatePayload["socialLinks.instagram"], "https://instagram.com/new_verified_username");
        assert.strictEqual(dbUpdatePayload.instagramSyncVersion, 2);
    });
});
