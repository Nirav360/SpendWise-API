import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export const generateInsights = async (currentMonthData, previousMonthData) => {
  try {
    const prompt = `
You are an intelligent personal finance advisor.

The user already sees:
- total balance
- total income
- total expenses

DO NOT repeat totals.

Your task is to analyze transaction history and provide useful financial insights.

Each transaction contains:
- category
- description
- amount
- payment mode
- type
- date

IMPORTANT RULES:

1. Detect recurring fixed expenses.
Examples:
- Bus pass
- Rent
- EMI
- Subscription

Do NOT treat recurring expenses as overspending.

2. Focus mainly on variable/discretionary spending:
- Food outside
- Shopping
- Entertainment
- Cab rides

3. Compare current month with previous month.

4. Detect:
- spending trends
- frequent small expenses
- unusual spending
- positive saving habits
- smart recommendations

5. Use description field for better understanding.

OUTPUT RULES:
- Maximum 5 bullet points
- Each line must start with "•"
- Keep concise
- Professional tone
- Currency INR (₹)

CURRENT MONTH TRANSACTIONS:
${JSON.stringify(currentMonthData)}

PREVIOUS MONTH TRANSACTIONS:
${JSON.stringify(previousMonthData)}
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return result.text?.replace(/\*/g, "•")?.trim();
  } catch (error) {
    console.error("Gemini Error:", error);

    throw new Error("AI service is temporarily unavailable");
  }
};
