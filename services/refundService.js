import Return from "../models/returnItem.js";
import mongoose from "mongoose";
mongoose.set("debug",true); // Import your Return model

export async function getRefundStatus(orderId) {
    try {
        
        if (!orderId) {
            throw new Error("Order ID is required");
        }

        // Query the database to find the refund status for the given orderId
        const returnItem = await Return.findOne({ item_id: "029-SC" }).select("refund_status");

        if (!returnItem) {
            throw new Error(`No refund status found for Order ID: ${orderId}`);
        }

        return returnItem.refund_status;
    } catch (error) {
        console.error("Error fetching refund status:", error.message);
        throw new Error(error.message || "Failed to fetch refund status.");
    }
}
