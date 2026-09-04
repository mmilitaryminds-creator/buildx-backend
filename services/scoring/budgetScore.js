const { BUDGET_COVERAGE_THRESHOLDS } = require('../config/weights');
const DataNormalizer = require('../DataNormalizer');

class BudgetScore {
  static calculate(budget, marketData) {
    if (!budget || budget <= 0) {
      return { score: null, confidence: 0, status: 'unavailable' };
    }

    const estimatedCost = this.estimateCost(marketData);

    if (!estimatedCost) {
      return {
        score: 65,
        confidence: 30,
        status: 'unavailable',
        note: 'لا توجد بيانات تكاليف كافية'
      };
    }

    const coverage = budget / estimatedCost;
    const score = DataNormalizer.piecewiseScore(coverage, BUDGET_COVERAGE_THRESHOLDS);

    return {
      score,
      coverage: parseFloat(coverage.toFixed(2)),
      availableBudget: budget,
      estimatedCost: Math.round(estimatedCost),
      recommendation: this.getRecommendation(coverage),
      confidence: 70,
      status: 'estimated'
    };
  }

  static estimateCost(data) {
    if (!data || !data.averageRent) return null;

    const rent = data.averageRent * 12;
    const equipment = data.averageRent * 1.5;
    const licensing = 5000;
    const marketing = 10000;
    const workingCapital = data.averageRent * 3;

    return rent + equipment + licensing + marketing + workingCapital;
  }

  static getRecommendation(coverage) {
    if (coverage >= 1.20) return '✅ الميزانية كافية وزائدة';
    if (coverage >= 1.00) return '✅ الميزانية مناسبة تماماً';
    if (coverage >= 0.80) return '⚠️ الميزانية قريبة - هامش أمان منخفض';
    if (coverage >= 0.60) return '⚠️ الميزانية غير كافية';
    return '❌ الميزانية قاصرة جداً';
  }
}

module.exports = BudgetScore;
