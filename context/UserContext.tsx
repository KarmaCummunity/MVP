// File overview:
// - Purpose: Global user/session context managing auth mode (guest/demo/real), selected user, and auth persistence.
// - Reached from: Wrapped around the app in `App.tsx`; consumed via `useUser()` in many screens.
// - Provides: Methods to set user with mode, sign out, toggle guest/demo, and resetHomeScreen trigger.
// - Storage: Persists `current_user`, `guest_mode`, and `auth_mode` in AsyncStorage; clears local collections on real auth.

// TODO: CRITICAL - This context is doing too much. Split into multiple contexts:
//   - AuthContext for authentication state
//   - UserProfileContext for user data
//   - AppStateContext for app-level state
// TODO: Add proper error handling and recovery mechanisms
// TODO: Implement proper TypeScript strict typing - remove any types
// TODO: Add comprehensive state validation and sanitization
// TODO: Remove hardcoded user data and implement proper user fetching
// TODO: Add proper loading states for all async operations
// TODO: Implement proper storage encryption for sensitive data
// TODO: Add unit tests for all context methods and state changes
// TODO: Remove console.log statements and use proper logging service
// TODO: Add proper memory management and cleanup for subscriptions
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '../utils/databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirebase } from '../utils/firebaseClient';

// Auth mode of the current session
export type AuthMode = 'guest' | 'demo' | 'real';
// Simplified role model for the app
export type Role = 'guest' | 'user' | 'admin';

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
  // Optional org enrichment
  orgApplicationId?: string;
  orgName?: string;
}

interface UserContextType {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => Promise<void>;
  setSelectedUserWithMode: (user: User | null, mode: AuthMode) => Promise<void>;
  // New simplified API
  role: Role;
  setCurrentPrincipal: (principal: { user: User | null; role: Role }) => Promise<void>;
  isUserSelected: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  isRealAuth: boolean;
  isAdmin: boolean;
  setGuestMode: () => Promise<void>;
  setDemoUser: () => Promise<void>;
  resetHomeScreen: () => void;
  resetHomeScreenTrigger: number;
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
  const [authMode, setAuthMode] = useState<AuthMode>('guest');
  const [resetHomeScreenTrigger, setResetHomeScreenTrigger] = useState(0);

  // Check authentication status on app start (run only once)
  useEffect(() => {
    // console removed
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Firebase Auth State Listener - automatically detects when user logs in/out (run only once)
  useEffect(() => {
    // console removed
    let unsubscribe: (() => void) | undefined;
    
    try {
      const { app } = getFirebase();
      const auth = getAuth(app);
      
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        // console removed

        if (firebaseUser) {
          // Firebase user is logged in - restore/create session
          // console removed
          
          // Create or restore user data
          const nowIso = new Date().toISOString();
          const userData: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email || '',
            phone: firebaseUser.phoneNumber || '+9720000000',
            avatar: firebaseUser.photoURL || 'https://i.pravatar.cc/150?img=1',
            bio: '',
            karmaPoints: 0,
            joinDate: nowIso,
            isActive: true,
            lastActive: nowIso,
            location: { city: 'ישראל', country: 'IL' },
            interests: [],
            roles: ['user'],
            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
            notifications: [],
            settings: { language: 'he', darkMode: false, notificationsEnabled: true },
          };

          // Save to AsyncStorage for persistence
          await AsyncStorage.setItem('current_user', JSON.stringify(userData));
          await AsyncStorage.setItem('auth_mode', 'real');
          await AsyncStorage.setItem('firebase_user_id', firebaseUser.uid);
          
          // Update context state
          const enrichedUser = await enrichUserWithOrgRoles(userData);
          setSelectedUserState(enrichedUser);
          setIsAuthenticated(true);
          setIsGuestMode(false);
          setAuthMode('real');
          
          // console removed
        } else {
          // No Firebase user - only clear if we had a Firebase user before
          const firebaseUserId = await AsyncStorage.getItem('firebase_user_id');
          if (firebaseUserId) {
            // console removed
            await AsyncStorage.multiRemove(['current_user', 'auth_mode', 'firebase_user_id']);
            setSelectedUserState(null);
            setIsAuthenticated(false);
            setIsGuestMode(false);
            setAuthMode('guest');
          }
        }
      });
      
      // console removed
    } catch (error) {
      console.error('🔥 Error setting up Firebase Auth listener:', error);
    }

    // Cleanup function
    return () => {
      // console removed
      if (unsubscribe) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const computeRole = (user: User | null, mode: AuthMode): Role => {
    if (mode === 'guest' || !user) return 'guest';
    const roles = Array.isArray(user?.roles) ? user!.roles : [];
    return (roles.includes('admin') || roles.includes('super_admin') || roles.includes('org_admin')) ? 'admin' : 'user';
  };

  const checkAuthStatus = async () => {
    try {
      // console removed
      setIsLoading(true);
      
      // First, check for successful OAuth authentication
      // console removed
      const oauthSuccess = await AsyncStorage.getItem('oauth_success_flag');
      const userData = await AsyncStorage.getItem('google_auth_user');
      const token = await AsyncStorage.getItem('google_auth_token');
      
      if (oauthSuccess && userData && token) {
        try {
          // console removed
          const parsedUserData = JSON.parse(userData);
          
          // Validate the user data
          if (parsedUserData && parsedUserData.id && parsedUserData.email) {
            // console removed
            
            // Enrich user with org roles if applicable
            const enrichedUser = await enrichUserWithOrgRoles(parsedUserData);
            
            setSelectedUserState(enrichedUser);
            setIsAuthenticated(true);
            setIsGuestMode(false);
            setAuthMode('real');
            
            // Clean up OAuth success flags since we've processed them
            await AsyncStorage.multiRemove(['oauth_success_flag', 'google_auth_user', 'google_auth_token']);
            
            // console removed
            return; // Exit early - user is authenticated
          } else {
            // console removed
          }
        } catch (parseError) {
          console.error('🔐 UserContext - checkAuthStatus - Error parsing OAuth user data:', parseError);
        }
      }
      
      // Check for persistent user session (if implemented in the future)
      // console removed
      const persistedUser = await AsyncStorage.getItem('current_user');
      const guestMode = await AsyncStorage.getItem('guest_mode');
      const authModeStored = await AsyncStorage.getItem('auth_mode');
      
      if (persistedUser) {
        try {
          const parsedUser = JSON.parse(persistedUser);
          if (parsedUser && parsedUser.id) {
            // console removed
            const enrichedUser = await enrichUserWithOrgRoles(parsedUser);
            setSelectedUserState(enrichedUser);
            setIsAuthenticated(true);
            setIsGuestMode(guestMode === 'true');
            setAuthMode((authModeStored as AuthMode) || 'real');
            // console removed
            return; // Exit early - user is authenticated
          }
        } catch (parseError) {
          console.error('🔐 UserContext - checkAuthStatus - Error parsing persisted user:', parseError);
        }
      }
      
      // No valid authentication found - clear any invalid data and set unauthenticated state
      // console removed
      await AsyncStorage.multiRemove([
        'current_user',
        'guest_mode',
        'auth_mode',
        'oauth_in_progress',
        'oauth_success_flag',
        'google_auth_user',
        'google_auth_token'
      ]);
      
      // console removed
      setIsAuthenticated(false);
      setIsGuestMode(false);
      setSelectedUserState(null);
      setAuthMode('guest');
      
    } catch (error) {
      console.error('🔐 UserContext - checkAuthStatus - Error:', error);
      // On error, ensure clean unauthenticated state
      setIsAuthenticated(false);
      setIsGuestMode(false);
      setSelectedUserState(null);
      setAuthMode('guest');
    } finally {
      // console removed
      setIsLoading(false);
    }
  };

  // New simplified setter: sets current principal using role model
  const setCurrentPrincipal = async (principal: { user: User | null; role: Role }) => {
    try {
      // console removed
      if (principal.role === 'guest' || !principal.user) {
        setSelectedUserState(null);
        setIsAuthenticated(true);
        setIsGuestMode(true);
        setAuthMode('guest');
        return;
      }
      const enriched = await enrichUserWithOrgRoles(principal.user);
      // Treat any non-guest role as real auth
      try {
        const { DatabaseService } = await import('../utils/databaseService');
        await DatabaseService.clearLocalCollections();
      } catch (e) {
        // console removed:', e);
      }
      setSelectedUserState(enriched);
      setIsAuthenticated(true);
      setIsGuestMode(false);
      setAuthMode('real');
    } catch (error) {
      console.error('Error in setCurrentPrincipal:', error);
      // Fallbacks
      if (principal.role === 'guest' || !principal.user) {
        setSelectedUserState(null);
        setIsAuthenticated(true);
        setIsGuestMode(true);
        setAuthMode('guest');
      } else {
        setSelectedUserState(principal.user);
        setIsAuthenticated(true);
        setIsGuestMode(false);
        setAuthMode('real');
      }
    }
  };

  const setSelectedUserWithMode = async (user: User | null, mode: AuthMode) => {
    try {
      // console removed
      // Bridge to new API
      const role = computeRole(user, mode);
      await setCurrentPrincipal({ user, role });
      // console removed
    } catch (error) {
      console.error('Error setting user:', error);
      const role = computeRole(user, mode);
      await setCurrentPrincipal({ user, role });
    }
  };

  // Backward compatible API
  const setSelectedUser = async (user: User | null) => setSelectedUserWithMode(user, user ? 'real' as const : 'guest');

  /**
   * Enriches a user object with organization roles if there is an approved org application
   * keyed by the user's email (partition key in DB for org applications).
   */
  const enrichUserWithOrgRoles = async (user: User): Promise<User> => {
    try {
      const emailKey = (user.email || '').toLowerCase();
      if (!emailKey) return user;
      
      // Super admin email - hardcoded for main admin
      const SUPER_ADMIN_EMAIL = 'navesarussi@gmail.com';
      const isSuperAdmin = emailKey === SUPER_ADMIN_EMAIL.toLowerCase();
      
      // Grant admin role by env config (comma-separated emails)
      const adminEmailsEnv = (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '').toLowerCase();
      const adminEmails = adminEmailsEnv
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const withAdmin = adminEmails.includes(emailKey) || isSuperAdmin;
      
      const applications = await db.listOrgApplications(emailKey);
      const approved = (applications as any[]).find((a) => a.status === 'approved');
      
      if (approved || withAdmin) {
        // Super admin gets super_admin role, others get admin
        const adminRole = isSuperAdmin ? 'super_admin' : 'admin';
        const extraRoles = [
          approved ? 'org_admin' : null,
          withAdmin ? adminRole : null
        ].filter(Boolean) as string[];
        const roles = Array.isArray(user.roles) 
          ? Array.from(new Set([...user.roles, ...extraRoles])) 
          : extraRoles;
        return { ...user, roles, orgApplicationId: approved?.id, orgName: approved?.orgName };
      }
      return user;
    } catch (err) {
      // console removed', err);
      return user;
    }
  };

  const signOut = async () => {
    try {
      // console removed
      setIsLoading(true);
      
      // Sign out from Firebase Auth
      try {
        const { app } = getFirebase();
        const auth = getAuth(app);
        await auth.signOut();
        // console removed
      } catch (firebaseError) {
        // console removed:', firebaseError);
      }
      
      // console removed
      await AsyncStorage.multiRemove([
        'current_user',
        'guest_mode',
        'auth_mode',
        'firebase_user_id',
        'oauth_in_progress',
        'oauth_success_flag',
        'google_auth_user',
        'google_auth_token'
      ]);
      
      // console removed
      setSelectedUserState(null);
      
      // console removed
      setIsAuthenticated(false);
      
      // console removed
      setIsGuestMode(false);
      
      // console removed
      setAuthMode('guest');
      
      // console removed
    } catch (error) {
      console.error('🔐 UserContext - signOut - Error during sign out:', error);
      setSelectedUserState(null);
      setIsAuthenticated(false);
      setIsGuestMode(false);
      setAuthMode('guest');
    } finally {
      // console removed
      setIsLoading(false);
    }
  };

  const setGuestMode = async () => {
    try {
      // console removed');
      setIsLoading(true);
      
      // DO NOT SAVE TO AsyncStorage - session only
      // console removed
      
      // Update state for current session only
      setSelectedUserState(null);
      setAuthMode('guest');
      setIsGuestMode(true);
      setIsAuthenticated(true);
      
      // console removed');
    } catch (error) {
      console.error('🔐 UserContext - setGuestMode - Error:', error);
      setSelectedUserState(null);
      setAuthMode('guest');
      setIsGuestMode(true);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
      // console removed
    }
  };

  const setDemoUser = async () => {
    // Demo mode removed – keep API for backward compatibility, but no-op
    // console removed');
  };

  const resetHomeScreen = () => {
    // console removed
    setResetHomeScreenTrigger(prev => prev + 1);
  };

  /**
   * Checks if the current user has admin privileges
   * Returns true if user has 'admin' or 'super_admin' role
   */
  const isAdmin = (): boolean => {
    if (!selectedUser || !selectedUser.roles) return false;
    const roles = Array.isArray(selectedUser.roles) ? selectedUser.roles : [];
    return roles.includes('admin') || roles.includes('super_admin');
  };

  const value: UserContextType = {
    selectedUser,
    setSelectedUser,
    setSelectedUserWithMode,
    role: computeRole(selectedUser, authMode),
    setCurrentPrincipal,
    isUserSelected: selectedUser !== null,
    isLoading,
    signOut,
    isAuthenticated,
    isGuestMode,
    isRealAuth: authMode === 'real',
    isAdmin: isAdmin(),
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