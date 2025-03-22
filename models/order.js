import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.UUID, default: () => new mongoose.Types.UUID() }, // UUID for unique order ID
  order_id: { type: String, required: true, unique: true },
  customer_id: { type: Number, required: true },
  items: [
    {
      item_id: { type: String, required: true },
      product_name: { type: String, required: true },
      category: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // Stored as float
    }
  ],
  total_amount: { type: Number, required: true },
  payment_type: { type: String, enum: ["Card", "UPI", "Cash"], required: true },
  status: { type: String, enum: ["Delivered", "Cancelled", "Returned", "Processing"], required: true },
  order_date: { type: String, required: false },
  tracking_id: { type: String, required: false }, // Optional tracking ID
  carrier: { type: String, required: false }, // Carrier service name
  customer_address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    country: { type: String, required: true },
  },
  shipper_address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    country: { type: String, required: true },
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
