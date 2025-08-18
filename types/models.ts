// Type definitions for Karma Community App
// Moved from fakeData.ts to proper types file

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  image?: string;
  timestamp: string;
  read?: boolean;
  type?: 'text' | 'image' | 'donation' | 'task';
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  status?: string;
}

export interface ChatConversation {
  id: string;
  userId: string;
  messages: Message[];
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCount?: number;
  participants: string[];
  createdAt: string;
}

export interface Donation {
  id: string;
  title: string;
  description: string;
  amount?: number;
  currency?: string;
  type: 'money' | 'item' | 'service' | 'time';
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  category: string;
  createdBy: string;
  createdAt: string;
  image?: string;
  location?: string;
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  location?: string | { city: string; country: string };
  bio?: string;
  joinDate: string;
  karmaPoints: number;
  completedTasks?: number;
  totalDonations?: number;
  receivedDonations?: number;
  isVerified?: boolean;
  isActive?: boolean;
  lastActive?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  roles?: string[];
  interests?: string[];
  preferences?: {
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
  settings?: {
    language: string;
    darkMode: boolean;
    notificationsEnabled: boolean;
  };
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  category: string;
  image?: string;
  tags?: string[];
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  location: string;
  founded: string;
  website: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  tags: string[];
  rating: number;
  totalDonations: number;
  activeDonors: number;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    goal: number;
    raised: number;
    deadline: string;
    status: 'active' | 'completed' | 'paused';
  }>;
  stats: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    icon: string;
    color: string;
    description: string;
  }>;
  volunteers?: string[];
  beneficiaries?: string[];
  impact?: {
    people: {
      helped: number;
      volunteers: number;
      beneficiaries: number;
    };
    resources: {
      donations: number;
      items: number;
      hours: number;
    };
    finances: {
      raised: number;
      spent: number;
      fundraising: number;
    };
  };
}

export interface DonationItem {
  id: string;
  ownerId: string;
  title: string;
  category: string;
  condition: string;
  location: string;
  price: number;
  rating: number;
  timestamp: string;
  tags: string[];
  qty: number;
}

export interface ItemType {
  furniture: string;
  clothes: string;
  general: string;
}
