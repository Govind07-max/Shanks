import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send an email
const sendEmail = async (recipient, status) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient,
            subject: "Refund Status Update",
            text: `Hello,\n\nYour refund status has been updated to: ${status}.\n\nThank you for shopping with us!`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipient}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export default sendEmail;
