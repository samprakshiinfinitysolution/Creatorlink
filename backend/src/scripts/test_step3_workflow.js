// Node Integration Test for Step 3 Deliverable Workflow Cases 1 - 10

import mongoose from "mongoose";
import Workspace from "../modules/workspace/workspace.model.js";
import {
    submitCreatorWorkspaceDeliverableService,
    reviewBrandWorkspaceDeliverableService
} from "../modules/workspace/workspace.service.js";

const runTests = async () => {
    console.log("=== STARTING STEP 3 WORKFLOW INTEGRATION TESTS ===");

    // Generate mock ObjectIds
    const creatorId = new mongoose.Types.ObjectId();
    const otherCreatorId = new mongoose.Types.ObjectId();
    const brandId = new mongoose.Types.ObjectId();
    const otherBrandId = new mongoose.Types.ObjectId();
    const bookingId = new mongoose.Types.ObjectId();
    const campaignId = new mongoose.Types.ObjectId();
    const serviceId = new mongoose.Types.ObjectId();

    // Create 6 deliverables matching quantity expansion: Post #1, Post #2, Story #1, Story #2, Story #3, Reel #1
    const delivIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
    ];

    const initialDeliverables = [
        { _id: delivIds[0], title: "Post #1", status: "pending" },
        { _id: delivIds[1], title: "Post #2", status: "pending" },
        { _id: delivIds[2], title: "Story #1", status: "pending" },
        { _id: delivIds[3], title: "Story #2", status: "pending" },
        { _id: delivIds[4], title: "Story #3", status: "pending" },
        { _id: delivIds[5], title: "Reel #1", status: "pending" }
    ];

    // CASE 1: Workspace created with 6 deliverables
    const workspace = new Workspace({
        booking: bookingId,
        campaign: campaignId,
        brand: brandId,
        creator: creatorId,
        service: serviceId,
        agreedPrice: 5000,
        currency: "INR",
        deadline: new Date("2026-12-31"),
        status: "in_progress",
        deliverables: initialDeliverables
    });

    console.log("CASE 1: Created mock workspace with 6 deliverables.");
    if (workspace.deliverables.length !== 6) throw new Error("Case 1 Failed: Expected 6 deliverables");
    console.log("CASE 1 PASSED: Workspace initialized with 6 deliverables.");

    let currentWorkspaceState = workspace;

    Workspace.findOne = function (filter) {
        return {
            populate: function () { return this; },
            then: function (resolve) {
                // Check auth matching
                if (filter.creator && filter.creator.toString() !== currentWorkspaceState.creator.toString()) {
                    return resolve(null);
                }
                if (filter.brand && filter.brand.toString() !== currentWorkspaceState.brand.toString()) {
                    return resolve(null);
                }
                return resolve(currentWorkspaceState);
            }
        };
    };

    Workspace.findById = function () {
        return {
            populate: function () {
                return {
                    populate: function () {
                        return {
                            populate: function () {
                                return {
                                    populate: function () {
                                        return Promise.resolve(currentWorkspaceState);
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
    };

    currentWorkspaceState.save = async function () {
        return currentWorkspaceState;
    };

    // CASE 2: Creator submits Post #1 (delivIds[0])
    console.log("\n--- Testing CASE 2: Creator submits Post #1 ---");
    const resCase2 = await submitCreatorWorkspaceDeliverableService(
        creatorId,
        currentWorkspaceState._id,
        delivIds[0],
        { title: "Post #1 Final", link: "https://instagram.com/p/123", notes: "First post done" }
    );

    const post1 = resCase2.deliverables.id(delivIds[0]);
    if (post1.status !== "submitted") throw new Error(`Case 2 Failed: Post #1 status should be 'submitted', got ${post1.status}`);
    if (!post1.submittedAt) throw new Error("Case 2 Failed: submittedAt not set");
    if (resCase2.deliverables[1].status !== "pending") throw new Error("Case 2 Failed: Other deliverables changed!");
    console.log("CASE 2 PASSED: Post #1 is 'submitted', other deliverables unchanged.");

    // CASE 3: Brand requests revision for Post #1
    console.log("\n--- Testing CASE 3: Brand requests revision for Post #1 ---");
    const resCase3 = await reviewBrandWorkspaceDeliverableService(
        brandId,
        currentWorkspaceState._id,
        delivIds[0],
        { status: "revision_requested", feedback: "Please trim the caption" }
    );

    const post1Rev = resCase3.deliverables.id(delivIds[0]);
    if (post1Rev.status !== "revision_requested") throw new Error(`Case 3 Failed: Post #1 status should be 'revision_requested', got ${post1Rev.status}`);
    if (resCase3.revisions.length === 0) throw new Error("Case 3 Failed: Revision feedback not recorded");
    console.log("CASE 3 PASSED: Post #1 is 'revision_requested' with feedback.");

    // CASE 4: Creator resubmits Post #1
    console.log("\n--- Testing CASE 4: Creator resubmits Post #1 ---");
    const resCase4 = await submitCreatorWorkspaceDeliverableService(
        creatorId,
        currentWorkspaceState._id,
        delivIds[0],
        { title: "Post #1 v2", link: "https://instagram.com/p/123-v2", notes: "Updated caption" }
    );

    const post1Resub = resCase4.deliverables.id(delivIds[0]);
    if (post1Resub.status !== "submitted") throw new Error("Case 4 Failed: Resubmitted deliverable status should be 'submitted'");
    if (post1Resub.submission.notes !== "Updated caption") throw new Error("Case 4 Failed: New submission notes not saved");
    if (resCase4.revisions.length === 0) throw new Error("Case 4 Failed: Revision history lost!");
    console.log("CASE 4 PASSED: Resubmitted Post #1 updated to 'submitted' while keeping revision history.");

    // CASE 5: Brand approves Post #1
    console.log("\n--- Testing CASE 5: Brand approves Post #1 ---");
    const resCase5 = await reviewBrandWorkspaceDeliverableService(
        brandId,
        currentWorkspaceState._id,
        delivIds[0],
        { action: "approve" }
    );

    const post1App = resCase5.deliverables.id(delivIds[0]);
    if (post1App.status !== "approved") throw new Error("Case 5 Failed: Post #1 should be 'approved'");
    if (!post1App.approvedAt) throw new Error("Case 5 Failed: approvedAt timestamp missing");
    console.log("CASE 5 PASSED: Post #1 is 'approved' with approvedAt timestamp.");

    // CASE 8: Try submitting an already approved deliverable (Post #1)
    console.log("\n--- Testing CASE 8: Try submitting an already approved deliverable ---");
    try {
        await submitCreatorWorkspaceDeliverableService(creatorId, currentWorkspaceState._id, delivIds[0], { link: "https://fail.com" });
        throw new Error("Case 8 Failed: Submission should have been rejected!");
    } catch (err) {
        if (!err.message.includes("already approved")) {
            throw err;
        }
        console.log("CASE 8 PASSED: Re-submitting an approved deliverable correctly rejected with error:", err.message);
    }

    // CASE 9: Try accessing another creator's Workspace
    console.log("\n--- Testing CASE 9: Try accessing another creator's Workspace ---");
    try {
        await submitCreatorWorkspaceDeliverableService(otherCreatorId, currentWorkspaceState._id, delivIds[0], { link: "https://fail.com" });
        throw new Error("Case 9 Failed: Unauthorized creator access should have been rejected!");
    } catch (err) {
        if (!err.message.includes("Workspace not found")) {
            throw err;
        }
        console.log("CASE 9 PASSED: Access by another creator rejected with 404.");
    }

    // CASE 10: Try brand review on a Workspace belonging to another brand
    console.log("\n--- Testing CASE 10: Try brand review on another brand's Workspace ---");
    try {
        await reviewBrandWorkspaceDeliverableService(otherBrandId, currentWorkspaceState._id, delivIds[0], { action: "approve" });
        throw new Error("Case 10 Failed: Unauthorized brand access should have been rejected!");
    } catch (err) {
        if (!err.message.includes("Workspace not found")) {
            throw err;
        }
        console.log("CASE 10 PASSED: Access by another brand rejected with 404.");
    }

    // CASE 6: Approve 5 of 6 deliverables (Post #2, Story #1, Story #2, Story #3)
    console.log("\n--- Testing CASE 6: Approve 5 of 6 deliverables ---");
    for (let i = 1; i <= 4; i++) {
        await submitCreatorWorkspaceDeliverableService(creatorId, currentWorkspaceState._id, delivIds[i], { link: "https://test.com" });
        await reviewBrandWorkspaceDeliverableService(brandId, currentWorkspaceState._id, delivIds[i], { action: "approve" });
    }

    if (currentWorkspaceState.status === "completed") {
        throw new Error("Case 6 Failed: Workspace MUST NOT become 'completed' when only 5 of 6 deliverables are approved!");
    }
    console.log(`CASE 6 PASSED: 5 deliverables approved, Reel #1 is pending. Workspace status is '${currentWorkspaceState.status}' (NOT completed).`);

    // CASE 7: Approve final 6th deliverable (Reel #1)
    console.log("\n--- Testing CASE 7: Approve final 6th deliverable ---");
    await submitCreatorWorkspaceDeliverableService(creatorId, currentWorkspaceState._id, delivIds[5], { link: "https://reel.com" });
    const resCase7 = await reviewBrandWorkspaceDeliverableService(brandId, currentWorkspaceState._id, delivIds[5], { action: "approve" });

    if (resCase7.status !== "completed") {
        throw new Error(`Case 7 Failed: Workspace status should be 'completed' when all 6 deliverables are approved, got ${resCase7.status}`);
    }
    console.log("CASE 7 PASSED: All 6 deliverables approved -> Workspace status automatically set to 'completed'!");

    console.log("\n==================================================");
    console.log("   ALL 10 TEST CASES PASSED SUCCESSFULLY!        ");
    console.log("==================================================");
};

runTests().catch((err) => {
    console.error("\nTEST FAILURE ERROR:", err);
    process.exit(1);
});
