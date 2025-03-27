import express from "express";
const router = express.Router();
import { CreateOrderController, getOrderController } from "../controllers/orderController.js";
import {nlpController} from "../controllers/nlpController.js";
import { loginUser } from "../controllers/authController.js";
import { getAllReturns, updateRefundStatus } from "../controllers/refundController.js";

router.get("/", (req, res) => {
  res.json({ message: "API is working" });
});

router.post("/CreateOrder", CreateOrderController);
router.post("/getOrder", getOrderController);
router.post("/nlp/getorder", nlpController);
router.post("/auth/login", loginUser);

router.get("/admin/returns", getAllReturns);
router.put("/admin/update-refund-status", updateRefundStatus);






export default router; 