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

const deliverableSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        dueDate: {
            type: Date
        },
        status: {
            type: String,
            enum: [
                "pending",
                "in_progress",
                "submitted",
                "revision_requested",
                "approved",
                "completed"
            ],
            default: "pending"
        },
        submission: submissionSchema,
        submittedAt: {
            type: Date
        },
        approvedAt: {
            type: Date
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

        brief: {
            type: String,
            trim: true,
            default: ""
        },

        deliverables: [deliverableSchema],

        files: [
            {
                name: {
                    type: String,
                    trim: true,
                    default: ""
                },
                url: {
                    type: String,
                    trim: true,
                    default: ""
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

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

