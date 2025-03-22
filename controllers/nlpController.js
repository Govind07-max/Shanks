import run from "../services/nlpService.js";
import { getRefundStatus } from "../services/refundService.js";
import mongoose from "mongoose";
const nlpController = async (req, res) => {
  const { text, userId } = req.body;

  if (!text || typeof text !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid or missing 'text' field in request body" });
  }

  try {
    const result = await run(text, userId); // Pass the userId
    const { response, intent, orderId } = result;
    console.log(" Processed NLP Response: ", response);
    console.log(" Intent:", intent);
    console.log(" Order ID:", orderId);

    if (orderId && intent) {
      if (intent === "Return Request") {
        // Handle return request logic here
        console.log("Return Request for Order ID:", orderId);
        
        res.status(200).json({ response, intent, orderId });



      } else if (intent === "Refund Status Inquiry") {
        // Handle refund status inquiry logic here

        console.log("Refund Status Inquiry for Order ID:", orderId);
        const status = getRefundStatus(orderId);

        res.status(200).json({ "refund status": status });
        // res.status(200).json({ response, intent, orderId });
      }
    } else if (orderId === null) {
      // If order ID is null (meaning no valid order ID), send only the raw response
      res.status(200).json({ response });
    } else {
      res.status(200).json({ response });
    }
  } catch (error) {
    console.error("Error in nlpController:", error.message);
    res.status(500).json({ error: "Failed to process the NLP request" });
  }
};

export { nlpController };
