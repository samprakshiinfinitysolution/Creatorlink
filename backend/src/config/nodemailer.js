import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

/**
 * Validates environment variables and builds the configuration for Nodemailer.
 * Reads SMTP host, port, secure flag, credentials, and service dynamically from .env.
 * No credentials, host, or ports are hardcoded.
 */
const getTransporterConfig = () => {
    const user = process.env.SMTP_USER || process.env.EMAIL;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const service = process.env.SMTP_SERVICE;
    const secure = process.env.SMTP_SECURE !== undefined
        ? (process.env.SMTP_SECURE === "true" || process.env.SMTP_SECURE === "1")
        : (port === 465);

    if (!user || !pass) {
        throw new Error(
            "Nodemailer configuration error: Missing required email credentials in .env. Please set SMTP_USER (or EMAIL) and SMTP_PASS (or EMAIL_PASS)."
        );
    }

    // Common options to ensure reliability on cloud hosting (Render, AWS, GCP):
    // 1. Force IPv4 (family: 4) to avoid cloud Linux IPv6 SMTP routing hangs.
    // 2. Set strict timeouts so requests fail fast with clear errors instead of hanging.
    // 3. Relax TLS rejection for self-signed or proxy certificates.
    const commonOptions = {
        auth: { user, pass },
        family: 4,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
            rejectUnauthorized: false
        }
    };

    // 1. If explicit service is set in .env (e.g. SMTP_SERVICE=gmail, sendgrid, mailgun)
    if (service) {
        return {
            service,
            ...commonOptions
        };
    }

    // 2. If host is set in .env
    if (host) {
        return {
            host,
            port: port || 587,
            secure: Boolean(secure),
            ...commonOptions
        };
    }

    // 3. Fallback to Gmail service if user email is @gmail.com
    if (user.includes("@gmail.com")) {
        return {
            service: "gmail",
            ...commonOptions
        };
    }

    throw new Error(
        "Nodemailer configuration error: Missing SMTP_HOST in .env. Please configure SMTP_HOST and SMTP_PORT."
    );
};

// Create reusable SMTP transporter
const transporter = nodemailer.createTransport(getTransporterConfig());

export { transporter, getTransporterConfig };
export default transporter;
