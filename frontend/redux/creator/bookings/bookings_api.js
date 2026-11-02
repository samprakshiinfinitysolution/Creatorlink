import axiosInstance from "@/lib/axios";

// Gets creator bookings with optional query parameters (page, limit, status).
const getCreatorBookings = async (params = {}) => {
    const response = await axiosInstance.get(
        "/creator/bookings",
        {
            params
        }
    );

    return response.data;
};

// Gets a single creator booking by ID.
const getCreatorBookingById = async (bookingId) => {
    const response = await axiosInstance.get(
        `/creator/bookings/${bookingId}`
    );

    return response.data;
};

// Updates booking status ("accepted" or "rejected") for brand-initiated proposals.
const updateCreatorBookingStatus = async (bookingId, status) => {
    const response = await axiosInstance.patch(
        `/creator/bookings/${bookingId}/status`,
        {
            status
        }
    );

    return response.data;
};

// Cancels a pending booking application initiated by the creator.
const cancelCreatorBooking = async (bookingId) => {
    const response = await axiosInstance.patch(
        `/creator/bookings/${bookingId}/cancel`
    );

    return response.data;
};

export {
    getCreatorBookings,
    getCreatorBookingById,
    updateCreatorBookingStatus,
    cancelCreatorBooking
};

