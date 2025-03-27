import mongoose from "mongoose";
import run from "../services/nlpService.js";
import { generateResponse } from "../services/llmservice.js";
import { getRefundStatus } from "../services/refundService.js";
import { getOrderDetails } from "../services/returnService.js";
import { generateLabel } from "../config/shippingLabel.js";
import { conversationHistory } from "../services/nlpService.js";

const nlpController = async (req, res) => {
  const { text, userId } = req.body;
  console.log("Received NLP Request:", req.body);

  // Validate input
  if (!text || typeof text !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid or missing 'text' field in request body" });
  }

  if (!userId || isNaN(Number(userId))) {
    return res
      .status(400)
      .json({ error: "Invalid or missing 'userId' field in request body" });
  }

  try {
    const numericUserId = Number(userId); // Convert userId to a Number

    // Process the user's input using the NLP service
    const result = await run(text, numericUserId);
    const { response, intent, orderId } = result;

    console.log("Processed NLP Response:", response);
    console.log("Intent:", intent);
    console.log("Order ID:", orderId);

    // Handle "Return Request" intent without an order ID
    if (intent === "Return Request" && !orderId) {
      console.log("Fetching past orders for user:", numericUserId);

      // Fetch past orders from the database
      const pastOrders = await mongoose.model("Order").find({ customer_id: numericUserId });

      if (pastOrders.length === 0) {
        return res.status(404).json({
          message: "No past orders found for this user. Please provide a valid order ID.",
        });
      }

      // Format the list of orders for the response
      const orderList = pastOrders.map((order) => ({
        orderId: order.order_id,
        date: order.order_date,
        items: order.items.map((item) => item.product_name).join(", "),
      }));

      // Send the response with the list of orders
      return res.status(200).json({
        message: "Please select the order you want to return.",
        orders: orderList,
      });
    }

    // Handle "Refund Status Inquiry" intent without an order ID
    if (intent === "Refund Status Inquiry" && !orderId) {
      console.log("Fetching past orders for user:", numericUserId);

      // Fetch past orders from the database
      const pastOrders = await mongoose.model("Order").find({ customer_id: numericUserId });

      if (pastOrders.length === 0) {
        return res.status(404).json({
          message: "No past orders found for this user. Please provide a valid order ID.",
        });
      }

      // Format the list of orders for the response
      const orderList = pastOrders.map((order) => ({
        orderId: order.order_id,
        date: order.order_date,
        status: order.status, // Include the status of the order
        items: order.items.map((item) => item.product_name).join(", "),
      }));

      // Send the response with the list of orders
      return res.status(200).json({
        message: "Please select the order you want to check the refund status for.",
        orders: orderList,
      });
    }

    // Handle intents with an order ID
    if (orderId && intent) {
      if (intent === "Return Request") {
        console.log("Return Request for Order ID:", orderId);

        // Fetch order details
        const orderDetails = await getOrderDetails(orderId);
        if (orderDetails) {
          const finalResponse = await generateResponse(orderDetails);

          // Update conversation history
          if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
          }
          conversationHistory[userId].push({ role: "model", parts: [{ text: finalResponse }] });

          return res.status(200).send(finalResponse);
        } else {
          return res.status(404).json({ error: "Order not found" });
        }
      } else if (intent === "Refund Status Inquiry") {
        console.log("Refund Status Inquiry for Order ID:", orderId);

        // Fetch refund status
        const status = await getRefundStatus(orderId);
        if (status) {
          return res.status(200).send(status);
        } else {
          return res.status(404).json({ error: "Refund status not found" });
        }
      } else if (intent === "Shipping Label Generation") {
        console.log("Shipping label generation for Order ID:", orderId);

        // Generate shipping label
        const label = await generateLabel(orderId);
        return res.status(200).send(label);
      } else {
        // Handle other intents
        return res.status(200).send(response);
      }
    }

    // Default response for unhandled cases
    console.log("default response");
    return res.status(200).send(response);
  } catch (error) {
    console.error("Error in nlpController:", error.message);
    return res.status(500).json({ error: "Failed to process the NLP request" });
  }
};

export { nlpController };