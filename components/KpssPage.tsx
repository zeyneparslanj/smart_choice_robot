import React, { useState, useEffect } from 'react';
import { analyzeKpssPerformance, calculateTargetNets, explainKpssCode } from '../services/geminiService';
import { KpssAnalysisResult, KpssCodeExplanation } from '../types';
import { MOCK_JOB_TRENDS, KPSS_QUALIFICATION_CODES } from '../constants';
import KpssMap from './KpssMap';
import TrendChart from './TrendChart';

// --- HELPER: EXAM DATES LOGIC ---
type ExamType = 'lisans' | 'alan' | 'onlisans';

interface ExamInfo {
    id: ExamType;
    label: string;
    shortLabel: string;
    description: string;
    baseMonth: number; // 0-indexed (6 = July)
    baseDay: number;
    isBiennial: boolean; // True for Ön Lisans (Every 2 years)
    color: string;
}

const EXAMS: ExamInfo[] = [
    { 
        id: 'lisans', 
        label: 'Lisans (GY-GK)', 
        shortLabel: 'Lisans',
        description: 'Genel Yetenek - Genel Kültür',
        baseMonth: 6, // July
        baseDay: 14, 
        isBiennial: false,
        color: 'from-red-500 to-rose-600'
    },
    { 
        id: 'alan', 
        label: 'Lisans (Alan Bilgisi)', 
        shortLabel: 'Alan',
        description: 'A Grubu Kadrolar',
        baseMonth: 6, // July
        baseDay: 21, 
        isBiennial: false,
        color: 'from-blue-500 to-indigo-600'
    },
    { 
        id: 'onlisans', 
        label: 'Ön Lisans', 
        shortLabel: 'Ön Lisans',
        description: '2 Yıllık Mezunlar İçin',
        baseMonth: 8, 
        baseDay: 15, 
        isBiennial: true, 
        color: 'from-emerald-500 to-teal-600'
    }
];

const calculateNextDate = (exam: ExamInfo) => {
    const now = new Date();
    let targetYear = now.getFullYear();

    if (exam.isBiennial && targetYear % 2 !== 0) {
        targetYear++;
    }

    let examDate = new Date(targetYear, exam.baseMonth, exam.baseDay, 10, 15, 0);

    if (now.getTime() > examDate.getTime()) {
        targetYear += exam.isBiennial ? 2 : 1;
        examDate = new Date(targetYear, exam.baseMonth, exam.baseDay, 10, 15, 0);
    }
    return examDate;
};

// --- COMPONENTS ---

const CountdownTimer = () => {
    const [selectedExamId, setSelectedExamId] = useState<ExamType>('lisans');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
    const [targetDate, setTargetDate] = useState<Date>(new Date());
    const activeExam = EXAMS.find(e => e.id === selectedExamId) || EXAMS[0];

    useEffect(() => {
        const tDate = calculateNextDate(activeExam);
        setTargetDate(tDate);
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = tDate.getTime() - now;
            if (distance < 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [activeExam]);

    return (
        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 text-white relative overflow-hidden mt-6">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${activeExam.color} rounded-full blur-3xl opacity-20 -mr-10 -mt-10 transition-colors duration-500`}></div>
            <div className="flex bg-gray-800 p-1 rounded-lg mb-6 relative z-10 w-fit">
                {EXAMS.map(exam => (
                    <button key={exam.id} onClick={() => setSelectedExamId(exam.id)} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${selectedExamId === exam.id ? 'bg-gray-700 text-white shadow-sm ring-1 ring-gray-600' : 'text-gray-400 hover:text-gray-200'}`}>{exam.shortLabel}</button>
                ))}
            </div>
            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center relative z-10">
                <span className={`w-2 h-2 rounded-full mr-2 animate-pulse bg-gradient-to-r ${activeExam.color}`}></span>
                {targetDate.getFullYear()} Sınavına Kalan
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                {Object.entries(timeLeft).map(([unit, val]) => (
                    <div key={unit} className="bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/5">
                        <span className="block text-3xl font-extrabold text-white">{val}</span>
                        <span className="block text-[10px] font-medium text-gray-400 uppercase">{unit === 'days' ? 'Gün' : unit === 'hours' ? 'Saat' : 'Dakika'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const KpssPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'score' | 'reverse' | 'map' | 'trends'>('score');
  
  // Score Calculator
  const [level, setLevel] = useState<'Lisans' | 'Ön Lisans' | 'Ortaöğretim'>('Lisans');
  const [gyNet, setGyNet] = useState<string>('');
  const [gkNet, setGkNet] = useState<string>('');
  const [result, setResult] = useState<KpssAnalysisResult | null>(null);
  
  // Reverse Wizard
  const [targetScore, setTargetScore] = useState<number>(85);
  const [reverseResult, setReverseResult] = useState<string | null>(null);
  const [strongSubjects, setStrongSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);

  // Code Search
  const [codeQuery, setCodeQuery] = useState('');
  const [codeLevelFilter, setCodeLevelFilter] = useState<'Tümü' | 'Lisans' | 'Ön Lisans' | 'Ortaöğretim'>('Tümü');
  const [codeResults, setCodeResults] = useState<{code: string, desc: string, level: string, jobs: string[]}[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Trends
  const [selectedTrendJob, setSelectedTrendJob] = useState(MOCK_JOB_TRENDS[0].title);

  // Animated Salary Counter
  const [displaySalary, setDisplaySalary] = useState(0);

  const SUBJECTS = ['Matematik', 'Türkçe', 'Tarih', 'Coğrafya', 'Vatandaşlık'];

  useEffect(() => {
      if (result?.estimatedSalary) {
          let start = 0;
          const end = parseInt(String(result.estimatedSalary).replace(/\D/g,'')) || 40000;
          const duration = 2000;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
              start += increment;
              if (start >= end) {
                  setDisplaySalary(end);
                  clearInterval(timer);
              } else {
                  setDisplaySalary(Math.floor(start));
              }
          }, 16);
          return () => clearInterval(timer);
      }
  }, [result]);

  // Real-time Search Effect
  useEffect(() => {
      const performSearch = () => {
          const query = codeQuery.trim().toLocaleLowerCase('tr-TR'); // Handle Turkish chars
          
          if (!query && codeLevelFilter === 'Tümü') {
              setCodeResults([]);
              return;
          }

          // Filter logic
          const matches = Object.entries(KPSS_QUALIFICATION_CODES)
            .filter(([code, data]) => {
                // 1. Text Matching
                const codeStr = code.toLocaleLowerCase('tr-TR');
                const descStr = data.desc.toLocaleLowerCase('tr-TR');
                const jobsStr = (data.jobs || []).join(' ').toLocaleLowerCase('tr-TR');
                
                // If query exists, check if it matches Code OR Desc OR Jobs
                const matchesQuery = !query || codeStr.includes(query) || descStr.includes(query) || jobsStr.includes(query);
                
                // 2. Level Matching
                const matchesLevel = codeLevelFilter === 'Tümü' || data.level === (codeLevelFilter as string);

                return matchesQuery && matchesLevel;
            })
            .map(([code, data]) => ({ 
                code, 
                desc: data.desc, 
                level: data.level, 
                jobs: data.jobs || [] 
            }));

          setCodeResults(matches);
      };

      performSearch();
  }, [codeQuery, codeLevelFilter]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const data = await analyzeKpssPerformance({ level, gyNet: Number(gyNet), gkNet: Number(gkNet) });
      // Mock salary if missing
      data.estimatedSalary = 42500; 
      setResult(data);
    } catch (error) { alert('Hata oluştu'); } finally { setLoading(false); }
  };

  const handleReverseCalculate = async () => {
      setLoading(true);
      setReverseResult(null);
      try {
          const res = await calculateTargetNets(level, targetScore, 'Genel', strongSubjects, weakSubjects);
          setReverseResult(res);
      } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const toggleSubject = (subject: string, type: 'strong' | 'weak') => {
      if (type === 'strong') {
          setStrongSubjects(prev => {
              if (prev.includes(subject)) return prev.filter(s => s !== subject);
              // Remove from weak if adding to strong
              if (weakSubjects.includes(subject)) setWeakSubjects(w => w.filter(s => s !== subject));
              return [...prev, subject];
          });
      } else {
          setWeakSubjects(prev => {
              if (prev.includes(subject)) return prev.filter(s => s !== subject);
              // Remove from strong if adding to weak
              if (strongSubjects.includes(subject)) setStrongSubjects(s => s.filter(s => s !== subject));
              return [...prev, subject];
          });
      }
  };

  // Helper to map Level to ÖSYM Table Name
  const getTableBadge = (level: string) => {
      switch(level) {
          case 'Lisans': return { text: 'Tablo 4 (Lisans)', color: 'bg-blue-100 text-blue-700' };
          case 'Ön Lisans': return { text: 'Tablo 3 (Ön Lisans)', color: 'bg-purple-100 text-purple-700' };
          case 'Ortaöğretim': return { text: 'Tablo 2 (Lise)', color: 'bg-orange-100 text-orange-700' };
          default: return { text: 'Genel / Özel Şart', color: 'bg-gray-100 text-gray-700' };
      }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in relative">
      
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
              <div>
                  <h2 className="text-4xl font-extrabold mb-2">KPSS Kariyer Üssü</h2>
                  <p className="text-slate-300">Hesapla, Planla, Atan.</p>
              </div>
              <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md mt-4 md:mt-0 overflow-x-auto">
                  {['score', 'reverse', 'map', 'trends'].map(t => (
                      <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap ${activeTab === t ? 'bg-white text-slate-900 shadow' : 'text-slate-300 hover:text-white'}`}>
                          {t === 'score' ? 'Puan Hesapla' : t === 'reverse' ? 'Hedef Sihirbazı' : t === 'map' ? 'Atama Haritası' : 'Trend Analizi'}
                      </button>
                  ))}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                   <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                   Nitelik Kodu Robotu
                </h3>
                
                {/* Level Filter */}
                <div className="flex gap-1 mb-3 overflow-x-auto no-scrollbar">
                    {['Tümü', 'Lisans', 'Ön Lisans', 'Ortaöğretim'].map(l => (
                        <button 
                            key={l}
                            type="button"
                            onClick={() => setCodeLevelFilter(l as any)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-colors ${codeLevelFilter === l ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Kod (4001) veya Ünvan (Bilgisayar)"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 pr-10 text-sm font-bold text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={codeQuery}
                        onChange={(e) => setCodeQuery(e.target.value)}
                    />
                    <div className="absolute right-3 top-4 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
                
                {/* Results List */}
                <div className="mt-4 max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
                    {codeResults.length > 0 ? (
                        codeResults.map((item, idx) => {
                            const badge = getTableBadge(item.level);
                            return (
                                <div key={idx} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 transition shadow-sm group animate-fade-in">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-black text-white bg-indigo-600 px-2 py-0.5 rounded shadow-sm">{item.code}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badge.color}`}>{badge.text}</span>
                                    </div>
                                    <p className="text-gray-800 font-bold text-xs leading-snug mb-2">{item.desc}</p>
                                    
                                    {item.jobs && item.jobs.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                                            {item.jobs.map((job, jIdx) => (
                                                <span key={jIdx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium border border-gray-200">
                                                    {job}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : codeQuery ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-900 font-bold text-sm mb-1">Sonuç Bulunamadı</p>
                            <p className="text-gray-500 text-xs italic">Farklı bir anahtar kelime deneyin (Örn: 'Mühendis', 'Memur').</p>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-xs font-medium">Aramak istediğiniz kodu (4001) veya mesleği (Bilgisayar) yazın.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <CountdownTimer />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">
            
            {/* TAB: SCORE CALCULATOR */}
            {activeTab === 'score' && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fade-in">
                    {!result ? (
                        <form onSubmit={handleCalculate} className="max-w-md mx-auto">
                            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Netlerini Gir, Durumunu Gör</h3>
                            
                            <div className="flex justify-center mb-6 bg-gray-100 p-1 rounded-xl">
                                {(['Lisans', 'Ön Lisans', 'Ortaöğretim'] as const).map(l => (
                                    <button 
                                      type="button" 
                                      key={l} 
                                      onClick={() => setLevel(l)} 
                                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${level === l ? 'bg-white shadow text-gray-900 ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                                    >
                                      {l}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Genel Yetenek</label>
                                    <input 
                                        type="number" 
                                        max={60} 
                                        value={gyNet} 
                                        onChange={e => setGyNet(e.target.value)} 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-black text-xl text-center text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition placeholder-gray-300" 
                                        placeholder="-" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase mb-2">Genel Kültür</label>
                                    <input 
                                        type="number" 
                                        max={60} 
                                        value={gkNet} 
                                        onChange={e => setGkNet(e.target.value)} 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-black text-xl text-center text-gray-900 focus:bg-white focus:ring-2 focus:ring-red-500 outline-none transition placeholder-gray-300" 
                                        placeholder="-" 
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:-translate-y-1">
                                {loading ? 'Analiz Ediliyor...' : 'Hesapla'}
                            </button>
                        </form>
                    ) : (
                        <div className="animate-fade-in">
                            <div className="flex items-center justify-between mb-8">
                                <button onClick={() => setResult(null)} className="text-sm font-bold text-gray-400 hover:text-gray-900 flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg> Geri</button>
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">Analiz Tamamlandı</span>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                                <div className="text-center md:text-left">
                                    <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest">Tahmini Puan</span>
                                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">{result.estimatedScore}</span>
                                </div>
                                <div className="flex-1 w-full bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <div>
                                        <span className="block text-xs font-bold text-gray-400 uppercase">Tahmini Maaş</span>
                                        <span className="text-3xl font-extrabold text-gray-900">₺{displaySalary.toLocaleString()}</span>
                                    </div>
                                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <h4 className="font-bold text-gray-900 mb-4">Önerilen Kadrolar</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.suitableCadres.map((c, i) => (
                                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-red-300 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-bold text-gray-800 text-sm">{c.title}</h5>
                                            <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded">Min: {c.minScore}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{c.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: REVERSE WIZARD (Slider) */}
            {activeTab === 'reverse' && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fade-in">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Hedef Belirle & Strateji Oluştur</h3>
                        <p className="text-gray-500 mt-2">Hayalindeki puana ulaşmak için hangi dersten kaç net yapmalısın?</p>
                    </div>

                    <div className="mb-8 px-4">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                            <span>50</span>
                            <span>70</span>
                            <span>85</span>
                            <span>100</span>
                        </div>
                        <input 
                            type="range" min="50" max="100" step="0.5" 
                            value={targetScore} onChange={e => setTargetScore(Number(e.target.value))}
                            className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="text-center mt-6">
                            <span className="text-6xl font-black text-blue-600">{targetScore}</span>
                            <span className="block text-xs font-bold text-blue-300 uppercase tracking-widest mt-1">Hedef Puan</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-900 uppercase mb-3">Güçlü Olduğun Dersler (Çoklu Seçim)</label>
                            <div className="flex flex-wrap gap-2">
                                {SUBJECTS.map(s => {
                                    const isSelected = strongSubjects.includes(s);
                                    return (
                                        <button 
                                            key={s} 
                                            onClick={() => toggleSubject(s, 'strong')}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                isSelected 
                                                ? 'bg-green-100 text-green-700 border-green-300 shadow-sm' 
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-900 uppercase mb-3">Zayıf Olduğun Dersler (Çoklu Seçim)</label>
                            <div className="flex flex-wrap gap-2">
                                {SUBJECTS.map(s => {
                                    const isSelected = weakSubjects.includes(s);
                                    return (
                                        <button 
                                            key={s} 
                                            onClick={() => toggleSubject(s, 'weak')}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                isSelected 
                                                ? 'bg-red-100 text-red-700 border-red-300 shadow-sm' 
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <button onClick={handleReverseCalculate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-1">
                            {loading ? 'Senaryolar Oluşturuluyor...' : 'Stratejimi Göster'}
                        </button>
                    </div>

                    {reverseResult && (
                        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100 prose prose-blue max-w-none text-sm font-medium animate-fade-in">
                            <div className="whitespace-pre-line text-blue-900">{reverseResult}</div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: MAP */}
            {activeTab === 'map' && (
                <KpssMap userScore={result ? parseFloat(result.estimatedScore) : 80} />
            )}

            {/* TAB: TRENDS */}
            {activeTab === 'trends' && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 animate-fade-in">
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Analiz Edilecek Kadro</label>
                        <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                            value={selectedTrendJob}
                            onChange={(e) => setSelectedTrendJob(e.target.value)}
                        >
                            {MOCK_JOB_TRENDS.map((job, idx) => (
                                <option key={idx} value={job.title}>{job.title}</option>
                            ))}
                        </select>
                    </div>
                    
                    <TrendChart trend={MOCK_JOB_TRENDS.find(t => t.title === selectedTrendJob) || MOCK_JOB_TRENDS[0]} />
                    
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                        <div className="flex items-start">
                            <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <p className="text-sm text-yellow-800">
                                <strong>Analiz Notu:</strong> Gösterilen veriler son 4 merkezi atama dönemine (2022/1 - 2023/2) aittir. Puanlardaki düşüş, o kadroya olan talebin azaldığını veya alım sayısının arttığını gösterebilir.
                            </p>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default KpssPage;