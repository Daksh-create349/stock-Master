
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Operation, AICommandResponse } from "../types";

// Helper to safe init API (environment variable should be set in real app)
const getAiClient = () => {
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeInventory = async (products: Product[], operations: Operation[]) => {
  const ai = getAiClient();
  if (!ai) {
    return "API Key is missing. Please configure the environment variable.";
  }

  const lowStockItems = products.filter(p => p.stock <= p.minStockRule);
  const prompt = `
    You are an expert Inventory Manager AI for 'StockMaster'.
    Analyze the following inventory data and provide a concise executive summary and 3 actionable recommendations.
    
    Data:
    - Total Products: ${products.length}
    - Low Stock Items: ${lowStockItems.map(p => `${p.name} (Qty: ${p.stock}, Min: ${p.minStockRule})`).join(', ')}
    - Recent Operations Pending: ${operations.filter(o => o.status !== 'Done').length}

    Keep the tone professional and efficient.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this time. Please try again later.";
  }
};

export const interpretCommand = async (command: string, productNames: string[], partnerNames: string[]): Promise<AICommandResponse> => {
  const ai = getAiClient();
  if (!ai) {
    return { intent: 'UNKNOWN', reply: 'AI Configuration missing.' };
  }

  const prompt = `
    You are the Voice Assistant for an Inventory System.
    User Command: "${command}"
    
    Context:
    - Existing Products: ${productNames.slice(0, 50).join(', ')}...
    - Existing Partners: ${partnerNames.slice(0, 20).join(', ')}...

    Task: classify the intent and extract entities.
    
    Intents:
    1. CREATE_PRODUCT: User wants to define a new item.
    2. CREATE_OPERATION: User wants to move stock (Buy/Receive, Sell/Deliver, Move/Transfer).
    3. CHECK_STOCK: User asks about quantity or location.
    4. UNKNOWN: Gibberish or unrelated.

    Return JSON complying with this schema:
    {
      intent: string,
      data: {
        productName?: string (fuzzy matched if possible),
        quantity?: number,
        partnerName?: string (fuzzy matched),
        operationType?: 'IN' (Receipt) | 'OUT' (Delivery) | 'INT' (Internal),
        targetLocation?: string
      },
      reply: string (A short, robotic, cool response confirming what you are doing)
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    intent: { type: Type.STRING },
                    data: {
                        type: Type.OBJECT,
                        properties: {
                            productName: { type: Type.STRING },
                            quantity: { type: Type.NUMBER },
                            partnerName: { type: Type.STRING },
                            operationType: { type: Type.STRING },
                            targetLocation: { type: Type.STRING }
                        }
                    },
                    reply: { type: Type.STRING }
                }
            }
        }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as AICommandResponse;

  } catch (error) {
    console.error(error);
    return { intent: 'UNKNOWN', reply: "I'm having trouble understanding the neural link." };
  }
}
