import axiosInstance from "@/lib/axios";


// Gets brand bookings with optional query parameters (page, limit, status, campaignId).
const getBrandBookings = async (params = {}) => {

    const response = await axiosInstance.get(
        "/brand/bookings",
        {
            params
        }
    );

    return response.data;
};


// Gets one booking by ID.
const getBrandBookingById = async (bookingId) => {

    const response = await axiosInstance.get(
        `/brand/bookings/${bookingId}`
    );

    return response.data;
};


// Updates brand booking status ("accepted" or "rejected").
const updateBrandBookingStatus = async (bookingId, status) => {

    const response = await axiosInstance.patch(
        `/brand/bookings/${bookingId}/status`,
        {
            status
        }
    );

    return response.data;
};


// Sends a brand booking proposal.
const createBrandBooking = async (bookingData) => {

    const response = await axiosInstance.post(
        "/brand/bookings",
        bookingData
    );

    return response.data;
};


export {
    getBrandBookings,
    getBrandBookingById,
    updateBrandBookingStatus,
    createBrandBooking
};
