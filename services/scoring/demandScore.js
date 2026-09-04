const DataNormalizer = require('../DataNormalizer');

class DemandScore {
  static calculate(marketData) {
    if (!marketData) {
      return { score: 50, confidence: 0, status: 'unavailable', components: {} };
    }

    const marketSize = this.getMarketSize(marketData);
    const growth = this.getGrowth(marketData);
    const demand = this.getDemand(marketData);

    const score = (
      (marketSize || 50) * 0.50 +
      (growth || 50) * 0.30 +
      (demand || 50) * 0.20
    );

    return {
      score: Math.round(score),
      components: { marketSize, growth, demand },
      confidence: this.getConfidence([marketSize, growth, demand]),
      status: marketSize && growth ? 'estimated' : 'unavailable'
    };
  }

  static getMarketSize(data) {
    if (!data.population) return null;
    return DataNormalizer.normalizePositive(data.population, 50000, 5000000);
  }

  static getGrowth(data) {
    if (data.growthRate === undefined) return null;
    return DataNormalizer.sigmoidNormalize(data.growthRate, 2, 2);
  }

  static getDemand(data) {
    if (!data.demandLevel) return null;
    return Math.min(100, Math.max(0, data.demandLevel));
  }

  static getConfidence(values) {
    const available = values.filter(v => v !== null).length;
    return Math.round((available / values.length) * 100);
  }
}

module.exports = DemandScore;
