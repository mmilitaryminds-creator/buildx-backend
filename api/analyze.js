import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { businessType, location, budget, targetAudience } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in environment variables.' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert market research analyst. Provide a professional and structured market analysis report for a new business based on the following details:
- Business Type: ${businessType}
- Location: ${location}
- Budget: ${budget}
- Target Audience: ${targetAudience || 'General public'}

Please provide the response in a structured format containing:
1. Executive Summary & Viability Score (out of 10)
2. Target Market & Customer Profile
3. Competitor Analysis & Market Opportunities
4. Financial Feasibility & Budget Allocation Strategy
5. Actionable Recommendations for Success
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const analysisText = response.text;

    return res.status(200).json({ success: true, analysis: analysisText });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
