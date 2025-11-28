import React, { useState } from 'react';

const FeedbackSection: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    // In a real app, you would send this to a backend
    console.log('User Feedback:', feedback);
    
    setSubmitted(true);
    
    // Reset form after delay
    setTimeout(() => {
        setSubmitted(false);
        setFeedback('');
    }, 3000);
  };

  return (
    <div className="mt-8 animate-fade-in">
       {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="flex justify-center mb-2">
             <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
          <h3 className="text-lg font-bold text-green-800">Teşekkürler!</h3>
          <p className="text-green-600">Geri bildiriminiz başarıyla alındı.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            Geri Bildirim
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Bu tavsiyeler hakkında ne düşünüyorsunuz? Geliştirmemize yardımcı olun.
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none bg-gray-50 focus:bg-white"
              rows={3}
              placeholder="Düşüncelerinizi buraya yazın..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!feedback.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm ${
                  feedback.trim() 
                    ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transform hover:-translate-y-0.5' 
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Gönder
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackSection;