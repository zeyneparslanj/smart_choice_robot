
import React, { useState } from 'react';
import { Recommendation } from '../types';
import UniversityDetailModal from './UniversityDetailModal';

interface ResultCardProps {
  rec: Recommendation;
  index: number;
  isSelected: boolean;
  onToggleCompare: (rec: Recommendation) => void;
  disableSelection: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ rec, index, isSelected, onToggleCompare, disableSelection }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Curated list of HIGH-QUALITY, Professional University Marketing-style images
  const images = [
      "https://images.unsplash.com/photo-1592280771884-477e8251e945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Classic Red Brick Ivy
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Historic Quad
      "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Modern Glass Campus
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Grand Library Interior
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Students on Lawn
      "https://images.unsplash.com/photo-1626125345510-4603468eedfb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Tech/Modern Architecture
      "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Lecture Hall
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // Stone Columns/Classic
      "https://images.unsplash.com/photo-1525921429612-e86051f44523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", // University Hall
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"  // Graduation/Alumni Walk
  ];

  // Deterministic selection based on university name string
  const getImageForString = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const idx = Math.abs(hash) % images.length;
      return images[idx];
  };

  const bgImage = getImageForString(rec.university);

  const getBadgeStyle = (prob: string) => {
    const p = prob.toLowerCase();
    if (p.includes('yüksek')) return 'bg-emerald-100 text-emerald-800 border-emerald-200 ring-emerald-500/20';
    if (p.includes('orta')) return 'bg-amber-100 text-amber-800 border-amber-200 ring-amber-500/20';
    return 'bg-rose-100 text-rose-800 border-rose-200 ring-rose-500/20';
  };

  return (
    <>
    <div className={`group relative bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-gray-200 hover:border-indigo-200'}`}>
      
      <div className="flex flex-col md:flex-row">
          {/* Image Section - Enforcing 16:9 Aspect Ratio on Mobile, Fixed Width on Desktop */}
          <div className="relative w-full aspect-video md:aspect-auto md:w-80 flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              <img 
                src={bgImage} 
                alt={rec.university} 
                className="w-full h-full object-cover transition duration-700 group-hover:scale-110 saturate-[1.05] contrast-[1.05]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/5"></div>
              
              <div className="absolute bottom-3 left-3 md:top-3 md:left-3 md:bottom-auto z-10">
                   <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-lg border border-white/20 ${rec.locationType === 'Yurt Dışı' ? 'bg-purple-600/90' : 'bg-blue-600/90'}`}>
                        {rec.country || 'TR'}
                   </span>
              </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                 <div className="pr-4">
                    <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1 line-clamp-2">{rec.department}</h3>
                    {rec.preferenceCode && (
                        <span className="inline-block text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 mb-1" title="ÖSYM Tercih Kodu">
                            #{rec.preferenceCode}
                        </span>
                    )}
                    <p className="text-sm font-bold text-gray-500 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                        {rec.university}
                    </p>
                 </div>
                 
                 <div className="flex items-center gap-2 flex-shrink-0">
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!disableSelection || isSelected) {
                                onToggleCompare(rec);
                            }
                        }}
                        disabled={disableSelection && !isSelected}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isSelected 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300 transform scale-110' 
                            : disableSelection 
                                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                : 'bg-white border border-gray-200 text-gray-400 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                        title="Karşılaştır"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </button>
                 </div>
              </div>

              {/* Badges & Stats */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                 <span className={`px-3 py-1 rounded-lg text-xs font-bold border ring-1 ${getBadgeStyle(rec.probability)}`}>
                    {rec.probability} İhtimal
                 </span>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 border-dashed">
                 <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tahmini Ücret</span>
                     <span className="text-sm font-bold text-gray-900">{rec.tuition ? rec.tuition : 'Detaylarda'}</span>
                 </div>
                 
                 <button 
                   onClick={() => setShowDetails(true)}
                   className="group/btn flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-200 transition-all hover:shadow-xl hover:-translate-y-0.5"
                 >
                    İncele
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                 </button>
              </div>
          </div>
      </div>
    </div>
    
    {showDetails && (
        <UniversityDetailModal rec={rec} onClose={() => setShowDetails(false)} />
    )}
    </>
  );
};

export default ResultCard;
