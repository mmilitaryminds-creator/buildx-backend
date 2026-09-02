export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const groqApiKey = process.env.GROQ_API_KEY;
  const censusApiKey = process.env.CENSUS_API_KEY;

  if (!groqApiKey) {
    return res.status(500).json({ error: 'Groq API key not configured' });
  }

  try {
    const { country = 'USA', city, businessType, budget, targetAudience } = req.body || {};

    if (!city || !businessType || !budget) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Step 1: Get real data if USA
    let populationData = null;
    if (country === 'USA' && censusApiKey) {
      try {
        const censusUrl = `https://api.census.gov/data/2021/pep/population?get=NAME,POP_2021&for=state:*&key=${censusApiKey}`;
        const censusRes = await fetch(censusUrl);
        if (censusRes.ok) {
          const censusData = await censusRes.json();
          const stateData = censusData.slice(1).find(row => 
            row[0].toLowerCase().includes(city.toLowerCase())
          );
          if (stateData) {
            populationData = {
              population: parseInt(stateData[1]),
              dataSource: 'U.S. Census Bureau (2021)',
              hasRealData: true
            };
          }
        }
      } catch (err) {
        // Continue without Census data
      }
    }

    // Step 2: Build prompt for Groq
    const prompt = `أنت محلل أعمال متخصص في BuildX. قم بتحليل المشروع التالي بصيغة JSON منظمة:

**بيانات المشروع:**
- الدولة: ${country}
- المدينة: ${city}
- نوع المشروع: ${businessType}
- الميزانية: $${budget}
${populationData ? `- عدد السكان: ${populationData.population.toLocaleString()}` : ''}
${targetAudience ? `- الفئة المستهدفة: ${targetAudience}` : ''}

${populationData && populationData.hasRealData ? 
  `**ملاحظة:** البيانات السكانية حقيقية من U.S. Census Bureau.` :
  `**ملاحظة:** هذا تحليل تقديري من الذكاء الاصطناعي وليس بناءً على بيانات رسمية.`
}

**المطلوب:**
قدم تحليلاً منظماً بصيغة JSON بالشكل التالي فقط (بدون أي نص إضافي):

\`\`\`json
{
  "score": <رقم من 0-100>,
  "scoreLabel": "<غير مقبول أو جيد أو ممتاز>",
  "statistics": {
    "population": "<عدد السكان إن توفر>",
    "marketSize": "<حجم السوق المتوقع>",
    "competitionLevel": "<منخفضة/متوسطة/مرتفعة>"
  },
  "positivePoints": [
    "<نقطة إيجابية 1>",
    "<نقطة إيجابية 2>",
    "<نقطة إيجابية 3>"
  ],
  "negativePoints": [
    "<نقطة سلبية 1>",
    "<نقطة سلبية 2>",
    "<نقطة سلبية 3>"
  ],
  "explanation": "<شرح مفصل للتقييم في 3-4 جمل واضحة>"
}
\`\`\`

**قواعد مهمة:**
1. التقييم يجب أن يكون مبنياً على البيانات الحقيقية إن توفرت.
2. كن صريحاً - لا تخترع أرقاماً.
3. استخدم لغة عربية واضحة وسهلة.
4. الرد يجب أن يكون JSON فقط بدون أي نص إضافي.`;

    // Step 3: Call Groq
    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
    const groqResponse = await fetch(groqUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      return res.status(500).json({ 
        error: 'Groq API error', 
        details: errText 
      });
    }

    const groqData = await groqResponse.json();
    const groqContent = groqData?.choices?.[0]?.message?.content || '';

    // Step 4: Parse JSON from Groq response
    let analysisResult = {
      score: 50,
      scoreLabel: 'جيد',
      statistics: {},
      positivePoints: [],
      negativePoints: [],
      explanation: groqContent
    };

    try {
      const jsonMatch = groqContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        analysisResult = {
          score: parsed.score || 50,
          scoreLabel: getScoreLabel(parsed.score || 50),
          statistics: parsed.statistics || {},
          positivePoints: parsed.positivePoints || [],
          negativePoints: parsed.negativePoints || [],
          explanation: parsed.explanation || ''
        };
      }
    } catch (parseErr) {
      // If JSON parsing fails, use the raw response
      analysisResult.explanation = groqContent;
    }

    // Step 5: Return formatted response
    return res.status(200).json({
      success: true,
      ...analysisResult,
      dataSource: populationData?.dataSource || 'AI Estimation',
      hasRealData: !!populationData?.hasRealData
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message 
    });
  }
}

// Helper function
function getScoreLabel(score) {
  if (score < 30) return 'غير مقبول';
  if (score < 70) return 'جيد';
  return 'ممتاز';
      }
