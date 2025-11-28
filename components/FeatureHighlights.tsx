import React from 'react';

const features = [
  {
    title: "Puan Analizi & Tahmin",
    description: "TYT, AYT ve YDT puanlarınızı analiz eder, sıralamanıza en uygun bölümleri gelişmiş algoritmalarla belirler.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Global Fırsatlar",
    description: "Sadece Türkiye değil, Avrupa ve Amerika'daki üniversite fırsatlarını da keşfedin. Dünya sizin kampüsünüz.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-purple-50 text-purple-600"
  },
  {
    title: "Yapay Zeka Destekli",
    description: "Gemini 2.5 teknolojisi ile ilgi alanlarınızı ve hedeflerinizi anlayarak size özel nokta atışı öneriler sunar.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    title: "Sanal Kampüs Turu",
    description: "Önerilen üniversitelerin kampüslerini, kütüphanelerini ve sosyal alanlarını yerindeymiş gibi inceleyin.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    color: "bg-green-50 text-green-600"
  },
  {
    title: "Burs & Maliyet Analizi",
    description: "Eğitim ücretleri, burs olanakları ve yaşam maliyetleri hakkında detaylı öngörüler alın.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "bg-yellow-50 text-yellow-600"
  },
  {
    title: "Gerçek Öğrenci Yorumları",
    description: "Bölüm hakkında okuyan öğrencilerin tecrübelerini ve anonim yorumlarını okuyarak karar verin.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: "bg-red-50 text-red-600"
  }
];

const FeatureHighlights: React.FC = () => {
  return (
    <div className="py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Üniversite Tercih Robotu ile Neler Yapabilirsiniz?</h2>
        <p className="text-gray-500 mt-2">Size özel tercih önerileri ve detaylı analizler</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${feature.color}`}>
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHighlights;