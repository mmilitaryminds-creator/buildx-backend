// services/data-collectors/WorldBankCollector.js
// هذا الملف يجلب بيانات اقتصادية حقيقية من البنك الدولي مجاناً

export class WorldBankCollector {
  constructor(country) {
    this.country = country;
    this.baseUrl = 'https://api.worldbank.org/v2';
  }

  async collect() {
    try {
      console.log('🌍 Fetching World Bank data...');
      
      const [gdpData, populationData, unemploymentData] = await Promise.all([
        this.fetchIndicator('NY.GDP.PCAP.CD'), // الناتج المحلي للفرد
        this.fetchIndicator('SP.POP.TOTL'),     // إجمالي السكان
        this.fetchIndicator('SL.UEM.TOTL.ZS'),  // معدل البطالة
      ]);

      return {
        gdpPerCapita: gdpData,
        population: populationData,
        unemploymentRate: unemploymentData,
        source: 'World Bank',
        year: 2023,
      };
    } catch (error) {
      console.warn('World Bank data fetch failed:', error);
      return {
        gdpPerCapita: null,
        population: null,
        unemploymentRate: null,
        source: 'World Bank',
        error: error.message
      };
    }
  }

  async fetchIndicator(indicator) {
    const url = `${this.baseUrl}/country/${this.country}/indicator/${indicator}?format=json&per_page=1&date=2023`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data[1]?.[0]?.value || null;
  }

  async getCountryInfo() {
    const url = `${this.baseUrl}/country/${this.country}?format=json`;
    const response = await fetch(url);
    const data = await response.json();
    return data[1]?.[0] || null;
  }
}
