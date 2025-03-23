import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.UUID, default: () => new mongoose.Types.UUID() }, // UUID for unique user ID
  customer_id: { type: Number, required: true, unique: true },
  customer_name: { type: String, required: true },
  password: { type: String, required: true }, // Store hashed password for security
  customer_email: { type: String, required: true, unique: true },
  customer_phone: { type: String, required: true },
  shipping_address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip_code: { type: String, required: true },
    country: { type: String, required: true },
  },
  order_ids: [{ type: String, required: true }], // Array of order IDs (one-to-many relationship)
});

const User = mongoose.model("User", userSchema);

export default User;
