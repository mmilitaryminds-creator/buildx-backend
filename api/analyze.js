export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    const businessType = body.businessType || body.business || body.type || 'مشروع تجاري';
    const city = body.city || body.location || 'الجزائر';
    const country = body.country || 'الجزائر';
    const budget = body.budget || body.money || '10000';
    const targetAudience = body.targetAudience || body.audience || 'العموم';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel.' });
    }

    // برومبت ذكي يفحص حتى تناقضات المدخلات (مثل وضع مدينة لا تنتمي للدولة)
    const prompt = `أنت خبير ذكي ومحلل اقتصادي ساخر ولطيف قليلاً. قم بتحليل الطلب التالي لنشاط تجاري:
- الدولة المحددة: ${country}
- المدينة المكتوبة: ${city}
- نوع النشاط: ${businessType}
- الميزانية: ${budget} دولار
- الفئة المستهدفة: ${targetAudience}

ملاحظة هامة جداً: قم أولاً بالتحقق مما إذا كانت المدينة (${city}) منطقية أو تنتمي حقاً إلى الدولة (${country}). إذا لاحظت تناقضاً غبياً أو مضحكاً (مثل شخص يختار دولة عربية ويكتب مدينة أمريكية كنيويورك)، ابدأ تقريرك بتنبيه ذكي ومرح يوضح هذا التناقض بأسلوب احترافي، ثم أكمل التحليل الاقتصادي بناءً على الواقع الصحيح.

قدم التقرير باللغة العربية متضمناً:
1. ملاحظة ذكية حول المدخلات (إذا وجد تناقض جيو-اقتصادي) أو الملخص التنفيذي ونسبة نجاح المشروع (من 10).
2. تحليل السوق المستهدف والجمهور.
3. تحليل المنافسين والفرص المتاحة.
4. الجدوى المالية وتوزيع الميزانية.
5. توصيات عملية لضمان النجاح.`;

    const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const apiResponse = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await apiResponse.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'Gemini API Error' });
    }

    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم توليد أي محتوى.';

    return res.status(200).json({ success: true, analysis: analysisText });
  } catch (error) {
    console.error('Server Catch Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
