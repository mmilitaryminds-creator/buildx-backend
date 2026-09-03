export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return res.status(500).json({ error: 'No API key' });

  const { city, businessType, budget } = req.body;
  if (!city || !businessType || !budget) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: `تحليل: ${businessType} في ${city} بـ $${budget}` }],
        max_tokens: 300
      })
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || 'No response';

    res.json({ success: true, score: 70, explanation: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
