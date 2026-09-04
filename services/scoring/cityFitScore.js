const DataNormalizer = require('../DataNormalizer');

class CityFitScore {
  static calculate(marketData) {
    if (!marketData) {
      return { score: 50, confidence: 0, status: 'unavailable' };
    }

    const marketSize = this.getMarketSize(marketData);
    const infrastructure = this.getInfrastructure(marketData);
    const business = this.getBusinessFriendly(marketData);

    const score = (
      (marketSize || 50) * 0.40 +
      (infrastructure || 50) * 0.35 +
      (business || 50) * 0.25
    );

    return {
      score: Math.round(score),
      components: { marketSize, infrastructure, business },
      confidence: this.getConfidence([marketSize, infrastructure, business]),
      status: 'estimated'
    };
  }

  static getMarketSize(data) {
    if (!data.population) return null;
    return DataNormalizer.normalizePositive(data.population, 50000, 5000000);
  }

  static getInfrastructure(data) {
    const score = (data.transportScore || 50) * 0.5 + (data.accessibilityScore || 50) * 0.5;
    return score;
  }

  static getBusinessFriendly(data) {
    const score = (data.businessEnvironment || 50) * 0.6 + (data.laborAvailability || 50) * 0.4;
    return score;
  }

  static getConfidence(values) {
    const available = values.filter(v => v !== null).length;
    return Math.round((available / values.length) * 100);
  }
}

module.exports = CityFitScore;
