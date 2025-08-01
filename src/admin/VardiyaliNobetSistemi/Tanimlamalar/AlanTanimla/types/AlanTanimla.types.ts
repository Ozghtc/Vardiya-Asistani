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

export interface WeekDay {
  value: string;
  name: string;
  short: string;
}

export interface VardiyaConfig {
  name: string;
  hours: string;
  duration: number;
}

// State Management Types
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

// Hook Return Types
export interface AlanTanimlaActions {
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setDescription: (description: string) => void;
  setSelectedColor: (color: string) => void;
  setShowShiftSettings: (show: boolean) => void;
  setShowShiftAddition: (show: boolean) => void;
  setDailyWorkHours: (hours: number) => void;
  setSelectedDays: (days: string[]) => void;
  setDayHours: (dayHours: DayHours) => void;
  setSelectedShift: (shift: string) => void;
  setSelectedShiftDays: (days: string[]) => void;
  setIsSaving: (saving: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  setHasShownCompletionToast: (shown: boolean) => void;
  setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
}

export interface AlanOperations {
  handleAddArea: () => void;
  handleAddShiftSettings: () => void;
  handleAddShift: () => void;
  handleSaveToDatabase: () => Promise<void>;
}

export interface StepNavigation {
  currentStep: 'form' | 'settings' | 'shifts';
  canProceedToSettings: boolean;
  canProceedToShifts: boolean;
  allDaysCompleted: boolean;
}

// Component Props Types
export interface RenkSeciciProps {
  selectedColor: string;
  usedColors: string[];
  isProcessing: boolean;
  onColorSelect: (color: string) => void;
}

export interface GunSeciciProps {
  selectedDays: string[];
  dayHours: DayHours;
  dailyWorkHours: number;
  isProcessing: boolean;
  onToggleDay: (day: string) => void;
  onToggleAllDays: () => void;
  onUpdateDayHour: (day: string, hours: number) => void;
  onUpdateAllDaysHours: () => void;
  onSetDailyWorkHours: (hours: number) => void;
}

export interface AlanOnizlemeProps {
  areas: Area[];
  showShiftAddition: boolean;
  selectedDays: string[];
  onGetAddedHoursForDay: (day: string) => number;
  onGetRemainingHoursForDay: (day: string) => number;
  onGetShiftsForDay: (day: string) => Shift[];
  onGetWeeklyTotalHours: () => number;
}

export interface AlanBilgileriFormuProps {
  name: string;
  description: string;
  selectedColor: string;
  usedColors: string[];
  isProcessing: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onColorSelect: (color: string) => void;
  onSubmit: () => void;
}

export interface MesaiAyarlariFormuProps {
  areas: Area[];
  selectedDays: string[];
  dayHours: DayHours;
  dailyWorkHours: number;
  isProcessing: boolean;
  showShiftAddition: boolean;
  onToggleDay: (day: string) => void;
  onToggleAllDays: () => void;
  onUpdateDayHour: (day: string, hours: number) => void;
  onUpdateAllDaysHours: () => void;
  onSetDailyWorkHours: (hours: number) => void;
  onSubmit: () => void;
  onGetAddedHoursForDay: (day: string) => number;
  onGetRemainingHoursForDay: (day: string) => number;
  onGetShiftsForDay: (day: string) => Shift[];
  onGetWeeklyTotalHours: () => number;
}

export interface VardiyaEklemeFormuProps {
  areas: Area[];
  selectedDays: string[];
  selectedShift: string;
  selectedShiftDays: string[];
  isProcessing: boolean;
  isSaving: boolean;
  allDaysCompleted: boolean;
  onSetSelectedShift: (shift: string) => void;
  onToggleShiftDay: (day: string) => void;
  onAddShift: () => void;
  onSaveToDatabase: () => Promise<void>;
  onGetRemainingHoursForDay: (day: string) => number;
  onGetUnaddedDays: () => string[];
}

// API Types
export interface CurrentUser {
  id?: string | number;
  kurum_id?: string;
  departman_id?: string;
  birim_id?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
} 