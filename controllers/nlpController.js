import run from "../services/nlpService.js";
import { getRefundStatus } from "../services/refundService.js";
import { getOrderDetails } from "../services/returnService.js";
import { generateResponse } from "../services/llmservice.js"; 
import { conversationHistory } from "../services/nlpService.js";
import { generateLabel } from "../config/shippingLabel.js";
import mongoose from "mongoose";

const nlpController = async (req, res) => {
  const { text, userId } = req.body;

  if (!text || typeof text !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid or missing 'text' field in request body" });
  }

  try {
    const result = await run(text, userId);
    const { response, intent, orderId } = result;
    console.log("Processed NLP Response:", response);
    console.log("Intent:", intent);
    console.log("Order ID:", orderId);

    console.log("Conversation History for User:", userId, conversationHistory[userId]);

    if (orderId && intent) {
      if (intent === "Return Request") {
        console.log("Return Request for Order ID:", orderId);
        const orderDetails = await getOrderDetails(orderId);
        if (orderDetails) {
          const finalResponse = await generateResponse(orderDetails);
          if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
          }
          conversationHistory[userId].push({ role: "model", parts: [{ text: finalResponse }] });

          res.status(200).json({ response: finalResponse });
        } else {
          res.status(404).json({ error: "Order not found" });
        }
      } else if (intent === "Refund Status Inquiry") {
        console.log("Refund Status Inquiry for Order ID:", orderId);
        const status = await getRefundStatus(orderId);
        if (status) {
          res.status(200).json({ Refund_status: status });
        } else {
          res.status(404).json({ error: "Refund status not found" });
        }
      } else if (intent === "Shipping label generation") {
        console.log("Shipping label generation for Order ID:", orderId);
        const Label = await generateLabel(orderId);

        res.status(200).send(Label);
      } else {
        
        res.status(200).send(response);
      }
    } else {
      
      res.status(200).send(response);
    }
  } catch (error) {
    console.error("Error in nlpController:", error.message);
    res.status(500).json({ error: "Failed to process the NLP request" });
  }
};

export { nlpController };