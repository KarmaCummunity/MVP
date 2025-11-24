// File overview:
// - Purpose: Thin wrapper around Firebase Auth for email/password flows and verification utilities.
// - Reached from: `LoginScreen` for email flows; occasionally for password reset.
// - Provides: sign up/in, verify email, check verification, sign out, send password reset.
// utils/authService.ts

// TODO: Add comprehensive error handling with proper error types and messages
// TODO: Implement proper authentication state management and persistence
// TODO: Add comprehensive input validation for email and password
// TODO: Implement proper password strength validation
// TODO: Add comprehensive logging and monitoring for all auth operations
// TODO: Implement proper session management and token refresh
// TODO: Add comprehensive security measures (rate limiting, brute force protection)
// TODO: Create proper TypeScript interfaces for all auth-related types
// TODO: Add comprehensive unit tests for all authentication functions
// TODO: Implement proper multi-factor authentication support
import { getFirebase } from './firebaseClient';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  signOut,
  reload,
  User,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
} from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let authInstance: any = null;

export const getAuthInstance = () => {
  if (!authInstance) {
    const { app } = getFirebase();
    authInstance = getAuth(app);
    
    // Configure persistence based on platform
    if (Platform.OS === 'web') {
      // Web: use browserLocalPersistence (localStorage)
      setPersistence(authInstance, browserLocalPersistence).catch((error) => {
        if (typeof __DEV__ !== 'undefined' && __DEV__) {
          // console removed
        }
      });
    } else {
      // React Native: Firebase automatically uses AsyncStorage
      // No need to set persistence explicitly - it's the default
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        // console removed');
      }
    }
  }
  
  return authInstance;
};

export async function getSignInMethods(email: string): Promise<string[]> {
  // Input validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new Error('אימייל לא תקין');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim().toLowerCase())) {
    throw new Error('פורמט אימייל לא תקין');
  }
  
  const auth = getAuthInstance();
  
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email.trim().toLowerCase());
    return methods || [];
  } catch (error: any) {
    // Log error but don't throw - we want to handle this gracefully
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';
    
    console.warn('getSignInMethods failed:', {
      code: errorCode,
      message: errorMessage,
      email: email.substring(0, 3) + '***'
    });
    
    // If it's a domain/auth error, return empty array (we'll try to sign in anyway)
    // This allows users to attempt login even if getSignInMethods fails
    if (errorCode === 'auth/invalid-api-key' || 
        errorCode === 'auth/app-not-authorized' ||
        errorMessage.includes('400') ||
        errorMessage.includes('recaptcha')) {
      console.warn('getSignInMethods: Returning empty array due to auth/config error - will allow login attempt');
      return [];
    }
    
    // For other errors, rethrow
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
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
  
  const auth = getAuthInstance();
  
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return cred.user;
  } catch (error: any) {
    // Log full error details for debugging - expanded
    const errorDetails = {
      code: error?.code,
      message: error?.message,
      email: email.substring(0, 3) + '***',
      errorString: String(error),
      errorKeys: error ? Object.keys(error) : [],
      stack: error?.stack,
      // Try to get more details from Firebase error
      customData: error?.customData,
      serverResponse: error?.serverResponse,
      // Log the full error object
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    };
    console.error('🔥 Firebase signUp error - FULL DETAILS:', errorDetails);
    console.error('🔥 Error object:', error);
    
    // Handle specific Firebase errors with user-friendly messages
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';
    const errorString = String(error || '');
    
    if (errorCode === 'auth/email-already-in-use') {
      throw new Error('אימייל זה כבר רשום במערכת. נסה להתחבר במקום');
    } else if (errorCode === 'auth/invalid-email') {
      throw new Error('אימייל לא תקין');
    } else if (errorCode === 'auth/operation-not-allowed') {
      throw new Error('אימות באמצעות אימייל לא מופעל. אנא פנה לתמיכה');
    } else if (errorCode === 'auth/weak-password') {
      throw new Error('הסיסמה חלשה מדי. אנא בחר סיסמה חזקה יותר');
    } else if (errorCode === 'auth/network-request-failed') {
      throw new Error('בעיית רשת. אנא בדוק את החיבור לאינטרנט');
    } else if (errorCode === 'auth/too-many-requests') {
      throw new Error('יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר');
    } else if (errorCode === 'auth/missing-recaptcha-token' || 
               errorMessage.includes('recaptcha') || 
               errorMessage.includes('reCAPTCHA') ||
               errorString.includes('recaptcha')) {
      throw new Error('נדרש אימות reCAPTCHA. אנא רענן את הדף ונסה שוב. אם הבעיה נמשכת, בדוק ב-Firebase Console שהאימות מופעל');
    } else if (errorMessage.includes('400') || 
               errorCode.includes('400') ||
               errorString.includes('400')) {
      // More detailed 400 error message
      const detailedMsg = errorMessage || errorString;
      throw new Error(`בקשה לא תקינה (400). ${detailedMsg.includes('recaptcha') ? 'נדרש אימות reCAPTCHA.' : ''} אנא בדוק את פרטי ההתחברות או רענן את הדף`);
    } else if (errorCode === 'auth/invalid-api-key') {
      throw new Error('מפתח API לא תקין. אנא פנה לתמיכה');
    } else if (errorCode === 'auth/app-not-authorized') {
      throw new Error('האפליקציה לא מורשית. אנא פנה לתמיכה');
    }
    
    // Generic error fallback - include original error message
    const userMessage = errorMessage || errorString || 'שגיאה בהרשמה';
    throw new Error(`${userMessage}. אנא נסה שוב או פנה לתמיכה`);
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
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
  
  const auth = getAuthInstance();
  
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    return cred.user;
  } catch (error: any) {
    // Log full error details for debugging - expanded
    const errorDetails = {
      code: error?.code,
      message: error?.message,
      email: email.substring(0, 3) + '***',
      errorString: String(error),
      errorKeys: error ? Object.keys(error) : [],
      stack: error?.stack,
      // Try to get more details from Firebase error
      customData: error?.customData,
      serverResponse: error?.serverResponse,
      // Log the full error object
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    };
    console.error('🔥 Firebase signIn error - FULL DETAILS:', errorDetails);
    console.error('🔥 Error object:', error);
    
    // Handle specific Firebase errors with user-friendly messages
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';
    const errorString = String(error || '');
    
    if (errorCode === 'auth/user-not-found') {
      throw new Error('אימייל זה לא רשום במערכת');
    } else if (errorCode === 'auth/wrong-password') {
      throw new Error('סיסמה שגויה');
    } else if (errorCode === 'auth/invalid-credential') {
      // This error can mean wrong password OR user doesn't exist in Firebase Auth
      // The calling code should check the database to provide more specific error
      throw new Error('פרטי התחברות שגויים. אם המייל קיים במערכת, ייתכן שיש בעיית סנכרון - אנא נסה איפוס סיסמה או פנה לתמיכה');
    } else if (errorCode === 'auth/invalid-email') {
      throw new Error('אימייל לא תקין');
    } else if (errorCode === 'auth/user-disabled') {
      throw new Error('חשבון זה הושבת. אנא פנה לתמיכה');
    } else if (errorCode === 'auth/network-request-failed') {
      throw new Error('בעיית רשת. אנא בדוק את החיבור לאינטרנט');
    } else if (errorCode === 'auth/too-many-requests') {
      throw new Error('יותר מדי ניסיונות. אנא נסה שוב מאוחר יותר');
    } else if (errorCode === 'auth/missing-recaptcha-token' || 
               errorMessage.includes('recaptcha') || 
               errorMessage.includes('reCAPTCHA') ||
               errorString.includes('recaptcha')) {
      throw new Error('נדרש אימות reCAPTCHA. אנא רענן את הדף ונסה שוב. אם הבעיה נמשכת, בדוק ב-Firebase Console שהאימות מופעל');
    } else if (errorMessage.includes('400') || 
               errorCode.includes('400') ||
               errorString.includes('400')) {
      // More detailed 400 error message
      const detailedMsg = errorMessage || errorString;
      throw new Error(`בקשה לא תקינה (400). ${detailedMsg.includes('recaptcha') ? 'נדרש אימות reCAPTCHA.' : ''} אנא בדוק את פרטי ההתחברות או רענן את הדף`);
    } else if (errorCode === 'auth/invalid-api-key') {
      throw new Error('מפתח API לא תקין. אנא פנה לתמיכה');
    } else if (errorCode === 'auth/app-not-authorized') {
      throw new Error('האפליקציה לא מורשית. אנא פנה לתמיכה');
    }
    
    // Generic error fallback - include original error message
    const userMessage = errorMessage || errorString || 'שגיאה בהתחברות';
    throw new Error(`${userMessage}. אנא נסה שוב או פנה לתמיכה`);
  }
}

export async function sendVerification(user?: User): Promise<void> {
  const auth = getAuthInstance();
  const u = user || auth.currentUser;
  if (!u) throw new Error('No current user');
  await sendEmailVerification(u);
}

export async function isEmailVerified(): Promise<boolean> {
  const auth = getAuthInstance();
  const u = auth.currentUser;
  if (!u) return false;
  await reload(u);
  return !!u.emailVerified;
}

export async function signOutFirebase(): Promise<void> {
  const auth = getAuthInstance();
  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getAuthInstance();
  await sendPasswordResetEmail(auth, email);
}


