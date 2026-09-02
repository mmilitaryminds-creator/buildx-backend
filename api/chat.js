const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // السماح فقط بطلبات POST (لأننا نرسل بيانات)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'No prompt provided' });
    }

    // التأكد من وجود المفتاح
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }

    // إنشاء الاتصال بالنموذج الحديث والمتاح حالياً (بناءً على طلب Google في الرسالة)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    // رسالة خطأ واضحة تعكس المشكلة الحقيقية
    return res.status(500).json({ error: 'فشل الاتصال بـ Gemini: ' + error.message });
  }
};
