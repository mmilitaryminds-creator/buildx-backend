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

    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API Key is missing in environment variables.' });
    }

    const prompt = `قم بإعداد تحليل سوق احترافي، دقيق، ومختصر باللغة العربية للمشروع التالي:
- النشاط: ${businessType}
- الدولة: ${country}
- المدينة: ${city}
- الميزانية: ${budget} دولار
- الفئة المستهدفة: ${targetAudience}
يرجى تقديم هيكل منظم وواضح للتقرير.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { 
            role: 'system', 
            content: 'أنت محلل استراتيجي وخبيرة تسويق عالمي تجيد بطلاقة فائقة جميع اللغات (العربية، الإنجليزية، الفرنسية، الألمانية، والصينية) وتكتب تقارير دقيقة واحترافية.' 
          },
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'فشل الاتصال بخدمة الذكاء الاصطناعي');
    }

    const analysisText = data.choices?.[0]?.message?.content || 'لم يتم استرجاع نتيجة';

    return res.status(200).json({
      success: true,
      analysis: analysisText
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'حدث خطأ في الخادم' });
  }
}
