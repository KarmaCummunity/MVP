// File overview:
// - Purpose: Custom authentication service using database-backed email/password authentication
// - Reached from: LoginScreenNew and EmailLoginForm for email/password flows
// - Provides: register, login, checkEmail - all using database instead of Firebase Auth
// - Security: Passwords are hashed server-side with Argon2, never sent in logs

import { restAdapter } from './restAdapter';

export interface CustomUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  karmaPoints?: number;
  joinDate?: string;
  isActive?: boolean;
  lastActive?: string;
  location?: { city: string; country: string };
  interests?: string[];
  roles?: string[];
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  notifications?: any[];
  settings?: {
    language: string;
    darkMode: boolean;
    notificationsEnabled: boolean;
  };
}

/**
 * Register a new user with email and password
 * Password is hashed server-side with Argon2
 * 
 * @param email - User email address
 * @param password - User password (will be hashed server-side)
 * @param name - Optional user name
 * @returns User data on success
 * @throws Error with Hebrew message on failure
 */
export async function registerWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<CustomUser> {
  // Input validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new Error('אימייל לא תקין');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim().toLowerCase())) {
    throw new Error('פורמט אימייל לא תקין');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new Error('סיסמה חייבת להכיל לפחות 6 תווים');
  }

  try {
    const result = await restAdapter.register(
      email.trim().toLowerCase(),
      password,
      name
    );

    if (result.error) {
      // Handle specific error messages
      if (result.error.includes('already registered') || result.error.includes('already exists')) {
        throw new Error('אימייל זה כבר רשום במערכת');
      }
      throw new Error(result.error);
    }

    if (!result.user) {
      throw new Error('הרישום נכשל. אנא נסה שוב');
    }

    return result.user as CustomUser;
  } catch (error: any) {
    // If it's already our custom error, re-throw it
    if (error.message && (error.message.includes('אימייל') || error.message.includes('סיסמה'))) {
      throw error;
    }

    // Handle HTTP errors
    if (error.message && error.message.includes('HTTP')) {
      if (error.message.includes('400')) {
        throw new Error('פרטי הרישום לא תקינים. אנא בדוק את המייל והסיסמה');
      }
      if (error.message.includes('429')) {
        throw new Error('יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר');
      }
      if (error.message.includes('500')) {
        throw new Error('שגיאת שרת. אנא נסה שוב מאוחר יותר');
      }
    }

    // Generic error
    const errorMessage = error?.message || 'שגיאה ברישום';
    throw new Error(`${errorMessage}. אנא נסה שוב או פנה לתמיכה`);
  }
}

/**
 * Login with email and password
 * Password is verified server-side against Argon2 hash
 * 
 * @param email - User email address
 * @param password - User password
 * @returns User data on success
 * @throws Error with Hebrew message on failure
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<CustomUser> {
  // Input validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new Error('אימייל לא תקין');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim().toLowerCase())) {
    throw new Error('פורמט אימייל לא תקין');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    throw new Error('נא להזין סיסמה');
  }

  try {
    const result = await restAdapter.login(
      email.trim().toLowerCase(),
      password
    );

    if (result.error) {
      // Handle specific error messages
      if (result.error.includes('Invalid email or password') || result.error.includes('invalid')) {
        throw new Error('אימייל או סיסמה שגויים');
      }
      if (result.error.includes('cannot login with password')) {
        throw new Error('חשבון זה לא יכול להתחבר עם סיסמה. אנא פנה לתמיכה');
      }
      throw new Error(result.error);
    }

    if (!result.user) {
      throw new Error('ההתחברות נכשלה. אנא נסה שוב');
    }

    return result.user as CustomUser;
  } catch (error: any) {
    // If it's already our custom error, re-throw it
    if (error.message && (error.message.includes('אימייל') || error.message.includes('סיסמה'))) {
      throw error;
    }

    // Handle HTTP errors
    if (error.message && error.message.includes('HTTP')) {
      if (error.message.includes('400')) {
        throw new Error('פרטי ההתחברות לא תקינים. אנא בדוק את המייל והסיסמה');
      }
      if (error.message.includes('429')) {
        throw new Error('יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר');
      }
      if (error.message.includes('500')) {
        throw new Error('שגיאת שרת. אנא נסה שוב מאוחר יותר');
      }
    }

    // Generic error
    const errorMessage = error?.message || 'שגיאה בהתחברות';
    throw new Error(`${errorMessage}. אנא נסה שוב או פנה לתמיכה`);
  }
}

/**
 * Check if an email is registered in the system
 * 
 * @param email - Email address to check
 * @returns true if email exists, false otherwise
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim().toLowerCase())) {
    return false;
  }

  try {
    const result = await restAdapter.checkEmail(email.trim().toLowerCase());
    return result?.exists === true;
  } catch (error) {
    console.warn('Error checking email:', error);
    return false;
  }
}

