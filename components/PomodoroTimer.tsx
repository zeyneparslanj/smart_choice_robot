
import React, { useState, useEffect } from 'react';

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(interval);
            handleComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const handleComplete = () => {
    setIsActive(false);
    // Play a sound (mock)
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(e => console.log('Audio play failed', e));

    if (mode === 'focus') {
      setSessions(s => s + 1);
      setMode('break');
      setMinutes(5);
    } else {
      setMode('focus');
      setMinutes(25);
    }
    setSeconds(0);
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'focus' ? 25 : 5);
    setSeconds(0);
  };

  const progress = mode === 'focus' 
    ? 100 - ((minutes * 60 + seconds) / (25 * 60)) * 100 
    : 100 - ((minutes * 60 + seconds) / (5 * 60)) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-3xl shadow-2xl p-4 w-64 border-2 border-indigo-100 transition-transform transform hover:-translate-y-1">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
           <h4 className="font-bold text-gray-800 flex items-center">
             <span className="text-xl mr-2">{mode === 'focus' ? '🍅' : '☕'}</span>
             {mode === 'focus' ? 'Odaklan' : 'Mola Ver'}
           </h4>
           <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
             {sessions} Oturum
           </span>
        </div>

        <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
           <svg className="w-full h-full transform -rotate-90">
             <circle cx="50%" cy="50%" r="45%" stroke="#f3f4f6" strokeWidth="8" fill="none" />
             <circle 
                cx="50%" cy="50%" r="45%" 
                stroke={mode === 'focus' ? '#ef4444' : '#10b981'} 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * progress) / 100} 
                strokeLinecap="round"
                className="transition-all duration-1000"
             />
           </svg>
           <div className="absolute inset-0 flex items-center justify-center text-3xl font-mono font-bold text-gray-800">
             {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
           </div>
        </div>

        <div className="flex justify-center gap-3">
           <button 
             onClick={toggleTimer}
             className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 ${isActive ? 'bg-amber-500' : 'bg-indigo-600'}`}
           >
             {isActive ? (
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
             ) : (
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
             )}
           </button>
           <button 
             onClick={resetTimer}
             className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
