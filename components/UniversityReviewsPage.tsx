
import React, { useState, useRef } from 'react';
import { getUniversityReviews } from '../services/geminiService';
import { UniversityReviewData } from '../types';
import { ALL_UNIVERSITIES } from '../constants';

const UniversityReviewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [universities, setUniversities] = useState<UniversityReviewData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [newReview, setNewReview] = useState({ universityName: '', author: '', rating: 5, comment: '' });

  // Popular universities for quick access
  const POPULAR_SEARCHES = [
    "Boğaziçi Üniversitesi",
    "Orta Doğu Teknik Üniversitesi (ODTÜ)",
    "İstanbul Teknik Üniversitesi (İTÜ)",
    "Koç Üniversitesi",
    "Bilkent Üniversitesi",
    "Galatasaray Üniversitesi"
  ];

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    
    setSearchTerm(term); 
    setIsSearching(true);
    setUniversities([]); 
    setError(null);
    
    try {
        const result = await getUniversityReviews(term);
        if (result && result.name) {
          setUniversities([result]);
        }
    } catch (err: any) {
      console.error("Search failed", err);
      setError(err.message || "Arama sırasında bir hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const handleReset = () => {
     setSearchTerm('');
     setUniversities([]);
     setIsSearching(false);
     setError(null);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.universityName.trim()) return;
    
    setUniversities(prev => {
      const updated = [...prev];
      const index = updated.findIndex(u => u.name.toLowerCase() === newReview.universityName.toLowerCase());
      
      const reviewObj = {
        author: newReview.author || 'Anonim',
        rating: Number(newReview.rating),
        comment: newReview.comment
      };

      if (index > -1) {
        updated[index].reviews.unshift(reviewObj);
        const total = updated[index].reviews.reduce((acc, curr) => acc + curr.rating, 0);
        updated[index].rating = parseFloat((total / updated[index].reviews.length).toFixed(1));
      } else {
        updated.unshift({
          name: newReview.universityName,
          description: "",
          website: "", 
          rating: Number(newReview.rating),
          reviews: [reviewObj],
          sourceUrls: [] 
        });
      }
      return updated;
    });

    setShowModal(false);
    setNewReview({ universityName: '', author: '', rating: 5, comment: '' });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const getSafeUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Üniversite Yorumları</h2>
          <p className="text-gray-600 mt-1">
             Google üzerindeki gerçek öğrenci yorumlarını ve puanlarını keşfedin.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform transition hover:-translate-y-1 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          Yorum Yap
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 flex gap-2">
        <form onSubmit={handleSearch} className="relative flex-1">
            <input 
            list="search_universities_dl"
            type="text" 
            placeholder="Üniversite adını yazın ve arayın..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 pr-32 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-medium"
            autoComplete="off"
            />
            
            <datalist id="search_universities_dl">
                {ALL_UNIVERSITIES.map((uni, index) => (
                    <option key={index} value={uni} />
                ))}
            </datalist>

            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <button 
            type="submit"
            disabled={isSearching || !searchTerm.trim()}
            className={`absolute right-2 top-2 bottom-2 px-6 rounded-lg font-bold transition flex items-center ${
                isSearching || !searchTerm.trim() 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
            >
            {isSearching ? (
                <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Aranıyor...
                </>
            ) : 'Google\'da Ara'}
            </button>
        </form>
        {/* Reset button only shows if we have results */}
        {(universities.length > 0 && !isSearching) && (
            <button 
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition whitespace-nowrap border border-gray-200"
                type="button"
            >
                Temizle
            </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
         <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center animate-fade-in shadow-sm">
             <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                 <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             </div>
             <div>
                 <h4 className="font-bold text-red-800">İşlem Başarısız</h4>
                 <p className="text-sm text-red-600 font-medium">{error}</p>
             </div>
         </div>
      )}

      {/* Popular Suggestions (Visible when no search active and no results) */}
      {!isSearching && universities.length === 0 && !error && (
          <div className="mb-12 animate-fade-in">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Popüler Aramalar</h4>
              <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((uni, idx) => (
                      <button
                        key={idx}
                        onClick={() => performSearch(uni)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition shadow-sm"
                      >
                          {uni}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Loading Skeleton */}
      {isSearching && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl h-64 border border-gray-200 p-6 flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-8 bg-gray-300 rounded w-12"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ))}
         </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-8">
        {!isSearching && universities.map((uni, idx) => (
          <div key={`${uni.name}-${idx}`} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:border-indigo-200 transition-all duration-300">
            
            {/* Header */}
            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                     <div className="flex flex-col gap-1 mb-1">
                        <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">{uni.name}</h3>
                        {uni.sourceUrls && uni.sourceUrls.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wide w-fit">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Google'dan Güncel
                            </span>
                        )}
                     </div>
                     {uni.website && (
                         <a href={getSafeUrl(uni.website)} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center mt-1">
                            Resmi Web Sitesi
                            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                         </a>
                     )}
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center text-yellow-400">
                        <span className="text-3xl font-black text-gray-900 mr-2">{uni.rating || '-'}</span>
                        {renderStars(uni.rating || 0)}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ortalama Puan</span>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uni.reviews && uni.reviews.length > 0 ? (
                    uni.reviews.slice(0, 6).map((review, rIdx) => (
                    <div key={rIdx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-gray-800 text-sm">{review.author || 'Anonim'}</h4>
                            <div className="flex items-center text-xs font-bold text-yellow-500">
                                {review.rating} <svg className="w-3 h-3 ml-0.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm italic leading-relaxed">"{review.comment}"</p>
                    </div>
                    ))
                ) : (
                    <div className="col-span-2 text-center py-4">
                         <p className="text-gray-400 italic text-sm">
                             Yorum metni bulunamadı. Genel puanlamayı dikkate alınız.
                         </p>
                    </div>
                )}
                </div>

                {/* Sources Footer */}
                <div className="mt-8 pt-4 border-t border-gray-100">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Kaynaklar:</h5>
                    <div className="flex flex-wrap gap-2">
                        {uni.sourceUrls && uni.sourceUrls.slice(0, 3).map((url, uIdx) => {
                             let hostname = 'Website';
                             try { hostname = new URL(url).hostname.replace('www.', ''); } catch(e){}
                             return (
                                <a key={uIdx} href={url} target="_blank" rel="noreferrer" className="flex items-center text-[10px] bg-blue-50 border border-blue-100 rounded px-3 py-1 text-blue-600 hover:text-blue-800 hover:border-blue-300 transition font-medium">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                    {hostname}
                                </a>
                             )
                        })}
                        {(!uni.sourceUrls || uni.sourceUrls.length === 0) && <span className="text-[10px] text-gray-400">Kaynak linki bulunamadı.</span>}
                    </div>
                </div>
            </div>

          </div>
        ))}
        
        {universities.length === 0 && !isSearching && !error && (
            <div className="col-span-1 md:col-span-2 text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Bir Üniversite Arayın</h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                    Yukarıdaki arama çubuğunu kullanarak veya popüler seçeneklerden birine tıklayarak öğrenci yorumlarına ulaşabilirsiniz.
                </p>
            </div>
        )}
      </div>

      {/* Add Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 animate-fade-in p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Yorum Bırak</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Üniversite Adı</label>
                <div className="relative">
                    <input 
                      required
                      list="all_universities_dl_modal"
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Listeden seçin veya yazın..."
                      value={newReview.universityName}
                      onChange={e => setNewReview({...newReview, universityName: e.target.value})}
                    />
                    <datalist id="all_universities_dl_modal">
                        {ALL_UNIVERSITIES.map((uni, index) => (
                            <option key={index} value={uni} />
                        ))}
                    </datalist>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                    *Dünya genelindeki tüm üniversiteler için giriş yapabilirsiniz.
                </p>
              </div>
              
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Adın (İsteğe bağlı)</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Anonim"
                      value={newReview.author}
                      onChange={e => setNewReview({...newReview, author: e.target.value})}
                    />
                 </div>
                 <div className="w-24">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Puan</label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newReview.rating}
                      onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})}
                    >
                        <option value="5">5 - Mükemmel</option>
                        <option value="4">4 - İyi</option>
                        <option value="3">3 - Orta</option>
                        <option value="2">2 - Kötü</option>
                        <option value="1">1 - Berbat</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Yorumun</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Kampüs, eğitim, sosyal hayat..."
                  value={newReview.comment}
                  onChange={e => setNewReview({...newReview, comment: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md"
                >
                  Yorumu Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityReviewsPage;
