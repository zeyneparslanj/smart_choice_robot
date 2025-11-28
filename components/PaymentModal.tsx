
import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onSuccess, onCancel }) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    termsAccepted: false
  });

  // Detect card type
  useEffect(() => {
    if (formData.cardNumber.startsWith('4')) setCardType('visa');
    else if (formData.cardNumber.startsWith('5')) setCardType('mastercard');
    else setCardType('unknown');
  }, [formData.cardNumber]);

  const formatCardNumber = (value: string) => {
    // Only allow digits and limit to 16 digits
    const v = value.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    if (type === 'checkbox') {
        setFormData({ ...formData, [name]: checked });
        return;
    }

    if (name === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (name === 'name') {
      formattedValue = value.toUpperCase();
    }

    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) return;

    setPaymentStatus('processing');
    
    // Simulate Payment Gateway Delay
    setTimeout(() => {
      setPaymentStatus('success');
      
      // Close modal after showing success message
      setTimeout(() => {
        onSuccess();
      }, 2500); // Slightly longer delay to allow reading the message
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (paymentStatus === 'success') {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative z-10 animate-fade-in text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ödeme Başarılı!</h3>
                <div className="mb-6 space-y-3">
                    <p className="text-gray-500 text-sm">Premium özellikler hesabınıza tanımlandı.</p>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                        <p className="text-indigo-700 font-bold text-sm animate-pulse flex items-center justify-center gap-2">
                           <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Analiziniz hazırlanıyor, lütfen bekleyiniz...
                        </p>
                    </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-green-500 animate-[width_2.5s_ease-in-out_forwards]" style={{width: '0%'}}></div>
                </div>
            </div>
             <style>{`
                @keyframes width { from { width: 0%; } to { width: 100%; } }
            `}</style>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
        onClick={paymentStatus === 'idle' ? onCancel : undefined}
      ></div>
      
      {/* Modal */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fade-in z-10 flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2">
            <div>
                <h3 className="text-2xl font-extrabold text-gray-900">Ödeme Yap</h3>
                <p className="text-sm text-gray-500 font-medium">Global Tercih Robotu Premium</p>
            </div>
            <button 
                onClick={onCancel} 
                disabled={paymentStatus === 'processing'}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition disabled:opacity-50"
            >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
                <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'card' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Kredi Kartı
                </button>
                <button 
                    onClick={() => setPaymentMethod('transfer')}
                    className={`py-2 rounded-lg text-sm font-bold transition-all ${paymentMethod === 'transfer' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Havale / EFT
                </button>
            </div>
        </div>

        <div className="p-6 pt-6">
          
          {paymentMethod === 'card' && (
             <>
             {/* Virtual Credit Card */}
             <div className="relative w-full h-56 mb-8 perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* Front */}
                    <div className="absolute w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 rounded-2xl shadow-xl p-6 text-white backface-hidden flex flex-col justify-between overflow-hidden border border-white/10">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl"></div>

                        <div className="flex justify-between items-start z-10">
                            <div className="w-12 h-9 bg-yellow-500/80 rounded-lg flex items-center justify-center border border-yellow-400/50 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-50 border border-black/20 rounded-lg"></div>
                                <svg className="w-8 h-8 text-black/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                            </div>
                            <div className="h-8">
                                {cardType === 'visa' && <span className="font-bold italic text-2xl tracking-tighter">VISA</span>}
                                {cardType === 'mastercard' && (
                                    <div className="flex -space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-red-500/90"></div>
                                        <div className="w-8 h-8 rounded-full bg-yellow-500/90"></div>
                                    </div>
                                )}
                                {cardType === 'unknown' && <span className="text-xs text-gray-300 font-mono tracking-widest uppercase">Credit Card</span>}
                            </div>
                        </div>

                        <div className="z-10 mt-4">
                            <div className="text-2xl font-mono tracking-widest drop-shadow-md">
                                {formData.cardNumber || '•••• •••• •••• ••••'}
                            </div>
                        </div>

                        <div className="flex justify-between items-end z-10 mt-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-gray-300 tracking-wider">Kart Sahibi</span>
                                <span className="font-medium tracking-wide uppercase truncate max-w-[200px]">{formData.name || 'AD SOYAD'}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase text-gray-300 tracking-wider">SKT</span>
                                <span className="font-mono font-medium">{formData.expiry || 'MM/YY'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Back */}
                    <div className="absolute w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl backface-hidden rotate-y-180 flex flex-col overflow-hidden border border-white/10">
                        <div className="w-full h-12 bg-black mt-6 opacity-80"></div>
                        <div className="px-6 mt-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase text-gray-400 mr-2 mb-1">CVV / CVC</span>
                                <div className="w-full bg-white h-10 rounded flex items-center justify-end px-3 font-mono text-gray-900 tracking-widest">
                                    {formData.cvv || '•••'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto p-6 flex justify-center">
                            <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                        </div>
                    </div>

                </div>
             </div>

             <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">Kart Üzerindeki İsim</label>
                    <input 
                        required
                        type="text" 
                        name="name"
                        placeholder="Ad Soyad"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => setIsFlipped(false)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium placeholder-gray-400"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">Kart Numarası</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        </div>
                        <input 
                            required
                            type="text" 
                            name="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            value={formData.cardNumber}
                            onChange={handleChange}
                            onFocus={() => setIsFlipped(false)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono font-medium placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="flex gap-5">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">SKT (AY/YIL)</label>
                        <input 
                            required
                            type="text" 
                            name="expiry"
                            placeholder="AA/YY"
                            maxLength={5}
                            value={formData.expiry}
                            onChange={handleChange}
                            onFocus={() => setIsFlipped(false)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-center placeholder-gray-400"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">CVV</label>
                        <input 
                            required
                            type="text" 
                            name="cvv"
                            placeholder="123"
                            maxLength={3}
                            value={formData.cvv}
                            onChange={handleChange}
                            onFocus={() => setIsFlipped(true)}
                            onBlur={() => setIsFlipped(false)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-mono font-medium text-center placeholder-gray-400"
                        />
                    </div>
                </div>
             </div>
             </>
          )}

          {paymentMethod === 'transfer' && (
              <div className="mb-6 animate-fade-in">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-4">
                      <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm mr-3">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>
                          </div>
                          <div>
                              <h4 className="font-bold text-indigo-900">Banka Hesap Bilgileri</h4>
                              <p className="text-xs text-indigo-600/80">Lütfen açıklama kısmına Ad Soyad yazınız.</p>
                          </div>
                      </div>
                      
                      <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center group">
                              <div>
                                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Banka</span>
                                  <span className="font-bold text-gray-800">Ziraat Bankası</span>
                              </div>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center group">
                              <div>
                                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Alıcı</span>
                                  <span className="font-bold text-gray-800">Global Tercih A.Ş.</span>
                              </div>
                              <button onClick={() => copyToClipboard('Global Tercih A.Ş.')} className="text-gray-400 hover:text-indigo-600 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-indigo-100 flex justify-between items-center group">
                              <div className="overflow-hidden">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold block">IBAN</span>
                                  <span className="font-mono font-bold text-gray-800 text-sm">TR00 0000 0000 0000 0000 0000 00</span>
                              </div>
                              <button onClick={() => copyToClipboard('TR000000000000000000000000')} className="text-gray-400 hover:text-indigo-600 transition ml-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Terms Checkbox - Shared */}
            <div className="flex items-center mb-6">
                <input 
                    id="terms" 
                    name="termsAccepted"
                    type="checkbox" 
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-xs text-gray-600 cursor-pointer">
                    <span className="font-bold text-indigo-600">Hizmet Şartlarını</span> okudum ve kabul ediyorum.
                </label>
            </div>

            <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                     <div className="flex flex-col">
                         <span className="text-sm font-bold text-gray-900">Toplam Tutar</span>
                         <span className="text-xs text-gray-500">Tek seferlik ödeme</span>
                     </div>
                     <span className="text-3xl font-extrabold text-indigo-900">50,00 ₺</span>
                </div>

                <button 
                    type="submit" 
                    disabled={paymentStatus === 'processing' || !formData.termsAccepted}
                    className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all transform flex justify-center items-center ${
                        paymentStatus === 'processing' || !formData.termsAccepted
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-200 active:scale-95'
                    }`}
                >
                {paymentStatus === 'processing' ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {paymentMethod === 'card' ? 'Ödeme İşleniyor...' : 'Bildirim Gönderiliyor...'}
                    </>
                ) : (
                    paymentMethod === 'card' ? 'Güvenli Ödeme Yap' : 'Ödemeyi Yaptım, Onayla'
                )}
                </button>
            </div>
          </form>
          
          <div className="mt-6 flex items-center justify-center space-x-4 grayscale opacity-60">
             <div className="h-6 w-10 bg-gray-200 rounded animate-pulse"></div>
             <div className="h-6 w-10 bg-gray-200 rounded animate-pulse delay-100"></div>
             <div className="h-6 w-10 bg-gray-200 rounded animate-pulse delay-200"></div>
             <div className="text-[10px] text-gray-400 font-bold flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                SSL 256-bit
             </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default PaymentModal;
