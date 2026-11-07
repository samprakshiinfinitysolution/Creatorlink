/**
 * CreatorLink - Migration Script: Completely Separate Email Verification and Admin Verification
 *
 * SAFETY RULES:
 * 1. Default mode is DRY-RUN. Does NOT perform any writes unless explicitly run with `--execute`.
 * 2. In `--execute` mode, creates a full JSON snapshot backup in `backend/scripts/backups/` before any modifications.
 * 3. Preserves all `Auth.isVerified` values exactly as they are (Email Verification / Login access unaffected).
 * 4. Idempotent: can safely be executed multiple times without corrupting state.
 *
 * Usage:
 *   Dry-Run:  node backend/scripts/migrate-verification-architecture.js
 *   Execute:  node backend/scripts/migrate-verification-architecture.js --execute
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("ERROR: MONGO_URI is not set in backend/.env");
    process.exit(1);
}

const isExecuteMode = process.argv.includes("--execute");

async function run() {
    console.log("==================================================================");
    console.log(`CREATORLINK VERIFICATION SEPARATION MIGRATION`);
    console.log(`Mode: ${isExecuteMode ? ">>> LIVE EXECUTION <<<" : ">>> DRY-RUN (Safe Read-Only) <<<"}`);
    console.log("==================================================================\n");

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.\n");

    const db = mongoose.connection.db;
    const authCollection = db.collection("auths");
    const verifCollection = db.collection("verificationrequests");
    const creatorCollection = db.collection("creatorprofiles");
    const brandCollection = db.collection("brandprofiles");

    // Fetch all Creator and Brand users
    const allUsers = await authCollection
        .find({ role: { $in: ["creator", "brand"] } })
        .project({ _id: 1, name: 1, email: 1, role: 1, isVerified: 1, createdAt: 1 })
        .toArray();

    const userMap = new Map(allUsers.map((u) => [u._id.toString(), u]));

    // Fetch all verification requests
    const allRequests = await verifCollection.find({}).toArray();

    console.log(`Found ${allUsers.length} Creator/Brand users in Auth.`);
    console.log(`Found ${allRequests.length} VerificationRequest records.\n`);

    // Classification groups
    const group1Approved = [];
    const group2UnverifiedToPending = [];
    const group3RejectedOrRevoked = [];
    const group4AlreadyPending = [];
    const group5MissingToCreate = [];

    const requestUserSet = new Set();

    for (const req of allRequests) {
        if (!req.user) continue;
        const uIdStr = req.user.toString();
        requestUserSet.add(uIdStr);

        const authUser = userMap.get(uIdStr);
        const historyList = Array.isArray(req.reviewHistory) ? req.reviewHistory : [];
        const hasHistory = historyList.length > 0;
        const latestHistoryEntry = hasHistory ? historyList[historyList.length - 1] : null;
        const latestAction = latestHistoryEntry?.action || null;

        // Determine reliable admin reviewer evidence
        const hasReliableReviewer = Boolean(
            latestHistoryEntry?.reviewedBy ||
            (req.reviewedBy && req.status === "approved")
        );

        // 1. Latest Decision Must Win: If the most recent Admin action was 'revoked' or 'rejected',
        // or current DB status is 'rejected', the account is strictly Group 3.
        // An earlier approval in history must NEVER override a later rejection or revocation!
        if (latestAction === "revoked" || latestAction === "rejected" || req.status === "rejected") {
            group3RejectedOrRevoked.push({
                reqId: req._id,
                userId: req.user,
                email: authUser?.email || "Unknown",
                role: req.role,
                status: req.status,
                rejectionReason: req.rejectionReason || latestHistoryEntry?.reason || "Rejected/revoked by administrator",
                latestAction: latestAction || "rejected",
                historyActions: historyList.map((h) => h.action)
            });
        } else if (req.status === "approved") {
            // 2. Approved only if latest action is 'approved' or supported by reliable Admin reviewer
            if (latestAction === "approved" || hasReliableReviewer) {
                // Group 1: Genuine Admin Approval Evidence exists as authoritative decision
                group1Approved.push({
                    reqId: req._id,
                    userId: req.user,
                    email: authUser?.email || "Unknown",
                    role: req.role,
                    evidence: latestAction === "approved"
                        ? "Latest action is 'approved' in reviewHistory"
                        : "Valid reviewedBy assigned",
                    reviewedBy: req.reviewedBy || latestHistoryEntry?.reviewedBy,
                    reviewedAt: req.reviewedAt || latestHistoryEntry?.reviewedAt
                });
            } else {
                // Group 2: Auto-synced without reliable Admin review (only email verified)
                group2UnverifiedToPending.push({
                    reqId: req._id,
                    userId: req.user,
                    email: authUser?.email || "Unknown",
                    role: req.role,
                    emailVerified: Boolean(authUser?.isVerified),
                    reviewHistoryCount: historyList.length
                });
            }
        } else {
            // Group 4: Already Pending
            group4AlreadyPending.push({
                reqId: req._id,
                userId: req.user,
                email: authUser?.email || "Unknown",
                role: req.role
            });
        }
    }

    // Check for missing Creator/Brand users who don't have a VerificationRequest record
    for (const u of allUsers) {
        if (!requestUserSet.has(u._id.toString())) {
            group5MissingToCreate.push({
                userId: u._id,
                email: u.email,
                role: u.role,
                emailVerified: Boolean(u.isVerified)
            });
        }
    }

    // Print Dry-Run Classification Report
    console.log("------------------------------------------------------------------");
    console.log("CLASSIFICATION SUMMARY");
    console.log("------------------------------------------------------------------");
    console.log(`[Group 1] Confirmed Admin Approved (Will stay APPROVED):    ${group1Approved.length}`);
    console.log(`[Group 2] Auto-Synced / No Admin Evidence (Move to PENDING): ${group2UnverifiedToPending.length}`);
    console.log(`[Group 3] Confirmed Rejected or Revoked (Will stay REJECTED):  ${group3RejectedOrRevoked.length}`);
    console.log(`[Group 4] Already Pending (No change needed):               ${group4AlreadyPending.length}`);
    console.log(`[Group 5] Missing Records (Will create as PENDING):          ${group5MissingToCreate.length}`);
    console.log("------------------------------------------------------------------\n");

    if (group1Approved.length > 0) {
        console.log("Sample Group 1 (Confirmed Approved):");
        group1Approved.slice(0, 3).forEach((item) => {
            console.log(`  - User: ${item.email} (${item.role}) | Evidence: ${item.evidence}`);
        });
        console.log("");
    }

    if (group2UnverifiedToPending.length > 0) {
        console.log("Sample Group 2 (Auto-synced -> Becoming Pending):");
        group2UnverifiedToPending.slice(0, 5).forEach((item) => {
            console.log(`  - User: ${item.email} (${item.role}) | EmailVerified: ${item.emailVerified} | Badge will be deactivated`);
        });
        console.log("");
    }

    if (group3RejectedOrRevoked.length > 0) {
        console.log("Sample Group 3 (Confirmed Rejected/Revoked):");
        group3RejectedOrRevoked.slice(0, 3).forEach((item) => {
            console.log(`  - User: ${item.email} (${item.role}) | Actions: ${item.historyActions.join(", ") || "rejected"}`);
        });
        console.log("");
    }

    if (group5MissingToCreate.length > 0) {
        console.log("Sample Group 5 (Missing -> Creating as Pending):");
        group5MissingToCreate.slice(0, 3).forEach((item) => {
            console.log(`  - User: ${item.email} (${item.role})`);
        });
        console.log("");
    }

    // Safety checks
    console.log("Safety Assertions:");
    console.log("  [PASS] Auth.isVerified will NOT be altered for any user.");
    console.log("  [PASS] Email login capability is 100% preserved.");
    console.log("  [PASS] No documents, profiles, or history records will be deleted.");

    if (!isExecuteMode) {
        console.log("\n==================================================================");
        console.log("DRY-RUN COMPLETE. No changes were made to the database.");
        console.log("To apply these changes after human approval, run:");
        console.log("node backend/scripts/migrate-verification-architecture.js --execute");
        console.log("==================================================================");
        await mongoose.disconnect();
        return;
    }

    // LIVE EXECUTION BLOCK
    console.log("\n>>> STARTING LIVE EXECUTION WITH PRE-MIGRATION BACKUP <<<");

    const backupsDir = path.resolve(__dirname, "backups");
    if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupsDir, `verification-migration-backup-${timestamp}.json`);

    const creatorProfiles = await creatorCollection.find({}).toArray();
    const brandProfiles = await brandCollection.find({}).toArray();

    const snapshot = {
        timestamp: new Date().toISOString(),
        authCount: allUsers.length,
        verifCount: allRequests.length,
        creatorProfileCount: creatorProfiles.length,
        brandProfileCount: brandProfiles.length,
        authUsers: allUsers,
        verificationRequests: allRequests,
        creatorProfiles: creatorProfiles.map((p) => ({
            _id: p._id,
            user: p.user,
            isVerifiedBadge: p.isVerifiedBadge
        })),
        brandProfiles: brandProfiles.map((p) => ({
            _id: p._id,
            user: p.user,
            isVerifiedBusiness: p.isVerifiedBusiness
        }))
    };

    // Write backup JSON synchronously
    try {
        fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2), "utf-8");
    } catch (fsErr) {
        console.error("FATAL: Failed to write pre-migration backup file:", fsErr);
        throw new Error(`Pre-migration backup write failed: ${fsErr.message}. Aborting all database writes.`);
    }

    // Explicit Safety Assertion: Validate backup file exists and size > 0 before proceeding to ANY write
    if (!fs.existsSync(backupFile)) {
        throw new Error(`FATAL: Pre-migration backup file does not exist at '${backupFile}'. Aborting all database writes.`);
    }

    const backupStats = fs.statSync(backupFile);
    if (!backupStats || backupStats.size <= 0) {
        throw new Error(`FATAL: Pre-migration backup file is empty (0 bytes). Aborting all database writes.`);
    }

    console.log(`Pre-migration backup created and validated successfully (${backupStats.size} bytes) at: ${backupFile}\n`);

    // 1. Update Group 2: Auto-synced accounts to 'pending' and remove verified badge
    if (group2UnverifiedToPending.length > 0) {
        const reqIdsToPending = group2UnverifiedToPending.map((i) => i.reqId);
        const userIdsToDeactivate = group2UnverifiedToPending.map((i) => i.userId);

        await verifCollection.updateMany(
            { _id: { $in: reqIdsToPending } },
            { $set: { status: "pending", notes: "Reset to pending (previously auto-synced from email verification)" } }
        );

        await creatorCollection.updateMany(
            { user: { $in: userIdsToDeactivate } },
            { $set: { isVerifiedBadge: false } }
        );

        await brandCollection.updateMany(
            { user: { $in: userIdsToDeactivate } },
            { $set: { isVerifiedBusiness: false } }
        );

        console.log(`Updated ${reqIdsToPending.length} VerificationRequests to 'pending' and deactivated profile badges.`);
    }

    // 2. Ensure Group 1 (Confirmed Approved) has profile badges set to true
    if (group1Approved.length > 0) {
        const approvedCreatorUserIds = group1Approved
            .filter((i) => i.role === "creator")
            .map((i) => i.userId);
        const approvedBrandUserIds = group1Approved
            .filter((i) => i.role === "brand")
            .map((i) => i.userId);

        if (approvedCreatorUserIds.length > 0) {
            await creatorCollection.updateMany(
                { user: { $in: approvedCreatorUserIds } },
                { $set: { isVerifiedBadge: true } }
            );
        }
        if (approvedBrandUserIds.length > 0) {
            await brandCollection.updateMany(
                { user: { $in: approvedBrandUserIds } },
                { $set: { isVerifiedBusiness: true } }
            );
        }
        console.log(`Confirmed active badges for ${group1Approved.length} verified accounts.`);
    }

    // 3. Ensure Group 3 (Confirmed Rejected/Revoked) has profile badges set to false
    if (group3RejectedOrRevoked.length > 0) {
        const rejectedUserIds = group3RejectedOrRevoked.map((i) => i.userId);
        await creatorCollection.updateMany(
            { user: { $in: rejectedUserIds } },
            { $set: { isVerifiedBadge: false } }
        );
        await brandCollection.updateMany(
            { user: { $in: rejectedUserIds } },
            { $set: { isVerifiedBusiness: false } }
        );
        console.log(`Confirmed inactive badges for ${group3RejectedOrRevoked.length} rejected/revoked accounts.`);
    }

    // 4. Sanitize Group 4 (Already Pending): Explicitly ensure profile badges are false
    if (group4AlreadyPending.length > 0) {
        const pendingUserIds = group4AlreadyPending.map((i) => i.userId);
        await creatorCollection.updateMany(
            { user: { $in: pendingUserIds } },
            { $set: { isVerifiedBadge: false } }
        );
        await brandCollection.updateMany(
            { user: { $in: pendingUserIds } },
            { $set: { isVerifiedBusiness: false } }
        );
        console.log(`Sanitized profile badges to false for ${group4AlreadyPending.length} already-pending accounts.`);
    }

    // 5. Create missing records as 'pending'
    if (group5MissingToCreate.length > 0) {
        const newRecords = group5MissingToCreate.map((u) => ({
            user: u.userId,
            role: u.role,
            documentType: "profile_verification",
            documentNumber: "",
            documentUrls: [],
            notes: "Canonical pending record created during verification architecture migration",
            status: "pending",
            createdAt: new Date(),
            reviewHistory: []
        }));

        await verifCollection.insertMany(newRecords, { ordered: false });
        console.log(`Created ${newRecords.length} missing verification records with status 'pending'.`);
    }

    console.log("\n==================================================================");
    console.log("MIGRATION EXECUTION COMPLETED SUCCESSFULLY.");
    console.log("==================================================================");

    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});

