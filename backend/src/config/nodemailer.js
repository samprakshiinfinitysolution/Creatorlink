import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/**
 * Validates environment variables and builds the configuration for Nodemailer.
 * Reads SMTP host, port, secure flag, or service dynamically from environment variables.
 */
const getTransporterConfig = () => {
    const user = process.env.EMAIL;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        throw new Error(
            "Nodemailer configuration error: Missing required email credentials. Please define EMAIL and EMAIL_PASS in your environment."
        );
    }

    // 1. Explicit custom SMTP host and port configuration
    if (process.env.SMTP_HOST) {
        const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
        const secure = process.env.SMTP_SECURE !== undefined
            ? process.env.SMTP_SECURE === "true"
            : port === 465;

        return {
            host: process.env.SMTP_HOST,
            port,
            secure,
            auth: { user, pass }
        };
    }

    // 2. Explicit SMTP service configuration (e.g., SendGrid, Mailgun)
    if (process.env.SMTP_SERVICE) {
        return {
            service: process.env.SMTP_SERVICE,
            auth: { user, pass }
        };
    }

    // 3. Provider detection: use Gmail service if sender address is on Gmail
    if (typeof user === "string" && user.toLowerCase().endsWith("@gmail.com")) {
        return {
            service: "gmail",
            auth: { user, pass }
        };
    }

    // 4. Default standard SMTP fallback
    return {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user, pass }
    };
};

// Create reusable SMTP transporter without initiating network calls or auto-verification
const transporter = nodemailer.createTransport(getTransporterConfig());

export { transporter };
export default transporter;
