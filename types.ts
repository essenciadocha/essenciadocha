
export type ThemeType = 'morning' | 'afternoon' | 'night';
export type CategoryType = 'all' | 'weight' | 'relax' | 'digestion' | 'debloat';
export type Language = 'pt-BR' | 'pt-PT' | 'es' | 'en';
export type ColorMode = 'light' | 'dark' | 'system';

export interface Recipe {
  id: string;
  name: string;
  benefit: string;
  time: string;
  color: string;
  accentColor: string;
  ingredients: string[];
  instructions: string[];
  icon: 'leaf' | 'cup' | 'flower' | 'sparkles' | 'droplets';
  category: 'weight' | 'relax' | 'digestion' | 'debloat';
  cycleDays: number;
  dosesPerDay: number;
  usage: string;
}

export interface UserProgress {
  teaCount: number;
  lastTeaDate: string | null;
  history: string[]; 
  favorites: string[];
  streak: number;
  dailyDoses: Record<string, number>;
  weeklyCheckins: boolean[];
  cycleStartDates: Record<string, string>;
  language?: Language;
}
