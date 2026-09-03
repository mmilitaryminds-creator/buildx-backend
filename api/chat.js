const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// تهيئة Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, projectData } = req.body;

    // بناء البرومبت الجديد
    const fullContext = `
    أنت "خبير BuildX" (BuildX Expert). محلل مشاريع واستثمار عالمي.
    
    ### البيانات المدخلة من المستخدم:
    ${JSON.stringify(projectData, null, 2)}
    
    ### وصف المشروع:
    ${prompt}
    
    ### تعليمات صارمة:
    1. استخدم "البحث" (Browser Search) المتاح لك لجمع بيانات حقيقية عن الدولة والمدينة والاقتصاد والمنافسة.
    2. أعد النتيجة كـ JSON منظم بدون نصوص إضافية.
    3. لا تخترع أرقاماً. إذا لم تتوفر بيانات، اكتب "البيانات غير متوفرة".
    4. اعرض سنة البيانات (مؤكد / تقديري).
    
    المطلوب: إرجاع JSON يشمل: final_score, final_label, indicators (مثل: demand, competition, budget_fit), pros, cons, recommendations, alternative_cities (إن وجدت), و final_verdict.
    `;

    // المحاولة الأولى مع Groq GPT-OSS 120B (مع البحث)
    try {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b", // النموذج الأفضل والمدعوم للبحث
        messages: [{ role: "user", content: fullContext }],
        tools: [{ type: "web_search" }] // تفعيل البحث
      });

      const responseText = completion.choices[0].message.content
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const parsedData = JSON.parse(responseText);
        return res.status(200).json({ result: parsedData });
      } catch {
        return res.status(200).json({ result: responseText });
      }
    } catch (groqError) {
      // إذا فشل، استخدم Gemini كخطة بديلة (Fallback)
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(fullContext);
      const responseText = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        return res.status(200).json({ result: JSON.parse(responseText) });
      } catch {
        return res.status(200).json({ result: responseText });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'فشل الاتصال: ' + error.message });
  }
};
