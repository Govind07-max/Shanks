import run from "../services/nlpService.js";
import { getRefundStatus } from "../services/refundService.js";
import mongoose from "mongoose";
import { getOrderDetails } from "../services/returnService.js";
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
    console.log(" Processed NLP Response: ", response);
    console.log(" Intent:", intent);
    console.log(" Order ID:", orderId);

    if (orderId && intent) {
      if (intent === "Return Request") {
        
        console.log("Return Request for Order ID:", orderId);
        const orderDetails = await getOrderDetails(orderId);
        res.status(200).json({ response, intent, orderId, orderDetails });
        



      } else if (intent === "Refund Status Inquiry") {
        

        console.log("Refund Status Inquiry for Order ID:", orderId);
        const status = await getRefundStatus(orderId);

        res.status(200).json({ "refund status": status });
        
      }
    } else if (orderId === null) {
      
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
