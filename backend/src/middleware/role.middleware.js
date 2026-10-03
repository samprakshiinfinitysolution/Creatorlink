import createApiError from "../utils/ApiError.js";


// Checks whether the authenticated user
// has permission to access a specific role-based route.

const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        // User must be authenticated first.
        if (!req.user) {
            throw createApiError(
                401,
                "Authentication is required"
            );
        }


        // Check whether user's role is allowed.
        if (!allowedRoles.includes(req.user.role)) {
            throw createApiError(
                403,
                "You do not have permission to access this resource"
            );
        }


        next();
    };
};


export default authorizeRoles;