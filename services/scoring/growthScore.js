const DataNormalizer = require('../DataNormalizer');

class GrowthScore {
  static calculate(marketData) {
    if (!marketData) {
      return { score: 50, confidence: 0, status: 'unavailable' };
    }

    const populationGrowth = this.getPopulationGrowth(marketData);
    const sectorGrowth = this.getSectorGrowth(marketData);
    const economicGrowth = this.getEconomicGrowth(marketData);

    const score = (
      (populationGrowth || 50) * 0.35 +
      (sectorGrowth || 50) * 0.35 +
      (economicGrowth || 50) * 0.30
    );

    return {
      score: Math.round(score),
      components: { populationGrowth, sectorGrowth, economicGrowth },
      confidence: this.getConfidence([populationGrowth, sectorGrowth, economicGrowth]),
      status: 'estimated'
    };
  }

  static getPopulationGrowth(data) {
    if (data.populationGrowthRate === undefined) return null;
    return DataNormalizer.sigmoidNormalize(data.populationGrowthRate, 1.5, 2);
  }

  static getSectorGrowth(data) {
    if (data.sectorGrowthRate === undefined) return null;
    return DataNormalizer.sigmoidNormalize(data.sectorGrowthRate, 3, 1.5);
  }

  static getEconomicGrowth(data) {
    if (!data.gdpGrowth) return null;
    return DataNormalizer.sigmoidNormalize(data.gdpGrowth, 2.5, 1.5);
  }

  static getConfidence(values) {
    const available = values.filter(v => v !== null).length;
    return Math.round((available / values.length) * 100);
  }
}

module.exports = GrowthScore;
