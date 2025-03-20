 import Order from "../models/order.js";
 import mongoose from "mongoose";
 import asyncHandler from "express-async-handler";
 import { returnEligible } from "../services/OrderService.js";
import e from "express";
const CreateOrderController = asyncHandler(async (req, res) => {
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      productName,
      productCategory,
      deliveryDate,
      price,
      paymentMethod,
      returnWindowDays,
      orderStatus,
    } = req.body;
    //validate the request
    if (
      !orderId ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !productName ||
      !productCategory ||
      !deliveryDate ||
      !price ||
      !paymentMethod ||
      !returnWindowDays ||
      !orderStatus
    ) {
      res.status(400);
      throw new Error("Please fill all the required fields");
    }
    //create a new order
    const newOrder = await Order.create({
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      productName,
      productCategory,
      deliveryDate,
      price,
      paymentMethod,
      returnWindowDays,
      orderStatus,
    });
    res.status(201).json(newOrder);
  });

  const getOrderController = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400);
      throw new Error("Please provide an orderId");
    }
    const order = await Order
      .findOne({ orderId: orderId })
      .select("orderId customerName customerEmail customerPhone productName productCategory deliveryDate price paymentMethod returnWindowDays orderStatus");
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }else{
    // returnEligible(order);
    const customerPhone = order.customerPhone;
      console.log(`Customer Phone Number: ${customerPhone}`);
      res.status(200).json(order);
    }
    // get the phone no. from the order


    

  });


export { CreateOrderController, getOrderController };