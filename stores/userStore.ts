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
  isInitialized: boolean; // Flag to track if store has been initialized
  lastHomeTabScreen: string | null; // Last screen visited in HomeTabStack before switching tabs

  // Actions
  setSelectedUser: (user: User | null) => Promise<void>;
  setSelectedUserWithMode: (user: User | null, mode: AuthMode) => Promise<void>;
  setCurrentPrincipal: (principal: { user: User | null; role: Role }) => Promise<void>;
  signOut: () => Promise<void>;
  setGuestMode: () => Promise<void>;
  setDemoUser: () => Promise<void>;
  resetHomeScreen: () => void;
  setLastHomeTabScreen: (screen: string | null) => void;
  clearLastHomeTabScreen: () => void;
  checkAuthStatus: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshUserRoles: () => Promise<void>; // Refresh user roles from database
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

    // Super admin email - hardcoded ONLY for the main system admin
    // DO NOT add other emails here - use database roles instead
    const SUPER_ADMINS = ['navesarussi@gmail.com'];
    const isSuperAdmin = SUPER_ADMINS.includes(emailKey);

    // Fetch fresh user data from database to get current roles
    const { apiService } = await import('../utils/apiService');
    let dbRoles: string[] = [];

    try {
      const response = await apiService.getUserById(user.id);
      if (response.success && response.data) {
        dbRoles = response.data.roles || [];
      }
    } catch (err) {
      console.log('🔐 enrichUserWithOrgRoles - Could not fetch user from DB, using existing roles');
      dbRoles = user.roles || [];
    }

    // Check for approved org applications
    const { db } = await import('../utils/databaseService');
    const applications = await db.listOrgApplications(emailKey);
    const approved = (applications as any[]).find((a) => a.status === 'approved');

    // Build final roles list
    let finalRoles = [...dbRoles];

    // Add super_admin if applicable (hardcoded)
    if (isSuperAdmin && !finalRoles.includes('super_admin')) {
      finalRoles.push('super_admin');
    }

    // Add org_admin if has approved application
    if (approved && !finalRoles.includes('org_admin')) {
      finalRoles.push('org_admin');
    }

    // Remove duplicates
    finalRoles = Array.from(new Set(finalRoles));

    return {
      ...user,
      roles: finalRoles,
      orgApplicationId: approved?.id,
      orgName: approved?.orgName
    };
  } catch (err) {
    console.log('🔐 userStore - enrichUserWithOrgRoles - skipped (no backend or no data)', err);
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
  isInitialized: false,
  lastHomeTabScreen: null,

  // Actions
  setCurrentPrincipal: async (principal: { user: User | null; role: Role }) => {
    try {
      console.log('🔐 userStore - setCurrentPrincipal:', { user: principal.user?.name || 'null', role: principal.role });
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
        console.log('⚠️ Failed to clear local collections on real auth (non-fatal):', e);
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
      console.log('🔐 userStore - setSelectedUserWithMode:', { user: user?.name || 'null', mode });
      const role = computeRole(user, mode);
      await get().setCurrentPrincipal({ user, role });
      console.log('🔐 userStore - setSelectedUserWithMode - completed');
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
      console.log('🔐 userStore - checkAuthStatus - Starting auth check');
      set({ isLoading: true });

      // First, check for successful OAuth authentication
      console.log('🔐 userStore - checkAuthStatus - Checking for OAuth success');
      const oauthSuccess = await AsyncStorage.getItem('oauth_success_flag');
      const userData = await AsyncStorage.getItem('google_auth_user');
      const token = await AsyncStorage.getItem('google_auth_token');

      if (oauthSuccess && userData && token) {
        try {
          console.log('🔐 userStore - checkAuthStatus - Found OAuth success data, processing');
          const parsedUserData = JSON.parse(userData);

          // Validate the user data
          if (parsedUserData && parsedUserData.id && parsedUserData.email) {
            console.log('🔐 userStore - checkAuthStatus - Setting authenticated user from OAuth');

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

            console.log('🔐 userStore - checkAuthStatus - OAuth authentication restored successfully');
            set({ isLoading: false });
            return; // Exit early - user is authenticated
          } else {
            console.warn('🔐 userStore - checkAuthStatus - Invalid OAuth user data found');
          }
        } catch (parseError) {
          console.error('🔐 userStore - checkAuthStatus - Error parsing OAuth user data:', parseError);
        }
      }

      // Check for persistent user session
      console.log('🔐 userStore - checkAuthStatus - Checking for persistent session');
      const persistedUser = await AsyncStorage.getItem('current_user');
      const guestMode = await AsyncStorage.getItem('guest_mode');
      const authModeStored = await AsyncStorage.getItem('auth_mode');

      if (persistedUser) {
        try {
          const parsedUser = JSON.parse(persistedUser);
          if (parsedUser && parsedUser.id) {
            console.log('🔐 userStore - checkAuthStatus - Restoring persisted user session');
            const enrichedUser = await enrichUserWithOrgRoles(parsedUser);
            set({
              selectedUser: enrichedUser,
              isAuthenticated: true,
              isGuestMode: guestMode === 'true',
              authMode: (authModeStored as AuthMode) || 'real',
            });
            console.log('🔐 userStore - checkAuthStatus - Persisted session restored successfully');
            set({ isLoading: false });
            return; // Exit early - user is authenticated
          }
        } catch (parseError) {
          console.error('🔐 userStore - checkAuthStatus - Error parsing persisted user:', parseError);
        }
      }

      // No valid authentication found - clear any invalid data and set unauthenticated state
      console.log('🔐 userStore - checkAuthStatus - No valid authentication found, clearing data');
      await AsyncStorage.multiRemove([
        'current_user',
        'guest_mode',
        'auth_mode',
        'oauth_in_progress',
        'oauth_success_flag',
        'google_auth_user',
        'google_auth_token'
      ]);

      console.log('🔐 userStore - checkAuthStatus - Setting unauthenticated state');
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
      console.log('🔐 userStore - signOut - Starting sign out process');
      set({ isLoading: true });

      // Sign out from Firebase Auth
      try {
        const { app } = getFirebase();
        const auth = getAuth(app);
        await auth.signOut();
        console.log('🔥 Firebase - User signed out successfully');
      } catch (firebaseError) {
        console.warn('🔥 Firebase - Sign out error (non-fatal):', firebaseError);
      }

      console.log('🔐 userStore - signOut - Removing all auth data from AsyncStorage');
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

      console.log('🔐 userStore - signOut - Setting user state to null');
      set({
        selectedUser: null,
        isAuthenticated: false,
        isGuestMode: false,
        authMode: 'guest',
        isLoading: false,
        isInitialized: true, // Keep initialized flag true after sign out
      });

      console.log('🔐 userStore - signOut - Sign out completed successfully');
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
      console.log('🔐 userStore - setGuestMode - Starting (session only)');
      set({ isLoading: true });

      // DO NOT SAVE TO AsyncStorage - session only
      console.log('🔐 userStore - setGuestMode - Setting guest mode for session only');

      // Update state for current session only
      set({
        selectedUser: null,
        authMode: 'guest',
        isGuestMode: true,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('🔐 userStore - setGuestMode - Guest mode set successfully (session only)');
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
    console.log('🔐 userStore - setDemoUser called (no-op, demo removed)');
  },

  resetHomeScreen: () => {
    console.log('🏠 userStore - resetHomeScreen called');
    set((state) => ({ resetHomeScreenTrigger: state.resetHomeScreenTrigger + 1 }));
  },

  setLastHomeTabScreen: (screen: string | null) => {
    console.log('🏠 userStore - setLastHomeTabScreen called', { screen });
    set({ lastHomeTabScreen: screen });
  },

  clearLastHomeTabScreen: () => {
    console.log('🏠 userStore - clearLastHomeTabScreen called');
    set({ lastHomeTabScreen: null });
  },

  refreshUserRoles: async () => {
    const currentUser = get().selectedUser;
    if (!currentUser) {
      console.log('🔐 userStore - refreshUserRoles - No user to refresh');
      return;
    }

    try {
      console.log('🔐 userStore - refreshUserRoles - Refreshing roles for user:', currentUser.email);
      const enrichedUser = await enrichUserWithOrgRoles(currentUser);

      // Only update if roles actually changed to prevent infinite loops
      const currentRoles = JSON.stringify((currentUser.roles || []).sort());
      const newRoles = JSON.stringify((enrichedUser.roles || []).sort());

      if (currentRoles !== newRoles) {
        console.log('🔐 userStore - refreshUserRoles - Roles changed!', {
          email: enrichedUser.email,
          oldRoles: currentUser.roles,
          newRoles: enrichedUser.roles
        });

        set({ selectedUser: enrichedUser });
        await AsyncStorage.setItem('current_user', JSON.stringify(enrichedUser));
      }
    } catch (error) {
      console.error('🔐 userStore - refreshUserRoles - Error:', error);
    }
  },

  initialize: async () => {
    console.log('🔐 userStore - initialize - Starting initialization');

    // Check auth status
    await get().checkAuthStatus();

    // Mark as initialized after checkAuthStatus completes
    set({ isInitialized: true });

    // Setup Firebase Auth State Listener
    console.log('🔥 userStore - Setting up Firebase Auth listener');
    try {
      const { app } = getFirebase();
      const auth = getAuth(app);

      onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        const state = get();

        // Skip updates if store hasn't been initialized yet
        if (!state.isInitialized) {
          console.log('🔥 Firebase Auth State Changed - Skipping (not initialized yet)');
          return;
        }

        console.log('🔥 Firebase Auth State Changed:', {
          hasUser: !!firebaseUser,
          email: firebaseUser?.email,
          uid: firebaseUser?.uid,
          emailVerified: firebaseUser?.emailVerified
        });

        if (firebaseUser) {
          // Firebase user is logged in - restore/create session
          console.log('🔥 Firebase user detected, restoring session');

          try {
            // Get UUID from server using firebase_uid and google_id
            const { apiService } = await import('../utils/apiService');

            // Extract google_id from providerData if available
            const googleProvider = firebaseUser.providerData?.find(
              (provider) => provider.providerId === 'google.com'
            );
            const googleId = googleProvider?.uid || undefined;

            console.log('🔥 Resolving user with identifiers:', {
              firebase_uid: firebaseUser.uid,
              google_id: googleId,
              email: firebaseUser.email
            });

            const resolveResponse = await apiService.resolveUserId({
              firebase_uid: firebaseUser.uid,
              google_id: googleId,
              email: firebaseUser.email || undefined
            });

            if (!resolveResponse.success || !(resolveResponse as any).user) {
              console.warn('🔥 Failed to resolve user ID from server, using fallback');
              // Fallback: try to get user by email
              if (firebaseUser.email) {
                const userResponse = await apiService.getUserById(firebaseUser.email);
                if (userResponse.success && userResponse.data) {
                  const serverUser = userResponse.data;
                  const nowIso = new Date().toISOString();
                  const userData: User = {
                    id: serverUser.id, // UUID from database
                    name: serverUser.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: serverUser.email || firebaseUser.email || '',
                    phone: serverUser.phone || firebaseUser.phoneNumber || '+9720000000',
                    avatar: serverUser.avatar_url || firebaseUser.photoURL || 'https://i.pravatar.cc/150?img=1',
                    bio: serverUser.bio || '',
                    karmaPoints: serverUser.karma_points || 0,
                    joinDate: serverUser.join_date || serverUser.created_at || nowIso,
                    isActive: serverUser.is_active !== false,
                    lastActive: serverUser.last_active || nowIso,
                    location: { city: serverUser.city || 'ישראל', country: serverUser.country || 'IL' },
                    interests: serverUser.interests || [],
                    roles: serverUser.roles || ['user'],
                    postsCount: serverUser.posts_count || 0,
                    followersCount: serverUser.followers_count || 0,
                    followingCount: serverUser.following_count || 0,
                    notifications: [],
                    settings: serverUser.settings || { language: 'he', darkMode: false, notificationsEnabled: true },
                  };

                  await AsyncStorage.setItem('current_user', JSON.stringify(userData));
                  await AsyncStorage.setItem('auth_mode', 'real');
                  await AsyncStorage.setItem('firebase_user_id', firebaseUser.uid);

                  const enrichedUser = await enrichUserWithOrgRoles(userData);
                  set({
                    selectedUser: enrichedUser,
                    isAuthenticated: true
                  });
                  console.log('🔥 Firebase session restored successfully with UUID:', userData.id);
                  return;
                }
              }
              throw new Error('Failed to get user from server');
            }

            // Check if we already have this user loaded to prevent unnecessary updates
            const currentState = get();
            if (currentState.selectedUser?.id === (resolveResponse as any).user.id &&
              currentState.isAuthenticated &&
              currentState.authMode === 'real') {
              console.log('🔥 Firebase Auth State Changed - User already loaded, skipping update');
              return;
            }

            // Use UUID from server
            const serverUser = (resolveResponse as any).user;
            const nowIso = new Date().toISOString();
            const userData: User = {
              id: serverUser.id, // UUID from database - this is the primary identifier
              name: serverUser.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: serverUser.email || firebaseUser.email || '',
              phone: serverUser.phone || firebaseUser.phoneNumber || '+9720000000',
              avatar: serverUser.avatar || firebaseUser.photoURL || 'https://i.pravatar.cc/150?img=1',
              bio: serverUser.bio || '',
              karmaPoints: serverUser.karmaPoints || 0,
              joinDate: serverUser.createdAt || serverUser.joinDate || nowIso,
              isActive: serverUser.isActive !== false,
              lastActive: serverUser.lastActive || nowIso,
              location: serverUser.location || { city: 'ישראל', country: 'IL' },
              interests: serverUser.interests || [],
              roles: serverUser.roles || ['user'],
              postsCount: serverUser.postsCount || 0,
              followersCount: serverUser.followersCount || 0,
              followingCount: serverUser.followingCount || 0,
              notifications: [],
              settings: serverUser.settings || { language: 'he', darkMode: false, notificationsEnabled: true },
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
              authMode: 'real',
              isGuestMode: false
            });
            console.log('🔥 Firebase session restored successfully with UUID:', userData.id);
          } catch (error) {
            console.error('🔥 Failed to restore Firebase session:', error);
            // Don't set user state if we can't get UUID from server
          }
        } else {
          // No Firebase user - only clear if we had a Firebase user before
          const currentState = get();
          const firebaseUserId = await AsyncStorage.getItem('firebase_user_id');

          // Only clear if we actually had a Firebase user and we're not in guest mode
          if (firebaseUserId && currentState.authMode === 'real' && currentState.isAuthenticated) {
            console.log('🔥 Firebase user logged out, clearing session');
            await AsyncStorage.multiRemove(['current_user', 'auth_mode', 'firebase_user_id']);
            set({
              selectedUser: null,
              isAuthenticated: false,
              isGuestMode: false,
              authMode: 'guest',
            });
          } else {
            console.log('🔥 Firebase Auth State Changed - No user, but not clearing (guest mode or no previous Firebase user)');
          }
        }
      });

      console.log('🔥 Firebase Auth listener set up successfully');
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
    lastHomeTabScreen: store.lastHomeTabScreen,
    setLastHomeTabScreen: store.setLastHomeTabScreen,
    clearLastHomeTabScreen: store.clearLastHomeTabScreen,
    refreshUserRoles: store.refreshUserRoles,
  };
};

