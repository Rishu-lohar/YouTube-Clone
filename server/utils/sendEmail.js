import nodemailer from "nodemailer";
import "dotenv/config";

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASS;

if (!emailUser || !emailPassword) {
  throw new Error("EMAIL_USER and EMAIL_PASS must be configured");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword.replace(/\s/g, ""),
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
    await transporter.verify();

    await transporter.sendMail({
      from: `"YouTube Clone" <${emailUser}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Unable to send OTP email", { cause: error });
  }
};

export default sendEmail;