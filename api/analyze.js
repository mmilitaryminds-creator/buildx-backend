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

    const prompt = `قم بإعداد تحليل سوق احترافي ومختصر للمشروع التالي:
- النشاط: ${businessType}
- الدولة: ${country}
- المدينة: ${city}
- الميزانية: ${budget} دولار
- الفئة المستهدفة: ${targetAudience}
أعطني التقرير باللغة العربية بشكل منظم وواضح.`;

    // تم التحديث إلى النموذج المدعوم تماماً
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'فشل الاتصال بخدمة الذكاء الاصطناعي');
    }

    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم استرجاع نتيجة';

    return res.status(200).json({
      success: true,
      analysis: analysisText
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'حدث خطأ في الخادم' });
  }
}
