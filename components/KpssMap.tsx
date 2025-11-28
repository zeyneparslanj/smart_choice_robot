

import React, { useState, useMemo } from 'react';
import { REAL_KPSS_DATA, TURKEY_CITIES } from '../constants';

interface KpssMapProps {
  userScore: number;
}

const KpssMap: React.FC<KpssMapProps> = ({ userScore: initialScore }) => {
  const [score, setScore] = useState<number>(initialScore || 80);
  const [selectedJob, setSelectedJob] = useState<string>(Object.keys(REAL_KPSS_DATA)[0]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterMode, setFilterMode] = useState<'all' | 'safe' | 'risky'>('all');

  // Process Data
  const cityStatusList = useMemo(() => {
    const jobData = REAL_KPSS_DATA[selectedJob] || [];
    
    return TURKEY_CITIES.map(city => {
      const data = jobData.find(d => d.plate === city.id);
      const minScore = data ? data.minScore : 0;
      const quota = data ? data.quota : 0;
      
      let status: 'safe' | 'risky' | 'impossible' | 'no-data' = 'no-data';
      let diff = 0;

      if (minScore > 0) {
        diff = score - minScore;
        if (diff >= 0) status = 'safe';
        else if (diff >= -2.0) status = 'risky';
        else status = 'impossible';
      }

      return {
        ...city,
        minScore,
        quota,
        diff,
        status
      };
    });
  }, [score, selectedJob]);

  // Filtering
  const filteredList = cityStatusList.filter(c => {
      if (filterMode === 'safe') return c.status === 'safe';
      if (filterMode === 'risky') return c.status === 'risky';
      return true;
  });

  // Stats
  const stats = {
      safe: cityStatusList.filter(c => c.status === 'safe').length,
      risky: cityStatusList.filter(c => c.status === 'risky').length,
      avgScore: (cityStatusList.filter(c => c.minScore > 0).reduce((acc, c) => acc + c.minScore, 0) / cityStatusList.filter(c => c.minScore > 0).length).toFixed(1)
  };

  const getStatusColor = (status: string, bg = true) => {
      switch(status) {
          case 'safe': return bg ? 'bg-emerald-500' : 'text-emerald-600';
          case 'risky': return bg ? 'bg-amber-400' : 'text-amber-600';
          case 'impossible': return bg ? 'bg-rose-500' : 'text-rose-600';
          default: return bg ? 'bg-gray-200' : 'text-gray-400';
      }
  };

  // Group job options
  const jobOptions = useMemo(() => {
      const allJobs = Object.keys(REAL_KPSS_DATA);
      // Simple grouping by keywords
      const groups: Record<string, string[]> = {
          'Sağlık': allJobs.filter(j => ['Hemşire', 'Ebe', 'Fizyo', 'Diyet', 'Psik', 'Laborant', 'Att', 'Para', 'Tıbbi'].some(k => j.includes(k))),
          'Mühendislik & Teknik': allJobs.filter(j => ['Mühendis', 'Mimar', 'Şehir', 'Programcı', 'Teknisyen'].some(k => j.includes(k))),
          'Eğitim & Öğretmenlik': allJobs.filter(j => ['Öğretmen', 'Rehberlik'].some(k => j.includes(k))),
          'Büro & İdare': allJobs.filter(j => ['VHKİ', 'Büro', 'Memur', 'KYK'].some(k => j.includes(k))),
          'Adalet & Güvenlik': allJobs.filter(j => ['Avukat', 'İnfaz', 'Zabıt', 'Mübaşir'].some(k => j.includes(k))),
          'Diğer': allJobs.filter(j => !['Hemşire', 'Ebe', 'Fizyo', 'Diyet', 'Psik', 'Laborant', 'Att', 'Para', 'Tıbbi', 'Mühendis', 'Mimar', 'Şehir', 'Programcı', 'Teknisyen', 'Öğretmen', 'Rehberlik', 'VHKİ', 'Büro', 'Memur', 'KYK', 'Avukat', 'İnfaz', 'Zabıt', 'Mübaşir'].some(k => j.includes(k)))
      };
      return groups;
  }, []);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
         <div>
             <h3 className="text-2xl font-extrabold text-gray-900 flex items-center">
                 <span className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                 </span>
                 Akıllı Atama Paneli
             </h3>
             <p className="text-sm font-medium text-gray-500 mt-1 ml-14">Türkiye geneli atama taban puanlarını ve şansınızı analiz edin.</p>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto bg-gray-50 p-2 rounded-2xl border border-gray-100">
             <div className="relative">
                 <select 
                    value={selectedJob} 
                    onChange={e => setSelectedJob(e.target.value)}
                    className="w-full sm:w-64 bg-white border border-gray-200 text-sm font-bold text-gray-900 py-3 px-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer"
                 >
                     {Object.entries(jobOptions).map(([group, jobs]) => (
                         jobs.length > 0 && (
                             <optgroup key={group} label={group}>
                                 {jobs.map(job => <option key={job} value={job}>{job}</option>)}
                             </optgroup>
                         )
                     ))}
                 </select>
                 <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                 </div>
             </div>
             
             <div className="relative flex items-center">
                 <input 
                    type="number" 
                    value={score} 
                    onChange={e => setScore(Number(e.target.value))}
                    className="w-full sm:w-28 bg-white border border-gray-200 text-sm font-black text-gray-900 py-3 px-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-center"
                 />
                 <span className="absolute right-3 text-[10px] font-bold text-gray-400 uppercase">Puan</span>
             </div>
         </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                  <span className="block text-2xl font-black text-emerald-700">{stats.safe}</span>
                  <span className="text-xs font-bold text-emerald-600 uppercase">Güvenli Şehir</span>
              </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                  <span className="block text-2xl font-black text-amber-700">{stats.risky}</span>
                  <span className="text-xs font-bold text-amber-600 uppercase">Sınırda (Riskli)</span>
              </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <div>
                  <span className="block text-2xl font-black text-indigo-700">{stats.avgScore}</span>
                  <span className="text-xs font-bold text-indigo-600 uppercase">Ort. Taban Puan</span>
              </div>
          </div>
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
          <div className="flex gap-2">
              <button onClick={() => setFilterMode('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterMode === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Tümü</button>
              <button onClick={() => setFilterMode('safe')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterMode === 'safe' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>Sadece Yeşiller</button>
              <button onClick={() => setFilterMode('risky')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterMode === 'risky' ? 'bg-amber-400 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>Riskli Bölge</button>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
          </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {filteredList.map(city => (
                  <div 
                    key={city.id}
                    className={`relative p-2 rounded-xl border transition-all duration-300 hover:shadow-lg hover:scale-105 group cursor-default ${
                        city.status === 'safe' ? 'bg-emerald-50 border-emerald-200' :
                        city.status === 'risky' ? 'bg-amber-50 border-amber-200' :
                        city.status === 'impossible' ? 'bg-rose-50 border-rose-100 opacity-60 hover:opacity-100' :
                        'bg-gray-50 border-gray-100 opacity-40'
                    }`}
                  >
                      <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-black text-gray-400">{city.id}</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(city.status)}`}></div>
                      </div>
                      <h4 className="font-bold text-xs text-gray-900 truncate mb-1" title={city.name}>{city.name}</h4>
                      {city.minScore > 0 ? (
                          <div className="text-center">
                              <span className="block text-xs font-black text-gray-800">{city.minScore}</span>
                              <span className={`block text-[9px] font-bold ${city.diff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                  {city.diff > 0 ? '+' : ''}{city.diff.toFixed(1)}
                              </span>
                          </div>
                      ) : (
                          <span className="block text-[9px] text-center text-gray-400 mt-2 font-medium">Alım Yok</span>
                      )}
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-32 bg-gray-900 text-white text-xs p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl">
                          <p className="font-bold border-b border-gray-700 pb-1 mb-1">{city.name}</p>
                          <div className="flex justify-between text-gray-300"><span>Kontenjan:</span> <span className="text-white font-mono">{city.quota}</span></div>
                          <div className="flex justify-between text-gray-300"><span>Taban:</span> <span className="text-white font-mono">{city.minScore}</span></div>
                          {city.diff !== 0 && (
                              <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-700">
                                  <span>Fark:</span>
                                  <span className={city.diff > 0 ? 'text-green-400' : 'text-red-400'}>{city.diff.toFixed(2)}</span>
                              </div>
                          )}
                          <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
          <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Şehir</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Taban Puan</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kontenjan</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Durum</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {filteredList.sort((a,b) => (a.diff - b.diff) * -1).map((city) => (
                          <tr key={city.id} className="hover:bg-gray-50 transition">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                      <span className="text-xs font-mono font-bold text-gray-400 mr-3 w-6">{city.id}</span>
                                      <div className="text-sm font-bold text-gray-900">{city.name}</div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  {city.minScore > 0 ? (
                                      <span className="text-sm font-mono font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded">{city.minScore}</span>
                                  ) : <span className="text-xs text-gray-400">-</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600">{city.quota > 0 ? city.quota : '-'}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  {city.status === 'safe' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">Atanabilir</span>}
                                  {city.status === 'risky' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800">Sınırda</span>}
                                  {city.status === 'impossible' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">Zor</span>}
                                  {city.status === 'no-data' && <span className="text-xs text-gray-400 italic">Veri Yok</span>}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {/* LEGEND (Renk Açıklaması) */}
      <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Renklerin Anlamı</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                  <div>
                      <span className="block text-sm font-bold text-emerald-800">Güvenli Bölge</span>
                      <p className="text-xs text-emerald-600 mt-1">Puanınız ilin taban puanından yüksek veya eşit. Atanma ihtimaliniz çok yüksek.</p>
                  </div>
              </div>
              <div className="flex items-start p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="w-3 h-3 bg-amber-400 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                  <div>
                      <span className="block text-sm font-bold text-amber-800">Sınırda / Riskli</span>
                      <p className="text-xs text-amber-600 mt-1">Puanınız taban puana çok yakın (2 puan fark). Tercih edilebilir ama garanti değil.</p>
                  </div>
              </div>
              <div className="flex items-start p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <div className="w-3 h-3 bg-rose-500 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                  <div>
                      <span className="block text-sm font-bold text-rose-800">Zor / İmkansız</span>
                      <p className="text-xs text-rose-600 mt-1">Puanınız o ilin taban puanının çok altında. Atanma ihtimali düşük.</p>
                  </div>
              </div>
              <div className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mt-1 mr-3 flex-shrink-0"></div>
                  <div>
                      <span className="block text-sm font-bold text-gray-700">Veri Yok / Alım Yok</span>
                      <p className="text-xs text-gray-500 mt-1">Bu ilde, seçilen bölüm için geçmiş dönemde kadro açılmamış.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default KpssMap;