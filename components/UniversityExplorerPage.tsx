
import React, { useState } from 'react';
import { getUniversityDetails } from '../services/geminiService';
import { Recommendation } from '../types';
import { ALL_UNIVERSITIES } from '../constants';
import UniversityDetailModal from './UniversityDetailModal';
import ComparisonModal from './ComparisonModal';

const UniversityExplorerPage: React.FC = () => {
  // Mode State
  const [mode, setMode] = useState<'explore' | 'compare'>('explore');

  // Explore State
  const [searchTerm, setSearchTerm] = useState('');
  const [universityData, setUniversityData] = useState<Recommendation | null>(null);
  
  // Compare State
  const [compareTerm1, setCompareTerm1] = useState('');
  const [compareTerm2, setCompareTerm2] = useState('');
  const [comparisonResults, setComparisonResults] = useState<Recommendation[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Shared State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Single Search Logic ---
  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    
    setSearchTerm(term); 
    setIsLoading(true);
    setUniversityData(null); 
    setError(null);
    
    try {
        const result = await getUniversityDetails(term);
        setUniversityData(result);
    } catch (err: any) {
      console.error("University detail fetch failed", err);
      setError("Bilgiler alınırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  // --- Comparison Logic ---
  const handleCompare = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!compareTerm1.trim() || !compareTerm2.trim()) return;

      setIsLoading(true);
      setError(null);
      setComparisonResults([]);

      try {
          const [res1, res2] = await Promise.all([
              getUniversityDetails(compareTerm1),
              getUniversityDetails(compareTerm2)
          ]);
          setComparisonResults([res1, res2]);
          setShowComparison(true);
      } catch (err: any) {
          console.error("Comparison fetch failed", err);
          setError("Karşılaştırma verileri alınırken bir hata oluştu. Lütfen üniversite isimlerini kontrol edin.");
      } finally {
          setIsLoading(false);
      }
  };


  // --- Render Views ---

  // 1. Single Detail View (Inline)
  if (universityData) {
      return (
          <div className="animate-fade-in w-full min-h-screen -mt-8"> 
             <UniversityDetailModal 
                rec={universityData} 
                onClose={() => setUniversityData(null)} 
                inline={true} 
             />
          </div>
      );
  }

  // 2. Comparison Inline View
  if (showComparison && comparisonResults.length > 0) {
      return (
          <div className="animate-fade-in w-full min-h-screen -mt-8">
            <ComparisonModal 
                universities={comparisonResults} 
                onClose={() => setShowComparison(false)} 
                onRemove={() => setShowComparison(false)} 
                inline={true}
            />
          </div>
      );
  }

  // Updated Image List with reliable Unsplash IDs and Ranking Data
  const suggestedUniversities = [
      { 
          name: "Harvard University", 
          location: "Cambridge, USA", 
          img: "https://images.unsplash.com/photo-1559135197-8a45ea74d367?auto=format&fit=crop&w=800&q=80",
          globalRank: "#1",
          trRank: "-"
      },
      { 
          name: "Boğaziçi Üniversitesi", 
          location: "İstanbul, Türkiye", 
          img: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80",
          globalRank: "#600+",
          trRank: "#1"
      },
      { 
          name: "University of Oxford", 
          location: "Oxford, UK", 
          img: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=800&q=80",
          globalRank: "#3",
          trRank: "-"
      },
      {
          name: "Stanford University",
          location: "California, USA",
          img: "https://images.unsplash.com/photo-1623944890763-0040669c5011?auto=format&fit=crop&w=800&q=80",
          globalRank: "#2",
          trRank: "-"
      },
      {
          name: "MIT",
          location: "Massachusetts, USA",
          img: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=800&q=80",
          globalRank: "#1 (QS)",
          trRank: "-"
      },
      {
          name: "ODTÜ", 
          location: "Ankara, Türkiye", 
          img: "https://images.unsplash.com/photo-1590579491624-f98f36d4c763?auto=format&fit=crop&w=800&q=80",
          globalRank: "#500+",
          trRank: "#2"
      }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in pb-24">
       
       {/* Hero Section */}
       <div className="relative bg-gray-900 rounded-3xl shadow-2xl overflow-hidden mb-12 group border border-gray-800 transition-all duration-500">
           {/* Background Image & Gradient */}
           <div className="absolute inset-0">
               <img 
                 src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80" 
                 alt="Library" 
                 className="w-full h-full object-cover opacity-30 transition-transform duration-1000 group-hover:scale-105 saturate-[1.1]"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-900/50"></div>
           </div>
           
           {/* Global Stats Badge (Top Right) */}
           <div className="absolute top-6 right-6 hidden lg:flex items-center gap-4 bg-black/40 backdrop-blur-md p-2 pr-6 rounded-2xl border border-white/10 shadow-2xl transform transition hover:scale-105 cursor-default z-20">
               <div className="flex -space-x-3">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-gray-900 shadow-lg flex items-center justify-center relative z-10 group/box">
                       <span className="text-[10px] font-extrabold text-white">EU</span>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-gray-900 shadow-lg flex items-center justify-center relative z-20 group/box">
                       <span className="text-[10px] font-extrabold text-white">USA</span>
                   </div>
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 border-2 border-gray-900 shadow-lg flex items-center justify-center relative z-30 group/box">
                        <span className="text-[10px] font-extrabold text-white">TR</span>
                   </div>
               </div>
               <div className="flex flex-col">
                   <span className="text-2xl font-extrabold text-white leading-none tracking-tight">25.000+</span>
                   <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Üniversite Verisi</span>
               </div>
           </div>

           <div className="relative z-10 px-8 py-12 md:px-16 md:py-16 flex flex-col items-center text-center">
                  <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-extrabold uppercase tracking-widest mb-6 backdrop-blur-md">
                     <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                     Keşfet & İncele
                  </span>
                  <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                     Üniversiteleri Keşfedin<br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">ve Karşılaştırın.</span>
                  </h2>
                  <p className="text-indigo-100/80 text-lg font-medium leading-relaxed mb-8 max-w-2xl">
                     Kampüs yaşamını, burs olanaklarını ve kariyer fırsatlarını yapay zeka destekli detaylı profillerle inceleyin veya iki üniversiteyi yan yana kıyaslayın.
                  </p>

                   {/* Mode Switcher */}
                   <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-xl inline-flex mb-8 border border-white/20">
                       <button 
                         onClick={() => setMode('explore')}
                         className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === 'explore' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                       >
                           🔍 Tekil İnceleme
                       </button>
                       <button 
                         onClick={() => setMode('compare')}
                         className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${mode === 'compare' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                       >
                           ⚖️ Karşılaştırma Yap
                       </button>
                   </div>

                   {/* Search Bar / Comparison Inputs */}
                   <div className="w-full max-w-3xl relative group/search">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-30 group-hover/search:opacity-75 transition duration-500"></div>
                        
                        {mode === 'explore' ? (
                            <form onSubmit={handleSearch} className="relative bg-white rounded-2xl p-2 flex shadow-2xl">
                                <div className="flex-1 flex items-center pl-4">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                    <input 
                                        list="explorer_universities_dl"
                                        type="text" 
                                        placeholder="Hangi üniversiteyi merak ediyorsunuz?" 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-0 text-lg font-semibold px-3 py-2"
                                        autoComplete="off"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isLoading || !searchTerm.trim()}
                                    className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${
                                        isLoading || !searchTerm.trim() 
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <span>İncele</span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleCompare} className="relative bg-white rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row gap-2">
                                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition">
                                    <span className="text-gray-400 text-xs font-bold mr-2 uppercase">A</span>
                                    <input 
                                        list="explorer_universities_dl"
                                        type="text" 
                                        placeholder="1. Üniversite" 
                                        value={compareTerm1}
                                        onChange={(e) => setCompareTerm1(e.target.value)}
                                        className="w-full bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-0 text-base font-semibold py-3"
                                        autoComplete="off"
                                    />
                                </div>
                                
                                <div className="hidden md:flex items-center justify-center text-gray-300 font-bold">VS</div>

                                <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-3 border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition">
                                    <span className="text-gray-400 text-xs font-bold mr-2 uppercase">B</span>
                                    <input 
                                        list="explorer_universities_dl"
                                        type="text" 
                                        placeholder="2. Üniversite" 
                                        value={compareTerm2}
                                        onChange={(e) => setCompareTerm2(e.target.value)}
                                        className="w-full bg-transparent border-none text-gray-900 placeholder-gray-400 focus:ring-0 text-base font-semibold py-3"
                                        autoComplete="off"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isLoading || !compareTerm1.trim() || !compareTerm2.trim()}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                                        isLoading || !compareTerm1.trim() || !compareTerm2.trim()
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <span>Karşılaştır</span>
                                    )}
                                </button>
                            </form>
                        )}
                        
                         <datalist id="explorer_universities_dl">
                            {ALL_UNIVERSITIES.map((uni, index) => (
                                <option key={index} value={uni} />
                            ))}
                        </datalist>
                   </div>
           </div>
       </div>

       {/* Loading Skeleton */}
       {isLoading && (
           <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 shadow-xl border border-gray-100 animate-pulse mb-12">
               <div className="flex flex-col md:flex-row gap-8">
                   <div className="w-full md:w-64 h-48 bg-gray-200 rounded-2xl flex-shrink-0"></div>
                   <div className="flex-1 space-y-5 py-2">
                       <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                       <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                       </div>
                       <div className="h-20 bg-gray-200 rounded w-full"></div>
                       <div className="flex gap-4 pt-2">
                           <div className="h-10 bg-gray-200 rounded w-32"></div>
                           <div className="h-10 bg-gray-200 rounded w-32"></div>
                       </div>
                   </div>
               </div>
           </div>
       )}

       {/* Error Message */}
       {error && (
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 rounded-2xl p-6 text-center animate-fade-in mb-12 shadow-sm">
                 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 </div>
                 <h4 className="font-bold text-red-900 mb-2">Hata Oluştu</h4>
                 <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
       )}

       {/* Popular Suggestions & Rankings */}
       {!universityData && !showComparison && !isLoading && !error && mode === 'explore' && (
           <div className="animate-fade-in">
                <div className="flex items-center gap-3 mb-8">
                     <div className="h-px bg-gray-200 flex-1"></div>
                     <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest px-4">Popüler Aramalar & Sıralamalar</h3>
                     <div className="h-px bg-gray-200 flex-1"></div>
                </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {suggestedUniversities.map((item, idx) => (
                       <button 
                         key={idx}
                         onClick={() => performSearch(item.name)}
                         className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 text-left w-full border border-gray-100 ring-0 hover:ring-4 hover:ring-indigo-500/10 aspect-video min-h-[200px]"
                       >
                           {/* Image */}
                           <div className="absolute inset-0 bg-gray-200">
                                <img 
                                    src={item.img} 
                                    alt={item.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 saturate-[1.1] contrast-[1.05]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
                           </div>
                           
                           {/* Content */}
                           <div className="absolute bottom-0 left-0 p-8 w-full text-white z-10">
                               <h4 className="font-extrabold text-2xl leading-tight mb-1 group-hover:text-indigo-300 transition-colors drop-shadow-md">{item.name}</h4>
                               <p className="text-sm text-gray-300 font-bold flex items-center mb-3">
                                   <svg className="w-4 h-4 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                   {item.location}
                               </p>

                               {/* Rankings Badge */}
                               <div className="flex gap-2">
                                  {item.globalRank && item.globalRank !== '-' && (
                                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-sm border border-white/20">
                                        🌍 Global: {item.globalRank}
                                     </span>
                                  )}
                                  {item.trRank && item.trRank !== '-' && (
                                     <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/90 text-white backdrop-blur-sm border border-white/20">
                                        🇹🇷 TR: {item.trRank}
                                     </span>
                                  )}
                               </div>
                           </div>
                           
                           {/* Arrow Icon */}
                           <div className="absolute top-5 right-5 bg-white/20 backdrop-blur-md rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 border border-white/30 shadow-lg">
                               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                           </div>
                       </button>
                   ))}
               </div>
           </div>
       )}

    </div>
  );
};

export default UniversityExplorerPage;
