import mongoose from "mongoose";

const savedCreatorSchema = new mongoose.Schema(
    {
        // Auth._id of the brand saving the creator
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
            index: true
        },

        // CreatorProfile._id of the saved creator
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CreatorProfile",
            required: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Compound index to guarantee uniqueness and prevent duplicate saves per brand
savedCreatorSchema.index(
    { brand: 1, creator: 1 },
    { unique: true }
);

// Index for fast sorting by most recently saved
savedCreatorSchema.index(
    { brand: 1, createdAt: -1 }
);

const SavedCreator = mongoose.model(
    "SavedCreator",
    savedCreatorSchema
);

export default SavedCreator;

