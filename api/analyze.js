// api/analyze.js
// نقطة الدخول الرئيسية للـ API

import { DataEngine } from '../services/DataEngine.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'BuildX API is running',
      version: '2.0.0',
      endpoints: {
        analyze: 'POST /api/analyze',
      },
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { country, city, businessType, budget } = req.body;

    // التحقق من المدخلات
    if (!country || !city || !businessType || !budget) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['country', 'city', 'businessType', 'budget'],
      });
    }

    // التحقق من القيم
    if (budget <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Budget must be greater than 0',
      });
    }

    console.log('🔍 Analysis Request:', { 
      country, 
      city, 
      businessType, 
      budget,
      timestamp: new Date().toISOString(),
    });

    // تشغيل محرك البيانات
    const engine = new DataEngine({ 
      country: country.toUpperCase(),
      city: city.toLowerCase().trim(),
      businessType: businessType.toLowerCase().trim(),
      budget: Number(budget),
    });
    
    const result = await engine.initialize();

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
    });
  }
}
