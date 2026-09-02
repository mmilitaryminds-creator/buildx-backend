const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

// قائمة بسيطة للتحقق من توافق بعض المدن (يمكن توسيعها لاحقاً)
const geoData = {
  "الجزائر": ["الجزائر العاصمة", "وهران", "قسنطينة", "باتنة", "سطيف"],
  "algeria": ["algiers", "oran", "constantine", "batna", "setif"],
  "الولايات المتحدة": ["نيويورك", "لوس أنجلوس", "شيكاغو", "هيوستن"],
  "united states": ["new york", "los angeles", "chicago", "houston"],
  "فرنسا": ["باريس", "ليون", "مرسيليا"],
  "france": ["paris", "lyon", "marseille"]
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, projectData } = req.body;

    // 1. التحقق الجغرافي الذكي
    const country = projectData.country?.toLowerCase() || "";
    const city = projectData.city?.toLowerCase() || "";

    // التحقق من التوافق إذا كانت القائمة تحتوي على هذه الدولة
    if (geoData[country]) {
      const validCities = geoData[country].map(c => c.toLowerCase());
      const isCityValid = validCities.includes(city);

      if (!isCityValid) {
        return res.status(400).json({ 
          error: "geo_mismatch",
          message: "⚠️ تعذر إجراء التحليل. يبدو أن هناك عدم توافق بين الدولة والمدينة المدخلتين. المدينة المحددة لا تقع ضمن الدولة التي اخترتها، ولذلك لا يمكننا تقديم تحليل موثوق للمشروع بهذه البيانات. يرجى التحقق من الدولة والمدينة ثم إعادة المحاولة."
        });
      }
    }

    // 2. البرومبت المحسن (لإرجاع JSON منظم)
    const fullContext = `
    أنت "خبير BuildX" (BuildX Expert). أنت محلل مشاريع وسوق محترف.

    ### البيانات المدخلة من المستخدم:
    ${JSON.stringify(projectData, null, 2)}

    ### وصف المشروع:
    ${prompt}

    ### تعليمات صارمة (مهم جداً):
    1. لا تعطِ إجابات عامة. حلل المشروع بناءً على الدولة والمدينة والميزانية ونوع المشروع.
    2. ميّز بوضوح بين البيانات الرسمية والتقديرات والتوقعات.
    3. لا تخترع أرقامًا أو منافسين أو مصادر.
    4. إذا كانت البيانات تقديرية، اكتب بوضوح: "تقديريًا" / "حوالي" / "Estimated".
    5. أظهر سنة البيانات (مثال: Population — 2026 أو Population estimate — 2027).
    6. أجب باللغة العربية.

    ### المطلوب النهائي:
    يجب أن تعيد النتيجة كـ JSON صالح (Valid JSON) فقط، بدون أي نصوص إضافية أو علامات Backticks (مثل \`\`\`). يجب أن يكون بنية JSON كالتالي:
    {
      "summary": "ملخص قصير للتحليل",
      "success_score": 78,
      "success_label": "🟢 ممتاز",
      "location": {
        "country": "Algeria",
        "city": "Batna",
        "population_country": "حوالي 45 مليون - 2026",
        "population_city": "حوالي 300 ألف - 2026",
        "population_forecast": "تقديريًا 310 ألف - 2027"
      },
      "budget_analysis": {
        "budget": 100000,
        "suitability": "🟢 مناسبة",
        "breakdown": {
          "rent": "تقديريًا $20,000",
          "equipment": "تقديريًا $30,000",
          "marketing": "تقديريًا $10,000",
          "operational": "تقديريًا $15,000",
          "reserve": "تقديريًا $25,000"
        }
      },
      "market_analysis": {
        "demand_level": "🟢 مرتفع",
        "trend": "السوق في نمو",
        "target_audience": ["الشباب", "الموظفون"],
        "notes": "الطلب مرتفع في هذه المنطقة"
      },
      "competition": {
        "competitors_count": "تقديريًا 5 منافسين",
        "level": "🟡 متوسطة",
        "details": "المنافسة متوسطة، المنافسون الرئيسيون هم..."
      },
      "pros": ["ميزة 1", "ميزة 2", "ميزة 3"],
      "cons": ["عيب 1", "عيب 2"],
      "risks": [
        { "risk": "المنافسة", "level": "🟡 متوسطة" },
        { "risk": "ارتفاع التكاليف", "level": "🔴 مرتفعة" }
      ],
      "alternative_cities": {
        "current_city": "Batna",
        "suggested_city": "Algiers",
        "reason": "عدد سكان أكبر وقوة شرائية أعلى"
      },
      "recommendation": {
        "decision": "🟢 أنصح بدراسة تنفيذ المشروع",
        "details": "المشروع لديه فرصة جيدة بسبب..."
      },
      "sources": [
        { "source": "Official statistics", "updated": "August 2026" }
      ]
    }
    `;

    // المحاولة الأولى: استخدام Groq
    try {
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) throw new Error("No Groq Key");
      
      const groq = new Groq({ apiKey: groqApiKey });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: fullContext }],
        model: "openai/gpt-oss-120b"
      });

      let responseText = completion.choices[0].message.content;

      // تنظيف النص من أي Backticks أو نصوص غريبة
      responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedData = JSON.parse(responseText);
      return res.status(200).json({ result: parsedData });

    } catch (groqError) {
      console.error("Groq failed, switching to Gemini:", groqError);

      // المحاولة الثانية: استخدام Gemini
      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) throw new Error("No Gemini Key");

        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(fullContext);
        let responseText = result.response.text();

        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const parsedData = JSON.parse(responseText);
        return res.status(200).json({ result: parsedData });

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
