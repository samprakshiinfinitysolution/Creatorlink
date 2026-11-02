import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import {
    getAdminUsers,
    getAdminUserById
} from "./users.controller.js";
import {
    validateGetUsersQuery,
    validateUserIdParam
} from "./users.validation.js";

const router = express.Router();

// Strict RBAC: All Admin Users routes require valid JWT authentication and role === "admin"
router.use(
    authenticateUser,
    authorizeRoles("admin")
);

// Fetches paginated platform users with filtering and search
router.get(
    "/",
    validateGetUsersQuery,
    getAdminUsers
);

// Fetches deep dossier for a single user by ID
router.get(
    "/:id",
    validateUserIdParam,
    getAdminUserById
);

export default router;

