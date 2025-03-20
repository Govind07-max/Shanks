import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema({
    orderId: { type: String, required: true, ref: 'Order' }, 
    customerName: { type: String, required: true },
    returnReason: { type: String, required: true }, 
    requestDate: { type: Date, default: Date.now },
    returnStatus: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Completed'], 
        default: 'Pending' 
    },
    refundStatus: { 
        type: String, 
        enum: ['Not Initiated', 'Processing', 'Completed'], 
        default: 'Not Initiated' 
    },
    returnLabelUrl: { type: String }, 
});


const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
export default ReturnRequest;
