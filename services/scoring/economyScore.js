const DataNormalizer = require('../DataNormalizer');

class EconomyScore {
  static calculate(marketData) {
    if (!marketData) {
      return { score: 55, confidence: 0, status: 'unavailable', components: {} };
    }

    const income = this.getIncome(marketData);
    const growth = this.getGdpGrowth(marketData);
    const employment = this.getEmployment(marketData);

    const score = (
      (income || 55) * 0.40 +
      (growth || 55) * 0.35 +
      (employment || 55) * 0.25
    );

    return {
      score: Math.round(score),
      components: { income, growth, employment },
      confidence: this.getConfidence([income, growth, employment]),
      status: 'estimated'
    };
  }

  static getIncome(data) {
    if (!data.medianIncome) return null;
    return DataNormalizer.normalizePositive(data.medianIncome, 5000, 150000);
  }

  static getGdpGrowth(data) {
    if (data.gdpGrowth === undefined) return null;
    return DataNormalizer.sigmoidNormalize(data.gdpGrowth, 2.5, 1.5);
  }

  static getEmployment(data) {
    if (data.unemploymentRate === undefined) return null;
    return DataNormalizer.normalizeNegative(data.unemploymentRate, 0, 15);
  }

  static getConfidence(values) {
    const available = values.filter(v => v !== null).length;
    return Math.round((available / values.length) * 100);
  }
}

module.exports = EconomyScore;
