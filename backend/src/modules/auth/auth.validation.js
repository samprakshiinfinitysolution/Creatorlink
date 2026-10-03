// Validates registration data.

const validateRegister = (req, res, next) => {

    const {
        name,
        email,
        password,
        role
    } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "All fields are required",
            data: null
        });
    }

    if (!["creator", "brand"].includes(role)) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Only creator and brand accounts can be registered",
            data: null
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Password must be at least 6 characters",
            data: null
        });
    }

    next();
};


// Validates login data.

const validateLogin = (req, res, next) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Email and password are required",
            data: null
        });
    }

    next();
};


// Checks refresh-token cookie.

const validateRefreshToken = (req, res, next) => {

    if (!req.cookies.refreshToken) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Refresh token is required",
            data: null
        });
    }

    next();
};


export {
    validateRegister,
    validateLogin,
    validateRefreshToken
};