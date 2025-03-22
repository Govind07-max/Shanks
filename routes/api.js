import express from "express";
const router = express.Router();
import { CreateOrderController, getOrderController } from "../controllers/orderController.js";
import {nlpController} from "../controllers/nlpController.js";

router.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

router.post("/CreateOrder", CreateOrderController);
router.post("/getOrder", getOrderController);
router.post("/nlp/getorder", nlpController);






export default router; 