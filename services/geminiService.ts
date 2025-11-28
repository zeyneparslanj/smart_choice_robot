
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, AiResponse, UniversityReviewData, Recommendation, KpssAnalysisRequest, KpssAnalysisResult, KpssCodeExplanation } from '../types';
import { MODEL_NAME } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SIMPLE CACHING SYSTEM ---
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour Cache

const getFromCache = (key: string) => {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        console.log(`Serving from cache: ${key}`);
        return cached.data;
    }
    return null;
};

const saveToCache = (key: string, data: any) => {
    if (data) {
        cache.set(key, { data, timestamp: Date.now() });
    }
};

// Helper for delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wrapper for API calls with retry logic
const generateContentWithRetry = async (model: string, contents: any, config: any, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model: model,
        contents: contents,
        config: config
      });
    } catch (error: any) {
      const isQuotaError = error.status === 429 || error.code === 429 || error.message?.includes('429') || error.message?.includes('quota');
      
      if (isQuotaError && i < retries - 1) {
        // Exponential backoff: 2s, 4s, 8s
        const delayTime = 2000 * Math.pow(2, i);
        console.warn(`Quota limit hit. Retrying in ${delayTime}ms...`);
        await wait(delayTime);
        continue;
      }
      
      // If it's the last retry or not a quota error, rethrow
      if (i === retries - 1) throw error;
    }
  }
};

export const getRecommendations = async (prefs: UserPreferences): Promise<AiResponse> => {
  // Recommendations are highly personalized, so we might not cache them broadly, 
  // or we could cache based on a hash of preferences if needed. For now, kept dynamic.

  const regionPrompt = prefs.targetRegion === 'GLOBAL' 
    ? "Hem Türkiye'den hem de dünyadan üniversiteler öner." 
    : "Sadece Türkiye'deki üniversiteleri öner.";

  const programFilterPrompt = prefs.programTypes.length > 0 
    ? `Programlar: ${prefs.programTypes.join(', ')}.`
    : "";

  const specialFilterPrompt = [
    prefs.includeNewlyOpened ? "Yeni açılanları ekle." : "",
    prefs.includeUnfilled ? "Dolmamışları ekle." : ""
  ].join(" ");

  const quotaPrompt = prefs.quotaType !== 'Genel Kontenjan' 
    ? `Kontenjan: "${prefs.quotaType}".` 
    : "";
    
  const departmentsPrompt = prefs.preferredDepartments 
    ? `Öncelikli Bölümler: "${prefs.preferredDepartments}".`
    : "";

  const universityPrompt = prefs.specificUniversity
    ? `HEDEF ÜNİVERSİTE: "${prefs.specificUniversity}". Önerilerin çoğu buradan olsun.`
    : "";

  const interestsPrompt = (prefs.interests && prefs.interests.toLowerCase() !== 'farketmez')
    ? `İlgi: ${prefs.interests}`
    : "İlgi: Akademik başarı ve puan odaklı.";

  const prompt = `
    "Tercih Robotu" olarak hareket et.
    
    Profil:
    - Alan: ${prefs.departmentType}
    - Puan: ${prefs.score || 'Yok'}
    - Sıralama: ${prefs.ranking || 'Yok'}
    - Şehir: ${prefs.city || 'Farketmez'}
    - Bölge: ${prefs.targetRegion}
    
    ${interestsPrompt}
    ${universityPrompt}
    ${departmentsPrompt}
    ${programFilterPrompt}
    ${specialFilterPrompt}
    ${quotaPrompt}
    ${regionPrompt}

    GÖREV: Puanına uygun en az 10-15 üniversite/bölüm öner.
    Çıktı JSON olmalı ve Türkçe olmalı.
    
    Kritik:
    - "preferenceCode": Türkiye'deki bölümler için 9 haneli ÖSYM program kodu (Örn: 101110085). Yurt dışı için boş bırak.
    - "campusVibe": Kısa ve öz.
    - "admissionRequirements": Kısa anahtar kelimeler (YKS: X, SAT: Y).
    - "careerStats": Sadece en popüler 3 meslek.
  `;

  try {
    const response = await generateContentWithRetry(MODEL_NAME, prompt, {
        systemInstruction: "Hızlı ve doğru üniversite önerileri sunan bir asistansın.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  university: { type: Type.STRING },
                  department: { type: Type.STRING },
                  city: { type: Type.STRING },
                  country: { type: Type.STRING },
                  locationType: { type: Type.STRING, enum: ['Yurt İçi', 'Yurt Dışı'] },
                  reason: { type: Type.STRING },
                  probability: { type: Type.STRING },
                  minScore: { type: Type.STRING },
                  minRank: { type: Type.STRING },
                  preferenceCode: { type: Type.STRING },
                  pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tuition: { type: Type.STRING },
                  campusVibe: { type: Type.STRING },
                  website: { type: Type.STRING },
                  globalRank: { type: Type.STRING },
                  admissionRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  scholarships: { type: Type.ARRAY, items: { type: Type.STRING } },
                  popularCampusSpots: { type: Type.ARRAY, items: { type: Type.STRING } },
                  careerPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  jobMarketOutlook: { type: Type.STRING },
                  averageSalary: { type: Type.STRING },
                  careerStats: { 
                    type: Type.ARRAY, 
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            salary: { type: Type.STRING },
                            growth: { type: Type.STRING },
                            demandScore: { type: Type.INTEGER }
                        }
                    }
                  }
                }
              }
            },
            advice: { type: Type.STRING }
          }
        }
    });

    if (response.text) {
      return JSON.parse(response.text) as AiResponse;
    }
    throw new Error("Boş yanıt alındı.");
  } catch (error) {
    console.error("Gemini API Hatası:", error);
    throw error;
  }
};

export const getUniversityDetails = async (universityName: string): Promise<Recommendation> => {
  const cacheKey = `details_${universityName.toLowerCase().trim()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const prompt = `
    Analyze university: "${universityName}".
    Generate a JSON profile matching the schema.
    
    GUIDELINES FOR SPEED:
    - Include the ÖSYM Program Code (preferenceCode) if available/applicable for a general department profile.
    - Keep text descriptions CONCISE (max 2 sentences).
    - 'pros'/'cons': List exactly 3 key items each.
    - 'popularCampusSpots': List exactly 4 real names (e.g. "Main Library", "Student Center").
    - 'careerStats': List exactly 3 common career paths with ESTIMATED data.
    - 'department': "Genel Bilgi".
    
    Output strictly valid JSON in Turkish.
  `;

  try {
      const response = await generateContentWithRetry(MODEL_NAME, prompt, {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                university: { type: Type.STRING },
                department: { type: Type.STRING },
                city: { type: Type.STRING },
                country: { type: Type.STRING },
                locationType: { type: Type.STRING, enum: ['Yurt İçi', 'Yurt Dışı'] },
                reason: { type: Type.STRING },
                probability: { type: Type.STRING },
                minScore: { type: Type.STRING },
                minRank: { type: Type.STRING },
                preferenceCode: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                tuition: { type: Type.STRING },
                campusVibe: { type: Type.STRING },
                website: { type: Type.STRING },
                globalRank: { type: Type.STRING },
                admissionRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                scholarships: { type: Type.ARRAY, items: { type: Type.STRING } },
                popularCampusSpots: { type: Type.ARRAY, items: { type: Type.STRING } },
                careerPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
                jobMarketOutlook: { type: Type.STRING },
                averageSalary: { type: Type.STRING },
                careerStats: { 
                type: Type.ARRAY, 
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        salary: { type: Type.STRING },
                        growth: { type: Type.STRING },
                        demandScore: { type: Type.INTEGER }
                    }
                }
                }
            }
        }
      });
      
      if (response.text) {
          const result = JSON.parse(response.text) as Recommendation;
          saveToCache(cacheKey, result); // Save to cache
          return result;
      }
      throw new Error("No data returned");
  } catch (error) {
      console.error("University Detail Fetch Error:", error);
      throw error;
  }
};

export const getUniversityReviews = async (universityName: string): Promise<UniversityReviewData> => {
  const cacheKey = `reviews_${universityName.toLowerCase().trim()}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const prompt = `
    Task: Get student reviews for "${universityName}".
    
    1. Search Google for reviews/forums (Reddit, Quora, Ekşi, Şikayetvar).
    2. Return JSON with 4-5 reviews translated to TURKISH.
    3. Use personas like "Reddit User", "Mezun".
    4. If no specific text found, synthesize general reputation.
    
    JSON Output: { name, website, rating, reviews: [{author, rating, comment}] }
  `;

  try {
    const response = await generateContentWithRetry(MODEL_NAME, prompt, {
        tools: [{ googleSearch: {} }],
    });

    let jsonStr = response.text || "{}";
    
    // Cleanup
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    
    let parsedData: any = {};
    try {
        parsedData = JSON.parse(jsonStr);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        parsedData = { name: universityName, reviews: [] };
    }

    if (!parsedData.reviews || !Array.isArray(parsedData.reviews)) {
        parsedData.reviews = [];
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls: string[] = [];
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        sourceUrls.push(chunk.web.uri);
      }
    });
    const uniqueUrls = Array.from(new Set(sourceUrls));

    const result = {
      name: parsedData.name || universityName,
      website: parsedData.website || "",
      rating: parsedData.rating || 0,
      description: parsedData.description,
      reviews: parsedData.reviews,
      sourceUrls: uniqueUrls
    };

    saveToCache(cacheKey, result); // Save to cache
    return result;

  } catch (error: any) {
    if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error("Sistem şu an çok yoğun. Lütfen 1 dakika bekleyip tekrar deneyin (Kota Aşıldı).");
    }
    console.error("Gemini Reviews Search Error:", error);
    throw error;
  }
};

// --- KPSS ANALİZ SİSTEMİ ---
export const analyzeKpssPerformance = async (req: KpssAnalysisRequest): Promise<KpssAnalysisResult> => {
    const prompt = `
      Sen uzman bir KPSS tercih danışmanısın.
      Kullanıcı Bilgileri:
      - Eğitim Düzeyi: ${req.level}
      - Genel Yetenek Net: ${req.gyNet}
      - Genel Kültür Net: ${req.gkNet}
      ${req.department ? `- Bölüm: ${req.department}` : ''}
  
      GÖREV:
      1. Bu netlerle tahmini bir KPSS puanı hesapla (P3, P93 veya P94). (Yaklaşık formül kullan).
      2. Bu puanla atanabileceği olası 5 devlet kadrosunu (Memurluk, VHKİ vb.) listele.
      3. Atanma şansını 0 ile 100 arasında bir puan olarak ver.
      4. Kadro trendini (puanlar artıyor mu, azalıyor mu) tahmin et.
  
      Çıktı JSON formatında olmalı.
    `;
  
    try {
      const response = await generateContentWithRetry(MODEL_NAME, prompt, {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedScore: { type: Type.STRING },
            scoreType: { type: Type.STRING },
            probabilityScore: { type: Type.INTEGER },
            chanceAnalysis: { type: Type.STRING },
            suitableCadres: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  minScore: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ['artiyor', 'azaliyor', 'sabit'] },
                  description: { type: Type.STRING }
                }
              }
            },
            advice: { type: Type.STRING }
          }
        }
      });
  
      if (response.text) {
        return JSON.parse(response.text) as KpssAnalysisResult;
      }
      throw new Error("KPSS verisi alınamadı.");
    } catch (error) {
      console.error("KPSS Analysis Error:", error);
      throw error;
    }
};

// --- KPSS REVERSE ENGINEERING (NET WIZARD) ---
export const calculateTargetNets = async (level: string, targetScore: number, department: string, strongSubjects: string[] = [], weakSubjects: string[] = []): Promise<string> => {
    const prompt = `
      Sen bir KPSS Strateji Uzmanısın ve "Net Sihirbazı"sın.
      
      Kullanıcı Hedefi:
      - Seviye: ${level}
      - Hedef Puan: ${targetScore}
      - Bölüm/Kadro: ${department || 'Genel Memurluk'}
      ${strongSubjects.length > 0 ? `- Güçlü Olduğu Dersler: ${strongSubjects.join(', ')} (Bu derslerden yüksek net yapabilir)` : ''}
      ${weakSubjects.length > 0 ? `- Zayıf Olduğu Dersler: ${weakSubjects.join(', ')} (Bu derslerden minimum net yaparak hedefi tutturmak istiyor)` : ''}
      
      GÖREV:
      1. Bu puanı almak için gereken EN OLASI ve STRATEJİK Net Kombinasyonunu (GY/GK ve ders ders) hesapla.
      2. KURAL: Kullanıcının zayıf olduğu derslerden net sayısını makul seviyede düşük tut, açığı güçlü olduğu derslerden kapat.
      3. Şu derslerin dağılımını ver: Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık.
      4. Stratejik, motive edici bir reçete yaz.

      Yanıtı şu formatta, şık bir düz metin olarak ver:
      "Hedefin ${targetScore} puan. İşte sana özel reçeten:
      
      🎯 **Genel Strateji**: [Strateji özeti]
      
      📊 **Ders Bazlı Hedeflerin**:
      - 📘 **Türkçe**: X Net
      - 📐 **Matematik**: Y Net
      - 🏛️ **Tarih**: Z Net
      ...
      
      💡 **Tavsiye**: [Tavsiye]"
    `;

    try {
        const response = await generateContentWithRetry(MODEL_NAME, prompt, {
            systemInstruction: "KPSS konusunda uzman, gerçekçi ve motive edici bir rehbersin."
        });
        return response.text || "Hesaplama yapılamadı.";
    } catch (error) {
        console.error("KPSS Reverse Calc Error:", error);
        throw error;
    }
};

// --- KPSS NİTELİK KODU AÇIKLAYICI ---
export const explainKpssCode = async (code: string): Promise<KpssCodeExplanation> => {
    const prompt = `
      KPSS Nitelik Kodu Analizi: "${code}"
      
      1. Bu kodun resmi veya yaygın tanımını yap (Örn: "Bilgisayar Mühendisliği mezunu olmak").
      2. Bu kodla alım yapan yaygın 3-4 kadro/ünvan adını listele (Örn: "Mühendis", "Programcı").
      3. Bu kadrolar için Türkiye'deki yaklaşık memur maaş aralığını tahmin et (Örn: "40.000 - 50.000 TL").
      
      Eğer kod geçersizse veya bulunamazsa tanıma "Bilinmeyen Kod" yaz.
    `;

    try {
        const response = await generateContentWithRetry(MODEL_NAME, prompt, {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    code: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    commonJobs: { type: Type.ARRAY, items: { type: Type.STRING } },
                    estimatedSalaryRange: { type: Type.STRING }
                }
            }
        });
        
        if (response.text) {
            return JSON.parse(response.text) as KpssCodeExplanation;
        }
        throw new Error("Boş veri.");
    } catch (error) {
        console.error("Code Explain Error:", error);
        throw error;
    }
};
