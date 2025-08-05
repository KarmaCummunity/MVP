import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  karmaPoints: number;
  location: { city: string; country: string };
}

interface SimpleUserContextType {
  selectedUser: User | null;
  isGuestMode: boolean;
  isLoading: boolean;
  setSelectedUser: (user: User | null) => void;
  setGuestMode: () => void;
  signOut: () => void;
}

const SimpleUserContext = createContext<SimpleUserContextType | undefined>(undefined);

interface SimpleUserProviderProps {
  children: ReactNode;
}

export const SimpleUserProvider: React.FC<SimpleUserProviderProps> = ({ children }) => {
  const [selectedUser, setSelectedUserState] = useState<User | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setSelectedUser = (user: User | null) => {
    console.log('🔐 SimpleUserContext - setSelectedUser:', user?.name || 'null');
    setSelectedUserState(user);
    setIsGuestMode(false);
  };

  const setGuestMode = () => {
    console.log('🔐 SimpleUserContext - setGuestMode');
    setSelectedUserState(null);
    setIsGuestMode(true);
  };

  const signOut = () => {
    console.log('🔐 SimpleUserContext - signOut');
    setSelectedUserState(null);
    setIsGuestMode(false);
  };

  const value: SimpleUserContextType = {
    selectedUser,
    isGuestMode,
    isLoading,
    setSelectedUser,
    setGuestMode,
    signOut,
  };

  return (
    <SimpleUserContext.Provider value={value}>
      {children}
    </SimpleUserContext.Provider>
  );
};

export const useSimpleUser = (): SimpleUserContextType => {
  const context = useContext(SimpleUserContext);
  if (context === undefined) {
    throw new Error('useSimpleUser must be used within a SimpleUserProvider');
  }
  return context;
};

export type { User }; 