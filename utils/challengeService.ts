// Challenge Service - מחשבון לוגיקה לאתגרים
// מותאם מ-TimerService של TimrsApp
import { Challenge, TimeUnit, ChallengeRecordBreak } from '../types/challenges';
import { differenceInCalendarMonths, addMonths } from 'date-fns';

export class ChallengeService {
  /**
   * מחשב כמה זמן עבר מאז תאריך ההתחלה
   */
  static calculateElapsedTime(challenge: Challenge): number {
    const now = Date.now();
    const elapsed = now - challenge.startDate;
    
    // ממיר מילישניות ליחידת הזמן המבוקשת
    switch (challenge.timeUnit) {
      case 'seconds':
        return Math.floor(elapsed / 1000);
      case 'minutes':
        return Math.floor(elapsed / (1000 * 60));
      case 'hours':
        return Math.floor(elapsed / (1000 * 60 * 60));
      case 'days':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        // חישוב מדויק של חודשים בעזרת date-fns
        return differenceInCalendarMonths(now, challenge.startDate);
      default:
        return 0;
    }
  }

  /**
   * מעדכן את הערך הנוכחי של האתגר והסטריק הנוכחי
   * מחזיר גם אם נשבר שיא
   */
  static updateChallengeValue(challenge: Challenge): {
    updatedChallenge: Challenge;
    recordBroken: boolean;
  } {
    const newValue = this.calculateElapsedTime(challenge);
    const currentStreak = this.calculateCurrentStreak(challenge);
    
    // בדיקה אם נשבר שיא
    const recordBroken = currentStreak > challenge.bestStreak;
    
    const updatedChallenge = {
      ...challenge,
      currentValue: newValue,
      currentStreak: currentStreak,
      bestStreak: Math.max(challenge.bestStreak, currentStreak), // עדכון שיא אם צריך
      lastCalculated: Date.now(),
    };
    
    return { updatedChallenge, recordBroken };
  }

  /**
   * מחשב את הסטריק הנוכחי - כמה יחידות זמן עברו מאז האיפוס האחרון
   */
  static calculateCurrentStreak(challenge: Challenge): number {
    const referenceDate = challenge.lastResetDate || challenge.startDate;
    const now = Date.now();
    const elapsed = now - referenceDate;
    
    // ממיר מילישניות ליחידת הזמן המבוקשת
    switch (challenge.timeUnit) {
      case 'seconds':
        return Math.floor(elapsed / 1000);
      case 'minutes':
        return Math.floor(elapsed / (1000 * 60));
      case 'hours':
        return Math.floor(elapsed / (1000 * 60 * 60));
      case 'days':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(elapsed / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        // חישוב מדויק של חודשים בעזרת date-fns
        return differenceInCalendarMonths(now, referenceDate);
      default:
        return 0;
    }
  }

  /**
   * מבצע איפוס מלא - מאפס את האתגר לחלוטין (לא משפיע על הקאונטרים)
   */
  static fullReset(challenge: Challenge): Challenge {
    return {
      ...challenge,
      startDate: Date.now(),
      currentValue: 0,
      lastCalculated: Date.now(),
      currentStreak: 0,
    };
  }

  /**
   * מבצע איפוס מותאם אישית - מוריד את הכמות המוגדרת ומעדכן קאונטרים
   * האתגר לא יכול להיות מינוס - אם האיפוס גדול מהערך הנוכחי, האתגר יתאפס ל-0
   * @returns tuple: [updatedChallenge, recordBreak (or null if no record broken)]
   */
  static customReset(challenge: Challenge): {
    challenge: Challenge;
    recordBreak: ChallengeRecordBreak | null;
  } {
    const currentValue = this.calculateElapsedTime(challenge);
    const currentStreak = this.calculateCurrentStreak(challenge);
    
    // בדיקה אם נשבר שיא - משתמשים ב-currentStreak במקום currentValue
    let recordBreak: ChallengeRecordBreak | null = null;
    const newBestStreak = Math.max(challenge.bestStreak, currentStreak);
    
    if (currentStreak > challenge.bestStreak) {
      // נשבר שיא!
      recordBreak = {
        id: '', // יוצר בשרת
        challengeId: challenge.id,
        userId: challenge.userId,
        timestamp: Date.now(),
        oldRecord: challenge.bestStreak,
        newRecord: currentStreak,
        improvement: currentStreak - challenge.bestStreak,
        isGlobalRecord: false,
      };
    }
    
    // אם האיפוס גדול מהערך הנוכחי, מבצעים איפוס מלא
    if (challenge.customResetAmount >= currentValue) {
      const updatedChallenge = {
        ...challenge,
        startDate: Date.now(),
        currentValue: 0,
        lastCalculated: Date.now(),
        currentStreak: 0,
        bestStreak: newBestStreak,
        resetCount: challenge.resetCount + 1,
        lastResetDate: Date.now(),
      };
      return { challenge: updatedChallenge, recordBreak };
    }
    
    // אחרת, מורידים את הכמות המוגדרת
    const newValue = currentValue - challenge.customResetAmount;
    
    // מחשב מתי צריך להיות תאריך ההתחלה החדש
    const unitsToSubtract = challenge.customResetAmount;
    let newStartDate: number;
    
    switch (challenge.timeUnit) {
      case 'seconds':
        newStartDate = challenge.startDate + unitsToSubtract * 1000;
        break;
      case 'minutes':
        newStartDate = challenge.startDate + unitsToSubtract * 1000 * 60;
        break;
      case 'hours':
        newStartDate = challenge.startDate + unitsToSubtract * 1000 * 60 * 60;
        break;
      case 'days':
        newStartDate = challenge.startDate + unitsToSubtract * 1000 * 60 * 60 * 24;
        break;
      case 'weeks':
        newStartDate = challenge.startDate + unitsToSubtract * 1000 * 60 * 60 * 24 * 7;
        break;
      case 'months':
        // חישוב מדויק של חודשים בעזרת date-fns
        newStartDate = addMonths(challenge.startDate, unitsToSubtract).getTime();
        break;
      default:
        newStartDate = challenge.startDate;
    }
    
    const updatedChallenge = {
      ...challenge,
      startDate: newStartDate,
      currentValue: newValue,
      lastCalculated: Date.now(),
      currentStreak: 0, // מתאפס הסטריק הנוכחי
      bestStreak: newBestStreak, // עדכון השיא
      resetCount: challenge.resetCount + 1, // הוספת 1 לספירת האיפוסים
      lastResetDate: Date.now(), // עדכון תאריך האיפוס האחרון
    };
    
    return { challenge: updatedChallenge, recordBreak };
  }

  /**
   * מחזיר את שם יחידת הזמן בעברית
   */
  static getTimeUnitLabel(unit: TimeUnit, value: number): string {
    switch (unit) {
      case 'seconds':
        return value === 1 ? 'שנייה' : 'שניות';
      case 'minutes':
        return value === 1 ? 'דקה' : 'דקות';
      case 'hours':
        return value === 1 ? 'שעה' : 'שעות';
      case 'days':
        return value === 1 ? 'יום' : 'ימים';
      case 'weeks':
        return value === 1 ? 'שבוע' : 'שבועות';
      case 'months':
        return value === 1 ? 'חודש' : 'חודשים';
      default:
        return '';
    }
  }

  /**
   * מחזיר תצוגת זמן חכמה - מוסיף יחידות גדולות יותר כשצריך
   * לדוגמה: 150 שניות -> "2 דקות 30 שניות"
   */
  static getSmartTimeDisplay(value: number, unit: TimeUnit): string {
    // אם היחידה היא ימים או יותר, לא צריך פירוק
    if (unit === 'days' || unit === 'weeks' || unit === 'months') {
      return `${value} ${this.getTimeUnitLabel(unit, value)}`;
    }

    let totalSeconds = 0;

    // ממיר הכל לשניות
    switch (unit) {
      case 'seconds':
        totalSeconds = value;
        break;
      case 'minutes':
        totalSeconds = value * 60;
        break;
      case 'hours':
        totalSeconds = value * 3600;
        break;
      default:
        return `${value} ${this.getTimeUnitLabel(unit, value)}`;
    }

    // אם הערך 0, להציג לפי יחידת הזמן המקורית
    if (totalSeconds === 0) {
      return `${value} ${this.getTimeUnitLabel(unit, value)}`;
    }

    const parts: string[] = [];

    // ימים
    if (totalSeconds >= 86400) {
      const days = Math.floor(totalSeconds / 86400);
      parts.push(`${days} ${this.getTimeUnitLabel('days', days)}`);
      totalSeconds %= 86400;
    }

    // שעות
    if (totalSeconds >= 3600) {
      const hours = Math.floor(totalSeconds / 3600);
      parts.push(`${hours} ${this.getTimeUnitLabel('hours', hours)}`);
      totalSeconds %= 3600;
    }

    // דקות
    if (totalSeconds >= 60) {
      const minutes = Math.floor(totalSeconds / 60);
      parts.push(`${minutes} ${this.getTimeUnitLabel('minutes', minutes)}`);
      totalSeconds %= 60;
    }

    // שניות
    if (totalSeconds > 0) {
      parts.push(`${totalSeconds} ${this.getTimeUnitLabel('seconds', totalSeconds)}`);
    }

    return parts.join(' ');
  }

  /**
   * מחזיר את שם יחידת הזמן בעברית (טופס)
   */
  static getTimeUnitDisplayName(unit: TimeUnit): string {
    switch (unit) {
      case 'seconds':
        return 'שניות';
      case 'minutes':
        return 'דקות';
      case 'hours':
        return 'שעות';
      case 'days':
        return 'ימים';
      case 'weeks':
        return 'שבועות';
      case 'months':
        return 'חודשים';
      default:
        return '';
    }
  }

  /**
   * מחזיר את כמות היחידות זמן שיש ביום אחד
   */
  static getUnitsPerDay(timeUnit: TimeUnit): number {
    switch (timeUnit) {
      case 'seconds':
        return 86400; // 60 * 60 * 24
      case 'minutes':
        return 1440; // 60 * 24
      case 'hours':
        return 24;
      case 'days':
        return 1;
      case 'weeks':
        return 1 / 7; // 0.142857... (שבוע אחד = כמעט שביעית יום)
      case 'months':
        return 1 / 30; // 0.0333... (חודש אחד = כשלושים יום)
      default:
        return 1;
    }
  }
}

