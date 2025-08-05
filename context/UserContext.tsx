import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check AsyncStorage for stored user and guest mode
      const storedUserData = await AsyncStorage.getItem('current_user');
      const guestModeData = await AsyncStorage.getItem('guest_mode');
      
      if (guestModeData === 'true') {
        // מצב אורח פעיל
        setIsGuestMode(true);
        setIsAuthenticated(true);
        setSelectedUserState(null);
      } else if (storedUserData) {
        try {
          const user = JSON.parse(storedUserData);
          if (user && user.id && user.name) {
            setSelectedUserState(user);
            setIsAuthenticated(true);
            setIsGuestMode(false);
          } else {
            await AsyncStorage.removeItem('current_user');
            setIsAuthenticated(false);
            setIsGuestMode(false);
          }
        } catch (parseError) {
          await AsyncStorage.removeItem('current_user');
          setIsAuthenticated(false);
          setIsGuestMode(false);
        }
      } else {
        setIsAuthenticated(false);
        setIsGuestMode(false);
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setIsAuthenticated(false);
      setIsGuestMode(false);
    } finally {
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

  const signOut = async () => {
    try {
      console.log('🔐 UserContext - signOut');
      setIsLoading(true);
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('guest_mode');
      setSelectedUser(null);
      setIsAuthenticated(false);
      setIsGuestMode(false);
    } catch (error) {
      console.error('Sign out failed:', error);
      setSelectedUser(null);
      setIsAuthenticated(false);
      setIsGuestMode(false);
    } finally {
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