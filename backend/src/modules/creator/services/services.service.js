import mongoose from "mongoose";

import CreatorService from "./services.model.js";
import createApiError from "../../../utils/ApiError.js";

import {
    getPagination,
    getPaginationData
} from "../../../utils/pagination.js";


// Create a new service for the authenticated creator.
const createService = async (creatorId, serviceData) => {

    const service = await CreatorService.create({
        creator: creatorId,
        ...serviceData
    });

    return service;
};


// Get all services belonging to the authenticated creator.
//
// Supports:
// - pagination
// - search by title/description/category
// - category filter
// - platform filter
// - active/inactive filter
// - sorting

const getMyServices = async (creatorId, query) => {
    const {
        page = 1,
        limit = 10,
        search,
        category,
        platform,
        isActive,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = query;

    const {
        page: currentPage,
        limit: itemsPerPage,
        skip
    } = getPagination(page, limit);


    const filter = {
        creator: creatorId
    };


    // Search across fields that are useful to a creator's service listing.
    if (search && search.trim()) {

        const searchTerm = search.trim();

        filter.$or = [
            {
                title: {
                    $regex: searchTerm,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: searchTerm,
                    $options: "i"
                }
            },
            {
                category: {
                    $regex: searchTerm,
                    $options: "i"
                }
            }
        ];
    }

    // Filter by service category.
    if (category && category.trim()) {
        filter.category = category.trim();
    }


    // Filter by platform.
    if (platform && platform.trim()) {
        filter.platform = platform.trim();
    }

    // Convert query-string boolean into an actual boolean.
    if (isActive !== undefined) {

        if (isActive === "true") {
            filter.isActive = true;
        }

        if (isActive === "false") {
            filter.isActive = false;
        }
    }

    // Only allow known sortable fields.
    const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "title",
        "price",
        "deliveryTime"
    ];


    const safeSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";


    const safeSortOrder = sortOrder === "asc"
        ? 1
        : -1;

    const sort = {
        [safeSortBy]: safeSortOrder
    };


    const [services, totalItems] = await Promise.all([
        CreatorService
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(itemsPerPage),

        CreatorService.countDocuments(filter)
    ]);


    return {
        services,
        pagination: getPaginationData(
            currentPage,
            itemsPerPage,
            totalItems
        )
    };
};


// Get one service belonging to the authenticated creator.
const getServiceById = async (creatorId, serviceId) => {

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        throw createApiError(
            400,
            "Invalid service ID"
        );
    }


    const service = await CreatorService.findOne({
        _id: serviceId,
        creator: creatorId
    });


    if (!service) {
        throw createApiError(
            404,
            "Creator service not found"
        );
    }


    return service;
};


// Update a creator's own service.
const updateService = async (
    creatorId,
    serviceId,
    serviceData
) => {

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        throw createApiError(
            400,
            "Invalid service ID"
        );
    }


    const service = await CreatorService.findOneAndUpdate(
        {
            _id: serviceId,
            creator: creatorId
        },
        {
            $set: serviceData
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!service) {
        throw createApiError(
            404,
            "Creator service not found"
        );
    }
    return service;
};


// Delete a creator's own service.
const deleteService = async (creatorId, serviceId) => {

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        throw createApiError(
            400,
            "Invalid service ID"
        );
    }


    const service = await CreatorService.findOneAndDelete({
        _id: serviceId,
        creator: creatorId
    });


    if (!service) {
        throw createApiError(
            404,
            "Creator service not found"
        );
    }


    return service;
};


export {
    createService,
    getMyServices,
    getServiceById,
    updateService,
    deleteService
};