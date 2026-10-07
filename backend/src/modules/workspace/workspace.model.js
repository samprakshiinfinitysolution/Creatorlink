import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            default: ""
        },
        link: {
            type: String,
            trim: true,
            default: ""
        },
        fileUrl: {
            type: String,
            trim: true,
            default: ""
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        },
        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const revisionSchema = new mongoose.Schema(
    {
        feedback: {
            type: String,
            trim: true,
            required: true
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: true }
);

const workspaceSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true
        },

        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true
        },

        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CreatorService",
            required: true
        },

        agreedPrice: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            uppercase: true,
            trim: true,
            default: "INR",
            maxlength: 3
        },

        deliverables: {
            type: [
                {
                    type: String,
                    trim: true
                }
            ],
            default: []
        },

        deadline: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: [
                "in_progress",
                "submitted",
                "revision_requested",
                "completed",
                "cancelled"
            ],
            default: "in_progress"
        },

        submissions: [submissionSchema],

        revisions: [revisionSchema]
    },
    {
        timestamps: true
    }
);

workspaceSchema.index({ creator: 1, status: 1, createdAt: -1 });
workspaceSchema.index({ brand: 1, status: 1, createdAt: -1 });

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
