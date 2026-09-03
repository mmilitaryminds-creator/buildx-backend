export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!geminiApiKey && !groqApiKey) {
    return res.status(500).json({ error: 'No AI API keys configured' });
  }

  try {
    const { country = 'USA', city, businessType, budget } = req.body;

    if (!city || !businessType || !budget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build prompt
    const prompt = `أنت محلل أعمال متخصص. حلل هذا المشروع:
- الدولة: ${country}
- المدينة: ${city}
- النوع: ${businessType}
- الميزانية: $${budget}

أعطيني JSON بهذا الشكل فقط (بدون أي نص إضافي):
{
  "score": <0-100>,
  "scoreLabel": "غير مقبول/جيد/ممتاز",
  "statistics": {"السكان": "...", "السوق": "..."},
  "positivePoints": ["نقطة 1", "نقطة 2"],
  "negativePoints": ["نقطة 1", "نقطة 2"],
  "explanation": "شرح كامل"
}`;

    let result = null;
    let aiProvider = 'none';

    // Try Gemini first
    if (geminiApiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (content) {
            result = parseResponse(content);
            aiProvider = 'Gemini';
          }
        }
      } catch (geminiErr) {
        console.log('Gemini failed, trying Groq...');
      }
    }

    // If Gemini failed, try Groq
    if (!result && groqApiKey) {
      try {
        const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
        
        const groqResponse = await fetch(groqUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (groqResponse.ok) {
          const groqData = await groqResponse.json();
          const content = groqData.choices?.[0]?.message?.content || '';
          
          if (content) {
            result = parseResponse(content);
            aiProvider = 'Groq (Gemini Fallback)';
          }
        }
      } catch (groqErr) {
        console.log('Groq also failed');
      }
    }

    // If both failed
    if (!result) {
      return res.status(500).json({ 
        error: 'Both AI providers failed',
        details: 'Gemini and Groq are not responding'
      });
    }

    return res.status(200).json({ 
      success: true, 
      ...result,
      aiProvider: aiProvider
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
}

// Helper function to parse AI response
function parseResponse(content) {
  let result = {
    score: 50,
    scoreLabel: 'جيد',
    statistics: {},
    positivePoints: [],
    negativePoints: [],
    explanation: content
  };

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      result = {
        score: parsed.score || 50,
        scoreLabel: getScoreLabel(parsed.score || 50),
        statistics: parsed.statistics || {},
        positivePoints: Array.isArray(parsed.positivePoints) ? parsed.positivePoints : [],
        negativePoints: Array.isArray(parsed.negativePoints) ? parsed.negativePoints : [],
        explanation: parsed.explanation || content
      };
    }
  } catch (e) {
    // Keep default result
  }

  return result;
}

function getScoreLabel(score) {
  if (score < 30) return 'غير مقبول';
  if (score < 70) return 'جيد';
  return 'ممتاز';
          }
