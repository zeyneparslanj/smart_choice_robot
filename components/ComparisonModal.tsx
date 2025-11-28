
import React from 'react';
import { Recommendation } from '../types';

interface ComparisonModalProps {
  universities: Recommendation[];
  onClose: () => void;
  onRemove: (universityName: string) => void;
  inline?: boolean;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ universities, onClose, onRemove, inline = false }) => {
  
  // Wrapper classes
  const wrapperClass = inline 
    ? "relative w-full bg-white rounded-3xl shadow-xl border border-gray-200 mt-4 overflow-hidden" 
    : "fixed inset-0 z-50 flex items-center justify-center p-4";

  const backdropClass = inline 
    ? "hidden" 
    : "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity";

  const containerClass = inline
    ? "w-full flex flex-col bg-white"
    : "bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] relative flex flex-col overflow-hidden animate-fade-in";

  const scrollContainerClass = inline
    ? "flex-1 overflow-x-auto custom-scrollbar" // Allow horizontal scroll for table, vertical uses window
    : "flex-1 overflow-auto bg-white custom-scrollbar";

  return (
    <div className={wrapperClass}>
      {!inline && <div className={backdropClass} onClick={onClose}></div>}

      <div className={containerClass}>
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-200 flex justify-between items-center bg-gray-50/80 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Üniversite Karşılaştırması</h2>
            <p className="text-gray-500 font-medium mt-1">Seçilen {universities.length} üniversite yan yana karşılaştırılıyor</p>
          </div>
          
          <button 
            onClick={onClose}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition ${inline ? 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700' : 'hover:bg-gray-200 p-2 rounded-full'}`}
          >
            {inline ? (
                <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Geri Dön</span>
                </>
            ) : (
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            )}
          </button>
        </div>

        {/* Content - Scrollable Table */}
        <div className={scrollContainerClass}>
          <div className="min-w-[800px] inline-block w-full"> 
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-6 text-left w-64 bg-white sticky left-0 z-10 border-b border-gray-200 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                    <span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Özellikler</span>
                  </th>
                  {universities.map((uni, idx) => (
                    <th key={idx} className="p-6 text-left border-b border-gray-200 min-w-[300px] align-top bg-white/50 relative group">
                      <div className="flex justify-between items-start gap-4">
                         <div>
                            <span className={`inline-block px-2.5 py-1 mb-3 text-[10px] font-bold rounded-full text-white shadow-sm ${uni.locationType === 'Yurt Dışı' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                {uni.country || 'TR'}
                            </span>
                            <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-1">{uni.university}</h3>
                            <p className="text-indigo-600 text-sm font-bold">{uni.department}</p>
                         </div>
                         <button 
                           onClick={() => onRemove(uni.university)}
                           className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                           title="Listeden çıkar"
                         >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                         </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Location */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Konum</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 text-gray-600 font-medium">
                      {uni.city}, {uni.country || 'Türkiye'}
                    </td>
                  ))}
                </tr>

                {/* Preference Code */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Tercih Kodu</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 text-gray-900 font-mono font-bold text-sm">
                      {uni.preferenceCode || '-'}
                    </td>
                  ))}
                </tr>

                {/* Probability */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Kazanma İhtimali</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
                        uni.probability.includes('Yüksek') ? 'bg-green-100 text-green-800 border-green-200' : 
                        uni.probability.includes('Orta') ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                        'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {uni.probability}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rank */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Sıralama (Global/TR)</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 text-gray-800 font-mono text-sm font-bold">
                      {uni.globalRank || 'Veri Yok'}
                    </td>
                  ))}
                </tr>

                {/* Tuition */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Eğitim Ücreti</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 text-gray-900 font-bold text-sm">
                      {uni.tuition || 'Belirtilmemiş'}
                    </td>
                  ))}
                </tr>

                {/* Pros */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 align-top shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Avantajlar</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 align-top">
                      <ul className="text-sm space-y-2 text-gray-600">
                        {uni.pros.slice(0, 4).map((p, i) => (
                          <li key={i} className="flex items-start">
                            <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            <span className="leading-snug">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                 {/* Cons */}
                 <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 align-top shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Zorluklar</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 align-top">
                      <ul className="text-sm space-y-2 text-gray-600">
                        {uni.cons.slice(0, 3).map((c, i) => (
                          <li key={i} className="flex items-start">
                             <svg className="w-4 h-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                             <span className="leading-snug">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Vibe */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 align-top shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Kampüs Atmosferi</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 align-top">
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <p className="text-sm text-indigo-900/80 italic leading-relaxed">
                            "{uni.campusVibe}"
                        </p>
                      </div>
                    </td>
                  ))}
                </tr>

                 {/* Admission */}
                 <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 align-top shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Kabul Şartları</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 align-top">
                        {uni.admissionRequirements && uni.admissionRequirements.length > 0 ? (
                             <ul className="text-xs space-y-1.5 text-gray-600 font-medium">
                                {uni.admissionRequirements.slice(0, 4).map((req, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="mr-2 text-indigo-400 font-bold">•</span>
                                        {req}
                                    </li>
                                ))}
                             </ul>
                        ) : <span className="text-xs text-gray-400">-</span>}
                    </td>
                  ))}
                </tr>
                
                {/* Career */}
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 font-bold text-gray-700 bg-gray-50 sticky left-0 align-top shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">Ortalama Maaş</td>
                  {universities.map((uni, idx) => (
                    <td key={idx} className="p-6 align-top">
                       <span className="text-lg font-bold text-gray-900 bg-green-50 px-2 py-1 rounded border border-green-100">{uni.averageSalary || 'Değişken'}</span>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
