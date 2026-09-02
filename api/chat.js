const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, projectData } = req.body;

    const fullContext = `
    أنت "خبير BuildX" (BuildX Expert). أنت مستشار أعمال خبير في تحليل المشاريع والاستثمار.
    
    ### البيانات المدخلة من المستخدم:
    ${projectData ? JSON.stringify(projectData, null, 2) : "لا توجد بيانات إضافية"}
    
    ### وصف المشروع:
    ${prompt}
    
    ### تعليمات صارمة:
    1. لا تخترع أي أرقام أو بيانات غير موجودة في المعلومات أعلاه.
    2. إذا لم تكن متأكداً من معلومة، اكتب: "معلومة غير مؤكدة".
    3. قم بتحليل السوق بناءً على المدينة، المساحة، الميزانية، والنشاط التجاري المذكور.
    4. قم بتقديم توصيات عملية وواقعية.
    5. أجب باللغة العربية وبأسلوب تقرير احترافي.
    `;

    // المحاولة الأولى: استخدام Groq بالنموذج الصحيح
    try {
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) {
        throw new Error("No Groq Key");
      }
      const groq = new Groq({ apiKey: groqApiKey });
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: fullContext }],
        model: "openai/gpt-oss-120b" // ✅ النموذج الصحيح المتاح الآن
      });

      const response = completion.choices[0].message.content;
      res.status(200).json({ result: response });
    } 
    // إذا فشل Groq، ننتقل لـ Gemini
    catch (groqError) {
      console.error("Groq failed, switching to Gemini:", groqError);

      try {
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
          throw new Error("No Gemini Key");
        }
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(fullContext);
        const response = result.response.text();

        res.status(200).json({ result: response });
      } 
      // إذا فشل كل شيء
      catch (geminiError) {
        console.error("Gemini failed too:", geminiError);
        return res.status(500).json({ error: 'فشل الاتصال: ' + geminiError.message });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'فشل الاتصال: ' + error.message });
  }
};
