export interface Area {
  id: string;
  name: string;
  color: string;
  description: string;
  dailyHours: number;
  activeDays: string[];
  dayHours: DayHours;
  shifts: Shift[];
}

export interface DayHours {
  [key: string]: number;
}

export interface Shift {
  id: string;
  name: string;
  hours: string;
  duration: number;
  days: string[];
}

export interface AlanTanimlaState {
  name: string;
  description: string;
  selectedColor: string;
  usedColors: string[];
  showShiftSettings: boolean;
  showShiftAddition: boolean;
  areas: Area[];
  dailyWorkHours: number;
  selectedDays: string[];
  dayHours: DayHours;
  selectedShift: string;
  selectedShiftDays: string[];
  isSaving: boolean;
  isProcessing: boolean;
  hasShownCompletionToast: boolean;
} 