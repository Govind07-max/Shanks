import Order from "../models/order.js"; 
import User from "../models/user.js"; 

async function generateLabel(orderId) {
    try {
        
        const order = await Order.findOne({ order_id: orderId });
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found`);
        }

        
        const user = await User.findOne({ order_ids: { $elemMatch: { $eq: orderId } } });
        if (!user) {
            throw new Error(`User associated with Order ID ${orderId} not found`);
        }

        
        const trackingNumber = order.tracking_number || Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const shippingDate = order.shipping_date || new Date().toISOString().split("T")[0]; // Default to today's date
        const senderName = "ACME Corporation"; // Static value
        const recipientName = user.customer_name || "Unknown Recipient";
        const recipientAddress = `${user.shipping_address.street}, ${user.shipping_address.city}, ${user.shipping_address.state}, ${user.shipping_address.zip_code}, ${user.shipping_address.country}`;
        const senderAddress = "456 Industrial Blvd, Los Angeles, 90001, USA"; // Static value

       
        const barcodeUrl = `https://quickchart.io/barcode?type=code128&text=${trackingNumber}&width=300&height=100&includeText=true`;

        // Call the shipping label API
        const response = await fetch('https://api.templated.io/v1/render', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 7bf48561-98a3-4a1f-93e2-a3b4f68a80ec'
            },
            body: JSON.stringify({
                "template": "097eb958-32e6-4e08-a5a2-357614ea61ff",
                "layers": {
                    "image-2": {
                        "image_url": barcodeUrl
                    },
                    "tracking-number": {
                        "text": `<b>${trackingNumber}</b>`,
                        "color": "#000000"
                    },
                    "remarks": {
                        "text": "<b>No Remark</b>",
                        "color": "#000000"
                    },
                    "label-remarks": {
                        "text": "REMARKS",
                        "color": "#000000"
                    },
                    "label-shipping-date": {
                        "text": "SHIPPING DATE",
                        "color": "#000000"
                    },
                    "shipping-date": {
                        "text": shippingDate,
                        "color": "#000000"
                    },
                    "package-dimensions": {
                        "text": "12cmx12cmx12cm",
                        "color": "#000000"
                    },
                    "dimensions": {
                        "text": "DIMENSIONS",
                        "color": "#000000"
                    },
                    "package-weight": {
                        "text": "2.5 KG",
                        "color": "#000000"
                    },
                    "weight": {
                        "text": "WEIGHT",
                        "color": "#000000"
                    },
                    "order-id": {
                        "text": orderId,
                        "color": "#000000"
                    },
                    "label-order-id": {
                        "text": "ORDER ID",
                        "color": "#000000"
                    },
                    "sender-name": {
                        "text": senderName,
                        "color": "#000000"
                    },
                    "from": {
                        "text": "FROM",
                        "color": "#000000"
                    },
                    "recipient-name": {
                        "text": recipientName,
                        "color": "#000000"
                    },
                    "ship-to": {
                        "text": "SHIP TO",
                        "color": "#000000"
                    },
                    "recipient-address": {
                        "text": recipientAddress,
                        "color": "#000000"
                    },
                    "sender-address": {
                        "text": senderAddress,
                        "color": "#000000"
                    }
                }
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('PDF Generated Successfully!');
            console.log('PDF URL:', result.url);
            return result.url;
        } else {
            console.error(' Error generating PDF:', result);
            throw new Error(result.message || "Failed to generate PDF");
        }
    } catch (error) {
        console.error(' An unexpected error occurred:', error.message);
        throw error;
    }
}

export { generateLabel };