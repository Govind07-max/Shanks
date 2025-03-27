import ReturnItem from "../models/returnItem.js";
import User from "../models/user.js"; // Import the User model
import sendEmail from "../services/emailService.js";

export const getAllReturns = async (req, res) => {
    try {
        const returns = await ReturnItem.find();
        res.json(returns);
    } catch (error) {
        console.error("Error fetching returns:", error);
        res.status(500).json({ message: "Error fetching return requests" });
    }
};


// Update refund status and send an email
export const updateRefundStatus = async (req, res) => {
    const { orderId, newStatus } = req.body;

    try {
        // Find the return item by order ID
        const returnItem = await ReturnItem.findOneAndUpdate(
            { order_id: orderId },
            { refund_status: newStatus },
            { new: true }
        );

        if (!returnItem) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Fetch the user's email from the User collection
        const user = await User.findOne({ customer_id: returnItem.customer_id });
        if (!user) {
            return res.status(404).json({ message: "User not found for the given order" });
        }

        // Use the correct field for the email
        const userEmail = user.customer_email;

        // Send an email notification
        await sendEmail(userEmail, newStatus);

        res.json({ message: "Refund status updated and email sent" });

    } catch (error) {
        console.error("Error updating refund status:", error);
        res.status(500).json({ message: "Error updating refund status" });
    }
};