// Character Types - Demo data removed
// Keep interface for type safety, remove all demo data

export interface CharacterType {
  id: string;
  name: string;
  description: string;
  avatar: string;
  bio: string;
  email?: string;
  phone?: string;
  karmaPoints: number;
  joinDate: string;
  location: { city: string; country: string };
  interests: string[];
  roles: string[];
  postsCount: number;
  followersCount: number;
  followingCount: number;
  completedTasks: number;
  totalDonations: number;
  receivedDonations: number;
  isVerified: boolean;
  isActive: boolean;
  lastActive?: string;
  preferences: {
    language: string;
    notifications: boolean;
    privacy: 'public' | 'private' | 'friends';
    darkMode?: boolean;
  };
  notifications?: Array<{
    type: 'message' | 'like' | 'comment' | 'follow' | 'system';
    text: string;
    date: string;
  }>;
  characterData: {
    donationHistory: Array<{
      type: 'money' | 'item' | 'service' | 'time' | 'knowledge';
      amount?: number;
      description: string;
      date: string;
    }>;
    receivedHelp: Array<{
      type: 'money' | 'item' | 'service' | 'time' | 'knowledge' | 'transport';
      description: string;
      date: string;
    }>;
    activeProjects: string[];
    skills: string[];
    needs: string[];
    availability: string;
    favoriteCategories: string[];
  };
}

// Empty arrays - demo data removed
export const allUsers: CharacterType[] = [];
export const characterTypes: CharacterType[] = [];
export const additionalUsers: CharacterType[] = [];

console.log('✅ Character types loaded (demo data removed)');
