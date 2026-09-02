const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, projectData } = req.body;

    // البرومبت الشامل الجديد (مع التغطية العالمية ونظام التقييم)
    const fullContext = `
    أنت "خبير BuildX" (BuildX Expert). أنت محلل مشاريع واستثمار عالمي.

    ### البيانات المدخلة من المستخدم:
    ${JSON.stringify(projectData, null, 2)}

    ### وصف المشروع:
    ${prompt}

    ### تعليمات صارمة (نظام تقييم حقيقي):
    1. هذا نظام عالمي، لا تصممه لدولة واحدة فقط. استخدم بيانات متاحة أو "غير متوفر".
    2. يجب أن يكون التقييم النهائي ناتجاً عن حساب واضح، وليس رقمًا عشوائيًا. 
    3. اعرض سنة البيانات لكل معلومة (مؤكد / تقديري / غير متوفر).
    4. لا تخترع أي أرقام. إذا لم تتوفر بيانات، اكتب "البيانات غير متوفرة".
    5. إذا كانت المدينة الحالية ليست الأفضل، اقترح مدناً بديلة بناءً على البيانات.

    ### المطلوب النهائي:
    أعد النتيجة كـ JSON صالح (Valid JSON) فقط، بدون أي نصوص إضافية. يجب أن يكون بنية JSON كالتالي:
    {
      "project_summary": {
        "country": "Algeria",
        "city": "Batna",
        "project_type": "مقهى",
        "budget": 50000,
        "area": 100,
        "audience": "الشباب"
      },
      "final_score": 78,
      "final_label": "🟢 ممتاز",
      "indicators": {
        "profitability": { "score": 70, "label": "🟢 جيد", "note": "تقديري" },
        "risk_level": { "score": 40, "label": "🟡 متوسط", "note": "مؤكد" },
        "demand_power": { "score": 85, "label": "🟢 قوي", "note": "تقديري" },
        "purchasing_power": { "score": 60, "label": "🟡 متوسط", "note": "مؤكد" },
        "competition_intensity": { "score": 50, "label": "🟡 متوسط", "note": "تقديري" },
        "location_suitability": { "score": 75, "label": "🟢 مناسب", "note": "مؤكد" },
        "growth_potential": { "score": 80, "label": "🟢 عالي", "note": "تقديري" },
        "budget_fit": { "score": 65, "label": "🟡 مناسب", "note": "مؤكد" }
      },
      "key_metrics": {
        "population": "حوالي 300 ألف - 2026 (تقديري)",
        "market_demand": "مرتفع - 2026",
        "competition_count": "5 منافسين - تقديري"
      },
      "pros": ["نقطة قوة 1", "نقطة قوة 2"],
      "cons": ["نقطة ضعف 1", "نقطة ضعف 2"],
      "recommendations": ["توصية 1", "توصية 2"],
      "alternative_cities": [
        { "city": "Algiers", "score": 86, "reason": "عدد سكان أكبر وقوة شرائية أعلى" },
        { "city": "Oran", "score": 81, "reason": "سوق أكثر نشاطاً" }
      ],
      "final_verdict": "المشروع واعد، لكنه يحتاج لتعديل الميزانية لتناسب الموقع."
    }
    `;

    // المحاولة مع Groq
    try {
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) throw new Error("No Groq Key");
      
      const groq = new Groq({ apiKey: groqApiKey });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: fullContext }],
        model: "openai/gpt-oss-120b"
      });
      let responseText = completion.choices[0].message.content;
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const parsedData = JSON.parse(responseText);
        return res.status(200).json({ result: parsedData });
      } catch {
        return res.status(200).json({ result: responseText });
      }

    } catch (groqError) {
      console.error("Groq failed, switching to Gemini:", groqError);

      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) throw new Error("No Gemini Key");

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(fullContext);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
          const parsedData = JSON.parse(responseText);
          return res.status(200).json({ result: parsedData });
        } catch {
          return res.status(200).json({ result: responseText });
        }

      } catch (geminiError) {
        console.error("Gemini failed too:", geminiError);
        return res.status(500).json({ error: 'فشل الاتصال: ' + geminiError.message });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'فشل الاتصال: ' + error.message });
  }
};
