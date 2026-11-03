import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },
        action: {
            type: String,
            required: true,
            trim: true
        },
        targetType: {
            type: String,
            required: true,
            enum: ["campaign", "user", "workspace", "booking", "verification", "payment", "subscription"],
            default: "campaign"
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        reason: {
            type: String,
            trim: true,
            default: ""
        },
        previousState: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        newState: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

auditLogSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
auditLogSchema.index({ admin: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;

