import transporter from "../../config/nodemailer.js";
import createApiError from "../ApiError.js";

/**
 * Sends an email using the configured Nodemailer SMTP transporter.
 * All sender metadata and SMTP credentials are read dynamically from environment variables.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} [options.html] - HTML formatted email body
 * @param {string} [options.text] - Plain text email body
 * @returns {Promise<Object>} Nodemailer sendMail result info
 */
const sendEmail = async ({ to, subject, html, text }) => {
    if (!to || typeof to !== "string" || !to.trim()) {
        throw createApiError(
            400,
            "Recipient email address ('to') is required"
        );
    }

    if (!subject || typeof subject !== "string" || !subject.trim()) {
        throw createApiError(
            400,
            "Email subject is required"
        );
    }

    if (!html && !text) {
        throw createApiError(
            400,
            "Email body content ('html' or 'text') is required"
        );
    }

    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.EMAIL;
    const fromName = process.env.SMTP_FROM_NAME;
    const defaultFrom = fromName && fromEmail 
        ? `"${fromName}" <${fromEmail}>` 
        : (fromEmail || "no-reply@creatorlink.com");

    const from = process.env.EMAIL_FROM || defaultFrom;

    const mailOptions = {
        from,
        to: to.trim(),
        subject: subject.trim(),
        ...(html && { html }),
        ...(text && { text })
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error("Failed to send email:", error.message);
        throw createApiError(
            500,
            "Failed to send email. Please try again later."
        );
    }
};

export { sendEmail };
export default sendEmail;
