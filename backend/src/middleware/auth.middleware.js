import createApiError from "../utils/ApiError.js";

import {
    verifyAccessToken
} from "../utils/helpers/token.helper.js";


// Verifies the access token stored in the HttpOnly cookie
// before allowing the request to reach the controller.

const authenticateUser = (req, res, next) => {

    // Get access token from the HttpOnly cookie.
    const token = req.cookies.accessToken;

    // Check if access token exists.
    if (!token) {
        throw createApiError(
            401,
            "Access token is required"
        );
    }

    try {

        // Verify the access token.
        const decodedToken = verifyAccessToken(token);

        // Store authenticated user information
        // for controllers and services.
        req.user = decodedToken;

        next();

    } catch (error) {

        throw createApiError(
            401,
            "Invalid or expired access token"
        );
    }
};


export default authenticateUser;