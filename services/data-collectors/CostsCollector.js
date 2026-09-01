// services/data-collectors/CostsCollector.js
// هذا الملف يحسب التكاليف التقديرية للمشروع

export class CostsCollector {
  constructor(country, city, businessType, budget) {
    this.country = country;
    this.city = city;
    this.businessType = businessType;
    this.budget = Number(budget);
  }

  async collect() {
    try {
      console.log('💰 Calculating costs...');
      
      const costs = this.estimateCosts();
      const monthlyTotal = this.calculateTotal(costs.monthly);
      const startupTotal = this.calculateTotal(costs.startup);
      const breakEven = this.calculateBreakEven(monthlyTotal, startupTotal);
      
      return {
        startupCosts: costs.startup,
        monthlyCosts: costs.monthly,
        totalStartupCosts: startupTotal,
        totalMonthlyCosts: monthlyTotal,
        breakEvenMonths: breakEven,
        budgetAnalysis: this.analyzeBudget(startupTotal),
        source: 'Estimated Costs',
        currency: 'USD',
      };
    } catch (error) {
      console.warn('Cost calculation failed:', error);
      return {
        startupCosts: {},
        monthlyCosts: {},
        totalStartupCosts: 0,
        totalMonthlyCosts: 0,
        breakEvenMonths: null,
        budgetAnalysis: {
          totalRequired: 0,
          userBudget: this.budget,
          remaining: this.budget,
          sufficient: true,
          percentageOfBudget: 0,
        },
        source: 'Estimated Costs',
        currency: 'USD',
      };
    }
  }

  estimateCosts() {
    const costStructure = {
      restaurant: {
        startup: { 
          equipment: 30000, 
          licenses: 5000, 
          renovation: 20000, 
          initialInventory: 10000,
          marketing: 5000,
        },
        monthly: { 
          rent: 5000, 
          salaries: 15000, 
          utilities: 2000, 
          insurance: 1000, 
          marketing: 3000,
          supplies: 8000,
        },
      },
      cafe: {
        startup: { 
          equipment: 15000, 
          licenses: 3000, 
          renovation: 12000, 
          initialInventory: 5000,
          marketing: 3000,
        },
        monthly: { 
          rent: 3500, 
          salaries: 8000, 
          utilities: 1500, 
          insurance: 800, 
          marketing: 2000,
          supplies: 4000,
        },
      },
      retail: {
        startup: { 
          inventory: 25000, 
          fixtures: 10000, 
          renovation: 15000, 
          licenses: 2000,
          marketing: 4000,
        },
        monthly: { 
          rent: 4000, 
          salaries: 10000, 
          utilities: 1800, 
          insurance: 1200, 
          marketing: 2500,
          inventory: 10000,
        },
      },
      gym: {
        startup: { 
          equipment: 50000, 
          renovation: 20000, 
          licenses: 4000, 
          initialInventory: 3000,
          marketing: 5000,
        },
        monthly: { 
          rent: 6000, 
          salaries: 12000, 
          utilities: 2500, 
          insurance: 2000, 
          marketing: 3000,
          maintenance: 1500,
        },
      },
      tech: {
        startup: { 
          equipment: 20000, 
          licenses: 5000, 
          office: 10000, 
          initialInventory: 2000,
          marketing: 8000,
        },
        monthly: { 
          rent: 4000, 
          salaries: 25000, 
          utilities: 2000, 
          insurance: 1500, 
          marketing: 5000,
          software: 3000,
        },
      },
    };

    return costStructure[this.businessType] || this.getDefaultCosts();
  }

  getDefaultCosts() {
    return {
      startup: { 
        general: this.budget * 0.5,
        licenses: this.budget * 0.05,
        marketing: this.budget * 0.1,
      },
      monthly: { 
        general: this.budget * 0.1,
        salaries: this.budget * 0.05,
        utilities: this.budget * 0.02,
      },
    };
  }

  calculateTotal(costsObj) {
    return Object.values(costsObj).reduce((sum, value) => sum + value, 0);
  }

  calculateBreakEven(monthlyTotal, startupTotal) {
    const monthlyRevenue = this.estimateMonthlyRevenue();
    
    if (monthlyRevenue <= monthlyTotal) {
      return 24; // سنتين كحد أقصى
    }
    
    const monthlyProfit = monthlyRevenue - monthlyTotal;
    return Math.ceil(startupTotal / monthlyProfit);
  }

  estimateMonthlyRevenue() {
    const revenueByType = {
      restaurant: 40000,
      cafe: 20000,
      retail: 30000,
      gym: 25000,
      tech: 50000,
    };
    
    return revenueByType[this.businessType] || 20000;
  }

  analyzeBudget(startupTotal) {
    const remaining = this.budget - startupTotal;
    
    return {
      totalRequired: startupTotal,
      userBudget: this.budget,
      remaining: remaining,
      sufficient: remaining >= 0,
      percentageOfBudget: ((startupTotal / this.budget) * 100).toFixed(1),
    };
  }
}
