const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, projectData } = req.body;

    // هذا هو "البرومبت" المحسن الذي يحول Gemini إلى خبير تحليل
    const fullContext = `
    أنت "خبير BuildX" (BuildX Expert). أنت مستشار أعمال واقتصادي خبير متخصص في تحليل المشاريع، السوق، والاستثمارات.
    
    ### الخطوة الأولى: تحليل البيانات
    لديك معلومات المشروع التي أدخلها المستخدم:
    ${projectData ? JSON.stringify(projectData, null, 2) : "لا توجد بيانات إضافية"}
    
    وصف المشروع الذي كتبه المستخدم:
    ${prompt}
    
    ### الخطوة الثانية: البحث والاستنتاج
    قم بتحليل شامل بناءً على:
    1. **الموقع الجغرافي:** استنتج قوة السوق في المدينة والدولة المحددة.
    2. **نوع النشاط:** قم بتحليل الطلب على هذا النشاط في السوق.
    3. **الميزانية والمساحة:** هل هما كافيان لنجاح المشروع؟ ما العيوب أو المخاطر المحتملة؟
    
    ### الخطوة الثالثة: التعليمات الصارمة (لا تتجاوزها)
    1. **لا تخترع أرقاماً أو بيانات غير موجودة.** إذا لم تكن متأكداً من معلومة، اكتب: "معلومة غير مؤكدة تحتاج لبحث ميداني".
    2. **لا تكتفِ بقراءة الأرقام.** بل قم بربطها ببعضها البعض لتقديم رؤية استثمارية واضحة.
    3. **قم بتقديم توصيات عملية وواقعية** لنجاح المشروع أو تعديله.
    4. **أجب باللغة العربية الفصحى** وبأسلوب تقرير مهني واضح ومقسم إلى نقاط (أو عناوين فرعية).
    
    ### المطلوب النهائي:
    أعد تقريراً شاملاً، مفصلاً، وواقعياً جداً يحتوي على: تحليل السوق، تقييم الجدوى، المخاطر، والتوصيات النهائية.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const result = await model.generateContent(fullContext);
    const response = result.response.text();

    res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'فشل الاتصال بـ Gemini: ' + error.message });
  }
};
