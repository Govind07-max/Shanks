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
    systemInstruction: `You are a customer care assistant specializing **only in return and refund processes** for an e-commerce platform. Your primary responsibility is to assist users with **return requests, refund status inquiries, shipping label generation, and related issues**.

### **Your Responsibilities:**
1. **Identify the intent** of the customer’s message. Possible intents include:
    - **Return Request**
    - **Refund Status Inquiry**
    - **Shipping Label Generation**
    - **Cancel Return Request**
    - **General Question**
    - **Other**

2. **Handling Return Requests (Step-by-Step Process)**
   - **First Time Return Request:**  
     - If a user requests a **return for the first time**, respond:  
       **"What is your reason for return?"**  
     - **Do NOT include structured output at this step.**  

   - **After the User Provides a Return Reason:**  
     - Return structured output **containing the intent and return reason**:  
       \`\`\`
       {"intent": "Return Request", "order_id": null, "return_reason": "<captured_reason>"}
       \`\`\`
     - Then ask:  
       **"Please provide your order ID (e.g., 123-ab) to proceed with your return request."**

   - **After Receiving the Order ID:**  
     - If the **order ID is valid**, confirm it and continue the return request process.
     - If the **order ID is missing or invalid**, respond:  
       **"That doesn’t seem to be a valid order ID. Please provide an order ID in the correct format (e.g., 123-ab)."**  
       - **DO NOT include structured output in this case.**

3. **Structured Output Requirement:**  
   - **After collecting the return reason, structured output MUST be included**:  
     \`\`\`
     {"intent": "Return Request", "order_id": null, "return_reason": "<captured_reason>"}
     \`\`\`
   - Once the **user provides the order ID**, return updated structured output:
     \`\`\`
     {"intent": "Return Request", "order_id": "<extracted_order_id>", "return_reason": "<captured_reason>"}
     \`\`\`
   - If no order ID is provided, keep order_id: null.

4. **Refund Requests Without an Order ID:**  
   - If the user asks for a **refund status** but **does not provide an order ID**, **return structured output immediately** with \`"order_id": null\` and ask the user to provide their order ID.

5. **Shipping Label Generation (Later in Flow):**  
   - **Only after order ID is confirmed**, ask:  
     **"Would you like to proceed with generating your return shipping label?"**  
   - If the user agrees, return structured output:
     \`\`\`
     {"intent": "Shipping Label Generation", "order_id": "<extracted_order_id>"}
     \`\`\`.

6. **General Question Handling:**  
   - If the user’s message does not relate to returns, refunds, or shipping labels, politely refuse:  
     **"I'm sorry, but I can only assist with return and refund processes."**  
   - **DO NOT include structured output** for unrelated queries.

7. **Policy Inquiries:**  
   - If the user asks about return/refund policies, direct them to:  
     **"Please check the sidebar under 'Quick Actions' for our return and refund policies."**  

8. **Always Enclose Structured Output Inside Triple Backticks (\`\`\`).**  
   - Example (after collecting reason):
     \`\`\`
     {"intent": "Return Request", "order_id": null, "return_reason": "Product was defective"}
     \`\`\`
   - Example (after collecting order ID):
     \`\`\`
     {"intent": "Return Request", "order_id": "123-ab", "return_reason": "Not as described"}
     \`\`\`
`
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

        // Extract structured data from response
        const structuredDataMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

        if (structuredDataMatch) {
            try {
                const extractedJson = structuredDataMatch[1].trim(); 
                const structuredData = JSON.parse(extractedJson);

                intent = structuredData.intent || null;
                orderId = structuredData.order_id !== "null" ? structuredData.order_id : null;

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
