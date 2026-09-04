const DemandScore = require('./scoring/demandScore');
const EconomyScore = require('./scoring/economyScore');
const BudgetScore = require('./scoring/budgetScore');
const CompetitionScore = require('./scoring/competitionScore');
const CityFitScore = require('./scoring/cityFitScore');
const GrowthScore = require('./scoring/growthScore');
const RiskScore = require('./scoring/riskScore');
const { WEIGHTS } = require('./config/weights');

class FeasibilityEngine {
  static async calculate(projectData, marketData) {
    try {
      // حساب كل مؤشر
      const demand = DemandScore.calculate(marketData);
      const economy = EconomyScore.calculate(marketData);
      const budget = BudgetScore.calculate(projectData.budget, marketData);
      const competition = CompetitionScore.calculate(marketData);
      const cityFit = CityFitScore.calculate(marketData);
      const growth = GrowthScore.calculate(marketData);
      const risk = RiskScore.calculate(marketData, projectData.budget, projectData.area);

      // حساب الدرجة النهائية
      const finalScore = (
        (demand.score || 50) * WEIGHTS.demand +
        (economy.score || 55) * WEIGHTS.economy +
        (budget.score || 60) * WEIGHTS.budget +
        (competition.score || 50) * WEIGHTS.competition +
        (cityFit.score || 50) * WEIGHTS.cityFit +
        (growth.score || 50) * WEIGHTS.growth +
        (risk.score || 50) * WEIGHTS.risk
      );

      // حساب الثقة
      const confidence = this.calculateConfidence([demand, economy, budget, competition, cityFit, growth, risk]);

      // تصنيف الدرجة
      const interpretation = this.interpretScore(finalScore);

      return {
        finalScore: Math.round(finalScore),
        confidence,
        interpretation,
        indicators: {
          demand,
          economy,
          budget,
          competition,
          cityFit,
          growth,
          risk
        },
        strengths: this.getStrengths([demand, economy, budget, competition, cityFit, growth]),
        weaknesses: this.getWeaknesses([demand, economy, budget, competition, cityFit, growth, risk]),
        recommendations: this.getRecommendations([demand, economy, budget, competition, cityFit, growth, risk]),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        finalScore: null,
        confidence: 0
      };
    }
  }

  static calculateConfidence(indicators) {
    const scores = indicators.map(ind => ind.confidence || 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  static interpretScore(score) {
    if (score >= 90) return 'ممتاز - فرصة استثنائية';
    if (score >= 80) return 'جيد جداً - فرصة قوية';
    if (score >= 70) return 'جيد - فرصة جيدة';
    if (score >= 60) return 'متوسط - يحتاج تحسينات';
    if (score >= 50) return 'ضعيف - تحديات واضحة';
    if (score >= 40) return 'ضعيف جداً - مخاطر عالية';
    return 'غير مجدي - لا ينصح به';
  }

  static getStrengths(indicators) {
    const strengths = [];

    indicators.forEach(ind => {
      if (ind.score >= 70) {
        if (ind.constructor.name === 'DemandScore') strengths.push('طلب قوي في السوق');
        if (ind.constructor.name === 'EconomyScore') strengths.push('اقتصاد قوي واستقرار');
        if (ind.constructor.name === 'BudgetScore') strengths.push('ميزانية كافية');
        if (ind.constructor.name === 'CityFitScore') strengths.push('الموقع مناسب جداً');
        if (ind.constructor.name === 'GrowthScore') strengths.push('سوق متنامية');
      }
    });

    return strengths.length > 0 ? strengths : ['السوق لديها إمكانيات معقولة'];
  }

  static getWeaknesses(indicators) {
    const weaknesses = [];

    indicators.forEach(ind => {
      if (ind.score < 50) {
        if (ind.constructor.name === 'DemandScore') weaknesses.push('طلب منخفض على السوق');
        if (ind.constructor.name === 'BudgetScore') weaknesses.push('الميزانية غير كافية');
        if (ind.constructor.name === 'CompetitionScore') weaknesses.push('منافسة قوية جداً');
        if (ind.constructor.name === 'RiskScore') weaknesses.push('مخاطر اقتصادية عالية');
      }
    });

    return weaknesses.length > 0 ? weaknesses : [];
  }

  static getRecommendations(indicators) {
    const recommendations = [];

    if (indicators[3].score < 60) {
      recommendations.push('ركز على تمايز المنتج عن المنافسين');
    }
    if (indicators[2].score < 70) {
      recommendations.push('حاول تخفيض التكاليف أو زيادة الميزانية');
    }
    if (indicators[1].score < 60) {
      recommendations.push('انتظر تحسن الوضع الاقتصادي');
    }
    if (indicators[6].score < 50) {
      recommendations.push('قيّم المخاطر المحددة بعناية');
    }

    recommendations.push('أجرِ دراسة سوق تفصيلية قبل الانطلاق');

    return recommendations;
  }
}

module.exports = FeasibilityEngine;
