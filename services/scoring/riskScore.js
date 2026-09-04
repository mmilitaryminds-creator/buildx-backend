class RiskScore {
  static calculate(marketData, budget, area) {
    let riskScore = 100;
    const risks = [];

    // Risk 1: Regulatory
    if (marketData?.regulatoryComplexity) {
      const penalty = Math.min(15, marketData.regulatoryComplexity * 3);
      riskScore -= penalty;
      risks.push({
        type: 'تنظيمي',
        penalty: Math.round(penalty),
        description: 'متطلبات تنظيمية وترخيص'
      });
    }

    // Risk 2: Financial
    if (budget < 20000) {
      riskScore -= 20;
      risks.push({
        type: 'مالي',
        penalty: 20,
        description: 'ميزانية منخفضة جداً'
      });
    } else if (budget < 50000) {
      riskScore -= 10;
      risks.push({
        type: 'مالي',
        penalty: 10,
        description: 'ميزانية محدودة'
      });
    }

    // Risk 3: Market
    if (marketData?.marketSaturation > 80) {
      riskScore -= 15;
      risks.push({
        type: 'سوق',
        penalty: 15,
        description: 'السوق مشبعة جداً'
      });
    }

    // Risk 4: Competition
    if (marketData?.competitorCount > 50) {
      riskScore -= 12;
      risks.push({
        type: 'منافسة',
        penalty: 12,
        description: 'منافسة قوية جداً'
      });
    }

    // Risk 5: Economic
    if (marketData?.economicStability < 40) {
      riskScore -= 18;
      risks.push({
        type: 'اقتصادي',
        penalty: 18,
        description: 'عدم استقرار اقتصادي'
      });
    }

    return {
      score: Math.max(10, riskScore),
      risks,
      totalPenalty: 100 - Math.max(10, riskScore),
      confidence: 75,
      status: 'estimated'
    };
  }
}

module.exports = RiskScore;
