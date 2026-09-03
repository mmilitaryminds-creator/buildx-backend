const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, projectData } = req.body;

    const fullContext = `
    أنت "خبير BuildX" (BuildX Expert). أنت محلل مشاريع واستثمار عالمي.

    ### البيانات المدخلة من المستخدم:
    ${JSON.stringify(projectData, null, 2)}

    ### وصف المشروع:
    ${prompt}

    ### تعليمات صارمة:
    1. لا تخترع أرقاماً. إذا لم تتوفر بيانات، اكتب "البيانات غير متوفرة".
    2. اعرض سنة البيانات (مؤكد / تقديري).
    3. أجب باللغة العربية.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(fullContext);
    const response = result.response.text();

    return res.status(200).json({ result: response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'فشل الاتصال: ' + error.message });
  }
};
