class DataNormalizer {
  static normalizePositive(value, min, max) {
    if (value === null || value === undefined) return null;
    if (min === max) return 50;
    const normalized = 100 * (value - min) / (max - min);
    return Math.max(0, Math.min(100, normalized));
  }

  static normalizeNegative(value, min, max) {
    if (value === null || value === undefined) return null;
    if (min === max) return 50;
    const normalized = 100 * (max - value) / (max - min);
    return Math.max(0, Math.min(100, normalized));
  }

  static piecewiseScore(value, thresholds) {
    if (value === null || value === undefined) return null;
    const sorted = Object.entries(thresholds).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
    for (const [threshold, score] of sorted) {
      if (value >= parseFloat(threshold)) return score;
    }
    return sorted[sorted.length - 1][1];
  }

  static sigmoidNormalize(value, mid, steepness = 1) {
    if (value === null || value === undefined) return null;
    const sigmoid = 1 / (1 + Math.exp(-steepness * (value - mid)));
    return Math.round(sigmoid * 100);
  }
}

module.exports = DataNormalizer;
