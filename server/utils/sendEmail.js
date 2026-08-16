import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
    try {
        await transporter.sendMail({
            from: `"YouTube Clone" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
            attachments,
        });

        console.log("✅ Email sent successfully");
    } catch (error) {
        console.error("❌ Email sending failed:", error);
    }
};

export default sendEmail;