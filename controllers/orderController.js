 import Order from "../models/order.js";
 import asyncHandler from "express-async-handler";
 
 // Controller to create a new order
 const CreateOrderController = asyncHandler(async (req, res) => {
   const {
     order_id,
     customer_id,
     items,
     total_amount,
     payment_type,
     status,
     order_date,
     tracking_id,
     carrier,
     customer_address,
     shipper_address,
   } = req.body;
 
   // Validate the request body
   if (
     !order_id ||
     !customer_id ||
     !items ||
     !Array.isArray(items) ||
     items.length === 0 ||
     !total_amount ||
     !payment_type ||
     !status ||
     !customer_address ||
     !customer_address.street ||
     !customer_address.city ||
     !customer_address.state ||
     !customer_address.zip_code ||
     !customer_address.country ||
     !shipper_address ||
     !shipper_address.street ||
     !shipper_address.city ||
     !shipper_address.state ||
     !shipper_address.zip_code ||
     !shipper_address.country
   ) {
     res.status(400);
     throw new Error("Please fill all the required fields");
   }
 
   // Validate items array
   for (const item of items) {
     if (
       !item.item_id ||
       !item.product_name ||
       !item.category ||
       !item.quantity ||
       !item.price
     ) {
       res.status(400);
       throw new Error("Each item must have item_id, product_name, category, quantity, and price");
     }
   }
 
   // Check if the order already exists
   const existingOrder = await Order.findOne({ order_id });
   if (existingOrder) {
     res.status(400);
     throw new Error("Order with this order_id already exists");
   }
 
   // Create a new order
   const newOrder = await Order.create({
     order_id,
     customer_id,
     items,
     total_amount,
     payment_type,
     status,
     order_date,
     tracking_id,
     carrier,
     customer_address,
     shipper_address,
   });
 
   // Respond with the created order
   res.status(201).json({
     message: "Order created successfully",
     order: newOrder,
   });
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