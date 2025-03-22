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
    systemInstruction: `You are a customer care agent for an e-commerce website. Your primary tasks are to understand the customer's intent and guide them appropriately.

Specifically, you need to:

1.  **Identify the intent** of the customer's message. Common intents include:
    * Return Request
    * Refund Status Inquiry
    * Order Status Inquiry
    * Shipping Information
    * General Question
    * Other

2.  If the identified intent is a "Return Request" or "Refund Status Inquiry" or "Order Status Inquiry":
    * If the order ID is not already present, politely ask the customer for their order ID using a question like: "Okay, to help you with your [intent], please provide your order ID. Your order ID should be in the format of 3 numbers followed by a hyphen and then two characters (e.g., 123-ab)." **Do not include the structured output in this initial request for the order ID.**

3.  **Extract and Validate the Order ID:**
    * If the customer's message contains a potential order ID, check if it matches the pattern: three numerical digits, followed by a hyphen, followed by exactly two alphanumeric characters.
    * **If the order ID matches the pattern:** Extract it and acknowledge it in your natural language response. **Include the structured output (Intent and Order ID) at the end of your response.**
    * **If the order ID does NOT match the pattern:** Respond with a message like: "That doesn't seem to be a valid order ID. Please provide your order ID in the correct format, which is 3 numbers followed by a hyphen and then two characters (e.g., 123-ab)." **Do not include the structured output.**

4.  If the user asks for any other request or intent that doesn't require an order ID immediately, provide a natural language response in a friendly and helpful tone. **Include the structured output with the identified intent and "order_id": null.**

5.  The format for the structured output is:
    \`\`\`
    {"intent": "<identified_intent>", "order_id": "<extracted_order_id or null>"}
    \`\`\`
6. strictly enclose the structured output inside the triple backticks (\`\`\`) .

You should respond in a friendly and helpful tone.`,
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

// In-memory storage for conversation history (for development)
const conversationHistory = {};

async function run(text, userId) {
    try {
        if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
        }

        const chatSession = model.startChat({
            generationConfig,
            history: conversationHistory[userId], // Use the stored history
        });

        const result = await chatSession.sendMessage(text);
        const responseText = result.response.text();

        // Debug: Log the full response before extraction
        console.log(" Full LLM Response:\n", responseText);

        // Store chat history
        conversationHistory[userId].push({ role: "user", parts: [{ text }] });
        conversationHistory[userId].push({ role: "model", parts: [{ text: responseText }] });

        let intent = null;
        let orderId = null;

        // Extract JSON from the response (Regex based)
        
        const structuredDataMatch = responseText.match(/```[\s\n]*\{[\s\S]*?"intent":.*?"order_id":.*?\}[\s\n]*```/);

        if (structuredDataMatch) {
            try {
                const extractedJson = structuredDataMatch[0].replace(/```/g, "").trim(); // Remove the backticks
                const structuredData = JSON.parse(extractedJson); // Parse JSON
                
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