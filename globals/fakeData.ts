// Enhanced Fake Data for Karma Community App
// This file contains all mock data used throughout the application

export interface Message {
  id: string;
  senderId: string; // 'me' for current user, or user ID for others
  text?: string;
  image?: string; // URL for image messages
  timestamp: string; // ISO string for easy sorting/display
  read?: boolean; // For read receipts
  type?: 'text' | 'image' | 'donation' | 'task';
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string; // URL for avatar
  isOnline: boolean;
  lastSeen?: string;
  status?: string;
}

export interface ChatConversation {
  id: string;
  userId: string; // The ID of the user you are chatting with
  messages: Message[];
  lastMessageText: string; // For display in chat list
  lastMessageTimestamp: string;
  unreadCount?: number;
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
  location?: string;
  bio?: string;
  joinDate: string;
  karmaPoints: number;
  completedTasks: number;
  totalDonations: number;
  isVerified: boolean;
  preferences: {
    language: string;
    notifications: boolean;
    privacy: 'public' | 'private' | 'friends';
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

// Enhanced Users Data
export const users = [
  {
    id: 'u1',
    name: 'אנה כהן',
    email: 'anna.cohen@example.com',
    phone: '+972501234567',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'אמא לשלושה, אוהבת לעזור בקהילה.',
    karmaPoints: 1200,
    joinDate: '2023-01-15',
    isActive: true,
    lastActive: '2024-07-29T16:00:00Z',
    location: { city: 'תל אביב', country: 'ישראל' },
    interests: ['התנדבות', 'בישול', 'ספרים'],
    roles: ['user'],
    postsCount: 12,
    followersCount: 0,
    followingCount: 0,
    notifications: [
      { type: 'message', text: 'יש לך הודעה חדשה', date: '2024-07-28T10:00:00Z' },
      { type: 'system', text: 'ברוכה הבאה!', date: '2023-01-15T09:00:00Z' },
    ],
    settings: { language: 'he', darkMode: false, notificationsEnabled: true },
  },
  {
    id: 'u2',
    name: 'דני לוי',
    email: 'dan.levi@example.com',
    phone: '+972502345678',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'יזם חברתי, אוהב טכנולוגיה.',
    karmaPoints: 950,
    joinDate: '2022-11-10',
    isActive: true,
    lastActive: '2024-07-29T15:30:00Z',
    location: { city: 'חיפה', country: 'ישראל' },
    interests: ['טכנולוגיה', 'ספורט', 'קהילה'],
    roles: ['user', 'admin'],
    postsCount: 20,
    followersCount: 0,
    followingCount: 0,
    notifications: [
      { type: 'like', text: 'מישהו אהב את הפוסט שלך', date: '2024-07-27T18:00:00Z' },
    ],
    settings: { language: 'he', darkMode: true, notificationsEnabled: true },
  },
  {
    id: 'u3',
    name: 'שרה אברהם',
    email: 'sarah.abraham@example.com',
    phone: '+972503456789',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'סטודנטית למדעי המחשב.',
    karmaPoints: 700,
    joinDate: '2023-03-22',
    isActive: false,
    lastActive: '2024-07-20T12:00:00Z',
    location: { city: 'ירושלים', country: 'ישראל' },
    interests: ['קוד', 'מוזיקה', 'טיולים'],
    roles: ['user'],
    postsCount: 5,
    followersCount: 0,
    followingCount: 0,
    notifications: [],
    settings: { language: 'he', darkMode: false, notificationsEnabled: false },
  },
  {
    id: 'u4',
    name: 'משה דוד',
    email: 'moshe.david@example.com',
    phone: '+972504567890',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    bio: 'אוהב לרוץ ולעזור.',
    karmaPoints: 400,
    joinDate: '2022-08-05',
    isActive: true,
    lastActive: '2024-07-29T14:00:00Z',
    location: { city: 'באר שבע', country: 'ישראל' },
    interests: ['ריצה', 'התנדבות', 'משפחה'],
    roles: ['user'],
    postsCount: 2,
    followersCount: 0,
    followingCount: 0,
    notifications: [
      { type: 'system', text: 'השלמת משימה!', date: '2024-07-15T08:00:00Z' },
    ],
    settings: { language: 'he', darkMode: false, notificationsEnabled: true },
  },
  {
    id: 'u5',
    name: 'רחל גולדברג',
    email: 'rachel.goldberg@example.com',
    phone: '+972505678901',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    bio: 'מורה לאנגלית, חובבת טבע.',
    karmaPoints: 1100,
    joinDate: '2021-12-01',
    isActive: true,
    lastActive: '2024-07-29T13:00:00Z',
    location: { city: 'רעננה', country: 'ישראל' },
    interests: ['הוראה', 'טיולים', 'ספרים'],
    roles: ['user'],
    postsCount: 8,
    followersCount: 0,
    followingCount: 0,
    notifications: [],
    settings: { language: 'he', darkMode: true, notificationsEnabled: true },
  },
  {
    id: 'u6',
    name: 'יוסי שפירא',
    email: 'yossi.shapira@example.com',
    phone: '+972506789012',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    bio: 'איש עסקים, מתנדב קבוע.',
    karmaPoints: 1600,
    joinDate: '2020-06-18',
    isActive: true,
    lastActive: '2024-07-29T12:00:00Z',
    location: { city: 'הרצליה', country: 'ישראל' },
    interests: ['עסקים', 'קהילה', 'ספורט'],
    roles: ['user', 'moderator'],
    postsCount: 15,
    followersCount: 0,
    followingCount: 0,
    notifications: [
      { type: 'follow', text: 'יש לך עוקב חדש', date: '2024-07-28T20:00:00Z' },
    ],
    settings: { language: 'he', darkMode: false, notificationsEnabled: true },
  },
  {
    id: 'u7',
    name: 'ליאת ברק',
    email: 'liat.barak@example.com',
    phone: '+972507890123',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    bio: 'מעצבת גרפית, אוהבת צילום.',
    karmaPoints: 850,
    joinDate: '2023-05-10',
    isActive: false,
    lastActive: '2024-07-10T10:00:00Z',
    location: { city: 'כפר סבא', country: 'ישראל' },
    interests: ['עיצוב', 'צילום', 'טיולים'],
    roles: ['user'],
    postsCount: 3,
    followersCount: 0,
    followingCount: 0,
    notifications: [],
    settings: { language: 'he', darkMode: false, notificationsEnabled: false },
  },
  {
    id: 'u8',
    name: 'אורי בן דוד',
    email: 'uri.bendavid@example.com',
    phone: '+972508901234',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    bio: 'מפתח תוכנה, אוהב אתגרים.',
    karmaPoints: 1300,
    joinDate: '2022-02-14',
    isActive: true,
    lastActive: '2024-07-29T11:00:00Z',
    location: { city: 'פתח תקווה', country: 'ישראל' },
    interests: ['קוד', 'ספורט', 'משחקים'],
    roles: ['user'],
    postsCount: 10,
    followersCount: 0,
    followingCount: 0,
    notifications: [
      { type: 'comment', text: 'מישהו הגיב לפוסט שלך', date: '2024-07-28T15:00:00Z' },
    ],
    settings: { language: 'he', darkMode: true, notificationsEnabled: true },
  },
  {
    id: 'u9',
    name: 'דפנה רוזן',
    email: 'dafna.rozen@example.com',
    phone: '+972509012345',
    avatar: 'https://randomuser.me/api/portraits/women/9.jpg',
    bio: 'חובבת בעלי חיים, מתנדבת בעמותה.',
    karmaPoints: 600,
    joinDate: '2021-09-30',
    isActive: true,
    lastActive: '2024-07-29T10:00:00Z',
    location: { city: 'אשדוד', country: 'ישראל' },
    interests: ['חיות', 'טבע', 'התנדבות'],
    roles: ['user'],
    postsCount: 4,
    followersCount: 0,
    followingCount: 0,
    notifications: [],
    settings: { language: 'he', darkMode: false, notificationsEnabled: true },
  },
  {
    id: 'u10',
    name: 'גיל עדן',
    email: 'gil.eden@example.com',
    phone: '+972501112233',
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    bio: 'מורה ליוגה, אוהב מדיטציה.',
    karmaPoints: 900,
    joinDate: '2023-07-01',
    isActive: true,
    lastActive: '2024-07-29T09:00:00Z',
    location: { city: 'מודיעין', country: 'ישראל' },
    interests: ['יוגה', 'מדיטציה', 'בריאות'],
    roles: ['user'],
    postsCount: 6,
    followersCount: 0,
    followingCount: 0,
    notifications: [
      { type: 'system', text: 'ברוך הבא!', date: '2023-07-01T09:00:00Z' },
    ],
    settings: { language: 'he', darkMode: false, notificationsEnabled: true },
  },
];


// Enhanced Conversations
export const conversations: ChatConversation[] = users.map((user) => {
//const messages = generateMessages(user.id);
const messages = [];
const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(m => !m.read && m.senderId !== 'me').length;
  
  return {
    id: user.id,
    userId: user.id,
    messages: messages,
    lastMessageText: lastMessage?.text || 'תמונה',
    lastMessageTimestamp: lastMessage?.timestamp || new Date().toISOString(),
    unreadCount
  };
});

// Enhanced Donations Data
export const donations: Donation[] = [
  {
    id: 'donation1',
    title: 'תרומת בגדים',
    description: 'בגדים במצב טוב למשפחות נזקקות',
    type: 'item',
    status: 'approved',
    category: 'בגדים',
    createdBy: 'user1',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    image: 'https://picsum.photos/id/1/300/200',
    location: 'מרכז התרומות',
    tags: ['בגדים', 'משפחות']
  },
  {
    id: 'donation2',
    title: 'תרומה כספית',
    description: 'תרומה לקניית ציוד לספרייה',
    amount: 500,
    currency: 'ILS',
    type: 'money',
    status: 'completed',
    category: 'חינוך',
    createdBy: 'user2',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tags: ['כסף', 'חינוך', 'ספרייה']
  },
  {
    id: 'donation3',
    title: 'שירותי ייעוץ משפטי',
    description: 'ייעוץ משפטי חינם למשפחות נזקקות',
    type: 'service',
    status: 'pending',
    category: 'ייעוץ',
    createdBy: 'user3',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    location: 'משרד עורכי דין',
    tags: ['ייעוץ', 'משפטי', 'חינם']
  }
];

// Enhanced Community Events - connected to charities
export const communityEvents: CommunityEvent[] = [
  {
    id: 'event1',
    title: 'יום קהילת קארמה - מפגש שנתי',
    description: 'אירוע קהילתי גדול של קהילת קארמה עם פעילויות לכל המשפחה, הכרות עם עמותות ופעילויות התנדבות',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '18:00',
    location: 'פארק הירקון, תל אביב',
    organizer: 'charity_000', // קהילת קארמה
    attendees: 85,
    maxAttendees: 200,
    category: 'אירועים קהילתיים',
    image: 'https://picsum.photos/id/10/300/200',
    tags: ['קהילה', 'משפחה', 'התנדבות', 'עמותות']
  },
  {
    id: 'event2',
    title: 'סדנת בישול בריא לקשישים - לב זהב',
    description: 'סדנת בישול בריא ומזין במיוחד לקשישים, בהדרכת שפים מתנדבים',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '16:00',
    location: 'מרכז לב זהב, תל אביב',
    organizer: 'charity_001', // לב זהב
    attendees: 25,
    maxAttendees: 30,
    category: 'בריאות ותזונה',
    image: 'https://picsum.photos/id/20/300/200',
    tags: ['בישול', 'בריאות', 'קשישים', 'תזונה']
  },
  {
    id: 'event3',
    title: 'יריד מדע לילדים - אור לילדים',
    description: 'יריד מדע אינטראקטיבי לילדים עם ניסויים מרתקים ופעילויות חינוכיות',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    time: '10:00',
    location: 'מוזיאון המדע, ירושלים',
    organizer: 'charity_002', // אור לילדים
    attendees: 120,
    maxAttendees: 150,
    category: 'חינוך ומדע',
    image: 'https://picsum.photos/id/30/300/200',
    tags: ['מדע', 'ילדים', 'חינוך', 'ניסויים']
  },
  {
    id: 'event4',
    title: 'יום אימוץ כלבים - חמלה לבעלי חיים',
    description: 'יום מיוחד לאימוץ כלבים וחתולים עם הכרות עם החיות וייעוץ וטרינרי',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: '09:00',
    location: 'מקלט חמלה, ראשון לציון',
    organizer: 'charity_004', // חמלה לבעלי חיים
    attendees: 45,
    maxAttendees: 80,
    category: 'בעלי חיים',
    image: 'https://picsum.photos/id/40/300/200',
    tags: ['אימוץ', 'כלבים', 'חתולים', 'בעלי חיים']
  },
  {
    id: 'event5',
    title: 'מפגש דו-קיום - זרעים של שלום',
    description: 'מפגש חברתי לקידום דו-קיום בין יהודים וערבים עם פעילויות משותפות',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    time: '19:00',
    location: 'מרכז זרעים של שלום, נצרת',
    organizer: 'charity_006', // זרעים של שלום
    attendees: 35,
    maxAttendees: 50,
    category: 'דו-קיום ושלום',
    image: 'https://picsum.photos/id/50/300/200',
    tags: ['דו-קיום', 'שלום', 'יהודים וערבים', 'חברה']
  }
];

// Community Stats are now part of KC charity statistics
// Current User Profile
export const currentUser: User = {
  id: 'me',
  name: 'דוד ישראלי',
  email: 'david@karmacommunity.com',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  phone: '+972-50-123-4567',
  location: 'תל אביב',
  bio: 'מתנדב פעיל בקהילה, אוהב לעזור לאחרים ולבנות קהילה חזקה',
  joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  karmaPoints: 1250,
  completedTasks: 45,
  totalDonations: 12,
  isVerified: true,
  preferences: {
    language: 'he',
    notifications: true,
    privacy: 'public'
  }
};

// Categories for tasks and donations
export const categories = [
  'מזון', 'בגדים', 'חינוך', 'בריאות', 'סביבה', 'קשישים', 'ילדים', 'חיות', 'תרבות', 'ספורט', 'ייעוץ', 'תחבורה'
];

// Donation Statistics are now part of KC charity statistics - can be accessed via charities[0].statistics

// ממשקים נוספים לעמותות
export interface CharityActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'donation' | 'volunteer' | 'event' | 'project' | 'milestone';
  participants?: number;
  impact?: string;
}

export interface CharityStatistic {
  id: string;
  name: string;
  value: number;
  unit?: string;
  icon?: string;
  color?: string;
  category?: string;
  description?: string;
}

export interface CharityProject {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'planned' | 'paused';
  startDate?: string;
  endDate?: string;
  budget?: number;
  raised?: number;
  volunteersNeeded?: number;
  volunteersJoined?: number;
}

export interface CharityVolunteerOpportunity {
  id: string;
  title: string;
  description: string;
  requirements?: string[];
  timeCommitment: string;
  location?: string;
  skills?: string[];
  isUrgent?: boolean;
  contactPerson?: string;
}

export interface CharityOperatingHours {
  day: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  open: string;
  close: string;
  isClosed?: boolean;
}

// ממשק מורחב לעמותה
export interface Charity {
  id: string;
  name: string;
  description: string;
  tags: string[];
  location: {
    address: string;
    city: string;
    region: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
  foundedYear: number;
  volunteersCount: number;
  beneficiariesCount: number;
  rating: number;
  isVerified: boolean;
  logo?: string;
  images?: string[];
  urgentNeeds?: string[];
  donationTypes: ('money' | 'time' | 'items' | 'services')[];
  languages: string[];
  accessibility: {
    wheelchair: boolean;
    hearingImpaired: boolean;
    visuallyImpaired: boolean;
  };
  
  // נתונים חדשים
  recentActivities?: CharityActivity[];
  motivationalQuotes?: string[];
  statistics?: CharityStatistic[];
  events?: CommunityEvent[];
  volunteers?: string[]; // IDs של משתמשים מתנדבים (מתוך allUsers)
  beneficiaries?: string[]; // IDs של משתמשים מוטבים (מתוך allUsers)
  projects?: CharityProject[];
  volunteerOpportunities?: CharityVolunteerOpportunity[];
  operatingHours?: CharityOperatingHours[];
  achievements?: {
    id: string;
    title: string;
    description: string;
    date: string;
    icon?: string;
  }[];
  partnerships?: {
    name: string;
    type: 'government' | 'business' | 'nonprofit' | 'international';
    description?: string;
    since?: string;
  }[];
  financialTransparency?: {
    annualBudget?: number;
    lastAuditDate?: string;
    expenseBreakdown?: {
      programs: number;
      administration: number;
      fundraising: number;
    };
  };
  impact?: {
    totalBeneficiaries: number;
    monthlyImpact?: string;
    successStories?: {
      title: string;
      description: string;
      date?: string;
    }[];
  };
}

// רשימת עמותות מפורטת
export const charities: Charity[] = [
  {
    id: "charity_000",
    name: "קהילת קארמה - Karma Community",
    description: "הפלטפורמה הישראלית המובילה לחיבור בין תורמים, מתנדבים ועמותות. אנו מאמינים בכוח הקהילה ובחשיבות הנתינה ההדדית. הפלטפורמה שלנו מאפשרת לכל אחד לתרום ולקבל בדרכים שונות - כסף, זמן, חפצים ושירותים. אנו יוצרים רשת תמיכה קהילתית חזקה שמחברת בין אנשים למען מטרות חברתיות משמעותיות ובונה חברה טובה יותר לכולנו.",
    tags: ["קהילה", "תרומות", "התנדבות", "חיבור", "נתינה", "פלטפורמה דיגיטלית", "רשת חברתית"],
    location: {
      address: "רחוב הטכנולוגיה 25, תל אביב-יפו",
      city: "תל אביב-יפו", 
      region: "תל אביב והמרכז",
      coordinates: {
        lat: 32.0853,
        lng: 34.7818
      }
    },
    contact: {
      phone: "03-7777777",
      email: "info@karmacommunity.co.il",
      website: "www.karmacommunity.co.il",
      socialMedia: {
        facebook: "https://facebook.com/karmacommunity",
        instagram: "https://instagram.com/karma_community_il",
        twitter: "https://twitter.com/karmacommunity",
        linkedin: "https://linkedin.com/company/karmacommunity"
      }
    },
    foundedYear: 2023,
    volunteersCount: 10,
    beneficiariesCount: 10,
    rating: 5.0,
    isVerified: true,
    logo: "https://picsum.photos/id/200/200/200",
    images: [
      "https://picsum.photos/id/201/400/300",
      "https://picsum.photos/id/202/400/300", 
      "https://picsum.photos/id/203/400/300",
      "https://picsum.photos/id/204/400/300"
    ],
    urgentNeeds: [
      "פיתוח תכונות חדשות לפלטפורמה",
      "שיווק ויח\"צ להגדלת המודעות",
      "תמיכה טכנית למשתמשים",
      "יצירת תוכן חינוכי על נתינה",
      "שיתופי פעולה עם עמותות נוספות"
    ],
    donationTypes: ["money", "time", "items", "services"],
    languages: ["עברית", "ערבית", "אנגלית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    },
    
    recentActivities: [
      {
        id: "activity_000_1",
        title: "השקת הפלטפורמה הרשמית",
        description: "השקנו רשמית את פלטפורמת קהילת קארמה לציבור הרחב עם כל התכונות המתקדמות",
        date: "2024-01-25T12:00:00Z",
        type: "milestone",
        participants: 10,
        impact: "פלטפורמה פעילה עם 10 משתמשים ראשונים"
      },
      {
        id: "activity_000_2",
        title: "חיבור עמותות ראשונות לפלטפורמה",
        description: "חיברנו 15 עמותות ראשונות לפלטפורמה ויצרנו עבורן פרופילים מפורטים",
        date: "2024-01-20T14:00:00Z",
        type: "project",
        participants: 5,
        impact: "15 עמותות פעילות בפלטפורמה"
      },
      {
        id: "activity_000_3",
        title: "פיתוח מערכת התרומות המתקדמת",
        description: "פיתחנו מערכת תרומות מתקדמת המאפשרת תרומת כסף, זמן, חפצים ושירותים",
        date: "2024-01-15T10:00:00Z",
        type: "milestone",
        participants: 3,
        impact: "מערכת תרומות מלאה ופעילה"
      }
    ],
    
    motivationalQuotes: [
      "יחד אנחנו יכולים ליצור שינוי אמיתי בעולם",
      "כל תרומה, קטנה כגדולה, יוצרת גלי שינוי",
      "הקהילה הכי חזקה היא זו שכל חבר בה דואג לאחר",
      "נתינה היא לא רק מה שאתה עושה - זה מי שאתה",
      "הטכנולוgia יכולה לחבר לבבות ולייצר טוב בעולם",
      "כל אחד יכול לתרום משהו - המקום שלך מחכה לך",
      "קהילה אמיתית נבנית על נתינה הדדית ואכפתיות"
    ],
    
    statistics: [
      {
        id: "stat_000_1",
        name: "משתמשים פעילים",
        value: 10,
        unit: "משתמשים",
        icon: "👥",
        color: "#4CAF50",
        description: "משתמשים רשומים ופעילים בפלטפורמה"
      },
      {
        id: "stat_000_2",
        name: "עמותות מחוברות",
        value: 15,
        unit: "עמותות",
        icon: "🏢",
        color: "#FF9800",
        description: "עמותות רשומות ופעילות בפלטפורמה"
      },
      {
        id: "stat_000_3",
        name: "תרומות שבוצעו",
        value: 25,
        unit: "תרומות",
        icon: "💝",
        color: "#2196F3",
        description: "סך התרומות שבוצעו דרך הפלטפורמה"
      },
      {
        id: "stat_000_4",
        name: "שעות התנדבות",
        value: 120,
        unit: "שעות",
        icon: "⏰",
        color: "#9C27B0",
        description: "שעות התנדבות שתרמו המשתמשים"
      },
      {
        id: "stat_000_5",
        name: "אירועים קהילתיים",
        value: 5,
        unit: "אירועים",
        icon: "🎉",
        color: "#E91E63",
        description: "אירועים קהילתיים שאורגנו דרך הפלטפורמה"
      },
      {
        id: "stat_000_6",
        name: "חברים פעילים",
        value: 10,
        unit: "חברים",
        icon: "👨‍👩‍👧‍👦",
        color: "#673AB7",
        description: "חברי קהילה פעילים ומעורבים"
      },
      {
        id: "stat_000_7",
        name: "פרויקטים פעילים",
        value: 2,
        unit: "פרויקטים",
        icon: "🚀",
        color: "#009688",
        description: "פרויקטים פעילים של הפלטפורמה"
      }
    ],
    
    volunteers: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10"],
    beneficiaries: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10"],
    
    projects: [
      {
        id: "project_000_1",
        title: "הרחבת הפלטפורמה לכל הארץ",
        description: "הרחבת הפלטפורמה לכלול עמותות ומשתמשים מכל רחבי הארץ, עם דגש על אזורי פריפריה",
        status: "active",
        startDate: "2024-02-01",
        endDate: "2024-12-31",
        budget: 500000,
        raised: 150000,
        volunteersNeeded: 20,
        volunteersJoined: 8
      },
      {
        id: "project_000_2", 
        title: "פיתוח אפליקציה ניידת",
        description: "פיתוח אפליקציה ניידת מתקדמת לאנדרואיד ו-iOS להנגשת הפלטפורמה לכולם",
        status: "active",
        startDate: "2024-01-01",
        endDate: "2024-06-30",
        budget: 300000,
        raised: 200000,
        volunteersNeeded: 10,
        volunteersJoined: 5
      }
    ],
    
    volunteerOpportunities: [
      {
        id: "vol_000_1",
        title: "פיתוח תוכנה ועיצוב",
        description: "עזרה בפיתוח תכונות חדשות, תיקון באגים ועיצוב ממשק משתמש",
        requirements: ["ידע בתכנות", "ניסיון בפיתוח אפליקציות", "יצירתיות בעיצוב"],
        timeCommitment: "5-10 שעות שבועיות",
        location: "עבודה מרחוק או במשרדי החברה",
        skills: ["תכנות", "עיצוב", "UX/UI"],
        isUrgent: true,
        contactPerson: "צוות הפיתוח - dev@karmacommunity.co.il"
      },
      {
        id: "vol_000_2",
        title: "שיווק ותוכן דיגיטלי",
        description: "יצירת תוכן לרשתות חברתיות, כתיבת פוסטים ועזרה בקמפיינים שיווקיים",
        requirements: ["כישורי כתיבה", "ידע ברשתות חברתיות", "יצירתיות"],
        timeCommitment: "3-5 שעות שבועיות",
        location: "עבודה מרחוק",
        skills: ["כתיבה", "שיווק דיגיטלי", "רשתות חברתיות"],
        isUrgent: false,
        contactPerson: "צוות השיווק - marketing@karmacommunity.co.il"
      }
    ],
    
    operatingHours: [
      { day: "sunday", open: "09:00", close: "18:00" },
      { day: "monday", open: "09:00", close: "18:00" },
      { day: "tuesday", open: "09:00", close: "18:00" },
      { day: "wednesday", open: "09:00", close: "18:00" },
      { day: "thursday", open: "09:00", close: "18:00" },
      { day: "friday", open: "09:00", close: "14:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    
    achievements: [
      {
        id: "achieve_000_1",
        title: "השקה מוצלחת של הפלטפורמה",
        description: "השקנו בהצלחה את פלטפורמת קהילת קארמה עם 10 משתמשים ו-15 עמותות",
        date: "2024-01-25",
        icon: "🚀"
      },
      {
        id: "achieve_000_2",
        title: "25 תרומות ראשונות",
        description: "הגענו ל-25 תרומות ראשונות דרך הפלטפורמה תוך חודש מההשקה",
        date: "2024-01-30",
        icon: "🎯"
      }
    ],
    
    partnerships: [
      {
        name: "משרד הרווחה והביטחון החברתי",
        type: "government",
        description: "שיתוף פעולה בקידום התנדבות ונתינה בישראל",
        since: "2024"
      },
      {
        name: "גוגל ישראל",
        type: "business", 
        description: "תמיכה טכנולוגית ושירותי קלאוד",
        since: "2024"
      }
    ],
    
    financialTransparency: {
      annualBudget: 800000,
      lastAuditDate: "2023-12-31",
      expenseBreakdown: {
        programs: 70,
        administration: 20,
        fundraising: 10
      }
    },
    
    impact: {
      totalBeneficiaries: 10,
      monthlyImpact: "מחברים בין 10 משתמשים ו-15 עמותות, מאפשרים 25 תרומות ויוצרים קהילה תומכת",
      successStories: [
        {
          title: "החיבור הראשון - אנה ולב זהב",
          description: "אנה כהן הייתה המשתמשת הראשונה שהתחברה לעמותת לב זהב דרך הפלטפורמה. היא התחילה לעזור בביקורי בית לקשישים ומצאה בכך מקור השראה ושמחה עצומים",
          date: "2024-01-26"
        },
        {
          title: "דני והתרומה הטכנולוגית",
          description: "דני לוי, מפתח תוכנה, תרם מזמנו לפיתוח תכונות חדשות בפלטפורמה ועזר לשפר את החוויה לכל המשתמשים",
          date: "2024-01-28"
        }
      ]
    }
  },
  {
    id: "charity_001",
    name: "לב זהב - עמותה לתמיכה בקשישים",
    description: "עמותה המספקת תמיכה חברתית, רפואית ונפשית לקשישים בודדים ועניים ברחבי הארץ. אנו פועלים מתוך אמונה שכל קשיש זכאי לחיים בכבוד ובקהילה תומכת. העמותה מתמחה בביקורי בית אישיים, מתן סיוע רפואי וכלכלי, ארגון פעילויות חברתיות וקבוצות תמיכה. אנו שואפים ליצור רשת תמיכה מקיפה שמבטיחה שאף קשיש לא יישאר לבד.",
    tags: ["קשישים", "תמיכה חברתית", "בריאות", "בודדים", "רווחה", "ביקורי בית", "סיוע רפואי"],
    location: {
      address: "רחוב הרצל 15, תל אביב-יפו",
      city: "תל אביב-יפו",
      region: "תל אביב והמרכז",
      coordinates: {
        lat: 32.0853,
        lng: 34.7818
      }
    },
    contact: {
      phone: "03-1234567",
      email: "info@levzahav.org.il",
      website: "www.levzahav.org.il",
      socialMedia: {
        facebook: "https://facebook.com/levzahav",
        instagram: "https://instagram.com/levzahav_org",
        twitter: "https://twitter.com/levzahav",
        linkedin: "https://linkedin.com/company/levzahav"
      }
    },
    foundedYear: 1995,
    volunteersCount: 285,
    beneficiariesCount: 1350,
    rating: 4.8,
    isVerified: true,
    logo: "https://picsum.photos/id/100/200/200",
    images: [
      "https://picsum.photos/id/101/400/300",
      "https://picsum.photos/id/102/400/300",
      "https://picsum.photos/id/103/400/300",
      "https://picsum.photos/id/104/400/300"
    ],
    urgentNeeds: [
      "מתנדבים לביקורי בית בשעות הערב",
      "ציוד רפואי בסיסי (מכשירי לחץ דם, מדי סוכר)",
      "תרומות כספיות לפרויקט מרכز היום החדש",
      "רכבים לשירותי הסעה רפואית",
      "מחשבים וטאבלטים לפעילויות דיגיטליות"
    ],
    donationTypes: ["money", "time", "items", "services"],
    languages: ["עברית", "רוסית", "אנגלית", "יידיש"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    },
    
    recentActivities: [
      {
        id: "activity_001_1",
        title: "חלוקת חבילות מזון לחג פסח",
        description: "חולקנו 180 חבילות מזון מיוחדות לחג פסח לקשישים בכל רחבי תל אביב, כולל מצות, יין, בשר ומוצרי יסוד נוספים",
        date: "2024-01-20T10:00:00Z",
        type: "project",
        participants: 52,
        impact: "180 קשישים קיבלו חבילות מזון מלאות לחג"
      },
      {
        id: "activity_001_2", 
        title: "השקת תוכנית 'קשיש דיגיטלי'",
        description: "התחלנו תוכנית חדשנית ללימוד שימוש בטכנולוגיה לקשישים, כולל וידאו קולים עם המשפחה ושימוש באפליקציות בריאות",
        date: "2024-01-18T14:00:00Z",
        type: "milestone",
        participants: 25,
        impact: "45 קשישים נרשמו לקורס הטכנולוגיה הראשון"
      },
      {
        id: "activity_001_3",
        title: "תרומה מיוחדת מחברת היי-טק",
        description: "קיבלנו תרומה של 75,000 ₪ מחברת טכנולוגיה מקומית לרכישת ציוד רפואי מתקדם ושיפוץ מרכז היום",
        date: "2024-01-15T09:00:00Z",
        type: "donation",
        impact: "ציוד רפואי חדש ושיפוץ מרכז היום לטובת 200 קשישים"
      },
      {
        id: "activity_001_4",
        title: "יום גיבוש למתנדבים",
        description: "קיימנו יום גיבוש מיוחד למתנדבים החדשים עם הכשרות מקצועיות וסדנאות העשרה",
        date: "2024-01-12T09:00:00Z",
        type: "event",
        participants: 38,
        impact: "38 מתנדבים חדשים הצטרפו לפעילות השוטפת"
      },
      {
        id: "activity_001_5",
        title: "פתיחת נקודת סיוע חדשה בדרום העיר",
        description: "פתחנו נקודת סיוע חדשה בדרום תל אביב לקשישים שמתקשים להגיע למרכז הראשי",
        date: "2024-01-08T11:00:00Z",
        type: "milestone",
        participants: 15,
        impact: "85 קשישים נוספים מקבלים שירות קרוב לבית"
      }
    ],
    
    motivationalQuotes: [
      "כבוד הזקנה - זה לא רק מצווה, זה דרך חיים ואחריות חברתית של כולנו",
      "כל קשיש הוא ספר פתוח של חכמה, ניסיון וסיפורי חיים שאסור לאבד",
      "הזמן שאנו נותנים לקשישים חוזר אלינו כברכה, חכמה ותחושת מימוש עמוקה",
      "בכל חיוך שאנו מביאים לקשיש - אנו מאירים את העולם ומקבלים אור בחזרה",
      "לתמוך בקשישים זה להשקיע בעתיד שלנו ולכבד את העבר שבנה אותנו",
      "כל ביקור בית הוא לא רק סיוע - זה חיבור אנושי שמעשיר את שני הצדדים",
      "הקשישים הם האוצר הלאומי שלנו - חובתנו לשמור עליו ולכבד אותו",
      "בזקנה יש יופי מיוחד - חכמת החיים, הסבלנות והפרספקטיבה הרחבה"
    ],
    
    statistics: [
      {
        id: "stat_001_1",
        name: "ביקורי בית השבוע",
        value: 420,
        unit: "ביקורים",
        icon: "🏠",
        color: "#4CAF50",
        description: "ביקורי בית שבועיים לקשישים בודדים ברחבי תל אביב"
      },
      {
        id: "stat_001_2",
        name: "ארוחות חמות חולקו",
        value: 1580,
        unit: "ארוחות",
        icon: "🍲",
        color: "#FF9800",
        description: "ארוחות חמות ומזינות שחולקו החודש"
      },
      {
        id: "stat_001_3",
        name: "שעות התנדבות",
        value: 3200,
        unit: "שעות",
        icon: "⏰",
        color: "#2196F3",
        description: "שעות התנדבות שנתרמו החודש על ידי המתנדבים"
      },
      {
        id: "stat_001_4",
        name: "קשישים פעילים בתוכניות",
        value: 520,
        unit: "משתתפים",
        icon: "👥",
        color: "#9C27B0",
        description: "קשישים המשתתפים בפעילויות חברתיות ותרבותיות"
      },
      {
        id: "stat_001_5",
        name: "טיפולים רפואיים",
        value: 280,
        unit: "טיפולים",
        icon: "🩺",
        color: "#E91E63",
        description: "טיפולים רפואיים שניתנו בבית החודש"
      },
      {
        id: "stat_001_6",
        name: "תרומות כספיות החודש",
        value: 45000,
        unit: "₪",
        icon: "💰",
        color: "#FF5722",
        description: "סכום התרומות הכספיות שהתקבלו החודש"
      }
    ],
    
    volunteers: ["u1", "u5", "u6", "u10"],
    beneficiaries: ["u4", "u7"],
    
    projects: [
      {
        id: "project_001_1",
        title: "מרכז יום מתקדם לקשישים - דרום תל אביב",
        description: "הקמת מרכז יום חדשני ומתקדם בדרום תל אביב הכולל פעילויות טיפוליות, חברתיות ותרבותיות. המרכז יכלול חדר כושר מותאם, חדר מחשבים, ספרייה, מטבח מקצועי וחצר מעוצבת",
        status: "active",
        startDate: "2024-01-01",
        endDate: "2024-08-30",
        budget: 250000,
        raised: 145000,
        volunteersNeeded: 35,
        volunteersJoined: 18
      },
      {
        id: "project_001_2",
        title: "תוכנית 'דור לדור' - העברת חכמה",
        description: "תוכנית חדשנית המחברת בין קשישים לצעירים למען העברת ידע, חוויות וחכמת חיים. כוללת מפגשים שבועיים, סדנאות משותפות ופרויקטים קהילתיים",
        status: "completed",
        startDate: "2023-09-01",
        endDate: "2023-12-31",
        budget: 80000,
        raised: 82000,
        volunteersNeeded: 40,
        volunteersJoined: 42
      },
      {
        id: "project_001_3",
        title: "רשת חירום דיגיטלית לקשישים",
        description: "פיתוח ויישום מערכת התרעה דיגיטלית לקשישים בסיכון, כולל כפתורי חירום חכמים, מעקב בריאותי ויצירת קשר אוטומטי עם המשפחה והצוות הרפואי",
        status: "planned",
        startDate: "2024-03-01",
        endDate: "2024-12-31",
        budget: 180000,
        raised: 35000,
        volunteersNeeded: 25,
        volunteersJoined: 8
      }
    ],
    
    volunteerOpportunities: [
      {
        id: "vol_001_1",
        title: "ביקורי בית שבועיים - תוכנית 'חבר נאמן'",
        description: "ביקור קבוע ואישי אצל קשיש בודד, כולל שיחה, ליווי לקניות או לרופא, עזרה בעבודות בית קלות ויצירת קשר חם ומשמעותי",
        requirements: ["סבלנות ואמפתיה", "יכולת הקשבה פעילה", "זמינות קבועה לפחות 6 חודשים", "רישיון נהיגה - יתרון"],
        timeCommitment: "3-4 שעות שבועיות",
        location: "תל אביב ופרברים - בתי הקשישים",
        skills: ["תקשורת בינאישית", "אמפתיה", "סבלנות"],
        isUrgent: true,
        contactPerson: "מיכל כהן - רכזת התנדבות - 03-1234567"
      },
      {
        id: "vol_001_2",
        title: "מדריך פעילויות במרכז היום",
        description: "הדרכה וליווי קשישים בפעילויות חברתיות, תרבותיות וטיפוליות במרכז היום. כולל ארגון משחקים, סדנאות יצירה, שירה בקבוצה ופעילויות זיכרון",
        requirements: ["אנרגיה חיובית וחיוך", "יכולת עבודה בקבוצה", "יצירתיות ורעיונות חדשים"],
        timeCommitment: "4-6 שעות שבועיות",
        location: "מרכז העמותה - רחוב הרצל 15",
        skills: ["ארגון פעילויות", "יצירתיות", "עבודה בצוות"],
        isUrgent: false,
        contactPerson: "דוד לוי - מנהל מרכז היום - 03-1234568"
      },
      {
        id: "vol_001_3",
        title: "מדריך טכנולוגיה לקשישים",
        description: "הוראת שימוש בטכנולוגיה לקשישים - סמארטפונים, טאבלטים, מחשבים. עזרה בפתיחת חשבונות, שימוש בווידאו קולים ואפליקציות שימושיות",
        requirements: ["ידע בטכנולוגיה", "סבלנות רבה", "יכולת הסברה פשוטה וברורה"],
        timeCommitment: "2-3 שעות שבועיות",
        location: "מרכז העמותה ובתי קשישים",
        skills: ["טכנולוגיה", "הוראה", "סבלנות"],
        isUrgent: true,
        contactPerson: "אורי בן דוד - רכז טכנולוגיה - 03-1234569"
      },
      {
        id: "vol_001_4",
        title: "נהג התנדבותי לשירותי הסעה",
        description: "הסעת קשישים לביקורים רפואיים, קניות, פעילויות חברתיות ואירועים. שירות חיוני המאפשר לקשישים לשמור על עצמאות ואיכות חיים",
        requirements: ["רישיון נהיגה בתוקף", "ביטוח רכב מקיף", "זמינות גמישה", "סבלנות ואדיבות"],
        timeCommitment: "4-8 שעות שבועיות",
        location: "כל רחבי תל אביב והמרכז",
        skills: ["נהיגה בטוחה", "ניווט", "תקשורת"],
        isUrgent: true,
        contactPerson: "שרה אברהם - רכזת הסעות - 03-1234570"
      }
    ],
    
    operatingHours: [
      { day: "sunday", open: "08:00", close: "17:00" },
      { day: "monday", open: "08:00", close: "17:00" },
      { day: "tuesday", open: "08:00", close: "17:00" },
      { day: "wednesday", open: "08:00", close: "17:00" },
      { day: "thursday", open: "08:00", close: "17:00" },
      { day: "friday", open: "08:00", close: "14:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    
    achievements: [
      {
        id: "achieve_001_1",
        title: "פרס מצוינות מעירית תל אביב-יפו 2023",
        description: "זכינו בפרס המצוינות הארצי על פעילותנו החדשנית למען קשישים ועל התרומה המשמעותית לקהילה",
        date: "2023-11-15",
        icon: "🏆"
      },
      {
        id: "achieve_001_2",
        title: "אבן דרך: 1,500 קשישים מקבלים שירות",
        description: "הגענו לאבן דרך היסטורית של 1,500 קשישים המקבלים שירותים שוטפים מהעמותה",
        date: "2023-12-20",
        icon: "🎯"
      },
      {
        id: "achieve_001_3",
        title: "הכרה כעמותה מובילה בתחום הקשישים",
        description: "קיבלנו הכרה רسמית ממשרד הרווחה כעמותה מובילה ופורצת דרך בתחום הטיפול בקשישים",
        date: "2023-09-10",
        icon: "🌟"
      },
      {
        id: "achieve_001_4",
        title: "השקת התוכנית הדיגיטלית הראשונה בישראל",
        description: "פיתחנו והשקנו את התוכנית הדיגיטלית הראשונה מסוגה בישראל לקשישים",
        date: "2024-01-18",
        icon: "💻"
      }
    ],
    
    partnerships: [
      {
        name: "עירית תל אביב-יפו",
        type: "government",
        description: "שיתוף פעולה אסטרטגי בתחום הרווחה החברתית, כולל מימון חלקי ותמיכה לוגיסטית",
        since: "2018"
      },
      {
        name: "קופת חולים כללית",
        type: "business",
        description: "מתן שירותי בריאות מסובסדים לקשישים, כולל בדיקות בית וטיפול רפואי ביתי",
        since: "2020"
      },
      {
        name: "אוניברסיטת תל אביב - הפקולטה לרפואה",
        type: "nonprofit",
        description: "שיתוף פעולה במחקר גרונטולוגי והכשרת סטודנטים לרפואה בטיפול בקשישים",
        since: "2021"
      },
      {
        name: "רשת סופרמרקטים 'שופרסל'",
        type: "business",
        description: "תרומת מוצרי מזון ומתן הנחות מיוחדות לקשישים מטעם העמותה",
        since: "2019"
      },
      {
        name: "ארגון הקשישים הבינלאומי",
        type: "international",
        description: "שיתוף ידע וחוויות עם ארגונים דומים ברחבי העולם והשתתפות בכנסים בינלאומיים",
        since: "2022"
      }
    ],
    
    financialTransparency: {
      annualBudget: 2800000,
      lastAuditDate: "2023-12-31",
      expenseBreakdown: {
        programs: 82,
        administration: 10,
        fundraising: 8
      }
    },
    
    impact: {
      totalBeneficiaries: 1350,
      monthlyImpact: "מספקים תמיכה יומיומית ומקיפה ל-420 קשישים בודדים, עוזרים ל-280 קשישים נוספים בפעילויות שבועיות ומגיעים ל-650 קשישים נוספים בפעילויות מיוחדות ואירועים",
      successStories: [
        {
          title: "שרה בת ה-82 מצאה משפחה חדשה ואהבה לחיים",
          description: "לאחר שנים של בדידות קשה והדרדרות במצב הרוח, שרה הצטרפה לפעילויות הקבוצתיות במרכז היום. היא יצרה חברויות חדשות ומשמעותיות, למדה להשתמש בטאבלט כדי לדבר עם הנכדים ואפילו הצטרפה לחוג שירה. היום היא אחת המתנדבות הפעילות שלנו ועוזרת לקשישים אחרים להשתלב",
          date: "2023-10-15"
        },
        {
          title: "מוקד החירום החדש הציל את חייו של יוסף",
          description: "יוסף בן ה-78, שחי לבד, חש ברע בלילה ולחץ על כפתור החירום החכם שקיבל מהעמותה. המערכת זיהתה מיד את המצב, יצרה קשר עם מוקד החירום ועם בנו, וזימנה אמבולנס. יוסף אושפז בזמן עם התקף לב וחייו ניצלו הודות לטיפול המהיר",
          date: "2023-09-22"
        },
        {
          title: "מרים למדה טכנולוגיה בגיל 85 והפכה למורה",
          description: "מרים, אלמנה בת 85, הצטרפה לקורס הטכנולוגיה לקשישים מתוך סקרנות. היא למדה להשתמש בסמארטפון, בווידאו קולים ואפילו ברשתות חברתיות. היום היא מסייעת למתנדבים ללמד קשישים אחרים ומנהלת קבוצת ווטסאפ של 30 קשישים מהשכונה",
          date: "2023-12-03"
        },
        {
          title: "אברהם חזר לחיות לאחר אובדן האישה",
          description: "אברהם בן ה-79 היה במצב של דיכאון עמוק לאחר מות אישתו. המתנדבת שלנו רחל ביקרה אותו פעמיים בשבוע, הביאה לו אוכל ובעיקר הקשיבה. בהדרגה הוא התחיל לצאת מהבית, הצטרף לקבוצת תמיכה לאבלים ואפילו התחיל לבשל שוב. היום הוא מתנדב בעצמו ועוזר לקשישים אחרים",
          date: "2023-11-28"
        }
      ]
    }
  },
  {
    id: "charity_002",
    name: "אור לילדים - עמותה לקידום חינוך",
    description: "עמותה המקדמת חינוך איכותי ושוויוני לכל ילד בישראל, עם דגש מיוחד על ילדים מרקע סוציו-אקונומי נמוך. אנו מאמינים שכל ילד זכאי להזדמנות שווה להצליח ולממש את הפוטנציאל שלו. העמותה מפעילה מגוון תוכניות חינוכיות, מעניקה מלגות לימודים, מקיימת חוגים וסדנאות העשרה, ומספקת ליווי אישי לתלמידים. אנו פועלים בשיתוף עם בתי ספר, רשויות מקומיות ומשפחות כדי ליצור סביבה תומכת ומעצימה שמאפשרת לכל ילד לפרוח.",
    tags: ["חינוך", "ילדים", "שוויון הזדמנויות", "קידום", "לימודים", "מלגות", "העשרה", "ליווי אישי"],
    location: {
      address: "רחוב יפו 45, ירושלים",
      city: "ירושלים",
      region: "ירושלים והסביבה",
      coordinates: {
        lat: 31.7857,
        lng: 35.2007
      }
    },
    contact: {
      phone: "02-9876543",
      email: "contact@orlayeladim.org.il",
      website: "www.orlayeladim.org.il",
      socialMedia: {
        facebook: "https://facebook.com/orlayeladim",
        instagram: "https://instagram.com/or_layeladim",
        twitter: "https://twitter.com/orlayeladim",
        linkedin: "https://linkedin.com/company/orlayeladim"
      }
    },
    foundedYear: 2001,
    volunteersCount: 220,
    beneficiariesCount: 950,
    rating: 4.9,
    isVerified: true,
    logo: "https://picsum.photos/id/110/200/200",
    images: [
      "https://picsum.photos/id/111/400/300",
      "https://picsum.photos/id/112/400/300",
      "https://picsum.photos/id/113/400/300",
      "https://picsum.photos/id/114/400/300"
    ],
    urgentNeeds: [
      "מתנדבים לליווי לימודי בערבים ובסופי שבוע",
      "מחשבים נישאים וטאבלטים לתלמידים",
      "תרומות כספיות למלגות לימודים",
      "ספרי לימוד וחומרי עזר לכל הגילאים",
      "מורים מתנדבים למקצועות מדעים ומתמטיקה"
    ],
    donationTypes: ["money", "time", "items", "services"],
    languages: ["עברית", "ערבית", "אנגלית", "אמהרית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    },
    
    recentActivities: [
      {
        id: "activity_002_1",
        title: "פתיחת מרכז לימודים חדש בשכונת קטמון",
        description: "פתחנו מרכז לימודים חדש ומתקדם בשכונת קטמון בירושלים, הכולל 8 כיתות לימוד, מעבדת מחשבים וספרייה עשירה",
        date: "2024-01-22T10:00:00Z",
        type: "milestone",
        participants: 85,
        impact: "120 ילדים נוספים יוכלו ללמוד במקום קרוב לבית"
      },
      {
        id: "activity_002_2",
        title: "חלוקת 200 מלגות לימודים לשנת הלימודים החדשה",
        description: "חילקנו 200 מלגות לימודים מלאות לתלמידים מצטיינים ממשפחות במצוקה כלכלית, כולל מימון שכר לימוד, ספרים וציוד",
        date: "2024-01-20T14:00:00Z",
        type: "project",
        participants: 15,
        impact: "200 תלמידים יוכלו להמשיך בלימודיהם ללא דאגות כלכליות"
      },
      {
        id: "activity_002_3",
        title: "השקת תוכנית 'מנטור דיגיטלי' עם חברות הייטק",
        description: "השקנו תוכנית חדשנית בשיתוף עם 5 חברות הייטק מובילות, המספקת מנטורים מקצועיים לתלמידי תיכון בתחומי המדע והטכנולוגיה",
        date: "2024-01-18T16:00:00Z",
        type: "milestone",
        participants: 45,
        impact: "80 תלמידי תיכון מקבלים ליווי מקצועי לקראת הבחירה בקריירה"
      },
      {
        id: "activity_002_4",
        title: "יום כיף חינוכי למשפחות במוזיאון המדע",
        description: "ארגנו יום כיף מיוחד למשפחות במוזיאון המדע בירושלים, כולל סדנאות מדעיות, הרצאות וביקור מודרך",
        date: "2024-01-16T09:00:00Z",
        type: "event",
        participants: 180,
        impact: "60 משפחות נהנו מיום העשרה משפחתי וחינוכי"
      },
      {
        id: "activity_002_5",
        title: "תרומת 150 מחשבים מחברת טכנולוגיה",
        description: "קיבלנו תרומה מיוחדת של 150 מחשבים נישאים חדשים מחברת טכנולוגיה מקומית, שחולקו לתלמידים הזקוקים לכך",
        date: "2024-01-14T11:00:00Z",
        type: "donation",
        impact: "150 תלמידים קיבלו מחשבים אישיים ללימודים מהבית"
      }
    ],
    
    motivationalQuotes: [
      "חינוך הוא הנשק החזק ביותר שאפשר להשתמש בו כדי לשנות את העולם",
      "כל ילד הוא אמן - השאלה היא איך לשמור על האמנות שלו כשהוא גדל",
      "ההשקעה בחינוך ילדים היא ההשקעה הטובה ביותר בעתיד שלנו",
      "לא משנה מאיפה אתה בא - חינוך יכול לקחת אותך לכל מקום",
      "המורה הטוב ביותר הוא זה שמראה איפה לחפש, אבל לא אומר מה לראות",
      "כל ילד זכאי לחלום גדול ולקבל את הכלים להגשים אותו",
      "חינוך זה לא מילוי דלי, אלא הדלקת אש",
      "הילדים הם העתיד שלנו - בואו נתן להם את הכלים הטובים ביותר"
    ],
    
    statistics: [
      {
        id: "stat_002_1",
        name: "תלמידים בליווי אישי",
        value: 380,
        unit: "תלמידים",
        icon: "👨‍🎓",
        color: "#4CAF50",
        description: "תלמידים המקבלים ליווי לימודי אישי שבועי"
      },
      {
        id: "stat_002_2",
        name: "מלגות לימודים פעילות",
        value: 240,
        unit: "מלגות",
        icon: "🎓",
        color: "#FF9800",
        description: "מלגות לימודים פעילות לתלמידים מצטיינים"
      },
      {
        id: "stat_002_3",
        name: "שעות הוראת תגבור",
        value: 1200,
        unit: "שעות",
        icon: "📚",
        color: "#2196F3",
        description: "שעות הוראת תגבור שניתנו החודש"
      },
      {
        id: "stat_002_4",
        name: "חוגי העשרה פעילים",
        value: 25,
        unit: "חוגים",
        icon: "🎨",
        color: "#9C27B0",
        description: "חוגי העשרה פעילים בתחומים שונים"
      },
      {
        id: "stat_002_5",
        name: "ציון ממוצע שיפור",
        value: 15,
        unit: "נקודות",
        icon: "📈",
        color: "#E91E63",
        description: "שיפור ממוצע בציונים של תלמידים בתוכנית"
      },
      {
        id: "stat_002_6",
        name: "מחשבים שחולקו השנה",
        value: 180,
        unit: "מחשבים",
        icon: "💻",
        color: "#FF5722",
        description: "מחשבים וטאבלטים שחולקו לתלמידים השנה"
      }
    ],
    
    volunteers: ["u2", "u3", "u8"],
    beneficiaries: ["u6", "u9"],
    
    projects: [
      {
        id: "project_002_1",
        title: "מרכזי לימוד קהילתיים - הרחבה ארצית",
        description: "הקמת 12 מרכזי לימוד קהילתיים חדשים ברחבי הארץ, המיועדים לספק ליווי לימודי, חוגי העשרה ותמיכה חינוכית לילדים מרקע סוציו-אקונומי נמוך",
        status: "active",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        budget: 1200000,
        raised: 680000,
        volunteersNeeded: 60,
        volunteersJoined: 35
      },
      {
        id: "project_002_2",
        title: "תוכנית המלגות הלאומית",
        description: "הרחבת תוכנית המלגות לכלול 500 תלמידים נוספים מכל רחבי הארץ, כולל מימון מלא של שכר לימוד, ספרים, ציוד וליווי אישי",
        status: "active",
        startDate: "2023-09-01",
        endDate: "2024-08-31",
        budget: 800000,
        raised: 750000,
        volunteersNeeded: 25,
        volunteersJoined: 22
      },
      {
        id: "project_002_3",
        title: "פלטפורמה דיגיטלית ללמידה מרחוק",
        description: "פיתוח פלטפורמה דיגיטלית מתקדמת ללמידה מרחוק, הכוללת שיעורים אינטראקטיביים, מערכת מעקב התקדמות ותמיכה טכנית לתלמידים ומורים",
        status: "planned",
        startDate: "2024-03-01",
        endDate: "2025-02-28",
        budget: 450000,
        raised: 120000,
        volunteersNeeded: 15,
        volunteersJoined: 6
      }
    ],
    
    volunteerOpportunities: [
      {
        id: "vol_002_1",
        title: "מורה מתנדב לליווי אישי",
        description: "ליווי לימודי אישי של תלמידים בבית הספר או במרכזי הלימוד שלנו. עזרה בשיעורי בית, הכנה לבחינות והעברת אהבת הלמידה",
        requirements: ["השכלה אקדמית או תיכונית מלאה", "סבלנות וחיבה לילדים", "זמינות קבועה פעמיים בשבוע"],
        timeCommitment: "4-6 שעות שבועיות",
        location: "מרכזי הלימוד בירושלים ובפרברים",
        skills: ["הוראה", "סבלנות", "תקשורת עם ילדים"],
        isUrgent: true,
        contactPerson: "מיכל רוזן - רכזת התנדבות - 02-9876544"
      },
      {
        id: "vol_002_2",
        title: "מדריך חוגי העשרה",
        description: "הדרכת חוגי העשרה בתחומים שונים: אומנות, מדעים, ספורט, מוזיקה, תיאטרון ועוד. יצירת חוויות למידה מהנות ומעשירות",
        requirements: ["מומחיות בתחום הרלוונטי", "יכולת הדרכה והעברת ידע", "יצירתיות ואנרגיה חיובית"],
        timeCommitment: "3-4 שעות שבועיות",
        location: "מרכזי הלימוד ובתי ספר שותפים",
        skills: ["הדרכה", "יצירתיות", "מומחיות תחומית"],
        isUrgent: false,
        contactPerson: "דוד כהן - מנהל חוגים - 02-9876545"
      },
      {
        id: "vol_002_3",
        title: "תמיכה טכנולוגית ומחשבים",
        description: "עזרה לתלמידים בשימוש במחשבים, תוכנות לימוד ופלטפורמות דיגיטליות. הדרכה טכנולוגית ופתרון בעיות טכניות",
        requirements: ["ידע טכנולוגי מתקדם", "יכולת הסברה פשוטה", "סבלנות עם מתחילים"],
        timeCommitment: "2-4 שעות שבועיות",
        location: "מרכזי הלימוד ותמיכה מרחוק",
        skills: ["טכנולוגיה", "הוראה", "פתרון בעיות"],
        isUrgent: true,
        contactPerson: "אורי לוי - רכז טכנולוגיה - 02-9876546"
      },
      {
        id: "vol_002_4",
        title: "מנטור קריירה לתלמידי תיכון",
        description: "ליווי ויעוץ לתלמידי תיכון בבחירת מסלול לימודים וקריירה, הכנה לבחינות בגרות ותמיכה בקבלת החלטות חשובות",
        requirements: ["ניסיון מקצועי רלוונטי", "יכולת ליווי והכוונה", "זמינות לפגישות קבועות"],
        timeCommitment: "2-3 שעות שבועיות",
        location: "מרכזי הלימוד ופגישות אונליין",
        skills: ["ייעוץ", "הכוונה מקצועית", "ניסיון תעסוקתי"],
        isUrgent: false,
        contactPerson: "שרה אברהם - רכזת מנטורים - 02-9876547"
      }
    ],
    
    operatingHours: [
      { day: "sunday", open: "08:00", close: "18:00" },
      { day: "monday", open: "08:00", close: "18:00" },
      { day: "tuesday", open: "08:00", close: "18:00" },
      { day: "wednesday", open: "08:00", close: "18:00" },
      { day: "thursday", open: "08:00", close: "18:00" },
      { day: "friday", open: "08:00", close: "13:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    
    achievements: [
      {
        id: "achieve_002_1",
        title: "פרס משרד החינוך למצוינות חינוכית 2023",
        description: "זכינו בפרס המצוינות החינוכית הארצי ממשרד החינוך על התרומה המשמעותית לקידום החינוך בישראל",
        date: "2023-12-10",
        icon: "🏆"
      },
      {
        id: "achieve_002_2",
        title: "1000 בוגרים התקבלו לאוניברסיטאות",
        description: "הגענו לאבן דרך מרגשת - 1000 בוגרי התוכניות שלנו התקבלו ללימודים אקדמיים במוסדות מובילים",
        date: "2023-10-15",
        icon: "🎓"
      },
      {
        id: "achieve_002_3",
        title: "הכרה בינלאומית מאונסקו",
        description: "קיבלנו הכרה מיוחדת מארגון אונסקו כמודל מוביל לקידום שוויון חינוכי במזרח התיכון",
        date: "2023-09-20",
        icon: "🌍"
      },
      {
        id: "achieve_002_4",
        title: "שיפור של 25% בציוני הבגרות",
        description: "תלמידי התוכניות שלנו השיגו שיפור ממוצע של 25% בציוני הבגרות לעומת השנה הקודמת",
        date: "2023-08-30",
        icon: "📈"
      }
    ],
    
    partnerships: [
      {
        name: "משרד החינוך",
        type: "government",
        description: "שיתוף פעולה אסטרטגי עם משרד החינוך בפיתוח תוכניות חינוכיות חדשניות ומימון פרויקטים",
        since: "2003"
      },
      {
        name: "האוניברסיטה העברית בירושלים",
        type: "nonprofit",
        description: "שיתוף במחקרים חינוכיים, הכשרת מורים והפעלת תוכניות מלגות לתלמידים מצטיינים",
        since: "2005"
      },
      {
        name: "מיקרוסופט ישראל",
        type: "business",
        description: "תרומת תוכנות, מחשבים והכשרות טכנולוגיות למורים ותלמידים",
        since: "2019"
      },
      {
        name: "בנק הפועלים",
        type: "business",
        description: "מימון תוכנית המלגות ותמיכה בפרויקטים חינוכיים מיוחדים",
        since: "2015"
      },
      {
        name: "קרן רותשילד",
        type: "nonprofit",
        description: "תמיכה בפיתוח מרכזי לימוד קהילתיים ותוכניות חינוכיות חדשניות",
        since: "2010"
      }
    ],
    
    financialTransparency: {
      annualBudget: 3200000,
      lastAuditDate: "2023-12-31",
      expenseBreakdown: {
        programs: 85,
        administration: 8,
        fundraising: 7
      }
    },
    
    impact: {
      totalBeneficiaries: 950,
      monthlyImpact: "מספקים ליווי חינוכי ל-380 תלמידים, מעניקים 240 מלגות לימודים פעילות, מפעילים 25 חוגי העשרה ומגיעים ל-950 ילדים ובני נוער בסך הכל",
      successStories: [
        {
          title: "יוסף - מעוני לסטודנט לרפואה",
          description: "יוסף, בן למשפחה ממוצא אתיופי עם 6 ילדים, התקשה בלימודים בגלל בעיות כלכליות. הוא הצטרף לתוכנית הליווי שלנו בכיתה ח', קיבל מלגה מלאה ומורה פרטי. היום הוא סטודנט לרפואה באוניברסיטה העברית וחלם להיות רופא ילדים",
          date: "2023-11-20"
        },
        {
          title: "מרים - מילדה שקטה למנהיגה צעירה",
          description: "מרים, ילדה ביישנית מירושלים, הצטרפה לחוג התיאטרון שלנו בגיל 10. בתחילה היא בקושי דיברה, אבל עם הזמן היא פרחה. היום בגיל 16 היא מנהיגת קבוצת התיאטרון, זכתה בתחרות ארצית ומתכננת ללמוד במחלקה לאמנויות הבמה",
          date: "2023-10-05"
        },
        {
          title: "אחמד - מכישלון לימודי להצלחה טכנולוגית",
          description: "אחמד מירושלים המזרחית נחשב לתלמיד 'בעייתי' עם ציונים נמוכים. כשהצטרף לתוכנית המחשבים שלנו, התגלה כבעל כישרון יוצא דופן. היום הוא מפתח אפליקציות, זכה בהאקתון ארצי ומקבל מלגה מלאה ללימודי הנדסת תוכנה",
          date: "2023-09-15"
        },
        {
          title: "שרה - מבעיות קריאה לאהבת ספרות",
          description: "שרה, ילדה עם דיסלקציה, התקשתה מאוד בקריאה ושנאה ספרות. המורה המתנדבת שלה פיתחה עבורה שיטות לימוד מיוחדות ועזרה לה לגלות את אהבת הספרים. היום שרה כותבת שירים, זכתה בתחרות כתיבה ארצית ורוצה להיות סופרת",
          date: "2023-12-01"
        }
      ]
    }
  },
  {
    id: "charity_003",
    name: "יד למשפחה - סיוע למשפחות במצוקה",
    description: "עמותה המספקת סיוע כלכלי, נפשי וחברתי למשפחות במצוקה ברחבי הארץ. אנו מאמינים שכל משפחה זכאית לחיים בכבוד ולקבל תמיכה בזמנים קשים. העמותה מתמחה במתן סיוע כלכלי דחוף, ליווי נפשי, סדנאות העצמה והכשרות מקצועיות. אנו פועלים ליצירת רשת ביטחון חברתית שמאפשרת למשפחות לעבור משברים ולחזור לחיים עצמאיים ומספקים.",
    tags: ["משפחות", "סיוע כלכלי", "מצוקה", "רווחה", "תמיכה", "ליווי נפשי", "העצמה"],
    location: {
      address: "רחוב אלנבי 78, חיפה",
      city: "חיפה",
      region: "חיפה והצפון",
      coordinates: {
        lat: 32.7940,
        lng: 34.9896
      }
    },
    contact: {
      phone: "04-5678901",
      email: "help@yadlamishpacha.org.il",
      website: "www.yadlamishpacha.org.il",
      socialMedia: {
        facebook: "https://facebook.com/yadlamishpacha",
        instagram: "https://instagram.com/yad_lamishpacha",
        twitter: "https://twitter.com/yadlamishpacha"
      }
    },
    foundedYear: 1988,
    volunteersCount: 350,
    beneficiariesCount: 1650,
    rating: 4.7,
    isVerified: true,
    logo: "https://picsum.photos/id/120/200/200",
    images: [
      "https://picsum.photos/id/121/400/300",
      "https://picsum.photos/id/122/400/300",
      "https://picsum.photos/id/123/400/300"
    ],
    urgentNeeds: [
      "תרומות כספיות לסיוע דחוף למשפחות",
      "מתנדבים לליווי משפחות במשבר",
      "מזון ומוצרי יסוד למשפחות נזקקות",
      "ייעוץ משפטי ופיננסי מתנדבים",
      "ציוד לתינוקות וילדים קטנים"
    ],
    donationTypes: ["money", "time", "items", "services"],
    languages: ["עברית", "ערבית", "רוסית", "אמהרית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: false
    },
    
    recentActivities: [
      {
        id: "activity_003_1",
        title: "חלוקת 300 חבילות מזון לחג",
        description: "חילקנו 300 חבילות מזון מיוחדות לחג פסח למשפחות במצוקה ברחבי הצפון",
        date: "2024-01-21T11:00:00Z",
        type: "project",
        participants: 65,
        impact: "300 משפחות קיבלו חבילות מזון מלאות לחג"
      },
      {
        id: "activity_003_2",
        title: "השקת תוכנית 'משפחה לעצמאות'",
        description: "השקנו תוכנית חדשה המלווה משפחות במעבר מתלות לעצמאות כלכלית דרך הכשרות והשמה לעבודה",
        date: "2024-01-19T15:00:00Z",
        type: "milestone",
        participants: 30,
        impact: "25 משפחות הצטרפו לתוכנית ההעצמה הראשונה"
      }
    ],
    
    motivationalQuotes: [
      "כל משפחה זכאית לחיים בכבוד ולקבל תמיכה בזמנים קשים",
      "יחד אנחנו יכולים להפוך משבר לחוזקה ותלות לעצמאות",
      "הסיוע האמיתי הוא זה שמעצים ובונה, לא רק עוזר זמנית",
      "בכל משפחה יש כוח - תפקידנו לעזור לו לפרוח"
    ],
    
    statistics: [
      {
        id: "stat_003_1",
        name: "משפחות בליווי פעיל",
        value: 280,
        unit: "משפחות",
        icon: "👨‍👩‍👧‍👦",
        color: "#4CAF50",
        description: "משפחות המקבלות ליווי אישי ותמיכה שוטפת"
      },
      {
        id: "stat_003_2",
        name: "סיוע כלכלי דחוף החודש",
        value: 85000,
        unit: "₪",
        icon: "💰",
        color: "#FF9800",
        description: "סכום הסיוע הכלכלי הדחוף שחולק החודש"
      }
    ],
    
    volunteers: ["u4", "u7", "u9"],
    beneficiaries: ["u1", "u3", "u8"],
    
    projects: [
      {
        id: "project_003_1",
        title: "תוכנית 'משפחה לעצמאות'",
        description: "תוכנית מקיפה המלווה משפחות במעבר מתלות כלכלית לעצמאות דרך הכשרות, ייעוץ והשמה לעבודה",
        status: "active",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        budget: 600000,
        raised: 320000,
        volunteersNeeded: 40,
        volunteersJoined: 18
      }
    ],
    
    volunteerOpportunities: [
      {
        id: "vol_003_1",
        title: "ליווי משפחות במשבר",
        description: "ליווי אישי של משפחות העוברות משבר כלכלי או אישי, מתן תמיכה רגשית ועזרה מעשית",
        requirements: ["אמפתיה וסבלנות", "יכולת הקשבה", "זמינות לפגישות קבועות"],
        timeCommitment: "3-4 שעות שבועיות",
        location: "חיפה והצפון",
        skills: ["תמיכה רגשית", "ליווי", "תקשורת"],
        isUrgent: true,
        contactPerson: "רחל כהן - רכזת ליווי - 04-5678902"
      }
    ],
    
    operatingHours: [
      { day: "sunday", open: "08:00", close: "17:00" },
      { day: "monday", open: "08:00", close: "17:00" },
      { day: "tuesday", open: "08:00", close: "17:00" },
      { day: "wednesday", open: "08:00", close: "17:00" },
      { day: "thursday", open: "08:00", close: "17:00" },
      { day: "friday", open: "08:00", close: "14:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    
    achievements: [
      {
        id: "achieve_003_1",
        title: "35 שנות פעילות למען משפחות",
        description: "חגגנו 35 שנות פעילות רציפה למען משפחות במצוקה בצפון הארץ",
        date: "2023-11-01",
        icon: "🏆"
      }
    ],
    
    partnerships: [
      {
        name: "עירית חיפה",
        type: "government",
        description: "שיתוף פעולה במתן סיוע למשפחות במצוקה",
        since: "1995"
      }
    ],
    
    financialTransparency: {
      annualBudget: 1800000,
      lastAuditDate: "2023-12-31",
      expenseBreakdown: {
        programs: 80,
        administration: 12,
        fundraising: 8
      }
    },
    
    impact: {
      totalBeneficiaries: 1650,
      monthlyImpact: "מלווים 280 משפחות, מספקים סיוע כלכלי דחוף ל-150 משפחות ומפעילים תוכניות העצמה ל-50 משפחות",
      successStories: [
        {
          title: "משפחת כהן חזרה לעצמאות",
          description: "לאחר שנתיים של משבר כלכלי, משפחת כהן הצליחה לחזור לעצמאות מלאה הודות לתוכנית ההכשרה וההשמה לעבודה",
          date: "2023-12-15"
        }
      ]
    }
  },
  {
    id: "charity_004",
    name: "חמלה לבעלי חיים - עמותה להצלת חיות",
    description: "עמותה המצילה, מטפלת ומאמצת בעלי חיים נטושים ופצועים ברחבי הארץ. אנו מאמינים שכל בעל חיים זכאי לחיים בכבוד ולאהבה. העמותה מפעילה מקלט מתקדם, מרפאה וטרינרית, תוכניות אימוץ ופעילות חינוכית למען זכויות בעלי חיים. אנו פועלים למניעת נטישה וכלפי התעללות ולקידום אחריות בעלות על בעלי חיים.",
    tags: ["בעלי חיים", "הצלה", "אימוץ", "וטרינריה", "טבע", "מקלט", "זכויות חיות"],
    location: {
      address: "רחוב העצמאות 23, ראשון לציון",
      city: "ראשון לציון",
      region: "השרון",
      coordinates: {
        lat: 31.9730,
        lng: 34.8044
      }
    },
    contact: {
      phone: "03-4567890",
      email: "info@hemla.org.il",
      website: "www.hemla.org.il",
      socialMedia: {
        facebook: "https://facebook.com/hemla",
        instagram: "https://instagram.com/hemla_animals"
      }
    },
    foundedYear: 1992,
    volunteersCount: 180,
    beneficiariesCount: 650,
    rating: 4.6,
    isVerified: true,
    logo: "https://picsum.photos/id/130/200/200",
    images: [
      "https://picsum.photos/id/131/400/300",
      "https://picsum.photos/id/132/400/300"
    ],
    urgentNeeds: [
      "מזון איכותי לכלבים וחתולים",
      "טיפולים וטרינריים יקרים",
      "מתנדבים לטיפול יומיומי בחיות",
      "משפחות מאמצות אחראיות",
      "ציוד רפואי וטרינרי"
    ],
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: false,
      hearingImpaired: false,
      visuallyImpaired: false
    },
    
    recentActivities: [
      {
        id: "activity_004_1",
        title: "הצלת 15 כלבים מרחוב",
        description: "הצלנו 15 כלבים נטושים מהרחוב, טיפלנו בהם רפואית והכנסנו אותם לתוכנית האימוץ",
        date: "2024-01-23T09:00:00Z",
        type: "project",
        participants: 12,
        impact: "15 כלבים ניצלו וממתינים לאימוץ"
      }
    ],
    
    motivationalQuotes: [
      "כל חיה זכאית לאהבה ולחיים בכבוד",
      "הרחמנות כלפי בעלי חיים היא סימן לאנושיות אמיתית",
      "אימוץ זה לא רק הצלת חיה - זה קבלת חבר לכל החיים"
    ],
    
    statistics: [
      {
        id: "stat_004_1",
        name: "חיות שניצלו השנה",
        value: 320,
        unit: "חיות",
        icon: "🐕",
        color: "#4CAF50",
        description: "כלבים וחתולים שניצלו והוכנסו למקלט השנה"
      }
    ],
    
    volunteers: ["u9", "u5"],
    beneficiaries: [], // בעלי חיים הם המוטבים, לא משתמשים ספציפיים
    
    projects: [
      {
        id: "project_004_1",
        title: "הרחבת המקלט",
        description: "הרחבת המקלט לכלול 100 מקומות נוספים לכלבים וחתולים נטושים",
        status: "active",
        startDate: "2024-01-01",
        endDate: "2024-08-31",
        budget: 400000,
        raised: 180000,
        volunteersNeeded: 20,
        volunteersJoined: 8
      }
    ],
    
    volunteerOpportunities: [
      {
        id: "vol_004_1",
        title: "טיפול יומיומי בחיות",
        description: "האכלה, ניקיון כלובים, משחק וליטוף של הכלבים והחתולים במקלט",
        requirements: ["אהבת בעלי חיים", "כושר גופני בסיסי", "זמינות קבועה"],
        timeCommitment: "3-4 שעות שבועיות",
        location: "המקלט בראשון לציון",
        skills: ["טיפול בחיות", "סבלנות", "אחריות"],
        isUrgent: true,
        contactPerson: "מיכל - רכזת מתנדבים - 03-4567891"
      }
    ],
    
    operatingHours: [
      { day: "sunday", open: "08:00", close: "16:00" },
      { day: "monday", open: "08:00", close: "16:00" },
      { day: "tuesday", open: "08:00", close: "16:00" },
      { day: "wednesday", open: "08:00", close: "16:00" },
      { day: "thursday", open: "08:00", close: "16:00" },
      { day: "friday", open: "08:00", close: "14:00" },
      { day: "saturday", open: "09:00", close: "13:00" }
    ],
    
    achievements: [
      {
        id: "achieve_004_1",
        title: "1000 חיות מאומצות",
        description: "הגענו לאבן דרך של 1000 כלבים וחתולים שמצאו בית חם ואוהב",
        date: "2023-10-20",
        icon: "🏆"
      }
    ],
    
    partnerships: [
      {
        name: "הוועדה הווטרינרית הישראלית",
        type: "nonprofit",
        description: "טיפולים וטרינריים מסובסדים ויעוץ מקצועי",
        since: "2015"
      }
    ],
    
    financialTransparency: {
      annualBudget: 900000,
      lastAuditDate: "2023-12-31",
      expenseBreakdown: {
        programs: 85,
        administration: 10,
        fundraising: 5
      }
    },
    
    impact: {
      totalBeneficiaries: 650,
      monthlyImpact: "מטפלים ב-150 חיות במקלט, מאמצים 25 חיות חדשות ומציעים טיפולים וטרינריים ל-80 חיות",
      successStories: [
        {
          title: "מקס מצא משפחה אחרי שנתיים במקלט",
          description: "מקס, כלב מעורב בן 5, חיכה שנתיים במקלט עד שמשפחת לוי אימצה אותו. היום הוא חבר הכי טוב של הילדים ומלווה נאמן למשפחה",
          date: "2023-11-10"
        }
      ]
    }
  },
  {
    id: "charity_005",
    name: "פעמוני תקווה - תמיכה בנוער בסיכון",
    description: "עמותה המספקת תמיכה חינוכית, נפשית וחברתית לנוער בסיכון ברחבי הארץ. אנו מאמינים שכל צעיר זכאי להזדמנות שנייה ולתמיכה בדרך לחיים טובים יותר. העמותה מפעילה מרכזי יום, תוכניות שיקום, ליווי אישי וסדנאות העצמה. אנו עובדים עם בני נוער שנושרים מהמערכת, חווים קשיים במשפחה או נקלעים לבעיות התנהגות.",
    tags: ["נוער", "סיכון", "חינוך", "תמיכה נפשית", "שיקום", "הזדמנות שנייה"],
    location: {
      address: "רחוב ויצמן 12, באר שבע",
      city: "באר שבע",
      region: "הנגב",
      coordinates: {
        lat: 31.2518,
        lng: 34.7915
      }
    },
    contact: {
      phone: "08-2345678",
      email: "hope@paamonim.org.il",
      website: "www.paamonim.org.il",
      socialMedia: {
        facebook: "https://facebook.com/paamonim",
        instagram: "https://instagram.com/paamonim_hope"
      }
    },
    foundedYear: 1998,
    volunteersCount: 220,
    beneficiariesCount: 680,
    rating: 4.8,
    isVerified: true,
    logo: "https://picsum.photos/id/140/200/200",
    urgentNeeds: [
      "מנטורים למעקב אישי אחר בני נוער",
      "תרומות לפעילויות העשרה וחוגים",
      "מקום לפעילויות קבוצתיות נוספות",
      "מחשבים ללימודים מרחוק",
      "מומחים לטיפול נפשי מתנדבים"
    ],
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: false
    },
    
    recentActivities: [
      {
        id: "activity_005_1",
        title: "25 בני נוער סיימו תוכנית שיקום",
        description: "25 בני נוער סיימו בהצלחה תוכנית שיקום של 6 חודשים וחזרו למסגרות לימודים רגילות",
        date: "2024-01-24T14:00:00Z",
        type: "milestone",
        participants: 25,
        impact: "25 בני נוער חזרו למסלול חיים תקין"
      }
    ],
    
    motivationalQuotes: [
      "כל צעיר זכאי להזדמנות שנייה ולאמונה בכוחותיו",
      "הנוער הוא העתיד - השקעה בהם היא השקעה בכולנו",
      "גם מהמקום הכי קשה אפשר לצמוח ולהצליח"
    ],
    
    statistics: [
      {
        id: "stat_005_1",
        name: "בני נוער בתוכניות",
        value: 180,
        unit: "צעירים",
        icon: "👦",
        color: "#4CAF50",
        description: "בני נוער המשתתפים בתוכניות השיקום השונות"
      }
    ],
    
    volunteers: ["u2", "u6", "u8"],
    beneficiaries: ["u10"],
    
    projects: [
      {
        id: "project_005_1",
        title: "מרכז יום חדש לנוער בסיכון",
        description: "הקמת מרכז יום חדש באר שבע לטיפול ב-50 בני נוער נוספים בסיכון",
        status: "active",
        startDate: "2024-01-01",
        endDate: "2024-10-31",
        budget: 350000,
        raised: 180000,
        volunteersNeeded: 15,
        volunteersJoined: 8
      }
    ],
    
    volunteerOpportunities: [
      {
        id: "vol_005_1",
        title: "מנטור אישי לנער בסיכון",
        description: "ליווי אישי ומתמשך של נער או נערה בסיכון, מתן תמיכה רגשית והכוונה לעתיד",
        requirements: ["סבלנות ואמפתיה", "יכולת התמודדות עם אתגרים", "זמינות לפגישות קבועות"],
        timeCommitment: "2-3 שעות שבועיות",
        location: "באר שבע והסביבה",
        skills: ["ליווי", "תמיכה רגשית", "הכוונה"],
        isUrgent: true,
        contactPerson: "דני - רכז מנטורים - 08-2345679"
      }
    ],
    
    operatingHours: [
      { day: "sunday", open: "08:00", close: "18:00" },
      { day: "monday", open: "08:00", close: "18:00" },
      { day: "tuesday", open: "08:00", close: "18:00" },
      { day: "wednesday", open: "08:00", close: "18:00" },
      { day: "thursday", open: "08:00", close: "18:00" },
      { day: "friday", open: "08:00", close: "13:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    
    achievements: [
      {
        id: "achieve_005_1",
        title: "500 בני נוער שוקמו בהצלחה",
        description: "הגענו לאבן דרך של 500 בני נוער שעברו תוכניות שיקום מוצלחות",
        date: "2023-09-15",
        icon: "🏆"
      }
    ],
    
    partnerships: [
      {
        name: "משרד החינוך",
        type: "government",
        description: "שיתוף פעולה בטיפול בנוער נושר",
        since: "2005"
      }
    ],
    
    financialTransparency: {
      annualBudget: 1200000,
      lastAuditDate: "2023-12-31",
      expenseBreakdown: {
        programs: 82,
        administration: 12,
        fundraising: 6
      }
    },
    
    impact: {
      totalBeneficiaries: 680,
      monthlyImpact: "מלווים 180 בני נוער בתוכניות שיקום, מפעילים 12 קבוצות תמיכה ומספקים ליווי אישי ל-60 צעירים",
      successStories: [
        {
          title: "אדם חזר ללימודים ומצא את דרכו",
          description: "אדם, בן 16, נשר מבית הספר ונקלע לבעיות. אחרי שנה בתוכנית שלנו הוא חזר ללימודים, סיים בגרות וכיום לומד הנדסה",
          date: "2023-08-20"
        }
      ]
    }
  },
  {
    id: "charity_006",
    name: "זרעים של שלום - קידום דו-קיום",
    description: "מקדמת דו-קיום ושלום בין יהודים וערבים בישראל דרך חינוך ופעילויות משותפות",
    tags: ["דו-קיום", "שלום", "יהודים וערבים", "חינוך", "סובלנות"],
    location: {
      address: "רחוב השלום 34, נצרת",
      city: "נצרת",
      region: "הגליל",
      coordinates: { lat: 32.7015, lng: 35.2973 }
    },
    contact: {
      phone: "04-3456789",
      email: "peace@zraim.org.il",
      website: "www.zraim.org.il"
    },
    foundedYear: 2005,
    volunteersCount: 120,
    beneficiariesCount: 400,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time"],
    languages: ["עברית", "ערבית", "אנגלית"],
    accessibility: { wheelchair: true, hearingImpaired: true, visuallyImpaired: true },
    recentActivities: [],
    motivationalQuotes: ["השלום מתחיל בחינוך ובהבנה הדדית", "דו-קיום הוא לא חלום - זה מטרה"],
    statistics: [],
    volunteers: ["u3", "u7"],
    beneficiaries: ["u2", "u5"],
    projects: [],
    volunteerOpportunities: [],
    operatingHours: [
      { day: "sunday", open: "09:00", close: "17:00" },
      { day: "monday", open: "09:00", close: "17:00" },
      { day: "tuesday", open: "09:00", close: "17:00" },
      { day: "wednesday", open: "09:00", close: "17:00" },
      { day: "thursday", open: "09:00", close: "17:00" },
      { day: "friday", open: "09:00", close: "13:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    achievements: [],
    partnerships: [],
    financialTransparency: { annualBudget: 800000, lastAuditDate: "2023-12-31", expenseBreakdown: { programs: 85, administration: 10, fundraising: 5 } },
    impact: { totalBeneficiaries: 400, monthlyImpact: "מקדמים דו-קיום דרך פעילויות חינוכיות", successStories: [] }
  },
  {
    id: "charity_007",
    name: "כנפיים של חופש - סיוע לנפגעי אלימות",
    description: "מספקת תמיכה נפשית, משפטית וחברתית לנפגעי אלימות מכל הסוגים",
    tags: ["אלימות", "תמיכה נפשית", "סיוע משפטי", "נפגעים", "שיקום"],
    location: {
      address: "רחוב הרצל 67, אשדוד",
      city: "אשדוד",
      region: "השפלה",
      coordinates: { lat: 31.8044, lng: 34.6553 }
    },
    contact: {
      phone: "08-7890123",
      email: "freedom@kanfaim.org.il",
      website: "www.kanfaim.org.il"
    },
    foundedYear: 2000,
    volunteersCount: 180,
    beneficiariesCount: 700,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אמהרית"],
    accessibility: { wheelchair: true, hearingImpaired: true, visuallyImpaired: true },
    recentActivities: [],
    motivationalQuotes: ["כל אדם זכאי לחיים ללא אלימות", "חופש מאלימות הוא זכות יסוד"],
    statistics: [],
    volunteers: ["u1", "u4"],
    beneficiaries: ["u7"],
    projects: [],
    volunteerOpportunities: [],
    operatingHours: [
      { day: "sunday", open: "09:00", close: "17:00" },
      { day: "monday", open: "09:00", close: "17:00" },
      { day: "tuesday", open: "09:00", close: "17:00" },
      { day: "wednesday", open: "09:00", close: "17:00" },
      { day: "thursday", open: "09:00", close: "17:00" },
      { day: "friday", open: "09:00", close: "13:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    achievements: [],
    partnerships: [],
    financialTransparency: { annualBudget: 1200000, lastAuditDate: "2023-12-31", expenseBreakdown: { programs: 80, administration: 15, fundraising: 5 } },
    impact: { totalBeneficiaries: 700, monthlyImpact: "מספקים תמיכה לנפגעי אלימות", successStories: [] }
  },
  {
    id: "charity_008",
    name: "עתיד טוב יותר - עמותה לפיתוח קהילתי",
    description: "מפתחת קהילות חזקות ומלוכדות ברחבי הארץ דרך פרויקטים חברתיים",
    tags: ["פיתוח קהילתי", "קהילה", "חיזוק", "פרויקטים", "חברתי"],
    location: {
      address: "רחוב הברזל 89, נתניה",
      city: "נתניה",
      region: "השרון",
      coordinates: { lat: 32.3215, lng: 34.8532 }
    },
    contact: {
      phone: "09-0123456",
      email: "future@atid.org.il",
      website: "www.atid.org.il"
    },
    foundedYear: 1996,
    volunteersCount: 280,
    beneficiariesCount: 1200,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: { wheelchair: true, hearingImpaired: false, visuallyImpaired: false },
    recentActivities: [],
    motivationalQuotes: ["קהילה חזקה בונה עתיד טוב יותר", "יחד אנחנו יכולים הכל"],
    statistics: [],
    volunteers: ["u6", "u10"],
    beneficiaries: ["u4", "u8"],
    projects: [],
    volunteerOpportunities: [],
    operatingHours: [
      { day: "sunday", open: "08:00", close: "16:00" },
      { day: "monday", open: "08:00", close: "16:00" },
      { day: "tuesday", open: "08:00", close: "16:00" },
      { day: "wednesday", open: "08:00", close: "16:00" },
      { day: "thursday", open: "08:00", close: "16:00" },
      { day: "friday", open: "08:00", close: "14:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    achievements: [],
    partnerships: [],
    financialTransparency: { annualBudget: 1500000, lastAuditDate: "2023-12-31", expenseBreakdown: { programs: 75, administration: 15, fundraising: 10 } },
    impact: { totalBeneficiaries: 1200, monthlyImpact: "מפתחים קהילות חזקות ומלוכדות", successStories: [] }
  },
  {
    id: "charity_009",
    name: "קול התקווה - תמיכה בחולי סרטן",
    description: "מספקת תמיכה נפשית, חברתית וכלכלית לחולי סרטן ובני משפחותיהם",
    tags: ["סרטן", "בריאות", "תמיכה נפשית", "חולים", "רפואה"],
    location: {
      address: "רחוב ויצמן 45, רמת גן",
      city: "רמת גן",
      region: "תל אביב והמרכז",
      coordinates: { lat: 32.0879, lng: 34.8242 }
    },
    contact: {
      phone: "03-6789012",
      email: "hope@kolhatikva.org.il",
      website: "www.kolhatikva.org.il"
    },
    foundedYear: 1993,
    volunteersCount: 350,
    beneficiariesCount: 2000,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית", "ערבית"],
    accessibility: { wheelchair: true, hearingImpaired: true, visuallyImpaired: true },
    recentActivities: [],
    motivationalQuotes: ["תקווה היא הכוח החזק ביותר מול המחלה", "יחד אנחנו חזקים יותר"],
    statistics: [],
    volunteers: ["u5", "u8", "u10"],
    beneficiaries: ["u3", "u6"],
    projects: [],
    volunteerOpportunities: [],
    operatingHours: [
      { day: "sunday", open: "08:00", close: "18:00" },
      { day: "monday", open: "08:00", close: "18:00" },
      { day: "tuesday", open: "08:00", close: "18:00" },
      { day: "wednesday", open: "08:00", close: "18:00" },
      { day: "thursday", open: "08:00", close: "18:00" },
      { day: "friday", open: "08:00", close: "14:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    achievements: [],
    partnerships: [],
    financialTransparency: { annualBudget: 2500000, lastAuditDate: "2023-12-31", expenseBreakdown: { programs: 88, administration: 8, fundraising: 4 } },
    impact: { totalBeneficiaries: 2000, monthlyImpact: "מספקים תמיכה מקיפה לחולי סרטן ומשפחותיהם", successStories: [] }
  },
  {
    id: "charity_010",
    name: "שביל האור - ליווי אנשים עם מוגבלויות",
    description: "מלווה ומעצימה אנשים עם מוגבלויות שונות לחיים עצמאיים ומספקים",
    tags: ["מוגבלויות", "שילוב", "עצמאות", "העצמה", "ליווי"],
    location: {
      address: "רחוב העצמאות 56, כפר סבא",
      city: "כפר סבא",
      region: "השרון",
      coordinates: { lat: 32.1742, lng: 34.9073 }
    },
    contact: {
      phone: "09-3456789",
      email: "light@shevilhaor.org.il",
      website: "www.shevilhaor.org.il"
    },
    foundedYear: 2002,
    volunteersCount: 220,
    beneficiariesCount: 800,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "אנגלית"],
    accessibility: { wheelchair: true, hearingImpaired: true, visuallyImpaired: true },
    recentActivities: [],
    motivationalQuotes: ["כל אדם יכול להשיג עצמאות ומימוש עצמי", "המוגבלות היא לא בגוף - היא בחשיבה"],
    statistics: [],
    volunteers: ["u1", "u9"],
    beneficiaries: ["u2"],
    projects: [],
    volunteerOpportunities: [],
    operatingHours: [
      { day: "sunday", open: "08:00", close: "17:00" },
      { day: "monday", open: "08:00", close: "17:00" },
      { day: "tuesday", open: "08:00", close: "17:00" },
      { day: "wednesday", open: "08:00", close: "17:00" },
      { day: "thursday", open: "08:00", close: "17:00" },
      { day: "friday", open: "08:00", close: "14:00" },
      { day: "saturday", isClosed: true, open: "", close: "" }
    ],
    achievements: [],
    partnerships: [],
    financialTransparency: { annualBudget: 1800000, lastAuditDate: "2023-12-31", expenseBreakdown: { programs: 82, administration: 12, fundraising: 6 } },
    impact: { totalBeneficiaries: 800, monthlyImpact: "מלווים ומעצימים אנשים עם מוגבלויות", successStories: [] }
  },
  {
    id: "charity_011",
    name: "בריאות לכולם - קידום רפואה נגישה",
    description: "מקדמת רפואה נגישה ואיכותית לכל שכבות האוכלוסייה בישראל",
    tags: ["רפואה", "בריאות", "נגישות", "קידום", "רפואה מונעת"],
    location: {
      address: "רחוב הרפואה 23, פתח תקווה",
      city: "פתח תקווה",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "03-4567890",
      email: "health@briut.org.il",
      website: "www.briut.org.il"
    },
    foundedYear: 1997,
    volunteersCount: 400,
    beneficiariesCount: 3000,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_012",
    name: "ירוק בעיניים - שמירה על איכות הסביבה",
    description: "מקדמת מודעות סביבתית ושימור הטבע בישראל",
    tags: ["סביבה", "טבע", "שימור", "מודעות", "ירוק"],
    location: {
      address: "רחוב הטבע 78, הרצליה",
      city: "הרצליה",
      region: "השרון"
    },
    contact: {
      phone: "09-5678901",
      email: "green@yaroq.org.il",
      website: "www.yaroq.org.il"
    },
    foundedYear: 2003,
    volunteersCount: 180,
    beneficiariesCount: 1500,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: false,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_013",
    name: "דרך הלב - סיוע פסיכולוגי",
    description: "מספקת סיוע פסיכולוגי מקצועי לכל מי שזקוק לתמיכה נפשית",
    tags: ["פסיכולוגיה", "תמיכה נפשית", "בריאות הנפש", "טיפול", "ייעוץ"],
    location: {
      address: "רחוב הנפש 34, רחובות",
      city: "רחובות",
      region: "השפלה"
    },
    contact: {
      phone: "08-7890123",
      email: "heart@derechhalev.org.il",
      website: "www.derechhalev.org.il"
    },
    foundedYear: 2001,
    volunteersCount: 150,
    beneficiariesCount: 600,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_014",
    name: "גשר לאקדמיה - קידום השכלה גבוהה",
    description: "מקדמת השכלה גבוהה בקרב אוכלוסיות מוחלשות ומעודדת מצוינות אקדמית",
    tags: ["השכלה גבוהה", "אקדמיה", "מצוינות", "קידום", "לימודים"],
    location: {
      address: "רחוב האקדמיה 12, רעננה",
      city: "רעננה",
      region: "השרון"
    },
    contact: {
      phone: "09-2345678",
      email: "academy@gesher.org.il",
      website: "www.gesher.org.il"
    },
    foundedYear: 2004,
    volunteersCount: 120,
    beneficiariesCount: 400,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "אנגלית", "ערבית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_015",
    name: "בית חם לניצולים - תמיכה בניצולי שואה",
    description: "מספקת תמיכה חברתית, נפשית וכלכלית לניצולי שואה בישראל",
    tags: ["ניצולי שואה", "היסטוריה", "תמיכה", "זיכרון", "קשישים"],
    location: {
      address: "רחוב הזיכרון 67, חולון",
      city: "חולון",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "03-3456789",
      email: "survivors@bayitcham.org.il",
      website: "www.bayitcham.org.il"
    },
    foundedYear: 1990,
    volunteersCount: 200,
    beneficiariesCount: 800,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "יידיש", "גרמנית", "פולנית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_016",
    name: "לגעת בשמיים - סיוע לילדים חולים",
    description: "מספקת תמיכה נפשית וחברתית לילדים חולים ובני משפחותיהם",
    tags: ["ילדים חולים", "תמיכה נפשית", "בריאות", "משפחות", "סיוע"],
    location: {
      address: "רחוב הרפואה 89, אשקלון",
      city: "אשקלון",
      region: "השפלה"
    },
    contact: {
      phone: "08-4567890",
      email: "sky@lagaat.org.il",
      website: "www.lagaat.org.il"
    },
    foundedYear: 1999,
    volunteersCount: 160,
    beneficiariesCount: 500,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_017",
    name: "נתינה לקהילה - פרויקטים חברתיים",
    description: "מפתחת ומפעילה פרויקטים חברתיים לקידום הקהילה ברחבי הארץ",
    tags: ["פרויקטים חברתיים", "קהילה", "פיתוח", "חברתי", "קידום"],
    location: {
      address: "רחוב הקהילה 34, קריית גת",
      city: "קריית גת",
      region: "הנגב"
    },
    contact: {
      phone: "08-5678901",
      email: "community@netina.org.il",
      website: "www.netina.org.il"
    },
    foundedYear: 2006,
    volunteersCount: 300,
    beneficiariesCount: 1800,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "items", "services"],
    languages: ["עברית", "ערבית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_018",
    name: "מרפא לנשמה - טיפול בטראומה",
    description: "מספקת טיפול מקצועי לנפגעי טראומה מכל הסוגים",
    tags: ["טראומה", "טיפול", "נפש", "שיקום", "תמיכה"],
    location: {
      address: "רחוב הנפש 67, יבנה",
      city: "יבנה",
      region: "השפלה"
    },
    contact: {
      phone: "08-6789012",
      email: "soul@marpe.org.il",
      website: "www.marpe.org.il"
    },
    foundedYear: 2002,
    volunteersCount: 120,
    beneficiariesCount: 400,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_019",
    name: "עוגן בים - תמיכה באוכלוסיות ימיות",
    description: "מספקת תמיכה וסיוע לאוכלוסיות המתגוררות באזורי החוף",
    tags: ["אוכלוסיות ימיות", "חוף", "תמיכה", "קהילה", "סיוע"],
    location: {
      address: "רחוב הים 12, אילת",
      city: "אילת",
      region: "הערבה"
    },
    contact: {
      phone: "08-7890123",
      email: "sea@ogen.org.il",
      website: "www.ogen.org.il"
    },
    foundedYear: 2007,
    volunteersCount: 90,
    beneficiariesCount: 300,
    rating: 4.5,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: false,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_020",
    name: "יד רחבה - חלוקת מזון לנזקקים",
    description: "מחלקת מזון טרי ומזין לנזקקים ברחבי הארץ",
    tags: ["מזון", "נזקקים", "חלוקה", "תזונה", "סיוע"],
    location: {
      address: "רחוב המזון 45, לוד",
      city: "לוד",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "03-8901234",
      email: "food@yadrechava.org.il",
      website: "www.yadrechava.org.il"
    },
    foundedYear: 1994,
    volunteersCount: 450,
    beneficiariesCount: 2500,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "ערבית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_021",
    name: "קשת בענן - תמיכה בקהילת הלהטב",
    description: "מספקת תמיכה חברתית, נפשית ומשפטית לקהילת הלהטב בישראל",
    tags: ["להטב", "קהילה", "תמיכה", "זכויות", "שילוב"],
    location: {
      address: "רחוב הגאווה 78, תל אביב-יפו",
      city: "תל אביב-יפו",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "03-9012345",
      email: "lgbt@keshet.org.il",
      website: "www.keshet.org.il"
    },
    foundedYear: 2001,
    volunteersCount: 180,
    beneficiariesCount: 800,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_022",
    name: "למען הזולת - התנדבות ועזרה הדדית",
    description: "מקדמת התנדבות ועזרה הדדית בקהילות ברחבי הארץ",
    tags: ["התנדבות", "עזרה הדדית", "קהילה", "נתינה", "חברתי"],
    location: {
      address: "רחוב הנתינה 23, מודיעין",
      city: "מודיעין",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "08-0123456",
      email: "others@lemaan.org.il",
      website: "www.lemaan.org.il"
    },
    foundedYear: 1998,
    volunteersCount: 600,
    beneficiariesCount: 3000,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "items", "services"],
    languages: ["עברית", "ערבית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_023",
    name: "אומנות למען שינוי - קידום חברתי דרך אומנות",
    description: "מקדמת שינוי חברתי דרך אומנות ויצירה בקהילות שונות",
    tags: ["אומנות", "שינוי חברתי", "יצירה", "קהילה", "קידום"],
    location: {
      address: "רחוב האומנות 56, רמת השרון",
      city: "רמת השרון",
      region: "השרון"
    },
    contact: {
      phone: "09-1234567",
      email: "art@omanut.org.il",
      website: "www.omanut.org.il"
    },
    foundedYear: 2003,
    volunteersCount: 140,
    beneficiariesCount: 600,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_024",
    name: "שוויון הזדמנויות - עמותה לצדק חברתי",
    description: "מקדמת צדק חברתי ושוויון הזדמנויות לכל שכבות האוכלוסייה",
    tags: ["צדק חברתי", "שוויון", "הזדמנויות", "קידום", "חברתי"],
    location: {
      address: "רחוב הצדק 89, גבעתיים",
      city: "גבעתיים",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "03-2345678",
      email: "justice@shivuyon.org.il",
      website: "www.shivuyon.org.il"
    },
    foundedYear: 2000,
    volunteersCount: 220,
    beneficiariesCount: 1200,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_025",
    name: "מגן לטף - הגנה על ילדים בסיכון",
    description: "מגנה על ילדים בסיכון ומספקת להם סביבה בטוחה ותומכת",
    tags: ["ילדים בסיכון", "הגנה", "בטיחות", "תמיכה", "שיקום"],
    location: {
      address: "רחוב ההגנה 34, קריית אונו",
      city: "קריית אונו",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "03-3456789",
      email: "protection@magen.org.il",
      website: "www.magen.org.il"
    },
    foundedYear: 1996,
    volunteersCount: 180,
    beneficiariesCount: 400,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_026",
    name: "פנים חדשות - שיקום אסירים",
    description: "מסייעת בשיקום אסירים משוחררים וקידום שילובם בחברה",
    tags: ["שיקום אסירים", "שילוב", "חברה", "תמיכה", "הזדמנות שנייה"],
    location: {
      address: "רחוב השיקום 67, רמלה",
      city: "רמלה",
      region: "השפלה"
    },
    contact: {
      phone: "08-4567890",
      email: "rehabilitation@panim.org.il",
      website: "www.panim.org.il"
    },
    foundedYear: 1995,
    volunteersCount: 150,
    beneficiariesCount: 300,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_027",
    name: "חיים בכבוד - סיוע לחסרי בית",
    description: "מספקת סיוע ודיור לחסרי בית ברחבי הארץ",
    tags: ["חסרי בית", "דיור", "סיוע", "כבוד", "תמיכה"],
    location: {
      address: "רחוב הדיור 23, בת ים",
      city: "בת ים",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "03-5678901",
      email: "dignity@chaim.org.il",
      website: "www.chaim.org.il"
    },
    foundedYear: 1992,
    volunteersCount: 280,
    beneficiariesCount: 800,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_028",
    name: "קול הנשים - קידום זכויות נשים",
    description: "מקדמת זכויות נשים ושוויון מגדרי בישראל",
    tags: ["נשים", "זכויות", "שוויון מגדרי", "קידום", "העצמה"],
    location: {
      address: "רחוב הנשים 45, חולון",
      city: "חולון",
      region: "תל אביב והמרכז"
    },
    contact: {
      phone: "03-6789012",
      email: "women@kol.org.il",
      website: "www.kol.org.il"
    },
    foundedYear: 1998,
    volunteersCount: 200,
    beneficiariesCount: 1200,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_029",
    name: "למען הטבע - שימור ביו-מגוון",
    description: "מקדמת שימור הטבע והביו-מגוון בישראל",
    tags: ["טבע", "ביו-מגוון", "שימור", "סביבה", "הגנה"],
    location: {
      address: "רחוב הטבע 78, קריית טבעון",
      city: "קריית טבעון",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-7890123",
      email: "nature@lemaan.org.il",
      website: "www.lemaan.org.il"
    },
    foundedYear: 2004,
    volunteersCount: 160,
    beneficiariesCount: 1000,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: false,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_030",
    name: "דרך היצירה - העצמה באמצעות יצירה",
    description: "מעצימה אנשים דרך יצירה ואומנות ככלי לשינוי אישי וחברתי",
    tags: ["יצירה", "העצמה", "אומנות", "שינוי", "פיתוח"],
    location: {
      address: "רחוב היצירה 12, נס ציונה",
      city: "נס ציונה",
      region: "השפלה"
    },
    contact: {
      phone: "08-8901234",
      email: "creation@derech.org.il",
      website: "www.derech.org.il"
    },
    foundedYear: 2005,
    volunteersCount: 120,
    beneficiariesCount: 500,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_031",
    name: "הבטחון התזונתי - מניעת רעב",
    description: "מקדמת ביטחון תזונתי ומניעת רעב בקרב אוכלוסיות מוחלשות",
    tags: ["ביטחון תזונתי", "מניעת רעב", "תזונה", "סיוע", "בריאות"],
    location: {
      address: "רחוב התזונה 34, יבנה",
      city: "יבנה",
      region: "השפלה"
    },
    contact: {
      phone: "08-9012345",
      email: "nutrition@bitachon.org.il",
      website: "www.bitachon.org.il"
    },
    foundedYear: 2000,
    volunteersCount: 350,
    beneficiariesCount: 2000,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "ערבית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_032",
    name: "מעגלי חיים - תמיכה במשפחות שכולות",
    description: "מספקת תמיכה נפשית וחברתית למשפחות שכולות",
    tags: ["משפחות שכולות", "תמיכה", "אבל", "שיקום", "קהילה"],
    location: {
      address: "רחוב הזיכרון 56, קריית שמונה",
      city: "קריית שמונה",
      region: "הגליל"
    },
    contact: {
      phone: "04-0123456",
      email: "bereaved@maagalim.org.il",
      website: "www.maagalim.org.il"
    },
    foundedYear: 1997,
    volunteersCount: 180,
    beneficiariesCount: 600,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_033",
    name: "רשת הביטחון - סיוע לעולים חדשים",
    description: "מספקת סיוע וליווי לעולים חדשים בישראל",
    tags: ["עולים חדשים", "סיוע", "ליווי", "שילוב", "קליטה"],
    location: {
      address: "רחוב העלייה 89, אשדוד",
      city: "אשדוד",
      region: "השפלה"
    },
    contact: {
      phone: "08-1234567",
      email: "aliyah@reshet.org.il",
      website: "www.reshet.org.il"
    },
    foundedYear: 1991,
    volunteersCount: 400,
    beneficiariesCount: 2500,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items", "services"],
    languages: ["עברית", "רוסית", "אמהרית", "אנגלית", "צרפתית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_034",
    name: "אורח חיים בריא - קידום בריאות הציבור",
    description: "מקדמת אורח חיים בריא ורפואה מונעת בקרב הציבור",
    tags: ["בריאות הציבור", "רפואה מונעת", "אורח חיים", "קידום", "חינוך"],
    location: {
      address: "רחוב הבריאות 23, רחובות",
      city: "רחובות",
      region: "השפלה"
    },
    contact: {
      phone: "08-2345678",
      email: "health@orach.org.il",
      website: "www.orach.org.il"
    },
    foundedYear: 2002,
    volunteersCount: 250,
    beneficiariesCount: 1500,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_035",
    name: "מטיילים למען הקהילה - עמותת טיולים אתגריים",
    description: "מארגנת טיולים אתגריים למען הקהילה ולקידום ערכים חברתיים",
    tags: ["טיולים אתגריים", "קהילה", "אתגר", "טבע", "חברתי"],
    location: {
      address: "רחוב הטיולים 45, טבריה",
      city: "טבריה",
      region: "הגליל"
    },
    contact: {
      phone: "04-3456789",
      email: "hiking@metaylim.org.il",
      website: "www.metaylim.org.il"
    },
    foundedYear: 2008,
    volunteersCount: 120,
    beneficiariesCount: 800,
    rating: 4.5,
    isVerified: true,
    donationTypes: ["money", "time"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: false,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_036",
    name: "שקט נפשי - סיוע נפשי לנוער",
    description: "מספקת סיוע נפשי מקצועי לנוער במצוקה",
    tags: ["סיוע נפשי", "נוער", "מצוקה", "טיפול", "תמיכה"],
    location: {
      address: "רחוב הנפש 67, קריית ביאליק",
      city: "קריית ביאליק",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-4567890",
      email: "mental@sheket.org.il",
      website: "www.sheket.org.il"
    },
    foundedYear: 2003,
    volunteersCount: 140,
    beneficiariesCount: 600,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_037",
    name: "התפתחות אישית - סדנאות וקורסים",
    description: "מספקת סדנאות וקורסים לפיתוח אישי ומקצועי",
    tags: ["התפתחות אישית", "סדנאות", "קורסים", "פיתוח", "העצמה"],
    location: {
      address: "רחוב ההתפתחות 89, קריית מוצקין",
      city: "קריית מוצקין",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-5678901",
      email: "development@hitpatchut.org.il",
      website: "www.hitpatchut.org.il"
    },
    foundedYear: 2006,
    volunteersCount: 180,
    beneficiariesCount: 1000,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_038",
    name: "רוח ספורטיבית - קידום ספורט תחרותי",
    description: "מקדמת ספורט תחרותי ופיתוח כישרונות ספורטיביים",
    tags: ["ספורט", "תחרותי", "כישרונות", "קידום", "אימון"],
    location: {
      address: "רחוב הספורט 12, קריית ים",
      city: "קריית ים",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-6789012",
      email: "sport@ruach.org.il",
      website: "www.ruach.org.il"
    },
    foundedYear: 2001,
    volunteersCount: 220,
    beneficiariesCount: 800,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_039",
    name: "מסע אל העצמי - עמותה לפיתוח מודעות",
    description: "מקדמת פיתוח מודעות עצמית ורוחנית",
    tags: ["מודעות", "רוחניות", "פיתוח", "העצמה", "מסע"],
    location: {
      address: "רחוב המודעות 34, צפת",
      city: "צפת",
      region: "הגליל"
    },
    contact: {
      phone: "04-7890123",
      email: "awareness@masa.org.il",
      website: "www.masa.org.il"
    },
    foundedYear: 2004,
    volunteersCount: 100,
    beneficiariesCount: 400,
    rating: 4.5,
    isVerified: true,
    donationTypes: ["money", "time"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: false,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_040",
    name: "בונים גשרים - חיבור בין קהילות",
    description: "מחברת בין קהילות שונות בישראל ומוקדמת דו-קיום",
    tags: ["חיבור קהילות", "דו-קיום", "גשרים", "סובלנות", "שילוב"],
    location: {
      address: "רחוב הגשרים 56, עכו",
      city: "עכו",
      region: "הגליל"
    },
    contact: {
      phone: "04-8901234",
      email: "bridges@bonim.org.il",
      website: "www.bonim.org.il"
    },
    foundedYear: 2002,
    volunteersCount: 160,
    beneficiariesCount: 1200,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_041",
    name: "אהבת הארץ - שימור מורשת",
    description: "מקדמת שימור המורשת והתרבות הישראלית",
    tags: ["מורשת", "תרבות", "שימור", "היסטוריה", "ארץ ישראל"],
    location: {
      address: "רחוב המורשת 78, צפת",
      city: "צפת",
      region: "הגליל"
    },
    contact: {
      phone: "04-9012345",
      email: "heritage@ahavat.org.il",
      website: "www.ahavat.org.il"
    },
    foundedYear: 1999,
    volunteersCount: 140,
    beneficiariesCount: 800,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_042",
    name: "קול אחד - עמותה לזכויות אדם",
    description: "מקדמת זכויות אדם ושוויון לכל האזרחים בישראל",
    tags: ["זכויות אדם", "שוויון", "צדק", "קידום", "הגנה"],
    location: {
      address: "רחוב הזכויות 23, נצרת עילית",
      city: "נצרת עילית",
      region: "הגליל"
    },
    contact: {
      phone: "04-0123456",
      email: "rights@kol.org.il",
      website: "www.kol.org.il"
    },
    foundedYear: 1997,
    volunteersCount: 200,
    beneficiariesCount: 1500,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_043",
    name: "חיוך לכולם - טיפול שיניים ללא עלות",
    description: "מספקת טיפול שיניים ללא עלות לנזקקים",
    tags: ["טיפול שיניים", "נזקקים", "בריאות", "רפואה", "סיוע"],
    location: {
      address: "רחוב השיניים 45, כרמיאל",
      city: "כרמיאל",
      region: "הגליל"
    },
    contact: {
      phone: "04-1234567",
      email: "smile@chiuch.org.il",
      website: "www.chiuch.org.il"
    },
    foundedYear: 2005,
    volunteersCount: 120,
    beneficiariesCount: 600,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_044",
    name: "מלאכים בלבן - תמיכה במשפחות של חולים כרוניים",
    description: "מספקת תמיכה למשפחות של חולים כרוניים",
    tags: ["חולים כרוניים", "משפחות", "תמיכה", "בריאות", "סיוע"],
    location: {
      address: "רחוב הרפואה 67, עפולה",
      city: "עפולה",
      region: "הגליל"
    },
    contact: {
      phone: "04-2345678",
      email: "angels@malachim.org.il",
      website: "www.malachim.org.il"
    },
    foundedYear: 2000,
    volunteersCount: 180,
    beneficiariesCount: 800,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_045",
    name: "הזדמנות שנייה - שיקום חברתי",
    description: "מספקת הזדמנות שנייה לאנשים שזקוקים לשיקום חברתי",
    tags: ["הזדמנות שנייה", "שיקום חברתי", "תמיכה", "שילוב", "חברה"],
    location: {
      address: "רחוב ההזדמנות 89, בית שאן",
      city: "בית שאן",
      region: "הגליל"
    },
    contact: {
      phone: "04-3456789",
      email: "second@hazdmanut.org.il",
      website: "www.hazdmanut.org.il"
    },
    foundedYear: 1998,
    volunteersCount: 150,
    beneficiariesCount: 400,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_046",
    name: "דרך השלום - חינוך לסובלנות",
    description: "מקדמת חינוך לסובלנות ושלום בקרב ילדים ונוער",
    tags: ["חינוך", "סובלנות", "שלום", "ילדים", "נוער"],
    location: {
      address: "רחוב השלום 12, טירת כרמל",
      city: "טירת כרמל",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-4567890",
      email: "peace@derech.org.il",
      website: "www.derech.org.il"
    },
    foundedYear: 2003,
    volunteersCount: 160,
    beneficiariesCount: 800,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_047",
    name: "אמץ חבר - עמותה לאימוץ כלבים וחתולים",
    description: "מקדמת אימוץ כלבים וחתולים ומספקת להם בית חם",
    tags: ["אימוץ", "כלבים", "חתולים", "בעלי חיים", "בית"],
    location: {
      address: "רחוב החיות 34, נשר",
      city: "נשר",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-5678901",
      email: "adopt@ametz.org.il",
      website: "www.ametz.org.il"
    },
    foundedYear: 2007,
    volunteersCount: 200,
    beneficiariesCount: 300,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: false,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_048",
    name: "יד תומכת - ליווי יולדות",
    description: "מספקת ליווי ותמיכה ליולדות ולמשפחותיהן",
    tags: ["יולדות", "ליווי", "תמיכה", "משפחות", "בריאות"],
    location: {
      address: "רחוב הליווי 56, קריית אתא",
      city: "קריית אתא",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-6789012",
      email: "support@yadtometet.org.il",
      website: "www.yadtometet.org.il"
    },
    foundedYear: 2001,
    volunteersCount: 140,
    beneficiariesCount: 600,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_049",
    name: "מפגש בין דורי - חיבור בין ותיקים לצעירים",
    description: "מחברת בין דורות שונים ומוקדמת העברת ידע וניסיון",
    tags: ["בין דורי", "חיבור", "ותיקים", "צעירים", "ידע"],
    location: {
      address: "רחוב הדורות 78, קריית מוצקין",
      city: "קריית מוצקין",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-7890123",
      email: "generations@mifgash.org.il",
      website: "www.mifgash.org.il"
    },
    foundedYear: 2005,
    volunteersCount: 180,
    beneficiariesCount: 1000,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_050",
    name: "עושים טוב - חלוקת ציוד לבית הספר",
    description: "מחלקת ציוד לבית הספר לילדים ממשפחות נזקקות",
    tags: ["ציוד בית ספר", "ילדים", "נזקקים", "חלוקה", "חינוך"],
    location: {
      address: "רחוב החינוך 23, קריית ביאליק",
      city: "קריית ביאליק",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-8901234",
      email: "good@osim.org.il",
      website: "www.osim.org.il"
    },
    foundedYear: 2008,
    volunteersCount: 120,
    beneficiariesCount: 800,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "ערבית", "רוסית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_051",
    name: "קריאת כיוון - ייעוץ תעסוקתי",
    description: "מספקת ייעוץ תעסוקתי והכוונה מקצועית",
    tags: ["ייעוץ תעסוקתי", "הכוונה", "תעסוקה", "קריירה", "פיתוח"],
    location: {
      address: "רחוב התעסוקה 45, קריית ים",
      city: "קריית ים",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-9012345",
      email: "career@kriat.org.il",
      website: "www.kriat.org.il"
    },
    foundedYear: 2002,
    volunteersCount: 160,
    beneficiariesCount: 600,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_052",
    name: "עולם חדש - תמיכה בילדים עם צרכים מיוחדים",
    description: "מספקת תמיכה וחינוך לילדים עם צרכים מיוחדים",
    tags: ["צרכים מיוחדים", "ילדים", "תמיכה", "חינוך", "שילוב"],
    location: {
      address: "רחוב השילוב 67, קריית מוצקין",
      city: "קריית מוצקין",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-0123456",
      email: "special@olam.org.il",
      website: "www.olam.org.il"
    },
    foundedYear: 1999,
    volunteersCount: 200,
    beneficiariesCount: 400,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_053",
    name: "ללא גבולות - עמותה לקידום ספורט נכים",
    description: "מקדמת ספורט ופעילות גופנית לאנשים עם מוגבלויות",
    tags: ["ספורט נכים", "מוגבלויות", "פעילות גופנית", "קידום", "שילוב"],
    location: {
      address: "רחוב הספורט 89, קריית ביאליק",
      city: "קריית ביאליק",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-1234567",
      email: "sport@lo-gvulot.org.il",
      website: "www.lo-gvulot.org.il"
    },
    foundedYear: 2004,
    volunteersCount: 140,
    beneficiariesCount: 300,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_054",
    name: "ניצוץ של תקווה - עמותה לסיוע לנפגעי סמים",
    description: "מספקת סיוע ושיקום לנפגעי סמים ובני משפחותיהם",
    tags: ["נפגעי סמים", "שיקום", "סיוע", "משפחות", "תמיכה"],
    location: {
      address: "רחוב השיקום 12, קריית ים",
      city: "קריית ים",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-2345678",
      email: "hope@nitzotz.org.il",
      website: "www.nitzotz.org.il"
    },
    foundedYear: 1996,
    volunteersCount: 180,
    beneficiariesCount: 500,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_055",
    name: "דרך היין - קידום תרבות היין המקומית",
    description: "מקדמת תרבות היין המקומית וחקלאות בישראל",
    tags: ["יין", "תרבות", "חקלאות", "קידום", "מקומי"],
    location: {
      address: "רחוב היין 34, קריית טבעון",
      city: "קריית טבעון",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-3456789",
      email: "wine@derech.org.il",
      website: "www.derech.org.il"
    },
    foundedYear: 2006,
    volunteersCount: 100,
    beneficiariesCount: 400,
    rating: 4.5,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_056",
    name: "כלים לחיים - סדנאות מיומנויות",
    description: "מספקת סדנאות לפיתוח מיומנויות חיים ומקצועיות",
    tags: ["מיומנויות", "סדנאות", "פיתוח", "כלים", "העצמה"],
    location: {
      address: "רחוב המיומנויות 56, קריית אתא",
      city: "קריית אתא",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-4567890",
      email: "skills@kelim.org.il",
      website: "www.kelim.org.il"
    },
    foundedYear: 2003,
    volunteersCount: 160,
    beneficiariesCount: 800,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_057",
    name: "פרנסה בכבוד - סיוע בהשמה לעבודה",
    description: "מסייעת בהשמה לעבודה ופיתוח קריירה",
    tags: ["השמה", "עבודה", "קריירה", "פיתוח", "כבוד"],
    location: {
      address: "רחוב התעסוקה 78, קריית מוצקין",
      city: "קריית מוצקין",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-5678901",
      email: "employment@parnasa.org.il",
      website: "www.parnasa.org.il"
    },
    foundedYear: 2001,
    volunteersCount: 200,
    beneficiariesCount: 1200,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_058",
    name: "שומרי היער - עמותה למען העצים",
    description: "מקדמת שמירה על עצים ויערות בישראל",
    tags: ["עצים", "יערות", "שמירה", "סביבה", "טבע"],
    location: {
      address: "רחוב היער 23, קריית טבעון",
      city: "קריית טבעון",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-6789012",
      email: "trees@shomrei.org.il",
      website: "www.shomrei.org.il"
    },
    foundedYear: 2005,
    volunteersCount: 120,
    beneficiariesCount: 500,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: false,
      hearingImpaired: false,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_059",
    name: "תקווה לשינוי - טיפול בהתמכרויות",
    description: "מספקת טיפול ושיקום לאנשים עם התמכרויות",
    tags: ["התמכרויות", "טיפול", "שיקום", "תמיכה", "תקווה"],
    location: {
      address: "רחוב השיקום 45, קריית ביאליק",
      city: "קריית ביאליק",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-7890123",
      email: "hope@tikva.org.il",
      website: "www.tikva.org.il"
    },
    foundedYear: 1997,
    volunteersCount: 180,
    beneficiariesCount: 600,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_060",
    name: "מעוף הציפור - סיוע נפשי לילדים",
    description: "מספקת סיוע נפשי מקצועי לילדים במצוקה",
    tags: ["סיוע נפשי", "ילדים", "מצוקה", "טיפול", "תמיכה"],
    location: {
      address: "רחוב הנפש 67, קריית ים",
      city: "קריית ים",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-8901234",
      email: "bird@maof.org.il",
      website: "www.maof.org.il"
    },
    foundedYear: 2002,
    volunteersCount: 140,
    beneficiariesCount: 500,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_061",
    name: "הכיפה הסגולה - עמותה לטיפול באוטיזם",
    description: "מספקת טיפול ותמיכה לילדים עם אוטיזם ובני משפחותיהם",
    tags: ["אוטיזם", "ילדים", "טיפול", "תמיכה", "משפחות"],
    location: {
      address: "רחוב הטיפול 89, קריית מוצקין",
      city: "קריית מוצקין",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-9012345",
      email: "autism@kipa.org.il",
      website: "www.kipa.org.il"
    },
    foundedYear: 2000,
    volunteersCount: 160,
    beneficiariesCount: 400,
    rating: 4.9,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_062",
    name: "פני מלאך - סיוע למשפחות עם ילדים חולים",
    description: "מספקת סיוע ותמיכה למשפחות עם ילדים חולים",
    tags: ["ילדים חולים", "משפחות", "סיוע", "תמיכה", "בריאות"],
    location: {
      address: "רחוב הסיוע 12, קריית אתא",
      city: "קריית אתא",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-0123456",
      email: "angel@panim.org.il",
      website: "www.panim.org.il"
    },
    foundedYear: 1998,
    volunteersCount: 200,
    beneficiariesCount: 600,
    rating: 4.8,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_063",
    name: "שער הזהב - עמותה לגמלאים",
    description: "מספקת פעילויות ותמיכה לגמלאים",
    tags: ["גמלאים", "פעילויות", "תמיכה", "קהילה", "זהב"],
    location: {
      address: "רחוב הזהב 34, קריית ביאליק",
      city: "קריית ביאליק",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-1234567",
      email: "golden@shaar.org.il",
      website: "www.shaar.org.il"
    },
    foundedYear: 1995,
    volunteersCount: 180,
    beneficiariesCount: 800,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "items"],
    languages: ["עברית", "רוסית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  },
  {
    id: "charity_064",
    name: "קול הדממה - סיוע ללקויי שמיעה",
    description: "מספקת סיוע ותמיכה לאנשים עם לקויות שמיעה",
    tags: ["לקויי שמיעה", "סיוע", "תמיכה", "נגישות", "שילוב"],
    location: {
      address: "רחוב השמיעה 56, קריית ים",
      city: "קריית ים",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-2345678",
      email: "silence@kol.org.il",
      website: "www.kol.org.il"
    },
    foundedYear: 2003,
    volunteersCount: 120,
    beneficiariesCount: 400,
    rating: 4.6,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "שפת סימנים", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: false
    }
  },
  {
    id: "charity_065",
    name: "הדרך הטובה - קידום ערכים",
    description: "מקדמת ערכים מוסריים וחברתיים בקרב ילדים ונוער",
    tags: ["ערכים", "מוסר", "חברתי", "ילדים", "נוער"],
    location: {
      address: "רחוב הערכים 78, קריית מוצקין",
      city: "קריית מוצקין",
      region: "חיפה והצפון"
    },
    contact: {
      phone: "04-3456789",
      email: "values@derech.org.il",
      website: "www.derech.org.il"
    },
    foundedYear: 2001,
    volunteersCount: 160,
    beneficiariesCount: 1000,
    rating: 4.7,
    isVerified: true,
    donationTypes: ["money", "time", "services"],
    languages: ["עברית", "ערבית", "אנגלית"],
    accessibility: {
      wheelchair: true,
      hearingImpaired: true,
      visuallyImpaired: true
    }
  }
];

// רשימת שמות עמותות (לשמירה על תאימות לאחור)
export const charityNames: string[] = charities.map(charity => charity.name);

// Motivational quotes are now part of each charity's motivationalQuotes array

// פרטי קבוצות וואטסאפ - ניקוי כפילויות
export const WHATSAPP_GROUP_DETAILS = [
  {
    name: "טרמפים מרכז",
    link: "https://chat.whatsapp.com/0lLT8M8RkPILPAV9IPfpjT",
    image: require("../assets/images/logo.png"),
  },
  {
    name: "טרמפים צפון",
    link: "https://chat.whatsapp.com/GjHTYqHGYF63VWh3BfTbE",
    image: require("../assets/images/logo.png"),
  },
  {
    name: "טרמפים דרום",
    link: "https://chat.whatsapp.com/GjHTYqHGYF63VWh3BfTbE",
    image: require("../assets/images/logo.png"),
  },
  {
    name: "קהילת קארמה - קבוצה ראשית",
    link: "https://chat.whatsapp.com/KarmaCommunityMain",
    image: require("../assets/images/logo.png"),
  }
];

// Recent donations are now part of the main donations array

// Charity data is now in the main charities array


// Recent activities are now part of each charity's recentActivities array