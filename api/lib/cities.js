// api/lib/cities.js
// قاعدة بيانات المدن العالمية

export function suggestCities(country, currentCity, businessType) {
  const globalCities = {
    'USA': [
      { city: 'New York', population: 8336817, gdpPerCapita: 76000, score: 75, reason: 'سوق ضخمة وقوة شرائية عالية' },
      { city: 'Austin', population: 961855, gdpPerCapita: 65000, score: 85, reason: 'نمو سريع وتكلفة معقولة' },
      { city: 'Denver', population: 715522, gdpPerCapita: 62000, score: 80, reason: 'سوق متوسطة النمو' },
      { city: 'Nashville', population: 689447, gdpPerCapita: 58000, score: 78, reason: 'طلب متزايد' },
      { city: 'Miami', population: 442241, gdpPerCapita: 55000, score: 82, reason: 'سوق سياحية قوية' }
    ],
    'SA': [
      { city: 'Riyadh', population: 7677000, gdpPerCapita: 28000, score: 82, reason: 'سوق كبيرة ونمو اقتصادي' },
      { city: 'Jeddah', population: 3976000, gdpPerCapita: 25000, score: 76, reason: 'تنوع اقتصادي وسياحة' },
      { city: 'Dammam', population: 1288000, gdpPerCapita: 27000, score: 72, reason: 'منطقة صناعية ونفطية' }
    ],
    'AE': [
      { city: 'Dubai', population: 3331000, gdpPerCapita: 45000, score: 88, reason: 'سوق عالمية وبنية تحتية ممتازة' },
      { city: 'Abu Dhabi', population: 1483000, gdpPerCapita: 50000, score: 82, reason: 'قوة شرائية عالية' },
      { city: 'Sharjah', population: 1400000, gdpPerCapita: 28000, score: 70, reason: 'تكاليف أقل وقريبة من دبي' }
    ],
    'EG': [
      { city: 'Cairo', population: 21000000, gdpPerCapita: 4000, score: 75, reason: 'سوق ضخمة جداً' },
      { city: 'Alexandria', population: 5200000, gdpPerCapita: 3500, score: 70, reason: 'تكاليف أقل وسوق كبيرة' },
      { city: 'New Cairo', population: 2000000, gdpPerCapita: 6000, score: 78, reason: 'منطقة نمو جديدة وطبقة متوسطة' }
    ],
    'FR': [
      { city: 'Paris', population: 2148000, gdpPerCapita: 45000, score: 85, reason: 'سوق عالمية وسياحة قوية' },
      { city: 'Lyon', population: 522969, gdpPerCapita: 40000, score: 78, reason: 'اقتصاد متنوع' },
      { city: 'Marseille', population: 869815, gdpPerCapita: 32000, score: 72, reason: 'ميناء وسياحة' }
    ],
    'GB': [
      { city: 'London', population: 8982000, gdpPerCapita: 50000, score: 88, reason: 'مركز مالي عالمي' },
      { city: 'Manchester', population: 553230, gdpPerCapita: 38000, score: 78, reason: 'نمو سريع' },
      { city: 'Birmingham', population: 1141816, gdpPerCapita: 32000, score: 72, reason: 'اقتصاد متنوع' }
    ],
    'DZ': [
      { city: 'Algiers', population: 3415811, gdpPerCapita: 4200, score: 72, reason: 'عاصمة وسوق كبيرة' },
      { city: 'Oran', population: 803329, gdpPerCapita: 4500, score: 68, reason: 'ميناء ونشاط تجاري' },
      { city: 'Constantine', population: 448374, gdpPerCapita: 3800, score: 65, reason: 'سوق متوسطة' }
    ],
    'MA': [
      { city: 'Casablanca', population: 3359000, gdpPerCapita: 5000, score: 78, reason: 'مركز اقتصادي' },
      { city: 'Rabat', population: 577827, gdpPerCapita: 5500, score: 72, reason: 'عاصمة إدارية' },
      { city: 'Marrakech', population: 928850, gdpPerCapita: 4000, score: 75, reason: 'سياحة قوية' }
    ],
    'TN': [
      { city: 'Tunis', population: 638845, gdpPerCapita: 4500, score: 70, reason: 'عاصمة اقتصادية' },
      { city: 'Sfax', population: 280566, gdpPerCapita: 5000, score: 65, reason: 'صناعة وتجارة' },
      { city: 'Sousse', population: 221530, gdpPerCapita: 4200, score: 68, reason: 'سياحة ساحلية' }
    ],
    'CA': [
      { city: 'Toronto', population: 2930000, gdpPerCapita: 52000, score: 85, reason: 'مركز مالي' },
      { city: 'Vancouver', population: 675218, gdpPerCapita: 48000, score: 80, reason: 'جودة حياة عالية' },
      { city: 'Montreal', population: 1780000, gdpPerCapita: 40000, score: 75, reason: 'تكاليف أقل' }
    ],
    'DE': [
      { city: 'Berlin', population: 3769495, gdpPerCapita: 42000, score: 82, reason: 'سوق كبيرة وابتكار' },
      { city: 'Munich', population: 1471508, gdpPerCapita: 55000, score: 85, reason: 'قوة شرائية عالية' },
      { city: 'Hamburg', population: 1841179, gdpPerCapita: 48000, score: 78, reason: 'ميناء وتجارة' }
    ],
    'TR': [
      { city: 'Istanbul', population: 15460000, gdpPerCapita: 12000, score: 80, reason: 'سوق ضخمة وجسر بين قارتين' },
      { city: 'Ankara', population: 5663000, gdpPerCapita: 13000, score: 72, reason: 'عاصمة إدارية' },
      { city: 'Izmir', population: 4394000, gdpPerCapita: 14000, score: 75, reason: 'ميناء وسياحة' }
    ],
    'IN': [
      { city: 'Mumbai', population: 20668000, gdpPerCapita: 8000, score: 78, reason: 'مركز مالي ضخم' },
      { city: 'Delhi', population: 30290000, gdpPerCapita: 7000, score: 75, reason: 'سوق ضخمة جداً' },
      { city: 'Bangalore', population: 13000000, gdpPerCapita: 9000, score: 82, reason: 'مركز تكنولوجي' }
    ],
    'BR': [
      { city: 'Sao Paulo', population: 12330000, gdpPerCapita: 12000, score: 78, reason: 'مركز اقتصادي' },
      { city: 'Rio de Janeiro', population: 6748000, gdpPerCapita: 11000, score: 75, reason: 'سياحة وخدمات' },
      { city: 'Brasilia', population: 3055000, gdpPerCapita: 15000, score: 72, reason: 'عاصمة إدارية' }
    ]
  };

  if (!globalCities[country]) {
    return [
      { 
        city: currentCity, 
        population: null, 
        gdpPerCapita: null, 
        score: 65, 
        reason: 'بيانات محدودة - تقييم تقديري',
        dataReliability: 'تقديري'
      },
      { 
        city: 'City A', 
        population: null, 
        gdpPerCapita: null, 
        score: 60, 
        reason: 'بيانات غير متوفرة - يحتاج بحث يدوي',
        dataReliability: 'غير متوفر'
      },
      { 
        city: 'City B', 
        population: null, 
        gdpPerCapita: null, 
        score: 55, 
        reason: 'بيانات غير متوفرة - يحتاج بحث يدوي',
        dataReliability: 'غير متوفر'
      }
    ];
  }

  return globalCities[country]
    .filter(c => c.city.toLowerCase() !== currentCity.toLowerCase())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(c => ({
      ...c,
      dataReliability: c.population ? 'مؤكد' : 'تقديري'
    }));
       }
