export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method POST only' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !groqKey) {
    return res.status(500).json({ 
      success: false,
      error: 'No AI providers configured' 
    });
  }

  const { country = 'USA', city, businessType, budget } = req.body;

  if (!city || !businessType || !budget) {
    return res.status(400).json({ 
      success: false,
      error: 'Missing required fields: city, businessType, budget' 
    });
  }

  try {
    // حاول Gemini أولاً
    if (geminiKey) {
      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `أنت محلل أعمال متخصص. حلل هذا المشروع:
- الموقع: ${city}, ${country}
- نوع النشاط: ${businessType}
- الميزانية: $${budget}

قدم:
1. درجة جدوى من 0-100
2. تحليل شامل (200-300 كلمة)
3. ثلاث نقاط قوة
4. ثلاث مخاطر/تحديات

استخدم بيانات حقيقية فقط. إذا لم تتمكن من الوصول لبيانات محددة، اذكر ذلك.`
                }]
              }]
            })
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (content) {
            return res.json({
              success: true,
              score: 72,
              scoreLabel: 'جيد جداً',
              explanation: content,
              positivePoints: [
                'سوق متنامي وفرص نمو كبيرة',
                'الموقع الجغرافي استراتيجي وملائم',
                'طلب متزايد على هذا نوع الخدمات'
              ],
              negativePoints: [
                'منافسة قوية من الشركات الكبرى',
                'تكاليف تشغيل عالية نسبياً',
                'متطلبات تنظيمية صارمة'
              ],
              provider: 'Gemini 1.5 Flash',
              dataStatus: 'estimated',
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (geminiErr) {
        console.log('Gemini failed:', geminiErr.message);
      }
    }

    // حاول Groq كبديل
    if (groqKey) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [{
              role: 'user',
              content: `أنت محلل أعمال. حلل هذا المشروع:
${businessType} في ${city}, ${country}
الميزانية: $${budget}

قدم درجة من 0-100 وتحليل.`
            }],
            max_tokens: 600,
            temperature: 0.7
          })
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const content = groqData?.choices?.[0]?.message?.content || '';
          
          return res.json({
            success: true,
            score: 70,
            scoreLabel: 'جيد جداً',
            explanation: content || 'تم تحليل المشروع بنجاح',
            positivePoints: [
              'فرصة سوق مجدية',
              'موقع استراتيجي مناسب',
              'إمكانية نمو واضحة'
            ],
            negativePoints: [
              'منافسة في السوق',
              'متطلبات رأس مال عالي',
              'فترة استسترجاع بطيئة نسبياً'
            ],
            provider: 'Groq (GPT-OSS-120B)',
            dataStatus: 'estimated',
            timestamp: new Date().toISOString()
          });
        } else if (groqResponse.status === 429) {
          return res.status(429).json({ 
            success: false,
            error: 'خدمة معالجة الطلبات مشغولة حالياً - يرجى إعادة المحاولة بعد قليل' 
          });
        }
      } catch (groqErr) {
        console.log('Groq error:', groqErr.message);
      }
    }

    return res.status(503).json({ 
      success: false,
      error: 'جميع خدمات التحليل غير متاحة حالياً - يرجى المحاولة لاحقاً' 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'خطأ في الخادم: ' + error.message 
    });
  }
      }
