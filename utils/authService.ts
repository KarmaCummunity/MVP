// File overview:
// - Purpose: Thin wrapper around Firebase Auth for email/password flows and verification utilities.
// - Reached from: `LoginScreen` for email flows; occasionally for password reset.
// - Provides: sign up/in, verify email, check verification, sign out, send password reset.
// utils/authService.ts
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
} from 'firebase/auth';

export const getAuthInstance = () => {
  const { app } = getFirebase();
  return getAuth(app);
};

export async function getSignInMethods(email: string): Promise<string[]> {
  const auth = getAuthInstance();
  return fetchSignInMethodsForEmail(auth, email);
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const auth = getAuthInstance();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getAuthInstance();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
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


