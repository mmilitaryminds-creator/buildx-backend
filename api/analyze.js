export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log("Received body:", req.body); // لمعرفة ما ترسله الواجهة بالتحديد

    const { businessType, location, budget, targetAudience, city, country } = req.body;
    
    // دمج المدينة والدولة لضمان عدم ضياع البيانات أياً كانت تسميتها
    const fullLocation = location || `${city || ''}, ${country || ''}`.trim() || 'الجزائر';
    const finalBusiness = businessType || 'مروع تجاري';
    const finalBudget = budget || 'غير محدد';
    const finalAudience = targetAudience || 'العموم';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing in Vercel.' });
    }

    const prompt = `أنت خبير تحليل أسواق واقتصادي. قدم تقريراً تحليلياً احترافياً ومفصلاً باللغة العربية لنشاط تجاري بناءً على المعطيات التالية:
- نوع النشاط: ${finalBusiness}
- الموقع: ${fullLocation}
- الميزانية: ${finalBudget} دولار
- الفئة المستهدفة: ${finalAudience}

يرجى تقديم الرد في شكل تقرير منظم يتضمن:
1. الملخص التنفيذي ونسبة نجاح المشروع (من 10)
2. تحليل السوق المستهدف والجمهور
3. تحليل المنافسين والفرص المتاحة
4. الجدوى المالية وتوزيع الميزانية
5. توصيات عملية لضمان النجاح`;

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
      console.error('Gemini API Error details:', data.error);
      return res.status(500).json({ error: data.error.message || 'Gemini API rejected the request' });
    }

    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'لم يتم توليد أي محتوى.';

    return res.status(200).json({ success: true, analysis: analysisText });
  } catch (error) {
    console.error('Server Catch Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
