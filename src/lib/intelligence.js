import { GoogleGenAI } from '@google/genai';

// Initialize the AI with your secret API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function computeShipmentIntelligence(shipment) {
  // 1. Give the AI the context and the shipment data
  const prompt = `
    You are an expert Supply Chain Risk Analyst AI. 
    Analyze the following shipment and determine the risk of delay.
    Shipment Data: ${JSON.stringify(shipment)}
    
    Return a JSON response with:
    - riskScore: "Low", "Medium", or "High"
    - predictedDelayPercent: A number from 0 to 100
    - explainability: An array of 2 short strings explaining your reasoning based on the cargo, priority, and recent anomalies.
    - recommendations: An array of 2 short action items for the logistics manager.
  `;

  // 2. Make the call to the AI model
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json", // Force the AI to only return valid JSON
    }
  });

  // 3. Parse the AI's intelligent response and return it to the dashboard!
  const intelligence = JSON.parse(response.text());
  
  return {
    riskScore: intelligence.riskScore,
    predictedDelayPercent: intelligence.predictedDelayPercent,
    eta: shipment.eta, // You could also ask the AI to recalculate the ETA!
    explainability: intelligence.explainability,
    recommendations: intelligence.recommendations,
  };
}

