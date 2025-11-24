// Challenge (Timer) Types - מועתק מ-TimrsApp
export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months';

export interface Challenge {
  id: string;
  userId: string; // הוספת userId לקישור למשתמש ב-KC
  name: string;
  startDate: number; // timestamp
  timeUnit: TimeUnit;
  customResetAmount: number; // כמה יחידות להוריד באיפוס מותאם אישית
  currentValue: number; // הערך הנוכחי של האתגר
  lastCalculated: number; // מתי חושב לאחרונה
  
  // קאונטרים לאתגר
  currentStreak: number; // Streak נוכחי - יחידות זמן מאז האיפוס האחרון
  bestStreak: number; // השיא האישי - הכי הרבה יחידות זמן שהצליח להגיע אליהן
  resetCount: number; // כמה פעמים בוצע איפוס חלקי
  lastResetDate: number; // תאריך האיפוס החלקי האחרון
  
  // מטא-דאטה
  createdAt?: string;
  updatedAt?: string;
}

export interface ChallengeFormData {
  name: string;
  timeUnit: TimeUnit;
  customResetAmount: number;
}

export interface GlobalChallengeStats {
  userId: string;
  currentStreak: number; // ימים רצופים בלי איפוס
  bestStreak: number; // השיא הכללי של ימים רצופים
  totalResets: number; // סך כל האיפוסים של כל האתגרים
  lastResetDate: number; // תאריך האיפוס האחרון (של כל אתגר)
  lastCheckDate: number; // תאריך הבדיקה האחרונה (לחישוב ימים)
}

export interface DeletedChallenge extends Challenge {
  deletedAt: number; // תאריך המחיקה
  finalValue: number; // הערך האחרון לפני המחיקה
}

export interface ChallengeResetLog {
  id: string;
  challengeId: string;
  userId: string;
  timestamp: number;
  amountReduced: number;
  reason: string;
  mood: number; // 1-5
  valueBeforeReset: number;
  valueAfterReset: number;
}

export interface ChallengeRecordBreak {
  id: string;
  challengeId: string;
  userId: string;
  timestamp: number;
  oldRecord: number;
  newRecord: number;
  improvement: number; // כמה השיפור (newRecord - oldRecord)
  isGlobalRecord: boolean; // האם זה שיא גלובלי או של אתגר בלבד
  context?: string; // הקשר - למה הצליח לשבור שיא
  reason?: string; // סיבה אופציונלית
}

// Validation constraints
export const ChallengeValidationRules = {
  challenge: {
    nameMinLength: 1,
    nameMaxLength: 50,
    customResetAmountMin: 1,
    customResetAmountMax: 1000000,
  },
  resetLog: {
    reasonMinLength: 1,
    reasonMaxLength: 500,
    moodMin: 1,
    moodMax: 5,
  },
  general: {
    maxChallenges: 100,
    maxResetLogs: 200,
    maxDeletedChallenges: 50,
    maxRecordBreaks: 100,
  },
} as const;


