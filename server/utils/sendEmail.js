import nodemailer from "nodemailer";

// Debug (Temporary)
console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "🔑 EMAIL_PASS:",
  process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌"
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
}) => {
  try {
    // Verify SMTP Connection
    await transporter.verify();
    console.log("✅ SMTP Server Connected");

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
    console.error("❌ Email sending failed");
    console.error(error);
  }
};

export default sendEmail;