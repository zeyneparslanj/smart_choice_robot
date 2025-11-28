import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { DEPARTMENT_TYPES, PROGRAM_OPTIONS, QUOTA_OPTIONS, ALL_DEPARTMENTS, ALL_UNIVERSITIES } from '../constants';

interface InputFormProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ preferences, setPreferences, onSubmit, isLoading }) => {
  const [deptInput, setDeptInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        if (name === 'programTypes') {
            setPreferences(prev => {
                const updated = checked 
                    ? [...prev.programTypes, value] 
                    : prev.programTypes.filter(t => t !== value);
                return { ...prev, programTypes: updated };
            });
        } else {
            setPreferences(prev => ({ ...prev, [name]: checked }));
        }
    } else {
        setPreferences(prev => ({ ...prev, [name]: value }));
    }
  };

  // Department Multi-Select Logic
  const selectedDepts = preferences.preferredDepartments 
    ? preferences.preferredDepartments.split(',').map(s => s.trim()).filter(Boolean) 
    : [];

  const addDepartment = (val: string) => {
      const trimmed = val.trim();
      if (!trimmed) return;
      if (selectedDepts.includes(trimmed)) {
          setDeptInput('');
          return;
      }
      
      const newDepts = [...selectedDepts, trimmed];
      setPreferences(prev => ({ ...prev, preferredDepartments: newDepts.join(', ') }));
      setDeptInput('');
  };

  const removeDepartment = (val: string) => {
      const newDepts = selectedDepts.filter(d => d !== val);
      setPreferences(prev => ({ ...prev, preferredDepartments: newDepts.join(', ') }));
  };

  const handleDeptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          addDepartment(deptInput);
      }
  };

  const handleDeptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setDeptInput(val);
      if (ALL_DEPARTMENTS.includes(val)) {
          addDepartment(val);
      }
  };

  const getProgramOptionData = (option: string) => {
      if (option.includes('4 YILLIK') && !option.includes('AÇIKÖĞRETİM')) return { label: 'Lisans (4 Yıl)', desc: 'Fakülte & Y.O.', icon: '🎓' };
      if (option.includes('2 YILLIK') && !option.includes('AÇIKÖĞRETİM')) return { label: 'Ön Lisans (2 Yıl)', desc: 'Meslek Yüksekokulu', icon: '📜' };
      if (option.includes('ÖZEL YETENEK')) return { label: 'Özel Yetenek', desc: 'Sınavla Alanlar', icon: '🎨' };
      if (option.includes('AÇIKÖĞRETİM') && option.includes('4 Yıllıklar')) return { label: 'Açıköğretim (4)', desc: 'Uzaktan Lisans', icon: '💻' };
      if (option.includes('AÇIKÖĞRETİM') && option.includes('2 Yıllıklar')) return { label: 'Açıköğretim (2)', desc: 'Uzaktan Ön Lisans', icon: '📱' };
      return { label: option, desc: '', icon: 'Unknown' };
  };

  // Determine if form is ready to submit
  // Valid if: (Interests are filled) OR (Preferred Departments are filled) OR (Score/Ranking is filled) OR (Specific University is filled)
  const isFormValid = preferences.interests || preferences.preferredDepartments || preferences.score || preferences.ranking || preferences.specificUniversity;

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-white/50 relative overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

      <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 p-2 rounded-lg mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            </span>
            ÜNİVERSİTE TERCİH ROBOTU
          </h2>
          <p className="text-gray-500 text-sm font-medium ml-12">Kriterlerinizi belirleyin, en doğru sonuçlara ulaşın.</p>
      </div>
      
      <div className="space-y-8">
        {/* Region Selector */}
        <div>
           <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 ml-1">Hedef Kapsamı</label>
           <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-100">
            <button
                type="button"
                onClick={() => setPreferences(prev => ({ ...prev, targetRegion: 'TR' }))}
                className={`flex flex-col items-center justify-center py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    preferences.targetRegion === 'TR' 
                    ? 'bg-white text-indigo-700 shadow-lg ring-1 ring-black/5 scale-100' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 scale-95'
                }`}
            >
                <span className="text-lg mb-1">🇹🇷</span> Sadece Türkiye
            </button>
            <button
                type="button"
                onClick={() => setPreferences(prev => ({ ...prev, targetRegion: 'GLOBAL' }))}
                className={`flex flex-col items-center justify-center py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                    preferences.targetRegion === 'GLOBAL' 
                    ? 'bg-white text-indigo-700 shadow-lg ring-1 ring-black/5 scale-100' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 scale-95'
                }`}
            >
                <span className="text-lg mb-1">🌍</span> Global + TR
            </button>
          </div>
        </div>

        {/* Basic Academic Info */}
        <div>
            <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 ml-1">Akademik Puanlar</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Puan Türü</label>
                    <div className="relative group">
                        <select
                            name="departmentType"
                            value={preferences.departmentType}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-gray-800 py-3.5 pl-4 pr-8 transition outline-none appearance-none cursor-pointer"
                        >
                            {DEPARTMENT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                         <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
                <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Puan</label>
                    <input
                    type="number"
                    name="score"
                    value={preferences.score}
                    onChange={handleChange}
                    placeholder="Örn: 420"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-gray-800 p-3.5 transition outline-none placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
                <div className="sm:col-span-1">
                    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase">Sıralama</label>
                    <input
                    type="number"
                    name="ranking"
                    value={preferences.ranking}
                    onChange={handleChange}
                    placeholder="Örn: 45000"
                    className="w-full rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-gray-800 p-3.5 transition outline-none placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
            </div>
        </div>

        {/* Filters Section */}
        <div>
            <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest ml-1">Program Filtreleri</label>
                <span className="text-[10px] text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md font-bold">Çoklu Seçim</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {PROGRAM_OPTIONS.map((option) => {
                    const { label, desc, icon } = getProgramOptionData(option);
                    const isSelected = preferences.programTypes.includes(option);
                    
                    return (
                        <label 
                            key={option} 
                            className={`cursor-pointer group relative flex flex-col p-3 rounded-2xl border-2 transition-all duration-200 select-none ${
                                isSelected 
                                ? 'border-indigo-500 bg-indigo-50/30 shadow-sm' 
                                : 'border-transparent bg-gray-50 hover:bg-gray-100'
                            }`}
                        >
                            <input
                                type="checkbox"
                                name="programTypes"
                                value={option}
                                checked={isSelected}
                                onChange={handleChange}
                                className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                            />
                            <div className="flex items-center justify-center mb-1.5">
                                <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
                            </div>
                            <span className={`text-center text-xs font-bold leading-tight ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                {label}
                            </span>
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                            )}
                        </label>
                    );
                })}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <label className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${preferences.includeNewlyOpened ? 'border-green-500 bg-green-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-green-200'}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border transition-colors ${preferences.includeNewlyOpened ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                        {preferences.includeNewlyOpened && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <input type="checkbox" name="includeNewlyOpened" checked={preferences.includeNewlyOpened} onChange={handleChange} className="hidden" />
                    <div>
                        <span className="block text-sm font-bold text-gray-800">Yeni Bölümler</span>
                        <span className="block text-[10px] text-gray-500 font-medium">Bu yıl ilk kez açılanlar</span>
                    </div>
                </label>
                
                <label className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${preferences.includeUnfilled ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-amber-200'}`}>
                     <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 border transition-colors ${preferences.includeUnfilled ? 'bg-amber-500 border-amber-500' : 'border-gray-300 bg-white'}`}>
                        {preferences.includeUnfilled && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                     <input type="checkbox" name="includeUnfilled" checked={preferences.includeUnfilled} onChange={handleChange} className="hidden" />
                    <div>
                        <span className="block text-sm font-bold text-gray-800">Ek Kontenjan</span>
                        <span className="block text-[10px] text-gray-500 font-medium">Dolmamış bölümleri dahil et</span>
                    </div>
                </label>
            </div>
        </div>

        {/* Special Quota & Interests */}
        <div className="space-y-6 pt-6 border-t border-gray-100 border-dashed">
             <div>
                <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">Kontenjan Türü</label>
                <div className="relative">
                    <select
                        name="quotaType"
                        value={preferences.quotaType}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-gray-800 py-3.5 pl-4 pr-10 transition outline-none appearance-none cursor-pointer"
                    >
                        {QUOTA_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
                <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">İstediğin Şehir(ler)</label>
                    <input
                        type="text"
                        name="city"
                        value={preferences.city}
                        onChange={handleChange}
                        placeholder="Örn: İstanbul, Ankara, İzmir..."
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-gray-800 p-3.5 transition outline-none placeholder-gray-400"
                    />
                </div>
                
                 {/* Specific University Filter */}
                 <div>
                   <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                       Özel Üniversite Tercihi <span className="text-gray-400 font-normal normal-case">(İsteğe Bağlı)</span>
                   </label>
                   <div className="relative group">
                        <input
                            list="specific_uni_list"
                            type="text"
                            name="specificUniversity"
                            value={preferences.specificUniversity}
                            onChange={handleChange}
                            placeholder="Sadece belirli bir üniversiteyi hedefliyorsanız yazın..."
                            className="w-full rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-gray-800 p-3.5 transition outline-none placeholder-gray-400"
                        />
                         <datalist id="specific_uni_list">
                            {ALL_UNIVERSITIES.map((uni, index) => (
                                <option key={index} value={uni} />
                            ))}
                        </datalist>
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1 ml-1">
                       *Tüm Türkiye ve Global üniversiteleri (ABD, Avrupa, Asya) kapsar.
                   </p>
                </div>

                {/* Preferred Departments (Multi-Select) */}
                <div>
                   <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">İstediğin Bölümler (Çoklu Seçim)</label>
                   <div className="relative">
                        <input
                            list="departments-list"
                            type="text"
                            value={deptInput}
                            onChange={handleDeptSelect}
                            onKeyDown={handleDeptKeyDown}
                            placeholder="Örn: Bilgisayar Mühendisliği (Listeden seçin veya yazıp Enter'a basın)"
                            className="w-full rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-gray-800 p-3.5 transition outline-none placeholder-gray-400"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                             {deptInput.length > 0 ? (
                                <span className="text-xs font-bold text-indigo-500">Enter'a bas ekle</span>
                             ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                             )}
                        </div>
                        <datalist id="departments-list">
                            {ALL_DEPARTMENTS.map((dept, index) => (
                                <option key={index} value={dept} />
                            ))}
                        </datalist>
                   </div>
                   
                   {/* Selected Tags */}
                   <div className="flex flex-wrap gap-2 mt-3">
                       {selectedDepts.map((dept, index) => (
                           <div key={index} className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 animate-fade-in group">
                               {dept}
                               <button 
                                type="button" 
                                onClick={() => removeDepartment(dept)}
                                className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 transition"
                               >
                                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                               </button>
                           </div>
                       ))}
                   </div>
                </div>

                <div>
                    <label className="block text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                        İlgi Alanları & Hobiler <span className="text-gray-400 font-normal normal-case">(İsteğe Bağlı)</span>
                    </label>
                    <textarea
                        name="interests"
                        value={preferences.interests}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Örn: Teknoloji, Çizim yapmak... veya boş bırakın."
                        className="w-full rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-medium text-gray-800 p-3.5 transition outline-none placeholder-gray-400 resize-none"
                    />
                </div>
            </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isLoading || !isFormValid}
          className={`group relative w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transform transition-all hover:-translate-y-1 active:scale-95 overflow-hidden ${
            isLoading || !isFormValid
              ? 'bg-gray-300 cursor-not-allowed shadow-none'
              : 'bg-gray-900 text-white hover:shadow-2xl'
          }`}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-gradient-x"></div>
          
          <div className="relative flex items-center justify-center">
             {isLoading ? (
                <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white/90" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Yapay Zeka Analiz Ediyor...
                </>
             ) : (
                <>
                 Analiz Et ve Sonuçları Göster
                 <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </>
             )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default InputForm;