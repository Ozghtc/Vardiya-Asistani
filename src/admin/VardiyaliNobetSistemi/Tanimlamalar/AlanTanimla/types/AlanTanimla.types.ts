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
  start: string;
  end: string;
  days: string[];
  hours: number;
}

export interface AlanTanimlaState {
  alanAdi: string;
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

export interface AlanTanimlaActions {
  setAlanAdi: (value: string) => void;
  setDescription: (value: string) => void;
  setSelectedColor: (value: string) => void;
  setUsedColors: (value: string[]) => void;
  setShowShiftSettings: (value: boolean) => void;
  setShowShiftAddition: (value: boolean) => void;
  setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
  setDailyWorkHours: (value: number) => void;
  setSelectedDays: (value: string[]) => void;
  setDayHours: (value: DayHours) => void;
  setSelectedShift: (value: string) => void;
  setSelectedShiftDays: (value: string[]) => void;
  setIsSaving: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;
  setHasShownCompletionToast: (value: boolean) => void;
}

export type AlanTanimlaHookReturn = AlanTanimlaState & AlanTanimlaActions; 