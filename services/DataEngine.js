// services/DataEngine.js
// المحرك الرئيسي لجمع ومعالجة البيانات

import { WorldBankCollector } from './data-collectors/WorldBankCollector.js';
import { CostsCollector } from './data-collectors/CostsCollector.js';
import { CompetitionCollector } from './data-collectors/CompetitionCollector.js';

export class DataEngine {
  constructor(input) {
    this.input = input;
    this.rawData = {};
    this.processedData = {};
    this.collectors = [];
  }

  async initialize() {
    console.log('🚀 Initializing BuildX Data Engine...');
    console.log('📝 Input:', this.input);

    try {
      // تهيئة المجمعين
      this.initializeCollectors();
      
      // جمع البيانات من جميع المصادر
      await this.collectAllData();
      
      // معالجة البيانات
      this.processData();
      
      // إنشاء النتيجة النهائية
      return this.createFinalResult();
    } catch (error) {
      console.error('❌ Data Engine Error:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  initializeCollectors() {
    this.collectors = [
      {
        name: 'worldBank',
        collector: new WorldBankCollector(this.input.country),
        enabled: true,
      },
      {
        name: 'costs',
        collector: new CostsCollector(
          this.input.country,
          this.input.city,
          this.input.businessType,
          this.input.budget
        ),
        enabled: true,
      },
      {
        name: 'competition',
        collector: new CompetitionCollector(
          this.input.country,
          this.input.city,
          this.input.businessType
        ),
        enabled: true,
      },
    ];

    // إضافة Census collector للولايات المتحدة فقط
    if (this.input.country === 'US') {
      this.collectors.push({
        name: 'census',
        collector: null, // سيتم استيراده ديناميكياً
        enabled: false,  // معطل مؤقتاً حتى نصلح الاستيراد
      });
    }
  }

  async collectAllData() {
    const promises = this.collectors
      .filter(c => c.enabled && c.collector)
      .map(async ({ name, collector }) => {
        try {
          console.log(`📡 Collecting ${name} data...`);
          const data = await collector.collect();
          this.rawData[name] = data;
          console.log(`✅ ${name} data collected successfully`);
        } catch (error) {
          console.warn(`⚠️ Failed to collect ${name} data:`, error.message);
          this.rawData[name] = null;
        }
      });

    await Promise.all(promises);
  }

  processData() {
    this.processedData = {
      demographics: this.processDemographics(),
      marketSize: this.processMarketSize(),
      competition: this.rawData.competition || null,
      costs: this.rawData.costs || null,
      risks: this.processRisks(),
      score: this.calculateScore(),
    };
  }

  processDemographics() {
    const worldBankData = this.rawData.worldBank;
    
    if (!worldBankData) return null;

    return {
      population: worldBankData.population,
      gdpPerCapita: worldBankData.gdpPerCapita,
      unemploymentRate: worldBankData.unemploymentRate,
      sources: ['World Bank'],
      dataYear: worldBankData.year || 2023,
    };
  }

  processMarketSize() {
    const demographics = this.processedData.demographics;
    if (!demographics?.population) return null;
    
    const spendingByType = {
      restaurant: 2500, // متوسط إنفاق سنوي للفرد بالدولار
      cafe: 1200,
      retail: 3000,
      gym: 800,
      salon: 600,
      tech: 2000,
    };
    
    const annualSpendingPerPerson = spendingByType[this.input.businessType] || 1500;
    const totalMarket = demographics.population * annualSpendingPerPerson;
    const targetMarket = totalMarket * 0.1; // استهداف 10% من السوق
    
    return {
      totalAddressableMarket: Math.round(totalMarket),
      serviceableMarket: Math.round(targetMarket),
      perCapitaSpending: annualSpendingPerPerson,
      growthPotential: this.estimateGrowth(),
      marketSizeCategory: this.categorizeMarketSize(totalMarket),
    };
  }

  estimateGrowth() {
    const businessGrowth = {
      restaurant: 3.5,
      cafe: 4.2,
      retail: 2.8,
      gym: 5.1,
      salon: 3.8,
      tech: 8.5,
    };
    
    return businessGrowth[this.input.businessType] || 3.0;
  }

  categorizeMarketSize(totalMarket) {
    if (totalMarket > 1000000000) return 'Very Large';
    if (totalMarket > 100000000) return 'Large';
    if (totalMarket > 10000000) return 'Medium';
    if (totalMarket > 1000000) return 'Small';
    return 'Very Small';
  }

  processRisks() {
    const risks = [];
    
    // مخاطر مالية
    if (this.rawData.costs?.budgetAnalysis) {
      if (!this.rawData.costs.budgetAnalysis.sufficient) {
        risks.push({
          type: 'financial',
          severity: 'high',
          description: `الميزانية غير كافية. تحتاج $${this.rawData.costs.budgetAnalysis.totalRequired} لكن لديك $${this.rawData.costs.budgetAnalysis.userBudget}`,
        });
      }
    }
    
    // مخاطر المنافسة
    if (this.rawData.competition?.marketSaturation === 'High') {
      risks.push({
        type: 'market',
        severity: 'medium',
        description: `تشبع سوقي مرتفع: ${this.rawData.competition.estimatedCompetitors} منافس متوقع`,
      });
    } else if (this.rawData.competition?.marketSaturation === 'Very Low') {
      risks.push({
        type: 'market',
        severity: 'low',
        description: 'منافسة منخفضة جداً - فرصة جيدة',
      });
    }
    
    // مخاطر البطالة
    if (this.processedData.demographics?.unemploymentRate > 10) {
      risks.push({
        type: 'economic',
        severity: 'high',
        description: `معدل بطالة مرتفع: ${this.processedData.demographics.unemploymentRate}%`,
      });
    } else if (this.processedData.demographics?.unemploymentRate < 5) {
      risks.push({
        type: 'economic',
        severity: 'low',
        description: `معدل بطالة منخفض: ${this.processedData.demographics.unemploymentRate}% - اقتصاد صحي`,
      });
    }
    
    return risks;
  }

  calculateScore() {
    let score = 70; // النقاط الأساسية
    const breakdown = [];
    
    // نقاط المنافسة
    if (this.rawData.competition) {
      const competitionScore = this.rawData.competition.competitionScore || 50;
      score += (50 - competitionScore) * 0.3;
      breakdown.push({
        category: 'Competition',
        score: Math.round(100 - competitionScore),
        weight: 30,
      });
    }
    
    // نقاط الميزانية
    if (this.rawData.costs?.budgetAnalysis) {
      const budgetScore = this.rawData.costs.budgetAnalysis.sufficient ? 90 : 40;
      score += budgetScore * 0.25;
      breakdown.push({
        category: 'Budget',
        score: budgetScore,
        weight: 25,
      });
    }
    
    // نقاط السوق
    if (this.processedData.demographics) {
      let marketScore = 70;
      if (this.processedData.demographics.gdpPerCapita > 30000) marketScore = 90;
      else if (this.processedData.demographics.gdpPerCapita > 10000) marketScore = 75;
      else if (this.processedData.demographics.gdpPerCapita < 5000) marketScore = 45;
      
      score += marketScore * 0.25;
      breakdown.push({
        category: 'Market',
        score: marketScore,
        weight: 25,
      });
    }
    
    // نقاط النمو
    const growth = this.processedData.marketSize?.growthPotential || 3;
    const growthScore = Math.min(100, growth * 15);
    score += growthScore * 0.2;
    breakdown.push({
      category: 'Growth',
      score: Math.round(growthScore),
      weight: 20,
    });
    
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    
    return {
      overall: finalScore,
      breakdown: breakdown,
      verdict: this.getVerdict(finalScore),
    };
  }

  getVerdict(score) {
    if (score >= 80) return 'Excellent Opportunity';
    if (score >= 65) return 'Good Opportunity';
    if (score >= 50) return 'Moderate Opportunity';
    if (score >= 35) return 'Risky Opportunity';
    return 'Not Recommended';
  }

  createFinalResult() {
    return {
      success: true,
      input: this.input,
      data: this.processedData,
      dataQuality: this.assessDataQuality(),
      timestamp: new Date().toISOString(),
      version: '2.0.0',
    };
  }

  assessDataQuality() {
    const totalSources = this.collectors.filter(c => c.enabled).length;
    const successfulSources = Object.values(this.rawData).filter(d => d !== null).length;
    
    const score = totalSources > 0 ? Math.round((successfulSources / totalSources) * 100) : 0;
    
    return {
      score: score,
      sourcesRequested: totalSources,
      sourcesSucceeded: successfulSources,
      reliability: score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low',
      availableSources: Object.keys(this.rawData).filter(key => this.rawData[key] !== null),
    };
  }
      }
