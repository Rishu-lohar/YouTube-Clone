import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateInvoice = async ({
  name,
  email,
  plan,
  amount,
  orderId,
  paymentId,
  startDate,
  expiryDate,
}) => {
  return new Promise((resolve, reject) => {
    try {
      // invoices folder create if not exists
      const invoiceDir = path.join(process.cwd(), "invoices");

      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir);
      }

      const invoicePath = path.join(
        invoiceDir,
        `Invoice-${orderId}.pdf`
      );

      const doc = new PDFDocument({
        margin: 50,
      });

      const stream = fs.createWriteStream(invoicePath);

      doc.pipe(stream);

      // Heading
      doc
        .fontSize(24)
        .fillColor("#ff0000")
        .text("YouTube Clone", {
          align: "center",
        });

      doc.moveDown();

      doc
        .fontSize(20)
        .fillColor("black")
        .text("Subscription Invoice", {
          align: "center",
        });

      doc.moveDown(2);

      doc.fontSize(13);

      doc.text(`Customer Name : ${name}`);
      doc.text(`Email         : ${email}`);

      doc.moveDown();

      doc.text(`Plan          : ${plan}`);
      doc.text(`Amount        : ₹${amount}`);
      doc.text(`Order ID      : ${orderId}`);
      doc.text(`Payment ID    : ${paymentId}`);

      doc.moveDown();

      doc.text(
        `Start Date    : ${new Date(startDate).toLocaleDateString()}`
      );

      doc.text(
        `Expiry Date   : ${new Date(expiryDate).toLocaleDateString()}`
      );

      doc.moveDown(2);

      doc
        .fontSize(16)
        .fillColor("green")
        .text("Payment Status : SUCCESS");

      doc.moveDown(2);

      doc
        .fontSize(12)
        .fillColor("gray")
        .text(
          "Thank you for purchasing YouTube Premium Subscription."
        );

      doc.end();

      stream.on("finish", () => {
        resolve(invoicePath);
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

export default generateInvoice;