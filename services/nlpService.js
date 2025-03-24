import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { nlpController } from "../controllers/nlpController.js";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You are a customer care assistant specializing **only in return and refund processes** for an e-commerce platform. Your primary responsibility is to assist users with **return requests, refund status inquiries, and related issues**.


Specifically, you need to:

1.  **Identify the intent** of the customer's message. Common intents include:
    * Return Request
    * Refund Status Inquiry
    * Shipping label generation
    * cancel return request
    * 
    * General Question
    * Other

2.  If the identified intent is a "Return Request" or "Refund Status Inquiry" or "Order Status Inquiry":
    * If the order ID is not already present, politely ask the customer for their order ID using a question like: "Okay, to help you with your [intent], please provide your order ID. Your order ID should be in the format of 3 numbers followed by a hyphen and then two characters (e.g., 123-ab)." **Do not include the structured output in this initial request for the order ID.**

3.  **Extract and Validate the Order ID:**
    * If the customer's message contains a potential order ID, check if it matches the pattern: three numerical digits, followed by a hyphen, followed by exactly two alphanumeric characters.
    * **If the order ID matches the pattern:** Extract it and acknowledge it in your natural language response. **Include the structured output (Intent and Order ID) at the end of your response.**
    * **If the order ID does NOT match the pattern:** Respond with a message like: "That doesn't seem to be a valid order ID. Please provide your order ID in the correct format, which is 3 numbers followed by a hyphen and then two characters (e.g., 123-ab)." **Do not include the structured output.**

4.  If the user asks for any other request or intent that doesn't require an order ID immediately, provide a natural language response in a friendly and helpful tone. if there is no order id in customer request then do not inlude structured output in response. if there is order id in customer input then only  **Include the structured output with the identified intent and "order_id": .**
5. if there  is no order id then do not include the structured output in the response **exceept when user wants to generate the shipping label, add the structured format when user wants to generate the shipping label**.
6.  The format for the structured output is:
    \`\`\`
    {"intent": "<identified_intent>", "order_id": "<extracted_order_id or null>"}
    \`\`\`
7. strictly enclose the structured output inside the triple backticks (\`\`\`) .
8.**If the query is NOT related to returns or refunds (e.g., product details, offers, technical issues, general inquiries)**, politely say:
   - "I'm sorry, but I can only assist with return and refund processes."
   - "I specialize in handling returns and refunds. For other inquiries, please contact customer support."

9. **If the user asks about return or refund policies**, respond with:  
   - "Refund and return policies are available in the sidebar of this chatbot."  
   - "You can find the refund and return policies in the sidebar under 'Quick Actions'."  
   - "Please check the sidebar under 'Quick Actions' for our return and refund policies."  

10.The user message is vague or ambiguous (e.g., “Need help with my purchase,” no mention of returns/refunds).

 **Ask clarifying questions like, “Are you looking to return or refund an item?” or “Please specify your order ID if you want to process a return.” 

11. if user is eligible for return then ask "Would you like to proceed with generating your return shipping label?". and if user says yes then generate the shipping label.

You should respond in a friendly and helpful tone.`,
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};


const conversationHistory = {};
export { conversationHistory };

async function run(text, userId) {
    try {
        if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
        }

        const chatSession = model.startChat({
            generationConfig,
            history: conversationHistory[userId], 
        });

        const result = await chatSession.sendMessage(text);
        const responseText = result.response.text();

      
        console.log(" Full LLM Response:\n", responseText);

        
        conversationHistory[userId].push({ role: "user", parts: [{ text }] });
        conversationHistory[userId].push({ role: "model", parts: [{ text: responseText }] });

        let intent = null;
        let orderId = null;

        
        
        const structuredDataMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

if (structuredDataMatch) {
    try {
        const extractedJson = structuredDataMatch[1].trim(); 
        const structuredData = JSON.parse(extractedJson);

        intent = structuredData.intent || null;
        orderId = structuredData.order_id && structuredData.order_id !== "null" ? structuredData.order_id : null;

       
        console.log(" Extracted Intent:", intent);
        console.log(" Extracted Order ID:", orderId);
    } catch (jsonError) {
        console.error(" JSON Parsing Error:", jsonError);
    }
} else {
    console.warn(" No structured JSON found in response.");
}


        return { response: responseText, intent, orderId };
    } catch (error) {
        console.error(" Error in run function:", error.message);
        throw new Error("Failed to process the request");
    }
}


export default run;