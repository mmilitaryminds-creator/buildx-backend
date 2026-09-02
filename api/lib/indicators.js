// api/lib/indicators.js
// دوال حساب المؤشرات والتقييم

export function calculateIndicators(data) {
  const indicators = {
    profitPotential: 50,
    riskLevel: 50,
    demandStrength: 50,
    purchasingPower: 50,
    competition: 50,
    locationSuitability: 50,
    growthPotential: 50,
    budgetSuitability: 50
  };

  // القوة الشرائية من البيانات الحقيقية
  if (data.medianIncome) {
    indicators.purchasingPower = Math.min(100, Math.round((data.medianIncome / 80000) * 100));
  } else if (data.gdpPerCapita) {
    indicators.purchasingPower = Math.min(100, Math.round((data.gdpPerCapita / 60000) * 100));
  }

  // قوة الطلب من عدد السكان
  if (data.population) {
    indicators.demandStrength = Math.min(100, Math.round((data.population / 10000000) * 100));
  }

  // ملاءمة الميزانية
  const estimatedCostPerSqm = 2000;
  const estimatedTotalCost = (data.area || 50) * estimatedCostPerSqm;
  indicators.budgetSuitability = Math.max(0, Math.min(100, Math.round((data.budget / estimatedTotalCost) * 100)));

  // عوامل نوع المشروع
  const businessFactors = {
    restaurant: { profit: 65, risk: 55, competition: 70, growth: 45 },
    cafe: { profit: 55, risk: 45, competition: 65, growth: 50 },
    retail: { profit: 60, risk: 50, competition: 60, growth: 40 },
    gym: { profit: 50, risk: 40, competition: 45, growth: 65 },
    tech: { profit: 80, risk: 60, competition: 35, growth: 85 },
    salon: { profit: 55, risk: 35, competition: 55, growth: 50 }
  };

  const factor = businessFactors[data.businessType] || { profit: 55, risk: 45, competition: 50, growth: 50 };
  
  indicators.profitPotential = factor.profit;
  indicators.riskLevel = factor.risk;
  indicators.competition = factor.competition;
  indicators.growthPotential = factor.growth;

  // تعديلات الجمهور المستهدف
  const audienceFactors = {
    families: { demand: 10, purchasing: 5 },
    young: { demand: 15, purchasing: -5 },
    professionals: { demand: 10, purchasing: 15 },
    students: { demand: 5, purchasing: -10 },
    tourists: { demand: 20, purchasing: 10 },
    general: { demand: 0, purchasing: 0 }
  };

  const audience = audienceFactors[data.targetAudience] || audienceFactors.general;
  indicators.demandStrength = Math.max(0, Math.min(100, indicators.demandStrength + audience.demand));
  indicators.purchasingPower = Math.max(0, Math.min(100, indicators.purchasingPower + audience.purchasing));

  // ملاءمة الموقع
  if (data.population) {
    indicators.locationSuitability = Math.min(100, Math.round((data.population / 5000000) * 100));
  }

  // إذا البيانات غير متوفرة، خفض النقاط
  if (!data.dataAvailable) {
    Object.keys(indicators).forEach(key => {
      indicators[key] = Math.max(0, Math.round(indicators[key] * 0.7));
    });
  }

  return indicators;
}

export function calculateFinalScore(indicators) {
  const weights = {
    profitPotential: 0.15,
    riskLevel: 0.10,
    demandStrength: 0.15,
    purchasingPower: 0.15,
    competition: 0.10,
    locationSuitability: 0.10,
    growthPotential: 0.15,
    budgetSuitability: 0.10
  };

  let score = 0;
  Object.keys(weights).forEach(key => {
    const value = indicators[key];
    if (key === 'riskLevel' || key === 'competition') {
      score += (100 - value) * weights[key];
    } else {
      score += value * weights[key];
    }
  });

  return Math.round(score);
}
