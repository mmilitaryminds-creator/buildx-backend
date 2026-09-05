const FeasibilityEngine = require('../services/FeasibilityEngine');

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
  },
  'Morocco_Casablanca': {
    population: 3300000,
    medianIncome: 14000,
    gdpGrowth: 2.8,
    unemploymentRate: 10.5,
    averageRent: 350,
    demandLevel: 62,
    competitorCount: 110,
    marketGrowth: 2.0,
    transportScore: 75,
    accessibilityScore: 80,
    businessEnvironment: 60,
    laborAvailability: 82,
    populationGrowthRate: 1.2,
    sectorGrowthRate: 2.2,
    marketSaturation: 58,
    regulatoryComplexity: 0.9,
    economicStability: 62
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
        error: 'Missing required fields'
      });
    }

    const key = `${country}_${city}`;
    const marketData = MARKET_DATA[key] || generateDefaultMarketData();

    // حساب المؤشرات مباشرة (بدون import FeasibilityEngine)
    const demand = calculateDemand(marketData);
    const economy = calculateEconomy(marketData);
    const budgetScore = calculateBudget(budget, marketData);
    const competition = calculateCompetition(marketData);
    const cityFit = calculateCityFit(marketData);
    const growth = calculateGrowth(marketData);
    const risk = calculateRisk(marketData, budget);

    const finalScore = Math.round(
      (demand * 0.20) +
      (economy * 0.15) +
      (budgetScore * 0.15) +
      (competition * 0.15) +
      (cityFit * 0.10) +
      (growth * 0.10) +
      (risk * 0.05)
    );

    const confidence = Math.round(
      (Object.keys(MARKET_DATA).includes(key) ? 85 : 60)
    );

    return res.json({
      success: true,
      feasibility: {
        finalScore,
        confidence,
        interpretation: interpretScore(finalScore),
        indicators: {
          demand: { score: demand, confidence: 75 },
          economy: { score: economy, confidence: 80 },
          budget: { score: budgetScore, confidence: 85 },
          competition: { score: competition, confidence: 60 },
          cityFit: { score: cityFit, confidence: 70 },
          growth: { score: growth, confidence: 65 },
          risk: { score: risk, confidence: 75 }
        },
        strengths: getStrengths(finalScore, marketData),
        weaknesses: getWeaknesses(finalScore, marketData),
        recommendations: getRecommendations(finalScore, marketData)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'خطأ في التحليل'
    });
  }
}

// Functions
function calculateDemand(data) {
  if (!data.population || !data.demandLevel) return 50;
  const size = Math.min(100, (data.population / 10000000) * 100);
  const demand = data.demandLevel || 50;
  return Math.round((size * 0.6) + (demand * 0.4));
}

function calculateEconomy(data) {
  if (!data.medianIncome || !data.gdpGrowth) return 55;
  const income = Math.min(100, (data.medianIncome / 100000) * 100);
  const growth = Math.min(100, (data.gdpGrowth / 5) * 100);
  return Math.round((income * 0.5) + (growth * 0.5));
}

function calculateBudget(budget, data) {
  if (!data.averageRent) return 60;
  const estimatedCost = data.averageRent * 12 * 1.5;
  const coverage = budget / estimatedCost;
  
  if (coverage >= 1.2) return 100;
  if (coverage >= 1.0) return 85;
  if (coverage >= 0.8) return 65;
  if (coverage >= 0.6) return 45;
  return 25;
}

function calculateCompetition(data) {
  if (!data.competitorCount || !data.population) return 50;
  const gap = data.population / data.competitorCount;
  const score = Math.min(100, (gap / 100000) * 100);
  return Math.round(score);
}

function calculateCityFit(data) {
  if (!data.population) return 50;
  const size = Math.min(100, (data.population / 10000000) * 100);
  const transport = data.transportScore || 50;
  return Math.round((size * 0.4) + (transport * 0.6));
}

function calculateGrowth(data) {
  if (!data.populationGrowthRate || !data.gdpGrowth) return 50;
  const pop = Math.min(100, (data.populationGrowthRate / 3) * 100);
  const gdp = Math.min(100, (data.gdpGrowth / 5) * 100);
  return Math.round((pop * 0.4) + (gdp * 0.6));
}

function calculateRisk(data, budget) {
  let risk = 100;
  
  if (budget < 20000) risk -= 20;
  else if (budget < 50000) risk -= 10;
  
  if (data.unemploymentRate && data.unemploymentRate > 10) risk -= 15;
  if (data.competitorCount && data.competitorCount > 200) risk -= 12;
  
  return Math.max(20, risk);
}

function interpretScore(score) {
  if (score >= 85) return 'ممتاز - فرصة استثنائية';
  if (score >= 75) return 'جيد جداً - فرصة قوية';
  if (score >= 65) return 'جيد - فرصة جيدة';
  if (score >= 50) return 'متوسط - يحتاج تحسينات';
  if (score >= 40) return 'ضعيف - تحديات واضحة';
  return 'ضعيف جداً - مخاطر عالية';
}

function getStrengths(score, data) {
  const strengths = [];
  if (score >= 70) strengths.push('فرص جيدة للنجاح');
  if (data.population > 5000000) strengths.push('سوق كبيرة');
  if (data.gdpGrowth > 2.5) strengths.push('اقتصاد متنامي');
  if (data.competitorCount < 150) strengths.push('منافسة معتدلة');
  return strengths.length > 0 ? strengths : ['السوق لديها إمكانيات'];
}

function getWeaknesses(score, data) {
  const weaknesses = [];
  if (score < 60) weaknesses.push('فرص محدودة');
  if (data.unemploymentRate > 10) weaknesses.push('معدل بطالة عالي');
  if (data.competitorCount > 200) weaknesses.push('منافسة قوية');
  if (data.marketSaturation > 70) weaknesses.push('السوق مشبعة');
  return weaknesses;
}

function getRecommendations(score, data) {
  const recommendations = [
    'أجرِ دراسة سوق تفصيلية',
    'حلل المنافسين بعناية',
    'طور استراتيجية تسويق قوية',
    'ركز على تمايز منتجك'
  ];
  
  if (score < 60) {
    recommendations.push('أعد النظر في جدوى المشروع');
  }
  
  return recommendations;
}

function generateDefaultMarketData() {
  return {
    population: Math.random() * 5000000 + 500000,
    medianIncome: Math.random() * 100000 + 20000,
    gdpGrowth: Math.random() * 4 + 1,
    unemploymentRate: Math.random() * 10 + 3,
    averageRent: Math.random() * 5000 + 500,
    demandLevel: Math.random() * 40 + 50,
    competitorCount: Math.floor(Math.random() * 200 + 50),
    marketGrowth: Math.random() * 3 + 1,
    transportScore: Math.random() * 30 + 60,
    populationGrowthRate: Math.random() * 2 + 0.5,
    sectorGrowthRate: Math.random() * 3 + 1.5
  };
}
