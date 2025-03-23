import Return from "../models/returnItem.js";

export async function getRefundStatus(orderId) {
    try {
        if (!orderId) {
            console.error(" Error: Order ID is missing");
            throw new Error("Order ID is required");
        }

        console.log(" Searching for refund status with Order ID:", orderId);

        
        const returnItem = await Return.findOne({ order_id: orderId }).select("refund_status");

        console.log(" Query Result:", returnItem);

        if (!returnItem) {
            console.warn(` No refund status found for Order ID: ${orderId}`);
            return null; 
        }

        console.log(" Refund Status Found:", returnItem.refund_status);
        return returnItem.refund_status;
    } catch (error) {
        console.error(" Error fetching refund status:", error.message);
        return null; 
    }
}
