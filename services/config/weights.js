// التكوين المركزي
const WEIGHTS = {
  demand: 0.20,
  targetMarket: 0.10,
  economy: 0.15,
  competition: 0.15,
  budget: 0.15,
  cityFit: 0.10,
  growth: 0.10,
  risk: 0.05
};

const weightSum = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(weightSum - 1.0) > 0.001) {
  throw new Error(`Weights must sum to 1. Current: ${weightSum}`);
}

const BUDGET_COVERAGE_THRESHOLDS = {
  1.20: 100, 1.00: 85, 0.80: 65, 0.60: 45, 0.40: 25, 0.0: 10
};

const CONFIDENCE_WEIGHTS = {
  confirmedIndicators: 0.35,
  dataCompleteness: 0.30,
  sourceReliability: 0.20,
  dataFreshness: 0.10,
  estimatedIndicators: -0.05
};

module.exports = { WEIGHTS, BUDGET_COVERAGE_THRESHOLDS, CONFIDENCE_WEIGHTS };
