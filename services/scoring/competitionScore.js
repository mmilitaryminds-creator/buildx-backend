const DataNormalizer = require('../DataNormalizer');

class CompetitionScore {
  static calculate(marketData) {
    if (!marketData) {
      return { score: 50, confidence: 0, status: 'unavailable', components: {} };
    }

    const gap = this.getMarketGap(marketData);
    const ratio = this.getDemandCompetitionRatio(marketData);
    const growth = this.getGrowth(marketData);

    const score = (
      (gap || 50) * 0.45 +
      (ratio || 50) * 0.35 +
      (growth || 50) * 0.20
    );

    return {
      score: Math.round(score),
      components: { gap, ratio, growth },
      analysis: this.getAnalysis(marketData),
      confidence: this.getConfidence([gap, ratio, growth]),
      status: 'estimated'
    };
  }

  static getMarketGap(data) {
    if (!data.competitorCount || !data.population) return null;
    const gap = data.population / Math.max(1, data.competitorCount);
    return DataNormalizer.normalizePositive(gap, 10000, 1000000);
  }

  static getDemandCompetitionRatio(data) {
    if (!data.demandLevel || data.competitorCount === undefined) return null;
    const ratio = data.demandLevel / Math.max(1, data.competitorCount);
    return DataNormalizer.sigmoidNormalize(ratio, 0.5, 2);
  }

  static getGrowth(data) {
    if (!data.marketGrowth) return null;
    return DataNormalizer.normalizePositive(data.marketGrowth, -5, 10);
  }

  static getAnalysis(data) {
    const analysis = [];
    if (data.competitorCount) {
      analysis.push(`المنافسون المعروفون: ${data.competitorCount}`);
    }
    if (data.demandLevel) {
      if (data.demandLevel > data.competitorCount) {
        analysis.push('✅ فرص جيدة: الطلب أكبر من المنافسة');
      } else {
        analysis.push('⚠️ تحدي: السوق متشبعة');
      }
    }
    return analysis;
  }

  static getConfidence(values) {
    const available = values.filter(v => v !== null).length;
    return Math.round((available / values.length) * 100);
  }
}

module.exports = CompetitionScore;
