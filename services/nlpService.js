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

2. **Structured Output Requirement:**  
   - If the identified intent is **Return Request, Refund Status Inquiry, or Shipping Label Generation**, you **MUST return structured output** in this format:  
     \`\`\`
     {"intent": "<identified_intent>", "order_id": "<extracted_order_id or null>"}
     \`\`\`
   - If no order ID is provided by the user, **still return the structured output, setting "order_id": null.**  
   - Do **NOT** delay structured output by first asking for an order ID. Always include it.

3. **Extract and Validate the Order ID:**  
   - The order ID format must be **three numbers, a hyphen, and two alphanumeric characters** (e.g., \`123-ab\`).  
   - If the **order ID matches** the format, extract it and confirm it in the response.  
   - If the **order ID is missing**, return \`"order_id": null\` in the structured output.  
   - If the **order ID is invalid**, respond:  
     **"That doesn’t seem to be a valid order ID. Please provide an order ID in the correct format (e.g., 123-ab)."**  
     - **DO NOT include structured output in this case.**

4. **Handling Return & Refund Requests Without an Order ID:**  
   - If the user asks for a **return or refund** but **does not provide an order ID**, DO NOT ask for it first.  
   - Instead, **return structured output immediately with \`"order_id": null\`** and then ask the user to provide their order ID.

5. **Return Eligibility Check & Shipping Label Generation:**  
   - If the user is eligible for return, ask:  
     **"Would you like to proceed with generating your return shipping label?"**  
   - If the user agrees, proceed with generating the shipping label.

6. **General Question Handling:**  
   - If the user’s message does not relate to returns, refunds, or shipping labels, politely refuse:  
     **"I'm sorry, but I can only assist with return and refund processes."**  
   - **DO NOT include structured output** for unrelated queries.

7. **Policy Inquiries:**  
   - If the user asks about return/refund policies, direct them to:  
     **"Please check the sidebar under 'Quick Actions' for our return and refund policies."**

8. **Always Enclose Structured Output Inside Triple Backticks (\`\`\`).**
   - Example:
     \`\`\`
     {"intent": "Return Request", "order_id": "123-AB"}
     \`\`\`
   - If no order ID is found:
     \`\`\`
     {"intent": "Return Request", "order_id": null}
     \`\`\`
`,
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
