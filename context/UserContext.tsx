import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirebase } from '../services/firebase';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  karmaPoints: number;
  joinDate: string;
  isActive: boolean;
  lastActive: string;
  location: { city: string; country: string };
  interests: string[];
  roles: string[];
  postsCount: number;
  followersCount: number;
  followingCount: number;
  notifications: Array<{ type: string; text: string; date: string }>;
  settings: { language: string; darkMode: boolean; notificationsEnabled: boolean };
}

interface UserContextType {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => Promise<void>;
  isUserSelected: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  setGuestMode: () => Promise<void>;
  setDemoUser: () => Promise<void>;
  resetHomeScreen: () => void;
  resetHomeScreenTrigger: number;
  signInWithGoogle?: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [selectedUser, setSelectedUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [resetHomeScreenTrigger, setResetHomeScreenTrigger] = useState(0);

  // Check authentication status on app start
  useEffect(() => {
    console.log('🔐 UserContext - useEffect - bind Firebase auth listener');
    setIsLoading(true);
    let unsubscribe: any = null;
    (async () => {
      const { auth } = await getFirebase();
      if (!auth) {
        // Firebase not available yet → fallback to local check
        await checkAuthStatus();
        setIsLoading(false);
        return;
      }
      const firebaseAuth = await import('firebase/auth');
      unsubscribe = firebaseAuth.onAuthStateChanged(auth, async (firebaseUser: any) => {
      try {
        if (firebaseUser) {
          const user: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'משתמש',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '',
            avatar: firebaseUser.photoURL || '',
            bio: '',
            karmaPoints: 0,
            joinDate: new Date().toISOString(),
            isActive: true,
            lastActive: new Date().toISOString(),
            location: { city: '', country: 'IL' },
            interests: [],
            roles: ['user'],
            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
            notifications: [],
            settings: { language: 'he', darkMode: false, notificationsEnabled: true },
          };
          await AsyncStorage.setItem('current_user', JSON.stringify(user));
          setSelectedUserState(user);
          setIsAuthenticated(true);
          setIsGuestMode(false);
        } else {
          // fall back to local stored (guest or prev session)
          await checkAuthStatus();
        }
      } finally {
        setIsLoading(false);
      }
      });
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔐 UserContext - checkAuthStatus - Starting auth check');
      setIsLoading(true);
      
      // Check AsyncStorage for stored user and guest mode
      const storedUserData = await AsyncStorage.getItem('current_user');
      const guestModeData = await AsyncStorage.getItem('guest_mode');
      
      console.log('🔐 UserContext - checkAuthStatus - storedUserData:', storedUserData ? 'exists' : 'null');
      console.log('🔐 UserContext - checkAuthStatus - guestModeData:', guestModeData);
      
      if (guestModeData === 'true') {
        // מצב אורח פעיל
        console.log('🔐 UserContext - checkAuthStatus - Setting guest mode');
        setIsGuestMode(true);
        setIsAuthenticated(true);
        setSelectedUserState(null);
      } else if (storedUserData) {
        try {
          const user = JSON.parse(storedUserData);
          console.log('🔐 UserContext - checkAuthStatus - Parsed user:', user?.name || 'invalid');
          if (user && user.id && user.name) {
            console.log('🔐 UserContext - checkAuthStatus - Setting authenticated user');
            setSelectedUserState(user);
            setIsAuthenticated(true);
            setIsGuestMode(false);
          } else {
            console.log('🔐 UserContext - checkAuthStatus - Invalid user data, removing');
            await AsyncStorage.removeItem('current_user');
            setIsAuthenticated(false);
            setIsGuestMode(false);
          }
        } catch (parseError) {
          console.log('🔐 UserContext - checkAuthStatus - Parse error, removing user data');
          await AsyncStorage.removeItem('current_user');
          setIsAuthenticated(false);
          setIsGuestMode(false);
        }
      } else {
        console.log('🔐 UserContext - checkAuthStatus - No stored data, setting unauthenticated');
        setIsAuthenticated(false);
        setIsGuestMode(false);
      }
    } catch (error) {
      console.error('🔐 UserContext - checkAuthStatus - Error:', error);
      setIsAuthenticated(false);
      setIsGuestMode(false);
    } finally {
      console.log('🔐 UserContext - checkAuthStatus - Auth check completed');
      setIsLoading(false);
    }
  };

  const setSelectedUser = async (user: User | null) => {
    try {
      console.log('🔐 UserContext - setSelectedUser:', user?.name || 'null');
      if (user) {
        await AsyncStorage.setItem('current_user', JSON.stringify(user));
        await AsyncStorage.removeItem('guest_mode');
        setSelectedUserState(user);
        setIsAuthenticated(true);
        setIsGuestMode(false);
      } else {
        await AsyncStorage.removeItem('current_user');
        setSelectedUserState(null);
        setIsAuthenticated(false);
        setIsGuestMode(false);
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
      setSelectedUserState(user);
      setIsAuthenticated(user !== null);
      setIsGuestMode(false);
    }
  };

  /**
   * פונקציית יציאה מהמערכת
   * מוחקת את כל הנתונים המאוחסנים ומאפסת את מצב המשתמש
   * עובדת גם למצב אורח וגם למשתמש מחובר
   */
  const signOut = async () => {
    try {
      console.log('🔐 UserContext - signOut - Starting sign out process');
      setIsLoading(true);
      try {
        const { auth } = await getFirebase();
        if (auth) {
          const firebaseAuth = await import('firebase/auth');
          await firebaseAuth.signOut(auth);
        }
      } catch (e) {
        // ignore if not signed in
      }
      
      // מחיקת נתוני המשתמש מ-AsyncStorage
      console.log('🔐 UserContext - signOut - Removing current_user from AsyncStorage');
      await AsyncStorage.removeItem('current_user');
      
      console.log('🔐 UserContext - signOut - Removing guest_mode from AsyncStorage');
      await AsyncStorage.removeItem('guest_mode');
      
      // בדיקה שהנתונים נמחקו בהצלחה
      const checkUser = await AsyncStorage.getItem('current_user');
      const checkGuest = await AsyncStorage.getItem('guest_mode');
      console.log('🔐 UserContext - signOut - After removal check - current_user:', checkUser ? 'still exists' : 'removed');
      console.log('🔐 UserContext - signOut - After removal check - guest_mode:', checkGuest ? 'still exists' : 'removed');
      
      // איפוס מצב המשתמש
      console.log('🔐 UserContext - signOut - Setting user state to null');
      setSelectedUserState(null);
      
      console.log('🔐 UserContext - signOut - Setting isAuthenticated to false');
      setIsAuthenticated(false);
      
      console.log('🔐 UserContext - signOut - Setting isGuestMode to false');
      setIsGuestMode(false);
      
      console.log('🔐 UserContext - signOut - Sign out completed successfully');
    } catch (error) {
      console.error('🔐 UserContext - signOut - Error during sign out:', error);
      // גם במקרה של שגיאה - מאפס את המצב
      setSelectedUserState(null);
      setIsAuthenticated(false);
      setIsGuestMode(false);
    } finally {
      console.log('🔐 UserContext - signOut - Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const setGuestMode = async () => {
    try {
      console.log('🔐 UserContext - setGuestMode');
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.setItem('guest_mode', 'true');
      setSelectedUserState(null);
      setIsAuthenticated(true);
      setIsGuestMode(true);
    } catch (error) {
      console.error('Error setting guest mode:', error);
      setSelectedUserState(null);
      setIsAuthenticated(true);
      setIsGuestMode(true);
    }
  };

  const setDemoUser = async () => {
    const { characterTypes } = require('../globals/characterTypes');
    if (characterTypes.length > 0) {
      const randomIndex = Math.floor(Math.random() * characterTypes.length);
      const demoCharacter = characterTypes[randomIndex];
      
      const demoUser: User = {
        id: demoCharacter.id,
        name: demoCharacter.name,
        email: `${demoCharacter.id}@karmacommunity.com`,
        phone: '+972501234567',
        avatar: demoCharacter.avatar,
        bio: demoCharacter.bio,
        karmaPoints: demoCharacter.karmaPoints,
        joinDate: demoCharacter.joinDate,
        isActive: true,
        lastActive: new Date().toISOString(),
        location: demoCharacter.location,
        interests: demoCharacter.interests,
        roles: demoCharacter.roles,
        postsCount: demoCharacter.postsCount,
        followersCount: demoCharacter.followersCount,
        followingCount: demoCharacter.followingCount,
        notifications: [
          { type: 'system', text: 'ברוך הבא!', date: new Date().toISOString() },
        ],
        settings: demoCharacter.preferences,
      };
      
      await setSelectedUser(demoUser);
      console.log('Demo user set successfully', { userId: demoUser.id });
    }
  };

  const resetHomeScreen = () => {
    console.log('🏠 UserContext - resetHomeScreen called');
    setResetHomeScreenTrigger(prev => prev + 1);
  };

  const value: UserContextType = {
    selectedUser,
    setSelectedUser,
    isUserSelected: selectedUser !== null,
    isLoading,
    signOut,
    isAuthenticated,
    isGuestMode,
    setGuestMode,
    setDemoUser,
    resetHomeScreen,
    resetHomeScreenTrigger,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export type { User }; 