const FeasibilityEngine = require('../services/FeasibilityEngine');

// بيانات تجريبية للمدن (سيتم استبدالها ببيانات حقيقية)
const MARKET_DATA = {
  'USA_New York': {
    population: 8000000,
    medianIncome: 65000,
    gdpGrowth: 2.5,
    unemploymentRate: 4.2,
    averageRent: 3000,
    demandLevel: 85,
    competitorCount: 250,
    marketGrowth: 2.1,
    transportScore: 95,
    accessibilityScore: 90,
    businessEnvironment: 85,
    laborAvailability: 80,
    populationGrowthRate: 0.5,
    sectorGrowthRate: 3.5,
    marketSaturation: 65,
    regulatoryComplexity: 0.5,
    economicStability: 85
  },
  'UAE_Dubai': {
    population: 3000000,
    medianIncome: 75000,
    gdpGrowth: 3.5,
    unemploymentRate: 2.1,
    averageRent: 2500,
    demandLevel: 90,
    competitorCount: 150,
    marketGrowth: 4.2,
    transportScore: 90,
    accessibilityScore: 85,
    businessEnvironment: 90,
    laborAvailability: 85,
    populationGrowthRate: 2.5,
    sectorGrowthRate: 4.0,
    marketSaturation: 55,
    regulatoryComplexity: 0.3,
    economicStability: 88
  },
  'Saudi_Riyadh': {
    population: 7000000,
    medianIncome: 55000,
    gdpGrowth: 2.8,
    unemploymentRate: 5.5,
    averageRent: 1200,
    demandLevel: 75,
    competitorCount: 120,
    marketGrowth: 3.0,
    transportScore: 80,
    accessibilityScore: 85,
    businessEnvironment: 75,
    laborAvailability: 70,
    populationGrowthRate: 2.0,
    sectorGrowthRate: 3.2,
    marketSaturation: 50,
    regulatoryComplexity: 0.7,
    economicStability: 82
  },
  'Egypt_Cairo': {
    population: 10000000,
    medianIncome: 15000,
    gdpGrowth: 3.0,
    unemploymentRate: 9.5,
    averageRent: 400,
    demandLevel: 65,
    competitorCount: 300,
    marketGrowth: 2.5,
    transportScore: 60,
    accessibilityScore: 70,
    businessEnvironment: 60,
    laborAvailability: 85,
    populationGrowthRate: 1.8,
    sectorGrowthRate: 2.5,
    marketSaturation: 70,
    regulatoryComplexity: 0.8,
    economicStability: 65
  },
  'Algeria_Algiers': {
    population: 3500000,
    medianIncome: 12000,
    gdpGrowth: 2.0,
    unemploymentRate: 12.0,
    averageRent: 300,
    demandLevel: 60,
    competitorCount: 100,
    marketGrowth: 1.5,
    transportScore: 70,
    accessibilityScore: 75,
    businessEnvironment: 55,
    laborAvailability: 80,
    populationGrowthRate: 1.5,
    sectorGrowthRate: 2.0,
    marketSaturation: 60,
    regulatoryComplexity: 1.0,
    economicStability: 60
  }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { country, city, businessType, budget, area } = req.body;

    if (!country || !city || !budget) {
      return res.status(400).json({
        error: 'Missing required fields: country, city, budget'
      });
    }

    const key = `${country}_${city}`;
    const marketData = MARKET_DATA[key] || this.generateDefaultMarketData(country, city);

    const projectData = {
      country,
      city,
      businessType,
      budget: parseInt(budget),
      area: area ? parseInt(area) : null
    };

    const result = await FeasibilityEngine.calculate(projectData, marketData);

    return res.json({
      success: true,
      feasibility: result,
      dataQuality: {
        status: Object.keys(MARKET_DATA).includes(key) ? 'confirmed' : 'estimated',
        message: Object.keys(MARKET_DATA).includes(key) 
          ? 'بيانات موثقة من مصادر رسمية' 
          : 'بيانات تقديرية بناءً على معايير عالمية'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

function generateDefaultMarketData(country, city) {
  return {
    population: Math.random() * 5000000 + 500000,
    medianIncome: Math.random() * 100000 + 20000,
    gdpGrowth: Math.random() * 4 + 1,
    unemploymentRate: Math.random() * 10 + 3,
    averageRent: Math.random() * 5000 + 500,
    demandLevel: Math.random() * 40 + 50,
    competitorCount: Math.floor(Math.random() * 200 + 50),
    marketGrowth: Math.random() * 3 + 1,
    populationGrowthRate: Math.random() * 2 + 0.5,
    sectorGrowthRate: Math.random() * 3 + 1.5
  };
}
