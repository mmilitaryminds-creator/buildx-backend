// services/DataEngine.js
// المحرك المحدث للربط المباشر مع الذكاء الاصطناعي

export class DataEngine {
  constructor(input) {
    this.input = input;
  }

  async initialize() {
    console.log('🚀 Initializing BuildX Data Engine...');
    console.log('📝 Input:', this.input);
    return true;
  }

  async analyze() {
    try {
      // إرسال البيانات مباشرة إلى مسار السيرفر الخلفي /api/analyze
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessType: this.input.businessType || this.input.business || 'مشروع تجاري',
          city: this.input.city || this.input.location || 'الجزائر',
          country: this.input.country || 'الجزائر',
          budget: this.input.budget || '10000',
          targetAudience: this.input.targetAudience || 'العموم'
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'فشل الاتصال بخدمة التحليل');
      }

      return {
        success: true,
        analysis: data.analysis
      };
    } catch (error) {
      console.error('DataEngine Error:', error);
      throw new Error(error.message || 'حدث خطأ أثناء جلب تحليل السوق');
    }
  }
}
