import mongoose from "mongoose";

const returnItemschema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.UUID, default: () => new mongoose.Types.UUID() }, // Unique order ID
    customer_id: { type: Number, required: true },
    order_id: { type: String, unique: true },
    
    item_id: { type: String, required: true,unique: true },
    product_name: { type: String, required: true },
    category: { type: String, required: true },

    order_date: { type: Date, required: true, default: Date.now }, // ISODate format
    return_status: { type: String, enum: ["Pending", "Approved", "Rejected", "Completed"], required: true },
    return_date: { type: Date }, // If applicable
    return_reason: { type: String },
    return_approval: { type: String, enum: ["Pending", "Approved", "Rejected"], required: true },

    refund_status: { type: String, enum: ["Pending", "Processing", "Completed", "Failed"], required: true },
    refund_amount: { type: Number, required: true }, // Stored as float

    payment_type: { type: String, enum: ["Card", "UPI", "Cash"], required: true },

    return_tracking_id: { type: String, required: false }, // Optional tracking ID
    return_carrier: { type: String, required: false }, // Carrier service for returns

    policy_id: { type: mongoose.Schema.Types.UUID, default: () => new mongoose.Types.UUID() }, // Unique policy reference

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

const Return = mongoose.model("Return", returnItemschema);
export default Return;
