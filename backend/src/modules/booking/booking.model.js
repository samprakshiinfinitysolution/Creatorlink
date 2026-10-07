import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        // Auth._id of the brand that created the campaign.
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Auth._id of the creator who applied/booked.
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true
        },

        // Campaign ID for which the creator applied.
        campaign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Campaign",
            required: true
        },

        // CreatorService ID selected by the creator for this collaboration.
        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CreatorService",
            required: true
        },

        // Price agreed for the collaboration.
        agreedPrice: {
            type: Number,
            required: true,
            min: 0
        },

        // Currency code.
        currency: {
            type: String,
            uppercase: true,
            trim: true,
            default: "INR",
            maxlength: 3
        },

        // Proposal/application message from creator.
        message: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: ""
        },

        // Deliverables copied from the target campaign.
        deliverables: {
            type: [
                {
                    type: String,
                    trim: true
                }
            ],
            required: true
        },

        // Start date of the collaboration.
        startDate: {
            type: Date,
            default: Date.now
        },

        // Completion deadline copied from the target campaign.
        deadline: {
            type: Date,
            required: true
        },

        // Lifecycle status of the booking/proposal.
        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "cancelled",
                "in_progress",
                "completed"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);


// Prevent duplicate bookings/applications by the same creator for the same campaign.
bookingSchema.index(
    { campaign: 1, creator: 1 },
    { unique: true }
);


// Useful for creator booking queries.
bookingSchema.index({
    creator: 1,
    status: 1,
    createdAt: -1
});


// Useful for brand booking queries.
bookingSchema.index({
    brand: 1,
    status: 1,
    createdAt: -1
});


const Booking = mongoose.model(
    "Booking",
    bookingSchema
);

export default Booking;
