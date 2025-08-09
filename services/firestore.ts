import { getFirebase } from './firebase';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  karmaPoints?: number;
  joinDate: string;
  lastActive: string;
  location?: { city?: string; country?: string };
  interests?: string[];
  roles?: string[];
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  settings?: { language?: string; darkMode?: boolean; notificationsEnabled?: boolean };
  pushToken?: string | null;
};

// Lazy get Firestore modules
const importFirestore = async () => {
  const { app } = await getFirebase();
  if (!app) return null as any;
  const mod: any = await (new Function("return import('firebase/firestore')"))();
  const db = mod.getFirestore(app);
  return { db, mod };
};

export const getUserDocRef = async (uid: string) => {
  const f = await importFirestore();
  if (!f) return null as any;
  const { db, mod } = f;
  return mod.doc(db, 'users', uid);
};

export const createOrMergeUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<UserProfile | null> => {
  const f = await importFirestore();
  if (!f) return null;
  const { db, mod } = f;
  const ref = mod.doc(db, 'users', uid);
  const now = new Date().toISOString();
  const payload: Partial<UserProfile> = {
    id: uid,
    lastActive: now,
    joinDate: data.joinDate || now,
    ...data,
  };
  await mod.setDoc(ref, payload, { merge: true });
  const snap = await mod.getDoc(ref);
  return (snap.exists() ? (snap.data() as UserProfile) : (payload as UserProfile));
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const f = await importFirestore();
  if (!f) return null;
  const { db, mod } = f;
  const ref = mod.doc(db, 'users', uid);
  const snap = await mod.getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const f = await importFirestore();
  if (!f) return;
  const { db, mod } = f;
  const ref = mod.doc(db, 'users', uid);
  await mod.setDoc(ref, data, { merge: true });
};

export const saveUserNotification = async (uid: string, notificationId: string, data: any): Promise<void> => {
  const f = await importFirestore();
  if (!f) return;
  const { db, mod } = f;
  const ref = mod.doc(db, 'users', uid, 'notifications', notificationId);
  await mod.setDoc(ref, data, { merge: true });
};

export const listUserNotifications = async (uid: string): Promise<any[]> => {
  const f = await importFirestore();
  if (!f) return [];
  const { db, mod } = f;
  const q = mod.query(mod.collection(db, 'users', uid, 'notifications'));
  const snap = await mod.getDocs(q);
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
};

export const markNotificationRead = async (uid: string, notificationId: string): Promise<void> => {
  const f = await importFirestore();
  if (!f) return;
  const { db, mod } = f;
  const ref = mod.doc(db, 'users', uid, 'notifications', notificationId);
  await mod.setDoc(ref, { read: true }, { merge: true });
};

export const deleteUserNotification = async (uid: string, notificationId: string): Promise<void> => {
  const f = await importFirestore();
  if (!f) return;
  const { db, mod } = f;
  const ref = mod.doc(db, 'users', uid, 'notifications', notificationId);
  await mod.deleteDoc(ref);
};

export const deleteUserAccountData = async (uid: string): Promise<void> => {
  const f = await importFirestore();
  if (!f) return;
  const { db, mod } = f;
  // Delete notifications subcollection best-effort (limited for MVP)
  const notifCol = mod.collection(db, 'users', uid, 'notifications');
  const notifSnap = await mod.getDocs(notifCol);
  const batch = mod.writeBatch(db);
  notifSnap.forEach((doc: any) => batch.delete(doc.ref));
  await batch.commit();
  // Delete user doc
  await mod.deleteDoc(mod.doc(db, 'users', uid));
};


