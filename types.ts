
export interface UserPreferences {
  score: string;
  ranking: string;
  interests: string;
  city: string;
  preferredDepartments: string; // New field for specific department filtering
  specificUniversity: string; // New field for filtering by a specific university
  departmentType: string;
  targetRegion: 'TR' | 'GLOBAL'; // Turkey only or Global
  
  // New Filtering Options
  programTypes: string[]; // List of selected program types
  includeNewlyOpened: boolean;
  includeUnfilled: boolean;
  quotaType: string;
}

export interface StudentReview {
  author: string;
  comment: string;
  rating: number; // 1-5 scale
}

export interface CareerStat {
  title: string;
  salary: string; // e.g. "45.000 TL"
  growth: string; // e.g. "Yüksek"
  demandScore: number; // New: 0-100 score representing market demand/trend
}

export interface Recommendation {
  university: string;
  department: string;
  city: string;
  country: string; // New: Country
  locationType: 'Yurt İçi' | 'Yurt Dışı';
  reason: string;
  probability: string;
  pros: string[];
  cons: string[];
  // Detailed fields for the immersive view
  tuition: string; // Estimated cost
  campusVibe: string; // Description of atmosphere
  website: string;
  globalRank: string; // Approx ranking
  
  preferenceCode?: string; // New: OSYM Preference Code (e.g., 101110085)

  // New fields for sorting and display
  minScore?: string; // Taban Puan
  minRank?: string; // Başarı Sıralaması

  admissionRequirements: string[]; // New: Exam scores, GPA etc.
  scholarships: string[]; // New: Financial aid info
  studentReviews?: StudentReview[]; // New: Student testimonials (optional)
  popularCampusSpots?: string[];
  // Career & Future
  careerPaths?: string[]; 
  jobMarketOutlook?: string;
  averageSalary?: string;
  careerStats?: CareerStat[]; // New: Structured data for charts
}

export interface AiResponse {
  recommendations: Recommendation[];
  advice: string;
}

export interface UniversityReviewData {
  name: string;
  rating: number;
  description?: string; // Brief about text
  website?: string; // Official URL
  reviews: StudentReview[];
  sourceUrls: string[];
}

// KPSS Types
export interface KpssAnalysisRequest {
  level: 'Lisans' | 'Ön Lisans' | 'Ortaöğretim';
  gkNet: number;
  gyNet: number;
  department?: string; // Mezun olunan bölüm
}

export interface KpssAnalysisResult {
  estimatedScore: string;
  scoreType: string; // P3, P93, P94
  probabilityScore: number; // 0-100 score for visualization
  chanceAnalysis: string;
  suitableCadres: {
    title: string;
    minScore: string; // Taban puan
    trend: 'artiyor' | 'azaliyor' | 'sabit'; // Trend direction
    description: string;
  }[];
  advice: string;
  estimatedSalary?: number; // New: Estimated Salary for counter
}

export interface KpssCodeExplanation {
  code: string;
  definition: string;
  commonJobs: string[];
  estimatedSalaryRange: string;
}

// New Types for Killer Features
export interface CityScore {
  id: string;
  name: string;
  minScore: number;
  region: string;
}

export interface PomodoroState {
  isActive: boolean;
  timeLeft: number; // seconds
  mode: 'focus' | 'break';
  sessionsCompleted: number;
}

// Trend Chart Types
export interface TrendPoint {
  period: string; // e.g., "2022/1"
  score: number;
}

export interface JobTrend {
  title: string;
  data: TrendPoint[];
}