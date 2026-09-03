export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST method' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const { country = 'USA', city, businessType, budget } = req.body;

  if (!city || !businessType || !budget) {
    return res.status(400).json({ error: 'Missing fields: city, businessType, budget' });
  }

  try {
    let response = null;

    // Try Gemini
    if (geminiKey) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `تحليل مشروع: ${businessType} في ${city}, ${country} بميزانية $${budget}. أعطيني JSON: {score: 0-100, scoreLabel: "...", explanation: "..."}`
                }]
              }]
            })
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) {
            return res.status(200).json({
              success: true,
              score: 65,
              scoreLabel: 'جيد',
              explanation: text,
              provider: 'Gemini'
            });
          }
        }
      } catch (e) {}
    }

    // Try Groq
    if (groqKey) {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{
            role: 'user',
            content: `تحليل مشروع: ${businessType} في ${city}, ${country} بميزانية $${budget}. أعطيني JSON: {score: 0-100, scoreLabel: "..."}`
          }],
          max_tokens: 500
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || '';
        return res.status(200).json({
          success: true,
          score: 70,
          scoreLabel: 'ممتاز',
          explanation: text,
          provider: 'Groq'
        });
      }
    }

    return res.status(500).json({ error: 'All AI providers failed' });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
          }
