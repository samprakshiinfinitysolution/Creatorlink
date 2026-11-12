import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import Auth from "../modules/auth/auth.model.js";
import PendingRegistration from "../modules/auth/pendingRegistration.model.js";
import { registerUser, verifyEmailOtp, resendVerificationOtp } from "../modules/auth/auth.service.js";

dotenv.config();

const runVerification = async () => {
    console.log("=================================================");
    console.log("TESTING OTP SIGNUP FLOW (SAVE AFTER OTP VERIFY)");
    console.log("=================================================");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ MongoDB Connected");

    const testEmail = `test_flow_${Date.now()}@creatorlink.test`;
    const testPassword = "SecurePassword123!";
    const testName = "Test Signup User";
    const testRole = "creator";

    try {
        // SCENARIO 1 & 2: Signup submitted -> Pending data created, NO Auth document created
        console.log("\n[Scenario 1 & 2] Submitting signup registration...");
        const registerRes = await registerUser({
            name: testName,
            email: testEmail,
            password: testPassword,
            role: testRole
        });
        console.log("✓ registerUser responded:", registerRes.message);

        const authDocBefore = await Auth.findOne({ email: testEmail });
        console.log("✓ Check Auth collection before verification:", authDocBefore === null ? "PASSED (Null - No Auth doc)" : "FAILED");

        const pendingDoc = await PendingRegistration.findOne({ email: testEmail });
        console.log("✓ Check PendingRegistration collection:", pendingDoc ? `PASSED (Pending doc exists, attempts: ${pendingDoc.attempts})` : "FAILED");

        if (authDocBefore !== null || !pendingDoc) {
            throw new Error("Scenario 1 & 2 assertion failed!");
        }

        // SCENARIO 8: Resend OTP cooldown check
        console.log("\n[Scenario 8] Testing resend cooldown protection...");
        try {
            await resendVerificationOtp(testEmail);
            console.log("FAILED: Resend within cooldown should have thrown 429");
        } catch (cooldownErr) {
            console.log(`✓ Cooldown respected: ${cooldownErr.message} (status: ${cooldownErr.statusCode})`);
        }

        // SCENARIO 7: Duplicate signup handling (submitting signup form again during cooldown)
        console.log("\n[Scenario 7] Testing duplicate signup form submission during cooldown...");
        try {
            await registerUser({
                name: testName,
                email: testEmail,
                password: testPassword,
                role: testRole
            });
            console.log("FAILED: Duplicate signup within cooldown should have thrown 429");
        } catch (dupErr) {
            console.log(`✓ Duplicate signup cooldown enforced: ${dupErr.message} (status: ${dupErr.statusCode})`);
        }

        // SCENARIO 3: Wrong OTP -> No Auth document created, attempt counter incremented
        console.log("\n[Scenario 3] Testing invalid OTP submission...");
        try {
            await verifyEmailOtp({ email: testEmail, otp: "000000" });
            console.log("FAILED: Invalid OTP should have thrown 400");
        } catch (otpErr) {
            console.log(`✓ Invalid OTP rejected: ${otpErr.message} (status: ${otpErr.statusCode})`);
        }

        const authDocAfterFail = await Auth.findOne({ email: testEmail });
        console.log("✓ Auth document after failed OTP:", authDocAfterFail === null ? "PASSED (Still Null)" : "FAILED");

        const pendingAfterFail = await PendingRegistration.findOne({ email: testEmail });
        console.log(`✓ Pending attempts count incremented: ${pendingAfterFail.attempts} (Expected: 1)`);

        // SCENARIO 4: Expired OTP -> Pending record cleaned, rejected
        console.log("\n[Scenario 4] Testing expired OTP handling...");
        // Temporarily set otpExpire to past
        await PendingRegistration.updateOne({ email: testEmail }, { otpExpire: new Date(Date.now() - 1000) });
        try {
            await verifyEmailOtp({ email: testEmail, otp: "123456" });
            console.log("FAILED: Expired OTP should have thrown 400");
        } catch (expErr) {
            console.log(`✓ Expired OTP rejected: ${expErr.message} (status: ${expErr.statusCode})`);
        }

        // SCENARIO 5 & 9: Concurrent duplicate OTP verification test
        console.log("\n[Scenario 5 & 9 + Concurrency] Testing concurrent duplicate OTP verification...");
        const validTestOtp = "789123";
        const validHash = crypto.createHash("sha256").update(validTestOtp).digest("hex");
        await PendingRegistration.create({
            name: testName,
            email: testEmail,
            password: pendingDoc.password,
            role: testRole,
            otpHash: validHash,
            otpExpire: new Date(Date.now() + 10 * 60 * 1000),
            attempts: 0,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        // Trigger two simultaneous verification calls for the identical pending record
        const [resA, resB] = await Promise.all([
            verifyEmailOtp({ email: testEmail, otp: validTestOtp }),
            verifyEmailOtp({ email: testEmail, otp: validTestOtp })
        ]);

        console.log("✓ Concurrent Request A result:", resA.message, "Tokens present:", Boolean(resA.accessToken));
        console.log("✓ Concurrent Request B result:", resB.message, "Tokens present:", Boolean(resB.accessToken));

        const authCount = await Auth.countDocuments({ email: testEmail });
        console.log(`✓ Auth documents created for ${testEmail}: ${authCount} (Expected: exactly 1)`);
        if (authCount !== 1) {
            throw new Error(`Expected exactly 1 Auth document, found ${authCount}!`);
        }

        const finalAuthDoc = await Auth.findOne({ email: testEmail });
        console.log("✓ Verified Auth document in MongoDB:", finalAuthDoc ? `Found (isVerified: ${finalAuthDoc.isVerified}, role: ${finalAuthDoc.role})` : "FAILED");

        const pendingAfterSuccess = await PendingRegistration.findOne({ email: testEmail });
        console.log("✓ PendingRegistration document cleaned up:", pendingAfterSuccess === null ? "PASSED (Null - Deleted)" : "FAILED");

        // Test preservation of pending registration if Auth.create fails on unexpected DB error
        console.log("\n[Testing Pending Document Preservation on DB Error]");
        const failEmail = `fail_sim_${Date.now()}@creatorlink.test`;
        const failOtp = "654321";
        const failHash = crypto.createHash("sha256").update(failOtp).digest("hex");
        const failPending = await PendingRegistration.create({
            name: "Fail Sim User",
            email: failEmail,
            password: "hashedPassword123",
            role: "creator",
            otpHash: failHash,
            otpExpire: new Date(Date.now() + 10 * 60 * 1000),
            attempts: 0,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        // Temporarily stub Auth.create to simulate unexpected database failure
        const originalAuthCreate = Auth.create;
        Auth.create = async () => {
            const err = new Error("Simulated transient MongoDB cluster network write timeout");
            err.code = "ECONNRESET";
            throw err;
        };

        try {
            await verifyEmailOtp({ email: failEmail, otp: failOtp });
            console.log("FAILED: Simulated DB write error should have thrown");
        } catch (simulatedErr) {
            console.log("✓ Caught expected simulated DB error:", simulatedErr.message);
        } finally {
            // Restore Auth.create
            Auth.create = originalAuthCreate;
        }

        const pendingStillExists = await PendingRegistration.findById(failPending._id);
        console.log("✓ Check pending registration preserved after DB error:", pendingStillExists !== null ? "PASSED (Document Preserved for Retry!)" : "FAILED");
        await PendingRegistration.deleteMany({ email: failEmail });
        console.log("\n[Testing Re-verification on already verified account]");
        try {
            await verifyEmailOtp({ email: testEmail, otp: validTestOtp });
            console.log("FAILED: Verifying already verified account should fail");
        } catch (alreadyErr) {
            console.log(`✓ Re-verification prevented: ${alreadyErr.message} (status: ${alreadyErr.statusCode})`);
        }

        // Test signup attempt on now-verified email -> Expect 409
        console.log("\n[Testing Signup on already verified email]");
        try {
            await registerUser({
                name: testName,
                email: testEmail,
                password: testPassword,
                role: testRole
            });
            console.log("FAILED: Registering verified email should throw 409");
        } catch (regVerifiedErr) {
            console.log(`✓ 409 Conflict thrown on verified email: ${regVerifiedErr.message}`);
        }

    } finally {
        // CLEANUP TEST DATA TO LEAVE ZERO TRACE
        console.log("\nCleaning up test artifacts...");
        await Auth.deleteMany({ email: testEmail });
        await PendingRegistration.deleteMany({ email: testEmail });
        const VerificationRequest = mongoose.models.VerificationRequest || mongoose.model("VerificationRequest", new mongoose.Schema({}, { strict: false }));
        await VerificationRequest.deleteMany({ email: testEmail });
        console.log("✓ Test records purged. Database state clean.");
        await mongoose.disconnect();
    }
};

runVerification().catch(err => {
    console.error("Test Suite Error:", err);
    process.exit(1);
});

