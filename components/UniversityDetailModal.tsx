
import React, { useState, useEffect, useMemo } from 'react';
import { Recommendation, UniversityReviewData, CareerStat } from '../types';
import { getUniversityReviews } from '../services/geminiService';

interface UniversityDetailModalProps {
  rec: Recommendation;
  onClose: () => void;
  inline?: boolean;
}

const UniversityDetailModal: React.FC<UniversityDetailModalProps> = ({ rec, onClose, inline = false }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'campus' | 'finance' | 'careers' | 'reviews'>('overview');
  
  // Real reviews state
  const [realReviewsData, setRealReviewsData] = useState<UniversityReviewData | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Chart Tooltip State
  const [hoveredCareer, setHoveredCareer] = useState<CareerStat | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Sorting State for Career Stats
  const [careerSort, setCareerSort] = useState<'salary' | 'demand' | 'growth'>('demand');

  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch reviews when tab changes to 'reviews'
  useEffect(() => {
    if (activeTab === 'reviews' && !realReviewsData && !isLoadingReviews && !reviewError) {
      const fetchReviews = async () => {
        setIsLoadingReviews(true);
        setReviewError(null);
        try {
          const data = await getUniversityReviews(rec.university);
          setRealReviewsData(data);
        } catch (error: any) {
          console.error("Failed to fetch real reviews", error);
          setReviewError(error.message || "Yorumlar yüklenirken bir hata oluştu.");
        } finally {
          setIsLoadingReviews(false);
        }
      };
      fetchReviews();
    }
  }, [activeTab, rec.university, realReviewsData, isLoadingReviews, reviewError]);


  // Expanded list of high-quality, professional campus images (16:9 optimized)
  const campusPlaceholders = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80", // Classic Quad
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80", // Modern Glass Building
    "https://images.unsplash.com/photo-1592280771884-477e8251e945?auto=format&fit=crop&w=1600&q=80", // Brick Building with Ivy
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1600&q=80", // Grand Library
    "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=1600&q=80", // Lecture Hall
    "https://images.unsplash.com/photo-1626125345510-4603468eedfb?auto=format&fit=crop&w=1600&q=80", // Modern Tech Campus
    "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1600&q=80", // Pillars / Architecture
    "https://images.unsplash.com/photo-1525921429612-e86051f44523?auto=format&fit=crop&w=1600&q=80", // University Chapel/Hall
    "https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?auto=format&fit=crop&w=1600&q=80", // Study Room
    "https://images.unsplash.com/photo-1515658323429-19d7d310a309?auto=format&fit=crop&w=1600&q=80", // Sunny Lawn
    "https://images.unsplash.com/photo-1551135049-8a33b5883817?auto=format&fit=crop&w=1600&q=80", // Graduation Hall
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1600&q=80", // Campus Walk
    "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1600&q=80", // Modern Study Space
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=80", // Campus Entrance
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80"  // Student Life
  ];
  
  // Deterministic image selection based on string hash to consistent images for same spot
  const getImageForString = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % campusPlaceholders.length;
      return campusPlaceholders[index];
  };
  
  const bgImage = getImageForString(rec.university + "hero_v2");

  const getSafeUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < rating ? 'fill-current' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const renderRequirementWithHighlight = (text: string) => {
    const parts = text.split(':');
    if (parts.length > 1) {
       return (
         <>
           <span className="font-bold text-gray-900">{parts[0]}:</span>
           <span className="text-gray-700">{parts.slice(1).join(':')}</span>
         </>
       );
    }
    return <span className="text-gray-700">{text}</span>;
  };

  const getCategorizedRequirements = () => {
    const scoreKeywords = ['SAT', 'ACT', 'TOEFL', 'IELTS', 'GPA', 'Diploma', 'YKS', 'Sıralama', 'Puan', 'Net', 'Ortalama', 'IB', 'AP'];
    const requirements = rec.admissionRequirements || [];
    
    const scores = requirements.filter(r => scoreKeywords.some(k => r.toUpperCase().includes(k.toUpperCase())));
    const general = requirements.filter(r => !scoreKeywords.some(k => r.toUpperCase().includes(k.toUpperCase())));
    
    return { scores, general };
  };

  const { scores: scoreRequirements, general: generalRequirements } = getCategorizedRequirements();

  // --- CHART LOGIC ---
  const getSalaryValue = (salaryStr: string) => {
    const numbers = salaryStr.match(/[\d\.]+/g); // Match groups of digits and dots
    if (!numbers) return 0;
    
    const parse = (s: string) => parseInt(s.replace(/\./g, '')) || 0;
    
    if (numbers.length >= 2) {
        return (parse(numbers[0]) + parse(numbers[1])) / 2;
    }
    return parse(numbers[0]);
  };

  const getGrowthColor = (growth: string) => {
    const g = growth.toLowerCase();
    if (g.includes('yüksek') || g.includes('hızlı') || g.includes('artış')) return 'bg-emerald-500 ring-emerald-300'; 
    if (g.includes('orta') || g.includes('stabil') || g.includes('dengeli')) return 'bg-amber-400 ring-amber-200'; 
    return 'bg-gray-400 ring-gray-200'; 
  };

  const getGrowthValue = (growth: string) => {
    const g = growth.toLowerCase();
    if (g.includes('yüksek') || g.includes('hızlı') || g.includes('artış')) return 3;
    if (g.includes('orta') || g.includes('stabil') || g.includes('dengeli')) return 2;
    return 1;
  };

  const sortedCareerStats = useMemo(() => {
     if (!rec.careerStats) return [];
     return [...rec.careerStats].sort((a, b) => {
        if (careerSort === 'salary') return getSalaryValue(b.salary) - getSalaryValue(a.salary);
        if (careerSort === 'demand') return (b.demandScore || 0) - (a.demandScore || 0);
        if (careerSort === 'growth') return getGrowthValue(b.growth) - getGrowthValue(a.growth);
        return 0;
     });
  }, [rec.careerStats, careerSort]);

  // --- GALLERY PREP ---
  const galleryItems = useMemo(() => {
    const spots = (rec.popularCampusSpots && rec.popularCampusSpots.length > 0 
      ? rec.popularCampusSpots 
      : ['Ana Kampüs', 'Üniversite Kütüphanesi', 'Öğrenci Merkezi', 'Spor Salonu', 'Fakülte Binası', 'Yeşil Alan']
    );
    return spots.map(spot => ({
      name: spot,
      image: getImageForString(rec.university + spot + "v2") // v2 key for fresh hash
    }));
  }, [rec.popularCampusSpots, rec.university]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };


  // WRAPPER CLASSES BASED ON MODE
  const wrapperClass = inline 
    ? "relative w-full bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100" 
    : "fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden";
  
  const backdropClass = inline 
    ? "hidden" 
    : "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity";

  const containerClass = inline
    ? "w-full min-h-screen flex flex-col bg-white" 
    : "bg-white sm:rounded-2xl shadow-2xl w-full max-w-4xl h-full sm:h-[90vh] relative flex flex-col overflow-hidden animate-fade-in";

  const contentScrollClass = inline
    ? "flex-1 p-6 sm:p-10 bg-gray-50"
    : "flex-1 overflow-y-auto p-6 sm:p-8 bg-gray-50";

  return (
    <div className={wrapperClass}>
      {!inline && <div className={backdropClass} onClick={onClose}></div>}

      <div className={containerClass}>
        
        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 md:h-96 flex-shrink-0 group overflow-hidden bg-gray-900">
          <img 
            src={bgImage} 
            alt={rec.university} 
            className="w-full h-full object-cover transition duration-1000 group-hover:scale-105 saturate-[1.1] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          <button 
            onClick={onClose}
            className={`absolute top-4 right-4 text-white rounded-full p-2 backdrop-blur-md transition z-20 flex items-center gap-2 ${inline ? 'bg-black/50 hover:bg-black/70 px-4' : 'bg-black/30 hover:bg-black/50'}`}
          >
            {inline && <span className="text-sm font-bold">Geri Dön</span>}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {inline 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path> // Left Arrow for Back
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path> // X for Close
                }
            </svg>
          </button>

          {rec.website && (
            <div className="absolute bottom-6 right-6 hidden sm:block z-20">
               <a 
                  href={getSafeUrl(rec.website)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
               >
                  Resmi Web Sitesi
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
               </a>
            </div>
          )}

          <div className="absolute bottom-6 left-6 text-white max-w-3xl z-10">
            <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border border-white/20 ${rec.locationType === 'Yurt Dışı' ? 'bg-purple-500/90' : 'bg-red-500/90'}`}>
                    {rec.country || 'Türkiye'}
                </span>
                {rec.preferenceCode && (
                   <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/20 font-mono">
                      Kod: {rec.preferenceCode}
                   </span>
                )}
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight shadow-black drop-shadow-xl tracking-tight mb-2">{rec.university}</h2>
            <div className="flex items-center flex-wrap gap-2">
                <p className="text-lg sm:text-xl text-gray-200 font-medium">{rec.department}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Sticky */}
        <div className={`border-b border-gray-200 bg-white z-40 shadow-sm ${inline ? 'sticky top-20' : 'sticky top-0'}`}>
          <div className="flex px-4 sm:px-8 gap-4 sm:gap-8 overflow-x-auto no-scrollbar justify-start sm:justify-center">
            {[
              { id: 'overview', label: 'Genel Bakış' },
              { id: 'campus', label: 'Kampüs & Yaşam' },
              { id: 'finance', label: 'Kabul & Maliyet' },
              { id: 'careers', label: 'Kariyer & Gelecek' },
              { id: 'reviews', label: 'Öğrenci Yorumları' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 text-sm font-bold border-b-2 transition whitespace-nowrap px-2 ${
                  activeTab === tab.id 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className={contentScrollClass}>
          <div className="max-w-5xl mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center relative z-10">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </span>
                    Genel Tanıtım & Vizyon
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">{rec.reason}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition">
                  <h4 className="font-bold text-green-700 mb-4 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Öne Çıkan Avantajlar
                  </h4>
                  <ul className="space-y-3">
                    {rec.pros.map((pro, i) => (
                      <li key={i} className="flex items-start text-gray-700">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition">
                  <h4 className="font-bold text-red-700 mb-4 flex items-center text-lg">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                    Dikkat Edilmesi Gerekenler
                  </h4>
                  <ul className="space-y-3">
                    {rec.cons.map((con, i) => (
                      <li key={i} className="flex items-start text-gray-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'campus' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </span>
                    Kampüs Atmosferi
                </h3>
                <p className="text-gray-700 leading-relaxed italic text-lg border-l-4 border-indigo-200 pl-4 py-1">
                  "{rec.campusVibe || 'Kampüs bilgisi yükleniyor...'}"
                </p>
              </div>

              {/* Campus Map Embed */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    </span>
                    Kampüs Konumu
                 </h3>
                 <div className="w-full h-96 bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200 relative group">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(rec.university)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                        title={`${rec.university} Map`}
                        className="w-full h-full grayscale group-hover:grayscale-0 transition duration-700"
                    ></iframe>
                 </div>
                 <div className="mt-4 text-right">
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.university)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-bold group bg-indigo-50 px-4 py-2 rounded-lg transition"
                    >
                        Büyük Haritada Aç
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                 </div>
              </div>
              
              {/* Virtual Tour & Popular Spots Carousel */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </span>
                    Sanal Kampüs Turu & Popüler Noktalar
                  </h3>
                  
                  {/* Active Carousel Stage - 16:9 Aspect Ratio Enforced */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden group bg-gray-900 shadow-xl mb-4">
                      <img 
                          key={currentImageIndex} // Key ensures animation on change
                          src={galleryItems[currentImageIndex].image} 
                          alt={galleryItems[currentImageIndex].name}
                          className="w-full h-full object-cover transition-opacity duration-500 animate-fade-in saturate-[1.1] contrast-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20"></div>
                      
                      {/* Nav Buttons */}
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                      >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100"
                      >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                      </button>

                      {/* Info & Actions Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                          <div>
                              <span className="text-indigo-300 font-bold text-xs uppercase tracking-wider mb-1 block">Şu An Geziyorsunuz</span>
                              <h4 className="text-white text-2xl font-bold leading-tight">{galleryItems[currentImageIndex].name}</h4>
                          </div>
                          
                          <div className="flex gap-3">
                             <a 
                                href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(rec.university + ' ' + galleryItems[currentImageIndex].name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-md transition border border-white/20"
                             >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Fotoğraflar
                             </a>
                             <a 
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(rec.university + ' ' + galleryItems[currentImageIndex].name + ' tour')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center text-xs font-bold bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg backdrop-blur-md transition shadow-lg"
                             >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Video Tur
                             </a>
                          </div>
                      </div>
                  </div>
                  
                  {/* Thumbnails Strip - Adjusted Size to Match 16:9 Aspect */}
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
                      {galleryItems.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`flex-shrink-0 w-32 h-18 rounded-lg overflow-hidden border-2 transition-all duration-300 relative snap-start ${
                                idx === currentImageIndex 
                                ? 'border-indigo-600 shadow-md ring-2 ring-indigo-100 scale-105 opacity-100' 
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                            style={{ aspectRatio: '16/9' }}
                          >
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </button>
                      ))}
                  </div>

              </div>
            </div>
          )}

          {/* ... Finance, Careers, Reviews tabs remain unchanged ... */}
          {activeTab === 'finance' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                   <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                   </span>
                   Kabul Şartları ve Puanlar
                </h3>
                
                {scoreRequirements.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {scoreRequirements.map((req, i) => {
                      const [key, val] = req.split(':');
                      return (
                        <div key={i} className="flex items-center p-4 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition">
                          <div className="bg-white p-2.5 rounded-lg mr-4 text-blue-600 shadow-sm border border-blue-50">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-blue-900 uppercase tracking-wide">{key}</p>
                            <p className="text-lg font-bold text-gray-900">{val || ''}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {generalRequirements.length > 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Genel Gereklilikler</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generalRequirements.map((req, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span className="text-gray-700 font-medium">
                                {renderRequirementWithHighlight(req)}
                            </span>
                          </li>
                        ))}
                      </ul>
                  </div>
                ) : scoreRequirements.length === 0 && (
                  <p className="text-gray-500 italic">Kabul şartları detaylandırılmamış.</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 sm:p-8 rounded-2xl border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center">
                   <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600 mr-3 shadow-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
                   </span>
                   Burs ve Finansal Destek
                </h3>
                {rec.scholarships && rec.scholarships.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rec.scholarships.map((sch, i) => (
                      <li key={i} className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-indigo-50/50">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0"></span>
                        <span className="text-indigo-900 font-medium">{sch}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-indigo-600/70 italic">Burs bilgisi bulunamadı.</p>
                )}
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-gray-100 rounded-lg text-gray-600 mr-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Maliyet Özeti</h3>
                        <p className="text-gray-500">Yıllık tahmini giderler</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gray-50 rounded-2xl flex flex-col justify-center items-center text-center border border-gray-100">
                        <span className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Eğitim Ücreti</span>
                        <span className="text-2xl font-extrabold text-gray-900">{rec.tuition || 'Belirtilmemiş'}</span>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-2xl flex flex-col justify-center items-center text-center border border-gray-100">
                        <span className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Kazanma İhtimali</span>
                        <span className={`text-2xl font-extrabold ${rec.probability.includes('Yüksek') ? 'text-green-600' : 'text-yellow-600'}`}>{rec.probability}</span>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'careers' && (
             <div className="space-y-8 animate-fade-in">
                {rec.careerStats && rec.careerStats.length > 0 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                            </span>
                            Kariyer Fırsat Matrisi
                        </h3>
                    </div>

                    <div className="relative w-full h-[450px] bg-gray-50 rounded-2xl border border-gray-200 p-6 select-none overflow-hidden group/chart cursor-crosshair">
                       {/* Quadrants Background */}
                       <div className="absolute inset-10 grid grid-cols-2 grid-rows-2 opacity-10 pointer-events-none">
                          <div className="bg-red-300 border-r border-b border-gray-400 flex items-start justify-start p-2"><span className="text-[10px] font-bold text-gray-700">Düşük Maaş / Yüksek Talep</span></div> 
                          <div className="bg-green-300 border-b border-gray-400 flex items-start justify-end p-2"><span className="text-[10px] font-bold text-green-900">Yüksek Maaş / Yüksek Talep</span></div> 
                          <div className="bg-gray-300 border-r border-gray-400 flex items-end justify-start p-2"><span className="text-[10px] font-bold text-gray-700">Düşük Maaş / Düşük Talep</span></div> 
                          <div className="bg-yellow-300 flex items-end justify-end p-2"><span className="text-[10px] font-bold text-gray-700">Yüksek Maaş / Düşük Talep</span></div> 
                       </div>
                       
                       {/* Axis Lines */}
                       <div className="absolute left-10 bottom-10 right-10 h-px bg-gray-300 z-0"></div>
                       <div className="absolute left-10 bottom-10 top-10 w-px bg-gray-300 z-0"></div>
                       
                       {/* Axis Labels */}
                       <div className="absolute bottom-2 right-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Ortalama Maaş (Artar →)</div>
                       <div className="absolute top-4 left-1 text-xs font-bold text-gray-500 uppercase tracking-widest [writing-mode:vertical-rl] rotate-180">İş Piyasası Talebi (Artar →)</div>

                       {/* Opportunity Zone Badge */}
                       <div className="absolute top-12 right-12 text-xs text-emerald-600 font-extrabold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 shadow-sm z-10 flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                          Yıldız Fırsat Bölgesi
                       </div>

                       {/* Bubbles */}
                       {(() => {
                          const dataPoints = rec.careerStats!.map(stat => ({
                             ...stat,
                             salaryVal: getSalaryValue(stat.salary),
                             demandVal: stat.demandScore || 50,
                             growthVal: getGrowthValue(stat.growth)
                          }));
                          const maxSal = Math.max(...dataPoints.map(d => d.salaryVal)) || 10000;
                          const minSal = Math.min(...dataPoints.map(d => d.salaryVal)) || 0;
                          // Avoid division by zero if all salaries are same
                          const salaryRange = (maxSal - minSal) || maxSal || 1; 

                          return dataPoints.map((stat, i) => {
                             // Coordinates (10% padding from edges)
                             // Use Math.max(0) to prevent negative values if parsing fails oddly
                             const normalizedSal = Math.max(0, stat.salaryVal - minSal);
                             const leftPct = 10 + (normalizedSal / salaryRange) * 80;
                             
                             // Clamp demand 0-100
                             const clampedDemand = Math.min(100, Math.max(0, stat.demandVal));
                             const bottomPct = 10 + (clampedDemand / 100) * 80;
                             
                             // Visuals
                             const colorClass = getGrowthColor(stat.growth);
                             // Size based on growth: 1=28px, 2=40px, 3=56px
                             const size = stat.growthVal === 3 ? 56 : stat.growthVal === 2 ? 40 : 28;
                             const sizePx = `${size}px`;

                             return (
                                <div 
                                    key={i}
                                    className={`absolute rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-300 hover:z-30 hover:scale-125 hover:shadow-2xl group/bubble flex items-center justify-center ${colorClass} ${stat.growthVal === 3 ? 'animate-pulse' : ''}`}
                                    style={{
                                        left: `${leftPct}%`,
                                        bottom: `${bottomPct}%`,
                                        width: sizePx,
                                        height: sizePx,
                                        transform: 'translate(-50%, 50%)'
                                    }}
                                    onMouseEnter={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        // Use page coordinates for better positioning if scrolling
                                        setTooltipPos({ x: rect.left, y: rect.top });
                                        setHoveredCareer(stat);
                                    }}
                                    onMouseLeave={() => setHoveredCareer(null)}
                                >
                                   {/* Initials */}
                                   <span className="text-[10px] font-bold text-white opacity-80 uppercase select-none">
                                     {stat.title.substring(0, 2)}
                                   </span>
                                </div>
                             );
                          });
                       })()}

                       {hoveredCareer && (
                          <div 
                            className="fixed bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-[100] pointer-events-none text-xs w-64 animate-fade-in border border-white/10"
                            style={{ 
                                left: Math.min(window.innerWidth - 270, Math.max(10, tooltipPos.x - 100)), // Smart X positioning
                                top: Math.max(10, tooltipPos.y - 140) // Smart Y positioning (above bubble)
                            }}
                          >
                             <p className="font-bold text-base mb-3 text-white border-b border-white/10 pb-2">{hoveredCareer.title}</p>
                             <div className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                   <span className="text-gray-400">Ort. Maaş</span>
                                   <span className="font-mono font-bold text-sm text-green-300 bg-green-900/30 px-2 py-0.5 rounded">{hoveredCareer.salary}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-gray-400">Piyasa Talebi</span>
                                   <div className="flex items-center gap-2">
                                       <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                           <div className={`h-full rounded-full ${hoveredCareer.demandScore > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${hoveredCareer.demandScore}%`}}></div>
                                       </div>
                                       <span className="font-bold text-white">
                                          %{hoveredCareer.demandScore}
                                       </span>
                                   </div>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                   <span className="text-gray-400">Büyüme Hızı</span>
                                   <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wide ${
                                       getGrowthValue(hoveredCareer.growth) === 3 ? 'bg-emerald-500 text-white' :
                                       getGrowthValue(hoveredCareer.growth) === 2 ? 'bg-amber-500 text-white' :
                                       'bg-gray-600 text-gray-200'
                                   }`}>
                                       {hoveredCareer.growth}
                                   </span>
                                </div>
                             </div>
                             {/* Arrow */}
                             <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900 rotate-45 border-r border-b border-white/10"></div>
                          </div>
                       )}
                    </div>
                    
                    {/* NEW: Chart Explanation Box */}
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mt-4 text-sm text-blue-900/80">
                        <h4 className="font-bold mb-3 flex items-center text-blue-800">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Grafik Okuma Rehberi
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                            <li className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                <span><strong className="text-blue-900">Yatay Eksen (X):</strong> Ortalama Maaş seviyesini gösterir. Sağa gittikçe maaş beklentisi artar.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                <span><strong className="text-blue-900">Dikey Eksen (Y):</strong> İş piyasasındaki talebi gösterir. Yukarı çıktıkça iş bulma kolaylığı artar.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                <span><strong className="text-blue-900">Daire Büyüklüğü:</strong> Sektörün büyüme hızını temsil eder. Büyük daireler geleceğin meslekleridir.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                <span><strong className="text-blue-900">Fırsat Bölgesi:</strong> Sol üst ve sağ üst köşeler (Yüksek Talep) en güvenli kariyer alanlarıdır.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm font-medium text-gray-500">
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-200"></span> Yüksek Büyüme (Büyük)</div>
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-amber-400 mr-2 shadow-sm shadow-amber-200"></span> Orta/Stabil</div>
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-gray-400 mr-2 shadow-sm shadow-gray-200"></span> Düşük/Belirsiz</div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8 rounded-2xl border border-blue-100">
                    <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       Gelecek Vizyonu
                    </h3>
                    <p className="text-blue-800 leading-relaxed font-medium">
                       {rec.jobMarketOutlook || "Sektör analizi yükleniyor..."}
                    </p>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                       <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wide">Genel Maaş Beklentisi</h3>
                       <p className="text-2xl sm:text-3xl font-extrabold text-green-600 mt-2">
                          {rec.averageSalary || "Değişken"}
                       </p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-full">
                       <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>

                {rec.careerStats && rec.careerStats.length > 0 && (
                  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                            </span>
                            Detaylı Veriler ve Sıralama
                        </h3>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                           <button onClick={() => setCareerSort('salary')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${careerSort === 'salary' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Maaşa Göre</button>
                           <button onClick={() => setCareerSort('demand')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${careerSort === 'demand' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Talebe Göre</button>
                           <button onClick={() => setCareerSort('growth')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${careerSort === 'growth' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Büyümeye Göre</button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedCareerStats.map((stat, idx) => (
                           <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group">
                               <div className="flex justify-between items-start mb-4">
                                   <h4 className="font-bold text-gray-800 text-sm line-clamp-2 pr-2 leading-tight" title={stat.title}>{stat.title}</h4>
                                   <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                                      stat.growth.toLowerCase().includes('yüksek') ? 'bg-green-50 text-green-700 border-green-100' :
                                      stat.growth.toLowerCase().includes('orta') ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                      'bg-gray-50 text-gray-600 border-gray-100'
                                   }`}>
                                      {stat.growth}
                                   </span>
                               </div>
                               <div className="space-y-4">
                                  <div>
                                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Ortalama Maaş</span>
                                     <p className="text-lg font-bold text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded w-fit">{stat.salary}</p>
                                  </div>
                                  <div>
                                      <div className="flex justify-between text-[10px] mb-1.5">
                                          <span className="text-gray-400 font-bold uppercase">Talep Skoru</span>
                                          <span className="font-bold text-indigo-600">%{stat.demandScore}</span>
                                      </div>
                                      <div className="w-full bg-gray-100 rounded-full h-2">
                                          <div 
                                            className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 group-hover:bg-indigo-600" 
                                            style={{ width: `${stat.demandScore}%` }}
                                          ></div>
                                      </div>
                                  </div>
                               </div>
                           </div>
                        ))}
                    </div>
                </div>
                )}
             </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                  </span>
                  Öğrenci Yorumları
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                   {isLoadingReviews ? 'Yükleniyor...' : 'Google Onaylı'}
                </span>
              </div>
              
              {reviewError && (
                 <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center animate-fade-in shadow-sm">
                     <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                         <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                     </div>
                     <div>
                         <h4 className="font-bold text-red-800 text-lg">Yüklenemedi</h4>
                         <p className="text-red-600 font-medium">{reviewError}</p>
                     </div>
                 </div>
              )}

              {isLoadingReviews && !reviewError && (
                <div className="grid gap-6 animate-pulse">
                   <div className="bg-gray-200 h-32 rounded-2xl"></div>
                   <div className="bg-gray-200 h-32 rounded-2xl"></div>
                   <div className="bg-gray-200 h-32 rounded-2xl"></div>
                </div>
              )}

              {!isLoadingReviews && !reviewError && realReviewsData && realReviewsData.reviews && realReviewsData.reviews.length > 0 && (
                 <div className="grid gap-6">
                  {realReviewsData.reviews.map((review, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex items-start mb-4">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                            {review.author ? review.author.charAt(0).toUpperCase() : 'A'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                             <h4 className="font-bold text-gray-900 text-base">{review.author || 'Anonim'}</h4>
                             {renderStars(review.rating)}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Öğrenci / Mezun</p>
                        </div>
                      </div>
                      <div className="relative pl-4 border-l-4 border-indigo-100">
                          <p className="text-gray-700 text-base leading-relaxed italic">
                            "{review.comment}"
                          </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoadingReviews && !reviewError && (!realReviewsData || !realReviewsData.reviews || realReviewsData.reviews.length === 0) && (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                  </div>
                  <h4 className="text-gray-900 font-bold mb-1">Henüz Yorum Yok</h4>
                  <p className="text-gray-500">Google üzerinde bu üniversite için güncel yorum bulunamadı.</p>
                </div>
              )}
              
               {!isLoadingReviews && !reviewError && realReviewsData && realReviewsData.sourceUrls && realReviewsData.sourceUrls.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Doğrulama Kaynakları (Google Search)</h5>
                    <div className="flex flex-wrap gap-3">
                        {realReviewsData.sourceUrls.slice(0, 4).map((url, uIdx) => {
                             let hostname = 'Website';
                             try { hostname = new URL(url).hostname.replace('www.', ''); } catch(e){}
                             return (
                                <a key={uIdx} href={url} target="_blank" rel="noreferrer" className="flex items-center text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm hover:shadow">
                                    <svg className="w-3.5 h-3.5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                    {hostname}
                                </a>
                             )
                        })}
                    </div>
                  </div>
               )}

            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetailModal;
