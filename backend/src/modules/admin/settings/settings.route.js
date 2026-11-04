import express from "express";
import authenticateUser from "../../../middleware/auth.middleware.js";
import authorizeRoles from "../../../middleware/role.middleware.js";
import { uploadSingleImage } from "../../../middleware/upload.middleware.js";
import {
    getAdminProfile,
    updateAdminProfile,
    uploadAdminAvatar,
    deleteAdminAvatar,
    changeAdminPassword,
    getSystemInfo
} from "./settings.controller.js";
import {
    validateUpdateProfile,
    validateChangePassword
} from "./settings.validation.js";

const router = express.Router();

// Strict RBAC: All Settings endpoints require authenticated admin role
router.use(authenticateUser, authorizeRoles("admin"));

// Profile management
router.get("/profile", getAdminProfile);
router.patch("/profile", validateUpdateProfile, updateAdminProfile);

// Avatar upload & deletion
router.post("/avatar", uploadSingleImage, uploadAdminAvatar);
router.delete("/avatar", deleteAdminAvatar);

// Password modification
router.post("/password", validateChangePassword, changeAdminPassword);

// System telemetry
router.get("/system", getSystemInfo);

export default router;

