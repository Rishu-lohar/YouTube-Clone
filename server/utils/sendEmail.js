import "dotenv/config";
import fs from "fs";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY must be configured");
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
      return { filename: att.filename, content };
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `YouTube Clone <${FROM_EMAIL}>`,
        to: [to],
        subject,
        text,
        html,
        attachments: formattedAttachments.length
          ? formattedAttachments
          : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Resend API error");
    }

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Unable to send OTP email", { cause: error });
  }
};

export default sendEmail;