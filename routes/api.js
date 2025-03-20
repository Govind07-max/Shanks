import express from "express";
const router = express.Router();
import { CreateOrderController, getOrderController } from "../controllers/orderController.js";

router.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

router.post("/CreateOrder", CreateOrderController);
router.post("/getOrder", getOrderController);






export default router; 