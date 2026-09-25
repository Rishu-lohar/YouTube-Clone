import "dotenv/config";
import fs from "fs";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "YouTube Clone";

if (!BREVO_API_KEY || !SENDER_EMAIL) {
  throw new Error("BREVO_API_KEY and BREVO_SENDER_EMAIL must be configured");
}

const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  try {
    const formattedAttachments = attachments.map((att) => {
      let content;
      if (att.path) {
        content = fs.readFileSync(att.path).toString("base64");
      } else if (att.content) {
        content = Buffer.isBuffer(att.content)
          ? att.content.toString("base64")
          : Buffer.from(att.content).toString("base64");
      }
      return { name: att.filename, content };
    });

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: SENDER_NAME, email: SENDER_EMAIL },
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
        attachment: formattedAttachments.length
          ? formattedAttachments
          : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Brevo API error");
    }

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Unable to send OTP email", { cause: error });
  }
};

export default sendEmail;