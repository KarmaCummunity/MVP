import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { db } from '../utils/databaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth mode of the current session
export type AuthMode = 'guest' | 'demo' | 'real';

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
  isUserSelected: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isGuestMode: boolean;
  isRealAuth: boolean;
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

  // Check authentication status on app start
  useEffect(() => {
    console.log('🔐 UserContext - useEffect - Starting auth check');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔐 UserContext - checkAuthStatus - Starting auth check');
      setIsLoading(true);
      
      // Check AsyncStorage for stored user and guest mode
      const storedUserData = await AsyncStorage.getItem('current_user');
      const guestModeData = await AsyncStorage.getItem('guest_mode');
      const storedAuthMode = (await AsyncStorage.getItem('auth_mode')) as AuthMode | null;
      
      console.log('🔐 UserContext - checkAuthStatus - storedUserData:', storedUserData ? 'exists' : 'null');
      console.log('🔐 UserContext - checkAuthStatus - guestModeData:', guestModeData);
      
      if (guestModeData === 'true') {
        console.log('🔐 UserContext - checkAuthStatus - Setting guest mode');
        setIsGuestMode(true);
        setIsAuthenticated(true);
        setSelectedUserState(null);
        setAuthMode('guest');
      } else if (storedUserData) {
        try {
          const user = JSON.parse(storedUserData);
          console.log('🔐 UserContext - checkAuthStatus - Parsed user:', user?.name || 'invalid');
          if (user && user.id && user.name) {
            console.log('🔐 UserContext - checkAuthStatus - Enriching user with org roles');
            const enriched = await enrichUserWithOrgRoles(user);
            console.log('🔐 UserContext - checkAuthStatus - Setting authenticated user');
            setSelectedUserState(enriched);
            setIsAuthenticated(true);
            setIsGuestMode(false);
            setAuthMode(storedAuthMode || 'real');
          } else {
            console.log('🔐 UserContext - checkAuthStatus - Invalid user data, removing');
            await AsyncStorage.removeItem('current_user');
            setIsAuthenticated(false);
            setIsGuestMode(false);
            setAuthMode('guest');
          }
        } catch (parseError) {
          console.log('🔐 UserContext - checkAuthStatus - Parse error, removing user data');
          await AsyncStorage.removeItem('current_user');
          setIsAuthenticated(false);
          setIsGuestMode(false);
          setAuthMode('guest');
        }
      } else {
        console.log('🔐 UserContext - checkAuthStatus - No stored data, setting unauthenticated');
        setIsAuthenticated(false);
        setIsGuestMode(false);
        setAuthMode('guest');
      }
    } catch (error) {
      console.error('🔐 UserContext - checkAuthStatus - Error:', error);
      setIsAuthenticated(false);
      setIsGuestMode(false);
      setAuthMode('guest');
    } finally {
      console.log('🔐 UserContext - checkAuthStatus - Auth check completed');
      setIsLoading(false);
    }
  };

  const setSelectedUserWithMode = async (user: User | null, mode: AuthMode) => {
    try {
      console.log('🔐 UserContext - setSelectedUserWithMode:', { user: user?.name || 'null', mode });
      if (user) {
        // Enrich user with org roles if applicable
        const enriched = await enrichUserWithOrgRoles(user);
        if (mode === 'real') {
          // On real auth, clear only local collections to preserve app prefs
          try {
            const { DatabaseService } = await import('../utils/databaseService');
            await DatabaseService.clearLocalCollections();
          } catch (e) {
            console.log('⚠️ Failed to clear local collections on real auth (non-fatal):', e);
          }
        }
        await AsyncStorage.setItem('current_user', JSON.stringify(enriched));
        await AsyncStorage.setItem('auth_mode', mode);
        await AsyncStorage.removeItem('guest_mode');
        setSelectedUserState(enriched);
        setIsAuthenticated(true);
        setIsGuestMode(mode === 'guest');
        setAuthMode(mode);
      } else {
        await AsyncStorage.removeItem('current_user');
        await AsyncStorage.removeItem('auth_mode');
        setSelectedUserState(null);
        setIsAuthenticated(false);
        setIsGuestMode(false);
        setAuthMode('guest');
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
      setSelectedUserState(user);
      setIsAuthenticated(user !== null);
      setIsGuestMode(false);
      setAuthMode(user ? 'real' : 'guest');
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
      // Grant admin role by env config (comma-separated emails)
      const adminEmailsEnv = (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '').toLowerCase();
      const adminEmails = adminEmailsEnv
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const withAdmin = adminEmails.includes(emailKey);
      const applications = await db.listOrgApplications(emailKey);
      const approved = (applications as any[]).find((a) => a.status === 'approved');
      if (approved || withAdmin) {
        const extraRoles = [approved ? 'org_admin' : null, withAdmin ? 'admin' : null].filter(Boolean) as string[];
        const roles = Array.isArray(user.roles) ? Array.from(new Set([...user.roles, ...extraRoles])) : extraRoles;
        return { ...user, roles, orgApplicationId: approved?.id, orgName: approved?.orgName };
      }
      return user;
    } catch (err) {
      console.log('🔐 UserContext - enrichUserWithOrgRoles - skipped (no backend or no data)', err);
      return user;
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 UserContext - signOut - Starting sign out process');
      setIsLoading(true);
      
      console.log('🔐 UserContext - signOut - Removing current_user from AsyncStorage');
      await AsyncStorage.removeItem('current_user');
      
      console.log('🔐 UserContext - signOut - Removing guest_mode from AsyncStorage');
      await AsyncStorage.removeItem('guest_mode');
      
      const checkUser = await AsyncStorage.getItem('current_user');
      const checkGuest = await AsyncStorage.getItem('guest_mode');
      console.log('🔐 UserContext - signOut - After removal check - current_user:', checkUser ? 'still exists' : 'removed');
      console.log('🔐 UserContext - signOut - After removal check - guest_mode:', checkGuest ? 'still exists' : 'removed');
      
      console.log('🔐 UserContext - signOut - Setting user state to null');
      setSelectedUserState(null);
      
      console.log('🔐 UserContext - signOut - Setting isAuthenticated to false');
      setIsAuthenticated(false);
      
      console.log('🔐 UserContext - signOut - Setting isGuestMode to false');
      setIsGuestMode(false);
      
      console.log('🔐 UserContext - signOut - Sign out completed successfully');
    } catch (error) {
      console.error('🔐 UserContext - signOut - Error during sign out:', error);
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
      await AsyncStorage.setItem('auth_mode', 'guest');
      setSelectedUserState(null);
      setIsAuthenticated(true);
      setIsGuestMode(true);
      setAuthMode('guest');
    } catch (error) {
      console.error('Error setting guest mode:', error);
      setSelectedUserState(null);
      setIsAuthenticated(true);
      setIsGuestMode(true);
      setAuthMode('guest');
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
          { type: 'system', text: require('i18next').t('home:welcome', { defaultValue: 'שלום' }) as string, date: new Date().toISOString() },
        ],
        settings: demoCharacter.preferences,
      };
      
      await setSelectedUserWithMode(demoUser, 'demo');
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
    setSelectedUserWithMode,
    isUserSelected: selectedUser !== null,
    isLoading,
    signOut,
    isAuthenticated,
    isGuestMode,
    isRealAuth: authMode === 'real',
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