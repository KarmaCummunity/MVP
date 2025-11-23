// File overview:
// - Purpose: Global user/session state management using Zustand (replaces UserContext)
// - Reached from: Any component via `useUserStore()` hook, or services via direct import
// - Provides: Methods to set user with mode, sign out, toggle guest/demo, and resetHomeScreen trigger
// - Storage: Persists `current_user`, `guest_mode`, and `auth_mode` in AsyncStorage; clears local collections on real auth
// - Advantage: Can be used outside React components (in services) without circular dependencies

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirebase } from '../utils/firebaseClient';

// Auth mode of the current session
export type AuthMode = 'guest' | 'demo' | 'real';
// Simplified role model for the app
export type Role = 'guest' | 'user' | 'admin';

export interface User {
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

interface UserState {
  selectedUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  authMode: AuthMode;
  resetHomeScreenTrigger: number;
  
  // Actions
  setSelectedUser: (user: User | null) => Promise<void>;
  setSelectedUserWithMode: (user: User | null, mode: AuthMode) => Promise<void>;
  setCurrentPrincipal: (principal: { user: User | null; role: Role }) => Promise<void>;
  signOut: () => Promise<void>;
  setGuestMode: () => Promise<void>;
  setDemoUser: () => Promise<void>;
  resetHomeScreen: () => void;
  checkAuthStatus: () => Promise<void>;
  initialize: () => Promise<void>;
}

const computeRole = (user: User | null, mode: AuthMode): Role => {
  if (mode === 'guest' || !user) return 'guest';
  const roles = Array.isArray(user?.roles) ? user!.roles : [];
  return (roles.includes('admin') || roles.includes('super_admin') || roles.includes('org_admin')) ? 'admin' : 'user';
};

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
    
    // Dynamic import to avoid circular dependency
    const { db } = await import('../utils/databaseService');
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

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  selectedUser: null,
  isLoading: true,
  isAuthenticated: false,
  isGuestMode: false,
  authMode: 'guest',
  resetHomeScreenTrigger: 0,
  
  // Actions
  setCurrentPrincipal: async (principal: { user: User | null; role: Role }) => {
    try {
      // console removed
      if (principal.role === 'guest' || !principal.user) {
        set({
          selectedUser: null,
          isAuthenticated: true,
          isGuestMode: true,
          authMode: 'guest',
        });
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
      set({
        selectedUser: enriched,
        isAuthenticated: true,
        isGuestMode: false,
        authMode: 'real',
      });
    } catch (error) {
      console.error('Error in setCurrentPrincipal:', error);
      // Fallbacks
      if (principal.role === 'guest' || !principal.user) {
        set({
          selectedUser: null,
          isAuthenticated: true,
          isGuestMode: true,
          authMode: 'guest',
        });
      } else {
        set({
          selectedUser: principal.user,
          isAuthenticated: true,
          isGuestMode: false,
          authMode: 'real',
        });
      }
    }
  },
  
  setSelectedUserWithMode: async (user: User | null, mode: AuthMode) => {
    try {
      // console removed
      const role = computeRole(user, mode);
      await get().setCurrentPrincipal({ user, role });
      // console removed
    } catch (error) {
      console.error('Error setting user:', error);
      const role = computeRole(user, mode);
      await get().setCurrentPrincipal({ user, role });
    }
  },
  
  setSelectedUser: async (user: User | null) => {
    await get().setSelectedUserWithMode(user, user ? 'real' as const : 'guest');
  },
  
  checkAuthStatus: async () => {
    try {
      // console removed
      set({ isLoading: true });
      
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
            
            set({
              selectedUser: enrichedUser,
              isAuthenticated: true,
              isGuestMode: false,
              authMode: 'real',
            });
            
            // Clean up OAuth success flags since we've processed them
            await AsyncStorage.multiRemove(['oauth_success_flag', 'google_auth_user', 'google_auth_token']);
            
            // console removed
            set({ isLoading: false });
            return; // Exit early - user is authenticated
          } else {
            // console removed
          }
        } catch (parseError) {
          console.error('🔐 userStore - checkAuthStatus - Error parsing OAuth user data:', parseError);
        }
      }
      
      // Check for persistent user session
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
            set({
              selectedUser: enrichedUser,
              isAuthenticated: true,
              isGuestMode: guestMode === 'true',
              authMode: (authModeStored as AuthMode) || 'real',
            });
            // console removed
            set({ isLoading: false });
            return; // Exit early - user is authenticated
          }
        } catch (parseError) {
          console.error('🔐 userStore - checkAuthStatus - Error parsing persisted user:', parseError);
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
      set({
        isAuthenticated: false,
        isGuestMode: false,
        selectedUser: null,
        authMode: 'guest',
        isLoading: false,
      });
      
    } catch (error) {
      console.error('🔐 userStore - checkAuthStatus - Error:', error);
      // On error, ensure clean unauthenticated state
      set({
        isAuthenticated: false,
        isGuestMode: false,
        selectedUser: null,
        authMode: 'guest',
        isLoading: false,
      });
    }
  },
  
  signOut: async () => {
    try {
      // console removed
      set({ isLoading: true });
      
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
      set({
        selectedUser: null,
        isAuthenticated: false,
        isGuestMode: false,
        authMode: 'guest',
        isLoading: false,
      });
      
      // console removed
    } catch (error) {
      console.error('🔐 userStore - signOut - Error during sign out:', error);
      set({
        selectedUser: null,
        isAuthenticated: false,
        isGuestMode: false,
        authMode: 'guest',
        isLoading: false,
      });
    }
  },
  
  setGuestMode: async () => {
    try {
      // console removed');
      set({ isLoading: true });
      
      // DO NOT SAVE TO AsyncStorage - session only
      // console removed
      
      // Update state for current session only
      set({
        selectedUser: null,
        authMode: 'guest',
        isGuestMode: true,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // console removed');
    } catch (error) {
      console.error('🔐 userStore - setGuestMode - Error:', error);
      set({
        selectedUser: null,
        authMode: 'guest',
        isGuestMode: true,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },
  
  setDemoUser: async () => {
    // Demo mode removed – keep API for backward compatibility, but no-op
    // console removed');
  },
  
  resetHomeScreen: () => {
    // console removed
    set((state) => ({ resetHomeScreenTrigger: state.resetHomeScreenTrigger + 1 }));
  },
  
  initialize: async () => {
    // console removed
    
    // Check auth status
    await get().checkAuthStatus();
    
    // Setup Firebase Auth State Listener
    // console removed
    try {
      const { app } = getFirebase();
      const auth = getAuth(app);
      
      onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
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
          
          // Update store state
          const enrichedUser = await enrichUserWithOrgRoles(userData);
          set({
            selectedUser: enrichedUser,
            isAuthenticated: true,
            isGuestMode: false,
            authMode: 'real',
          });
          
          // console removed
        } else {
          // No Firebase user - only clear if we had a Firebase user before
          const firebaseUserId = await AsyncStorage.getItem('firebase_user_id');
          if (firebaseUserId) {
            // console removed
            await AsyncStorage.multiRemove(['current_user', 'auth_mode', 'firebase_user_id']);
            set({
              selectedUser: null,
              isAuthenticated: false,
              isGuestMode: false,
              authMode: 'guest',
            });
          }
        }
      });
      
      // console removed
    } catch (error) {
      console.error('🔥 Error setting up Firebase Auth listener:', error);
    }
  },
}));

// Computed selectors (for better performance)
export const useUser = () => {
  const store = useUserStore();
  return {
    selectedUser: store.selectedUser,
    setSelectedUser: store.setSelectedUser,
    setSelectedUserWithMode: store.setSelectedUserWithMode,
    role: computeRole(store.selectedUser, store.authMode),
    setCurrentPrincipal: store.setCurrentPrincipal,
    isUserSelected: store.selectedUser !== null,
    isLoading: store.isLoading,
    signOut: store.signOut,
    isAuthenticated: store.isAuthenticated,
    isGuestMode: store.isGuestMode,
    isRealAuth: store.authMode === 'real',
    isAdmin: (() => {
      const user = store.selectedUser;
      if (!user || !user.roles) return false;
      const roles = Array.isArray(user.roles) ? user.roles : [];
      return roles.includes('admin') || roles.includes('super_admin');
    })(),
    setGuestMode: store.setGuestMode,
    setDemoUser: store.setDemoUser,
    resetHomeScreen: store.resetHomeScreen,
    resetHomeScreenTrigger: store.resetHomeScreenTrigger,
  };
};

