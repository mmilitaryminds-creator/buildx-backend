export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const apiKey = process.env.CENSUS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const censusUrl = `https://api.census.gov/data/2021/pep/population?get=NAME,POP_2021&for=state:*&key=${apiKey}`;
    const response = await fetch(censusUrl);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: 'Census API error', details: errText });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
