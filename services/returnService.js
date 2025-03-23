import Order from "../models/order.js"
; // Import the Order model

export async function getOrderDetails(orderId) {
    try {
        if (!orderId) {
            console.error("Error: Order ID is missing");
            throw new Error("Order ID is required");
        }

        console.log(" Searching for order details with Order ID:", orderId);

        
        const orderDetails = await Order.findOne({ order_id: orderId });

        console.log(" Query Result:", orderDetails);

        if (!orderDetails) {
            console.warn(`No order found for Order ID: ${orderId}`);
            return null; 
        }

        console.log(" Order Details Found:", orderDetails);
        return orderDetails; // Return the order details
    } catch (error) {
        console.error("Error fetching order details:", error.message);
        return null; 
    }
}