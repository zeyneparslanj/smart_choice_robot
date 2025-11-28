
import React, { useState, useMemo } from 'react';
import { UserPreferences, AiResponse, Recommendation } from './types';
import { DEPARTMENT_TYPES, QUOTA_OPTIONS } from './constants';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import FeedbackSection from './components/FeedbackSection';
import PaymentModal from './components/PaymentModal';
import UniversityReviewsPage from './components/UniversityReviewsPage';
import UniversityExplorerPage from './components/UniversityExplorerPage';
import KpssPage from './components/KpssPage';
import FeatureHighlights from './components/FeatureHighlights';
import ComparisonModal from './components/ComparisonModal';
import { getRecommendations } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'reviews' | 'universities' | 'kpss'>('home');

  const [preferences, setPreferences] = useState<UserPreferences>({
    score: '',
    ranking: '',
    interests: '',
    city: '',
    preferredDepartments: '',
    specificUniversity: '', // Initialized
    departmentType: DEPARTMENT_TYPES[0],
    targetRegion: 'TR',
    programTypes: [],
    includeNewlyOpened: false,
    includeUnfilled: false,
    quotaType: QUOTA_OPTIONS[0]
  });

  const [result, setResult] = useState<AiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // TEST MODU: Ödeme sistemini geçici olarak devre dışı bırakmak için 'true' yapıldı.
  // Gerçek ödeme akışını test etmek için burayı 'false' yapabilirsiniz.
  const [isPaid, setIsPaid] = useState(true); 
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [comparisonList, setComparisonList] = useState<Recommendation[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const [sortOption, setSortOption] = useState<string>('probability');

  const handleStartAnalysis = () => {
    // Ödeme kontrolü: isPaid true olduğu sürece direkt analize geçer
    if (!isPaid) {
      setShowPaymentModal(true);
    } else {
      fetchRecommendations();
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setIsPaid(true);
    fetchRecommendations();
  };

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setComparisonList([]); 

    try {
      const data = await getRecommendations(preferences);
      setResult(data);
    } catch (err) {
      setError("Bir hata oluştu. Lütfen API anahtarınızı kontrol edin veya daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompare = (rec: Recommendation) => {
    setComparisonList(prev => {
      const exists = prev.find(p => p.university === rec.university);
      if (exists) {
        return prev.filter(p => p.university !== rec.university);
      } else {
        if (prev.length >= 3) return prev; 
        return [...prev, rec];
      }
    });
  };

  const removeFromComparison = (universityName: string) => {
      setComparisonList(prev => prev.filter(p => p.university !== universityName));
  };

  const sortedRecommendations = useMemo(() => {
    if (!result?.recommendations) return [];

    const list = [...result.recommendations];

    switch (sortOption) {
        case 'global-tr':
            return list.sort((a, b) => {
                if (a.locationType === 'Yurt Dışı' && b.locationType !== 'Yurt Dışı') return -1;
                if (a.locationType !== 'Yurt Dışı' && b.locationType === 'Yurt Dışı') return 1;
                return 0;
            });
        case 'tr-global':
            return list.sort((a, b) => {
                if (a.locationType === 'Yurt İçi' && b.locationType !== 'Yurt İçi') return -1;
                if (a.locationType !== 'Yurt İçi' && b.locationType === 'Yurt İçi') return 1;
                return 0;
            });
        case 'probability':
             const probMap: Record<string, number> = { 'çok yüksek': 4, 'yüksek': 3, 'orta': 2, 'düşük': 1 };
             return list.sort((a, b) => (probMap[b.probability.toLowerCase()] || 0) - (probMap[a.probability.toLowerCase()] || 0));
        case 'probability-asc':
             const probMapAsc: Record<string, number> = { 'çok yüksek': 4, 'yüksek': 3, 'orta': 2, 'düşük': 1 };
             return list.sort((a, b) => (probMapAsc[a.probability.toLowerCase()] || 0) - (probMapAsc[b.probability.toLowerCase()] || 0));
        case 'score-desc':
             const getScore = (s?: string) => parseFloat(s?.replace(/[^0-9.]/g, '') || '0');
             return list.sort((a, b) => getScore(b.minScore) - getScore(a.minScore));
        default:
            return list;
    }
  }, [result, sortOption]);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {showPaymentModal && (
        <PaymentModal onSuccess={handlePaymentSuccess} onCancel={() => setShowPaymentModal(false)} />
      )}

      {showComparisonModal && (
          <ComparisonModal universities={comparisonList} onClose={() => setShowComparisonModal(false)} onRemove={removeFromComparison} />
      )}

      {/* Floating Comparison Bar */}
      {comparisonList.length > 0 && currentView === 'home' && !showComparisonModal && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in w-full max-w-md px-4">
           <div className="bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl p-4 flex justify-between items-center border border-white/10 ring-1 ring-white/10">
               <div className="flex items-center">
                   <div className="bg-indigo-600 rounded-xl p-2.5 mr-3 shadow-lg shadow-indigo-500/30">
                       <span className="font-bold text-lg leading-none">{comparisonList.length}</span>
                   </div>
                   <div className="flex flex-col">
                       <span className="text-sm font-bold text-gray-100">Karşılaştırma Listesi</span>
                       <span className="text-[10px] font-medium text-gray-400 tracking-wide uppercase">{3 - comparisonList.length} seçim hakkı kaldı</span>
                   </div>
               </div>
               <div className="flex gap-2">
                   {comparisonList.length >= 2 ? (
                        <button onClick={() => setShowComparisonModal(true)} className="bg-white text-indigo-900 text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg transition transform hover:-translate-y-0.5 hover:bg-gray-50">
                            Karşılaştır
                        </button>
                   ) : (
                       <span className="text-xs text-gray-500 bg-gray-800 px-3 py-2 rounded-lg font-medium border border-gray-700">En az 2 seç</span>
                   )}
                   <button onClick={() => setComparisonList([])} className="p-2.5 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-gray-400 transition">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                   </button>
               </div>
           </div>
        </div>
      )}

      {/* Modern Glass Header */}
      <header className="sticky top-0 z-40 w-full transition-all duration-300 border-b border-white/50 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentView('home')}>
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 blur opacity-40 group-hover:opacity-60 transition duration-300 rounded-xl"></div>
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-2.5 rounded-xl shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
            </div>
            <div className="flex flex-col">
                 <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">Global Tercih<span className="text-indigo-600">.</span></h1>
                 <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">AI Powered</span>
                     {isPaid && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                 </div>
            </div>
          </div>

          <nav className="hidden md:flex bg-gray-100/50 p-1.5 rounded-2xl border border-white/50 backdrop-blur-sm">
             <button onClick={() => setCurrentView('home')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'home' ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}>
               Üniversite Tercih Robotu
             </button>
             <button onClick={() => setCurrentView('kpss')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'kpss' ? 'bg-white text-red-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}>
               KPSS Robotu
             </button>
             <button onClick={() => setCurrentView('reviews')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'reviews' ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}>
               Üniversite Yorumları
             </button>
             <button onClick={() => setCurrentView('universities')} className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${currentView === 'universities' ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}>
               Üniversiteleri Keşfet
             </button>
          </nav>

          <div className="flex items-center gap-4">
             {!isPaid && (
                <button onClick={() => setShowPaymentModal(true)} className="hidden sm:flex group relative px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <span className="relative flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        Premium'a Geç
                    </span>
                </button>
            )}
             {isPaid && (
                <div className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-bold">Premium Aktif</span>
                </div>
            )}
            <div className="md:hidden">
               <button onClick={() => setCurrentView(currentView === 'home' ? 'reviews' : 'home')} className="p-2 text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {currentView === 'home' && (
            <>
                <div className="text-center mb-12 animate-fade-in pt-6">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest mb-4 shadow-sm">
                        Yapay Zeka Destekli Üniversite Danışmanı
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">Geleceğini</span> Tasarla.
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
                        Puanlarını gir, hayallerini paylaş. Yapay zeka senin için en iyi üniversite ve bölüm eşleşmelerini analiz etsin.
                    </p>
                </div>

                <FeatureHighlights />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-12">
                    <div className="lg:col-span-4 sticky top-24">
                        <InputForm preferences={preferences} setPreferences={setPreferences} onSubmit={handleStartAnalysis} isLoading={isLoading} />
                    </div>

                    <div className="lg:col-span-8">
                        {error && (
                            <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-2xl flex items-center shadow-sm">
                                <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <p className="text-sm font-bold text-red-800">{error}</p>
                            </div>
                        )}

                        {!result && !isLoading && !error && (
                            <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-dashed border-gray-300 p-12 text-center relative overflow-hidden group hover:border-indigo-300 transition-all duration-500">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>
                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition duration-500 text-indigo-500">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Analiz Bekleniyor</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mb-8">Sol taraftaki formu doldurarak yapay zeka destekli detaylı raporunuzu hemen oluşturun.</p>
                                    {!isPaid && (
                                        <button onClick={() => setShowPaymentModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all">
                                            <span>✨ Analizi Başlat</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-8 animate-fade-in pb-24 lg:pb-0">
                                <div className="bg-gradient-to-br from-white to-indigo-50 border border-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                            </span>
                                            Yapay Zeka Danışmanı Diyor ki:
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed text-lg font-medium">{result.advice}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-200 gap-4">
                                    <div className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        {sortedRecommendations.length} Sonuç Bulundu
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sırala:</span>
                                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none font-bold cursor-pointer hover:bg-white transition">
                                            <option value="probability">İhtimal: En Yüksek</option>
                                            <option value="probability-asc">İhtimal: En Düşük</option>
                                            <option value="score-desc">Taban Puan: En Yüksek</option>
                                            <option value="global-tr">Önce Yurt Dışı</option>
                                            <option value="tr-global">Önce Türkiye</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {sortedRecommendations.map((rec, index) => (
                                        <ResultCard 
                                            key={`${rec.university}-${index}`} 
                                            rec={rec} 
                                            index={index} 
                                            isSelected={comparisonList.some(c => c.university === rec.university)}
                                            onToggleCompare={toggleCompare}
                                            disableSelection={comparisonList.length >= 3}
                                        />
                                    ))}
                                </div>
                                <FeedbackSection />
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}

        {currentView === 'reviews' && (
            <UniversityReviewsPage />
        )}

        {currentView === 'universities' && (
            <UniversityExplorerPage />
        )}

        {currentView === 'kpss' && (
            <KpssPage />
        )}

      </main>

      <footer className="bg-white border-t border-gray-200 py-12 mt-12 relative z-10">
        <div className="container mx-auto px-4 text-center">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">Global Tercih Robotu<span className="text-indigo-600">.</span></h3>
            <p className="text-gray-500 text-sm font-medium">&copy; {new Date().getFullYear()} Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
