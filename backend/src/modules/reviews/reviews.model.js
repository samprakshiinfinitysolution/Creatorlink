import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        // Reference to the workspace where collaboration took place
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true
        },

        // Reference to the booking
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking"
        },

        // Reference to the campaign
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign"
        },

        // User giving the review (Brand or Creator)
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // User receiving the review (Creator or Brand)
        reviewee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Star rating from 1 to 5
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        // Detailed review text feedback
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// Enforce at most one review per reviewer per workspace
reviewSchema.index({ workspace: 1, reviewer: 1 }, { unique: true });

// Optimize lookups for reviews given or received
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ reviewee: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
