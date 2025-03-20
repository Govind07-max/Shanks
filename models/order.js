import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  productName: { type: String, required: true },
  productCategory: { type: String, required: true }, // e.g., Electronics, Clothing
  purchaseDate: { type: Date, required: true, default: Date.now },
  deliveryDate: { type: Date, required: true },
  price: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["Card", "UPI", "Cash"],
    required: true,
  },
  returnEligible: { type: Boolean, default: false },
  returnWindowDays: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ["Delivered", "Cancelled", "Returned", "Processing"],
    required: true,
  },
});

// Export model using ES6 syntax
const Order = mongoose.model("Order", orderSchema);
export default Order;
