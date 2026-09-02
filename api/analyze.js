import { calculateIndicators, calculateFinalScore } from './lib/indicators.js';
import { suggestCities } from './lib/cities.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const censusKey = process.env.CENSUS_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!censusKey || !geminiKey) {
    return res.status(500).json({ error: 'API keys not configured on server' });
  }

  try {
    const { country = 'USA', city, businessType, budget } = req.body || {};

    if (!city || !businessType || !budget) {
      return res.status(400).json({ error: 'Missing required fields: city, businessType, budget' });
    }

    let analysisData = {
      country,
      city,
      businessType,
      budget,
      score: 0,
      analysis: '',
      dataAvailable: false,
      dataSource: '',
      risks: [],
      opportunities: []
    };

    // Step 1: Get real data if available (USA only for now)
    if (country === 'USA') {
      try {
        const censusUrl = `https://api.census.gov/data/2021/pep/population?get=NAME,POP_2021&for=state:*&key=${censusKey}`;
        const censusRes = await fetch(censusUrl);
        
        if (censusRes.ok) {
          const censusData = await censusRes.json();
          const stateData = censusData.slice(1).find(row => row[0].toLowerCase().includes(city.toLowerCase()));
          
          if (stateData) {
            const population = parseInt(stateData[1]);
            analysisData.dataAvailable = true;
            analysisData.dataSource = 'U.S. Census Bureau (2021)';
            analysisData.population = population;
          }
        }
      } catch (err) {
        // Continue without Census data
      }
    }

    // Step 2: Mark data as unavailable if not USA
    if (country !== 'USA' && !analysisData.dataAvailable) {
      analysisData.dataAvailable = false;
      analysisData.dataSource = 'Data Not Available - AI Estimation Only';
    }

    // Step 3: Use Gemini to analyze (real data if available, or disclaimer if not)
    // Calculate indicators and score
analysisData.indicators = calculateIndicators(analysisData);
analysisData.score = calculateFinalScore(analysisData.indicators);
analysisData.verdict = analysisData.score >= 70 ? 'ممتاز' : analysisData.score >= 30 ? 'جيد' : 'غير مقبول';
analysisData.alternativeCities = suggestCities(country, city, businessType);

let geminiPrompt = '';
    
    if (analysisData.dataAvailable) {
      geminiPrompt = `
أنت محلل أعمال متخصص. قم بتحليل المشروع التالي بناءً على بيانات حقيقية:

نوع المشروع: ${businessType}
الموقع: ${city}, ${country}
الميزانية: $${budget}
عدد السكان: ${analysisData.population}

قدّم:
1. تقييم من 0-100 (يجب أن يعتمد على البيانات الحقيقية)
2. شرح التقييم في 2-3 جمل
3. المخاطر الرئيسية (3 نقاط)
4. الفرص (2 نقطة)

صيغة الرد: JSON بهذا الشكل:
{"score": XX, "explanation": "...", "risks": [...], "opportunities": [...]}
      `;
    } else {
      geminiPrompt = `
تحذير مهم: هذا تحليل تقديري من الذكاء الاصطناعي فقط، وليس بناءً على بيانات رسمية.

نوع المشروع: ${businessType}
الموقع: ${city}, ${country}
الميزانية: $${budget}

قدّم تقييماً عاماً:
1. تقييم من 0-100 (تقديري فقط)
2. شرح أنه تقدير عام وليس بيانات رسمية
3. المخاطر المحتملة
4. الفرص المحتملة

صيغة الرد: JSON
{"score": XX, "explanation": "...", "risks": [...], "opportunities": [...]}
      `;
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }]
      })
    });

    if (!geminiRes.ok) {
      return res.status(500).json({ error: 'Gemini API error', details: await geminiRes.text() });
    }

    const geminiData = await geminiRes.json();
    const geminiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to parse JSON from Gemini response
    let geminiParsed = {};
    try {
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        geminiParsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If JSON parsing fails, use the raw text
      geminiParsed = { explanation: geminiText };
    }

    // Step 4: Build final response
    analysisData.score = geminiParsed.score || 50;
    analysisData.analysis = geminiParsed.explanation || geminiText;
    analysisData.risks = geminiParsed.risks || [];
    analysisData.opportunities = geminiParsed.opportunities || [];

    return res.status(200).json({ 
      success: true, 
      ...analysisData 
    });

  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
