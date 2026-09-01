// services/data-collectors/CompetitionCollector.js
// هذا الملف يحلل المنافسة في السوق

export class CompetitionCollector {
  constructor(country, city, businessType) {
    this.country = country;
    this.city = city;
    this.businessType = businessType;
  }

  async collect() {
    try {
      console.log('🏪 Analyzing competition...');
      
      const cityInfo = this.getCityInfo();
      const estimatedCompetitors = this.estimateCompetitors(cityInfo.population);
      const saturation = this.calculateSaturation(estimatedCompetitors);
      
      return {
        cityPopulation: cityInfo.population,
        cityTier: cityInfo.tier,
        estimatedCompetitors: estimatedCompetitors,
        marketSaturation: saturation.level,
        competitionScore: saturation.score,
        barriers: this.identifyBarriers(),
        opportunities: this.identifyOpportunities(saturation.level),
        source: 'Estimated Analysis',
      };
    } catch (error) {
      console.warn('Competition analysis failed:', error);
      return {
        cityPopulation: null,
        cityTier: 'unknown',
        estimatedCompetitors: null,
        marketSaturation: 'Unknown',
        competitionScore: null,
        barriers: [],
        opportunities: [],
        source: 'Fallback data',
      };
    }
  }

  getCityInfo() {
    const cityDatabase = {
      'new york': { population: 8336817, tier: 'mega', country: 'US' },
      'los angeles': { population: 3898747, tier: 'mega', country: 'US' },
      'chicago': { population: 2746388, tier: 'large', country: 'US' },
      'houston': { population: 2304580, tier: 'large', country: 'US' },
      'phoenix': { population: 1608139, tier: 'large', country: 'US' },
      'london': { population: 8982000, tier: 'mega', country: 'GB' },
      'paris': { population: 2148000, tier: 'large', country: 'FR' },
      'dubai': { population: 3331000, tier: 'large', country: 'AE' },
      'riyadh': { population: 7677000, tier: 'large', country: 'SA' },
      'cairo': { population: 21000000, tier: 'mega', country: 'EG' },
      'casablanca': { population: 3359000, tier: 'large', country: 'MA' },
    };

    return cityDatabase[this.city.toLowerCase()] || { 
      population: 500000, 
      tier: 'medium',
      country: this.country,
    };
  }

  estimateCompetitors(population) {
    const businessDensity = {
      restaurant: 0.00015, // مطعم لكل 6,667 شخص
      cafe: 0.00012,        // كافيه لكل 8,333 شخص
      retail: 0.00025,      // متجر لكل 4,000 شخص
      gym: 0.00008,         // جيم لكل 12,500 شخص
      salon: 0.0003,        // صالون لكل 3,333 شخص
      tech: 0.00005,        // شركة تقنية لكل 20,000 شخص
    };

    const density = businessDensity[this.businessType] || 0.0001;
    return Math.round(population * density);
  }

  calculateSaturation(competitors) {
    if (competitors > 1000) {
      return { level: 'High', score: 85 };
    } else if (competitors > 500) {
      return { level: 'Medium', score: 60 };
    } else if (competitors > 100) {
      return { level: 'Low', score: 35 };
    } else {
      return { level: 'Very Low', score: 15 };
    }
  }

  identifyBarriers() {
    const barriers = {
      restaurant: [
        'Licenses and permits required',
        'Health and safety inspections',
        'High initial capital needed',
        'Intense competition',
        'Staff recruitment challenges',
      ],
      cafe: [
        'Prime location costs',
        'Seasonal demand fluctuations',
        'Equipment costs',
        'Coffee bean price volatility',
      ],
      retail: [
        'Inventory management',
        'E-commerce competition',
        'High rental costs',
        'Changing consumer behavior',
      ],
      gym: [
        'High equipment costs',
        'Membership retention difficulty',
        'Insurance requirements',
        'Space requirements',
      ],
      tech: [
        'Talent acquisition',
        'Rapid market changes',
        'High R&D costs',
        'Intellectual property protection',
      ],
    };

    return barriers[this.businessType] || [
      'General market barriers',
      'Regulatory requirements',
      'Initial capital needs',
    ];
  }

  identifyOpportunities(saturation) {
    if (saturation === 'Very Low' || saturation === 'Low') {
      return [
        'Limited competition in the market',
        'First-mover advantage possible',
        'Potential for high market share',
        'Room for innovation',
      ];
    } else if (saturation === 'Medium') {
      return [
        'Balanced market conditions',
        'Opportunity for differentiation',
        'Stable customer base exists',
        'Room for specialized services',
      ];
    } else {
      return [
        'Market validation proven',
        'Focus on niche segments',
        'Competitive pricing strategy needed',
        'Superior service can win market share',
      ];
    }
  }
              }
