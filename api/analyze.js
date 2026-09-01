import { GoogleGenerativeAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const businessType = body.businessType || 'مشروع تجاري';
    const city = body.city || 'الجزائر';
    const country = body.country || 'الجزائر';
    const budget = body.budget || '10000';
    const targetAudience = body.targetAudience || 'العموم';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API Key is missing in environment variables.' });
    }

    const ai = new GoogleGenerativeAI({ apiKey });

    const prompt = `قم بإعداد تحليل سوق احترافي ومختصر باللغة العربية للمشروع التالي:
- النشاط: ${businessType}
- الدولة: ${country}
- المدينة: ${city}
- الميزانية: ${budget} دولار
- الفئة المستهدفة: ${targetAudience}`;

    // استخدام المكتبة الرسمية التي تتجاوز مشاكل أسماء النماذج تماماً
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const analysisText = response.text || 'لم يتم استرجاع نتيجة';

    return res.status(200).json({
      success: true,
      analysis: analysisText
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'حدث خطأ في الخادم' });
  }
}
