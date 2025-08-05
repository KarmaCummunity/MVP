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

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  category: string;
  location?: string;
  tags?: string[];
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
    followersCount: 150,
    followingCount: 80,
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
    followersCount: 200,
    followingCount: 120,
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
    followersCount: 60,
    followingCount: 40,
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
    followersCount: 30,
    followingCount: 25,
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
    followersCount: 90,
    followingCount: 60,
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
    followersCount: 300,
    followingCount: 180,
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
    followersCount: 40,
    followingCount: 35,
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
    followersCount: 120,
    followingCount: 70,
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
    followersCount: 55,
    followingCount: 38,
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
    followersCount: 70,
    followingCount: 50,
    notifications: [
      { type: 'system', text: 'ברוך הבא!', date: '2023-07-01T09:00:00Z' },
    ],
    settings: { language: 'he', darkMode: false, notificationsEnabled: true },
  },
];

// Enhanced Messages Generation
const generateMessages = (userId: string): Message[] => {
  const now = new Date();
  const messages: Message[] = [
    {
      id: 'm1',
      senderId: userId,
      text: 'היי! ראיתי שיש לך משימה חדשה שפורסמה',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      read: true,
      type: 'text'
    },
    {
      id: 'm2',
      senderId: 'me',
      text: 'כן, אני מחפש מתנדבים לעזור עם איסוף מזון',
      timestamp: new Date(now.getTime() - 14 * 60 * 1000).toISOString(),
      read: true,
      type: 'text'
    },
    {
      id: 'm3',
      senderId: userId,
      text: 'אני מעוניין! איפה ומתי?',
      timestamp: new Date(now.getTime() - 13 * 60 * 1000).toISOString(),
      read: true,
      type: 'text'
    },
    {
      id: 'm4',
      senderId: 'me',
      text: 'מעולה! מחר ב-10:00 בבוקר במרכז הקהילה',
      timestamp: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
      read: true,
      type: 'text'
    },
    {
      id: 'm5',
      senderId: userId,
      image: 'https://picsum.photos/id/237/300/200',
      timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      read: true,
      type: 'image'
    },
    {
      id: 'm6',
      senderId: 'me',
      text: 'וואו, נראה מעולה! תודה על התמונה',
      timestamp: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
      read: true,
      type: 'text'
    },
    {
      id: 'm7',
      senderId: userId,
      text: 'אני אגיע עם עוד 2 חברים, בסדר?',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      read: false,
      type: 'text'
    },
    {
      id: 'm8',
      senderId: 'me',
      text: 'בהחלט! ככל שיותר אנשים, יותר טוב 😊',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      read: false,
      type: 'text'
    },
  ];
  return messages;
};

// Enhanced Conversations
export const conversations: ChatConversation[] = users.map((user) => {
  const messages = generateMessages(user.id);
  const lastMessage = messages[messages.length - 1];
  const unreadCount = messages.filter(m => !m.read && m.senderId !== 'me').length;
  
  return {
    id: user.id,
    userId: user.id,
    messages: messages,
    lastMessageText: lastMessage.text || 'תמונה',
    lastMessageTimestamp: lastMessage.timestamp,
    unreadCount
  };
});

// Enhanced Tasks Data
export const tasks: Task[] = [
  {
    id: 'task1',
    title: 'איסוף מזון למשפחות נזקקות',
    description: 'צריך עזרה באיסוף מזון מהסופרים המקומיים למשפחות נזקקות בקהילה',
    status: 'pending',
    priority: 'high',
    assignedTo: 'user1',
    createdBy: 'me',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    category: 'מזון',
    location: 'מרכז הקהילה',
    tags: ['מזון', 'משפחות', 'דחוף']
  },
  {
    id: 'task2',
    title: 'ניקוי גינה קהילתית',
    description: 'עזרה בניקוי ותחזוקת הגינה הקהילתית',
    status: 'in_progress',
    priority: 'medium',
    assignedTo: 'user3',
    createdBy: 'user2',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    category: 'סביבה',
    location: 'גינה קהילתית',
    tags: ['גינה', 'סביבה', 'תחזוקה']
  },
  {
    id: 'task3',
    title: 'הוראה לילדים',
    description: 'עזרה בשיעורי בית לילדים ממשפחות מעוטות יכולת',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'user5',
    createdBy: 'user4',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'חינוך',
    location: 'ספרייה קהילתית',
    tags: ['חינוך', 'ילדים', 'שיעורים']
  },
  {
    id: 'task4',
    title: 'תרומת דם',
    description: 'ארגון יום תרומת דם בקהילה',
    status: 'pending',
    priority: 'high',
    createdBy: 'user6',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'בריאות',
    location: 'בית חולים מקומי',
    tags: ['דם', 'בריאות', 'דחוף']
  },
  {
    id: 'task5',
    title: 'עזרה לקשישים',
    description: 'עזרה בסידור הבית וקניות לקשישים בקהילה',
    status: 'pending',
    priority: 'medium',
    createdBy: 'user7',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'קשישים',
    location: 'בתי קשישים',
    tags: ['קשישים', 'עזרה', 'קניות']
  }
];

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

// Enhanced Community Events
export const communityEvents: CommunityEvent[] = [
  {
    id: 'event1',
    title: 'יום קהילה',
    description: 'אירוע קהילתי גדול עם פעילויות לכל המשפחה',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    time: '18:00',
    location: 'פארק העיר',
    organizer: 'user1',
    attendees: 45,
    maxAttendees: 100,
    category: 'אירועים',
    image: 'https://picsum.photos/id/10/300/200',
    tags: ['קהילה', 'משפחה', 'פארק']
  },
  {
    id: 'event2',
    title: 'סדנת בישול',
    description: 'סדנת בישול בריא למשפחות',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    time: '16:00',
    location: 'מרכז הקהילה',
    organizer: 'user5',
    attendees: 12,
    maxAttendees: 20,
    category: 'חינוך',
    image: 'https://picsum.photos/id/20/300/200',
    tags: ['בישול', 'בריאות', 'משפחה']
  }
];

// Enhanced Community Stats
export const communityStats = [
  { value: 125000, name: "תרומות בדולרים", icon: "💵" },
  { value: 2345, name: "מתנדבים פעילים", icon: "👥" },
  { value: 78, name: "אירועים קהילתיים", icon: "🎉" },
  { value: 15, name: "פרויקטים חדשים", icon: "🚀" },
  { value: 3200, name: "חברים פעילים", icon: "👨‍👩‍👧‍👦" },
  { value: 95, name: "שותפים בקהילה", icon: "🤝" },
  { value: 500, name: "שעות התנדבות", icon: "⏰" },
  { value: 12, name: "יוזמות חדשניות", icon: "💡" },
  { value: 8, name: "הנהגות קהילתיות", icon: "👑" },
  { value: 250, name: "משפחות נתמכות", icon: "🏠" },
  { value: 1876, name: "טרמפים שנוצרו", icon: "🚗" },
  { value: 450, name: "חפצים שנתרמו", icon: "📦" },
  { value: 23, name: "עמותות שותפות", icon: "🏢" },
  { value: 1500, name: "ק''ג בגדים נתרמו", icon: "👕" },
  { value: 2100, name: "ק''ג אוכל נתרם", icon: "🍎" },
  { value: 67, name: "קורסים נלמדו בספרייה", icon: "📚" },
  { value: 120, name: "חיות שמצאו בית", icon: "🐕" },
  { value: 350, name: "ליטר דם נתרם", icon: "🩸" },
  { value: 18, name: "משפחות אומנה נמצאו", icon: "👨‍👩‍👧‍👦" },
  { value: 45, name: "סדנאות יצירה", icon: "🎨" },
  { value: 9, name: "גינות קהילתיות", icon: "🌱" },
  { value: 750, name: "עצים ניטעו", icon: "🌳" },
  { value: 110, name: "שעות ייעוץ אישי", icon: "💬" },
  { value: 5, name: "פרסים קהילתיים", icon: "🏆" },
  { value: 1200, name: "ק''מ של שבילי קהילה", icon: "🛤️" },
  { value: 30, name: "פודקאסטים קהילתיים", icon: "🎙️" },
  { value: 900, name: "שקיות מיחזור", icon: "♻️" },
  { value: 200, name: "הכשרות מנהיגות", icon: "🎓" },
  { value: 60, name: "אירועי תרבות", icon: "🎭" },
];

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

// Task priorities
export const priorities = [
  { value: 'low', label: 'נמוכה', color: '#4CAF50' },
  { value: 'medium', label: 'בינונית', color: '#FF9800' },
  { value: 'high', label: 'גבוהה', color: '#F44336' }
];

// Task statuses
export const statuses = [
  { value: 'pending', label: 'ממתין', color: '#FF9800' },
  { value: 'in_progress', label: 'בביצוע', color: '#2196F3' },
  { value: 'completed', label: 'הושלם', color: '#4CAF50' },
  { value: 'cancelled', label: 'בוטל', color: '#9E9E9E' }
];

// Donation Statistics for the Bubble Screen
export const donationStats = [
  // כסף - Money Donations
  { id: 'money1', value: 125000, name: "תרומות כספיות השבוע", icon: "💰", category: 'money', color: '#4CAF50' },
  { id: 'money2', value: 35, name: "תורמים פעילים החודש", icon: "💳", category: 'money', color: '#66BB6A' },
  
  // טרמפים - Ride Sharing  
  { id: 'rides1', value: 245, name: "טרמפים שהתקיימו השבוע", icon: "🚗", category: 'rides', color: '#2196F3' },
  { id: 'rides2', value: 89, name: "נהגים פעילים", icon: "🚙", category: 'rides', color: '#42A5F5' },
  
  // אוכל - Food Donations
  { id: 'food1', value: 1580, name: "ק״ג אוכל נתרם השבוע", icon: "🍎", category: 'food', color: '#FF9800' },
  { id: 'food2', value: 127, name: "משפחות שקיבלו אוכל", icon: "🍽️", category: 'food', color: '#FFB74D' },
  
  // חברי קהילה - Community Members
  { id: 'members1', value: 52, name: "חברים חדשים השבוע", icon: "👥", category: 'members', color: '#9C27B0' },
  { id: 'members2', value: 3247, name: "סה״כ חברי קהילה פעילים", icon: "🌟", category: 'members', color: '#BA68C8' }
];

// === נתונים שהועברו מ-constants.tsx ===

// רשימת שמות עמותות
export const charityNames: string[] = [
  "לב זהב - עמותה לתמיכה בקשישים",
  "אור לילדים - עמותה לקידום חינוך",
  "יד למשפחה - סיוע למשפחות במצוקה",
  "חמלה לבעלי חיים - עמותה להצלת חיות",
  "פעמוני תקווה - תמיכה בנוער בסיכון",
  "זרעים של שלום - קידום דו-קיום",
  "כנפיים של חופש - סיוע לנפגעי אלימות",
  "עתיד טוב יותר - עמותה לפיתוח קהילתי",
  "קול התקווה - תמיכה בחולי סרטן",
  "שביל האור - ליווי אנשים עם מוגבלויות",
  "בריאות לכולם - קידום רפואה נגישה",
  "ירוק בעיניים - שמירה על איכות הסביבה",
  "דרך הלב - סיוע פסיכולוגי",
  "גשר לאקדמיה - קידום השכלה גבוהה",
  "בית חם לניצולים - תמיכה בניצולי שואה",
  "לגעת בשמיים - סיוע לילדים חולים",
  "נתינה לקהילה - פרויקטים חברתיים",
  "מרפא לנשמה - טיפול בטראומה",
  "עוגן בים - תמיכה באוכלוסיות ימיות",
  "יד רחבה - חלוקת מזון לנזקקים",
  "קשת בענן - תמיכה בקהילת הלהטב",
  "למען הזולת - התנדבות ועזרה הדדית",
  "אומנות למען שינוי - קידום חברתי דרך אומנות",
  "שוויון הזדמנויות - עמותה לצדק חברתי",
  "מגן לטף - הגנה על ילדים בסיכון",
  "פנים חדשות - שיקום אסירים",
  "חיים בכבוד - סיוע לחסרי בית",
  "קול הנשים - קידום זכויות נשים",
  "למען הטבע - שימור ביו-מגוון",
  "דרך היצירה - העצמה באמצעות יצירה",
  "הבטחון התזונתי - מניעת רעב",
  "מעגלי חיים - תמיכה במשפחות שכולות",
  "רשת הביטחון - סיוע לעולים חדשים",
  "אורח חיים בריא - קידום בריאות הציבור",
  "מטיילים למען הקהילה - עמותת טיולים אתגריים",
  "שקט נפשי - סיוע נפשי לנוער",
  "התפתחות אישית - סדנאות וקורסים",
  "רוח ספורטיבית - קידום ספורט תחרותי",
  "מסע אל העצמי - עמותה לפיתוח מודעות",
  "בונים גשרים - חיבור בין קהילות",
  "אהבת הארץ - שימור מורשת",
  "קול אחד - עמותה לזכויות אדם",
  "חיוך לכולם - טיפול שיניים ללא עלות",
  "מלאכים בלבן - תמיכה במשפחות של חולים כרוניים",
  "הזדמנות שנייה - שיקום חברתי",
  "דרך השלום - חינוך לסובלנות",
  "אמץ חבר - עמותה לאימוץ כלבים וחתולים",
  "יד תומכת - ליווי יולדות",
  "מפגש בין דורי - חיבור בין ותיקים לצעירים",
  "עושים טוב - חלוקת ציוד לבית הספר",
  "קריאת כיוון - ייעוץ תעסוקתי",
  "עולם חדש - תמיכה בילדים עם צרכים מיוחדים",
  "ללא גבולות - עמותה לקידום ספורט נכים",
  "ניצוץ של תקווה - עמותה לסיוע לנפגעי סמים",
  "דרך היין - קידום תרבות היין המקומית",
  "כלים לחיים - סדנאות מיומנויות",
  "פרנסה בכבוד - סיוע בהשמה לעבודה",
  "שומרי היער - עמותה למען העצים",
  "תקווה לשינוי - טיפול בהתמכרויות",
  "מעוף הציפור - סיוע נפשי לילדים",
  "הכיפה הסגולה - עמותה לטיפול באוטיזם",
  "פני מלאך - סיוע למשפחות עם ילדים חולים",
  "שער הזהב - עמותה לגמלאים",
  "קול הדממה - סיוע ללקויי שמיעה",
  "הדרך הטובה - קידום ערכים",
  "לב פתוח - עמותה לתרומת איברים",
  "צבעוניות בחיים - תמיכה באומנים מתחילים",
  "כוח המחשבה - עמותה למען חולי אלצהיימר",
  "עולם שלם - שילוב עולים בחברה",
  "ניצוצות של אור - סיוע לילדים בסיכון",
  "בטחה לילד - הגנה מפני התעללות",
  "פעמוני חירות - סיוע לאסירים משוחררים",
  "מזון לכולם - בנק מזון ארצי",
  "קול הארץ - שימור אתרי מורשת",
  "לחיים טובים יותר - עמותה לבריאות הנפש",
  "אור השחר - סיוע לנפגעי כתות",
  "השראה לצעירים - פיתוח מנהיגות",
  "יד ביד לקהילה - פרויקטים קהילתיים",
  "בונים עתיד - שיקום שכונות מצוקה",
  "קול השקט - עמותה למען נפגעי טרור",
  "דרך המעשה - קידום התנדבות",
  "גן עדן לחיות - מקלט לבעלי חיים",
  "שחף של חופש - סיוע לנוער בסיכון",
  "לב האדם - קידום צדק חברתי",
  "כחול לבן - עמותה למען חיילים בודדים",
  "התקווה שבלב - סיוע למשפחות פשע",
  "אור בחשיכה - תמיכה נפשית",
  "למען הדור הבא - חינוך סביבתי",
  "קול העם - עמותה לזכויות צרכנים",
  "מרכז האושר - סדנאות לרווחה אישית",
  "חזון ויוזמה - קידום יזמות חברתית",
  "מפתחות להצלחה - סיוע בחינוך מקצועי",
  "שלום עולמי - קידום דיאלוג בין-תרבותי",
  "בית לגמלאי - פעילויות לגיל הזהב",
  "תרומה לחיים - קידום תרומת דם",
  "מעגל הנתינה - סיוע לנזקקים בחגים",
  "דרך החינוך - קידום ערכים בבתי ספר",
  "אוצרות הטבע - שימור אוצרות טבע",
  "קול המצוקה - סיוע לנפגעי אלימות במשפחה",
  "שדות ירוקים - חקלאות בת קיימא",
  "כנף רחבה - סיוע לילדים עם מחלות נדירות",
  "יד ביד למחר - קידום שילוב בחברה",
  "שקט ורוגע - מרכז לטיפול בסטרס",
  "מחשבה ירוקה - קידום מודעות סביבתית",
  "הלב הפועם - סיוע למשפחות עם ילדים חולי לב",
  "מסע של אור - עמותה לליווי מטופלים אונקולוגיים"
];

// ציטוטי מוטיבציה
export const motivationalQuotes = [
  "העתיד שייך לאלו שמאמינים ביופיים של חלומותיהם.",
  "כל יום הוא התחלה חדשה.",
  "אל תוותר – ההתחלה תמיד הכי קשה.",
  "הדרך היחידה לעשות עבודה נהדרת היא לאהוב את מה שאתה עושה.",
  "אין דבר העומד בפני הרצון.",
  "כשאתה מפחד – תזוז בכל זאת.",
  "כל כישלון הוא צעד אחד לקראת ההצלחה.",
  "אל תשווה את ההתחלה שלך לאמצע של מישהו אחר.",
  "עשה היום את מה שאחרים לא – כדי שתוכל מחר מה שאחרים לא יכולים.",
  "המכשולים הם מה שאתה רואה כשאתה מוריד את העיניים מהמטרה.",
  "האומץ לא תמיד שואג – לפעמים הוא לוחש: אנסה שוב מחר.",
  "לא משנה כמה לאט אתה מתקדם – אתה עדיין עוקף את מי שיושב על הספה.",
  "כל יום הוא הזדמנות להתקדם.",
  "הצלחה היא סדרה של צעדים קטנים שנעשים בעקביות.",
  "אין קיצורי דרך למקומות ששווה להגיע אליהם.",
  "תאמין בעצמך גם כשאף אחד אחר לא.",
  "כל מסע מתחיל בצעד אחד.",
  "הזמן הכי טוב להתחיל היה אתמול. השני הכי טוב הוא עכשיו.",
  "אם אתה יכול לחלום את זה – אתה יכול להשיג את זה.",
  "אל תיתן לפחד להחליט בשבילך.",
  "אתה חזק יותר ממה שאתה חושב.",
  "הצלחה מתחילה בהחלטה לנסות.",
  "אל תחכה להזדמנות – צור אותה.",
  "בכל נפילה טמונה צמיחה.",
  "גם הדרך הארוכה ביותר מתחילה בצעד קטן.",
  "מה שלא הורג – מחשל.",
  "כדי לנצח – צריך קודם להאמין שאפשר.",
  "תחלום בגדול – תעבוד חכם – תישאר צנוע.",
  "הכוח האמיתי נמצא בהתמדה.",
  "להיות אמיץ זה להתחיל גם כשאין ביטחון.",
  "השינוי מתחיל מבפנים.",
  "מה שאתה מאמין – זה מה שאתה יוצר.",
  "תהיה השינוי שאתה רוצה לראות בעולם.",
  "אל תוותר על עצמך – אף פעם.",
  "העבר לא שווה להישאר בו – ההווה מחכה שתיצור אותו.",
  "כשיש למה לקום – הקימה קלה יותר.",
  "חולשה היא רק חוסר תרגול.",
  "כל קושי הוא שיעור במסע.",
  "בכל יום אתה נולד מחדש – מה תעשה היום?",
  "החלום שלך שווה את זה.",
  "אם תיפול 7 פעמים – קום 8.",
  "תודה היא המפתח לשפע.",
  "החיים קצרים מדי כדי לדחות את החלומות.",
  "תהיה טוב – גם כשאף אחד לא רואה.",
  "אל תחפש השראה – תהיה השראה.",
  "האמת שלך היא העוצמה שלך.",
  "הדרך הקצרה היא להמשיך.",
  "לכל אתגר יש פתרון – לפעמים אתה הפתרון.",
  "מה שאתה מתרכז בו – גדל.",
  "אל תתנצל על זה שאתה משתנה.",
  "אם אין דרך – תיצור אחת.",
  "תמשיך לזוז – גם אם לאט.",
  "תהיה עסוק בלבנות – לא בלבקר.",
  "האור תמיד חזק מהחושך.",
  "העולם מחכה לגרסה הכי טובה שלך.",
  "כל אדם שאתה פוגש – נלחם בקרב שאתה לא רואה.",
  "פשוט תתחיל.",
  "תן למה שמדליק אותך – לשרוף את הספקות.",
  "עשה את הכי טוב שאתה יכול – במקום שאתה נמצא.",
  "הסבלנות היא חלק מההצלחה.",
  "אל תפחד לזרוח.",
  "כל כישרון צריך תרגול – כל חלום צריך אומץ.",
  "אל תיתן לפחד להשתיק אותך.",
  "תצא מהקופסה – או תבנה אחת חדשה.",
  "כל יום – הזדמנות חדשה להתחזק.",
  "גם דרך קשה מובילה לפסגות גבוהות.",
  "כאב זמני – גאווה לנצח.",
  "החלומות שלך לא במקרה שלך.",
  "תאמין, תפעל, תחזור על זה.",
  "הדרך להצלחה רצופה בניסיונות.",
  "ההתמדה מנצחת את הכישרון – אם הכישרון לא מתמיד.",
  "אל תחכה לרגע הנכון – תיצור אותו.",
  "אין הגבלה למה שאתה יכול להיות.",
  "תאהב את הדרך – לא רק את היעד.",
  "מי שנכשל – ניסה. מי שלא – כבר נכשל.",
  "הניצחון האמיתי הוא פנימי.",
  "המפתח הוא לא לוותר.",
  "תהיה עקשן לגבי החלומות שלך – אבל גמיש בדרך.",
  "מה שאתה עושה – חשוב יותר ממה שאתה אומר.",
  "אל תיתן לקושי לעצור אותך – תן לו לדחוף אותך.",
  "תזכור למה התחלת.",
  "תשתדל להיות טוב יותר מהאתמול – זה מספיק.",
  "כל שינוי גדול – התחיל בצעד אמיץ קטן.",
  "אל תסתכל אחורה – אתה לא הולך לשם.",
  "האומץ מתחיל בהחלטה.",
  "כשאתה נופל – זו רק הזדמנות לקום חזק יותר.",
  "אל תיתן לפחד לגנוב לך את החלום.",
  "תבחר באור – כל יום מחדש.",
  "הדרך הכי טובה לנבא את העתיד – היא ליצור אותו.",
  "גם צעד קטן קדימה – זה עדיין קדימה.",
  "תהיה הסיבה שמישהו מחייך היום.",
  "הזמן עובר – תשתמש בו נכון.",
  "כל יום שאתה בוחר לקום – זה ניצחון.",
  "אמונה בעצמך – היא תחילתו של כל שינוי.",
  "התקדמות אמיתית נמדדת בהתמדה – לא במהירות.",
  "אין דבר חזק יותר מלב בוער.",
  "בכל פעם שאתה מוותר – מישהו אחר מנצח.",
  "תאהב את עצמך – אתה התחלה של כל השאר.",
  "תמיד יש איפה לגדול.",
  "השינוי האמיתי דורש אומץ."
];

// פרטי קבוצות וואטסאפ
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
    name: "טרמפים צפון",
    link: "https://chat.whatsapp.com/GjHTYqHGYF63VWh3BfTbE",
    image: require("../assets/images/logo.png"),
  },
  {
    name: "טרמפים צפון",
    link: "https://chat.whatsapp.com/GjHTYqHGYF63VWh3BfTbE",
    image: require("../assets/images/logo.png"),
  },
  {
    name: "טרמפים צפון",
    link: "https://chat.whatsapp.com/GjHTYqHGYF63VWh3BfTbE",
    image: require("../assets/images/logo.png"),
  },
  {
    name: "טרמפים צפון",
    link: "https://chat.whatsapp.com/GjHTYqHGYF63VWh3BfTbE",
    image: require("../assets/images/logo.png"),
  },
  {
    name: "טרמפים צפון",
    link: "https://chat.whatsapp.com/GjHTYqHGYF63VWh3BfTbE",
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
];


  // Recent Activities
export const recentActivities = [
    {
      id: '1',
      type: 'task',
      title: 'משימה הושלמה: איסוף מזון',
      description: 'אנה כהן השלימה משימת איסוף מזון',
      time: 'לפני שעה',
      icon: 'checkmark-circle',
      color: '#4CAF50' // success green
    },
    {
      id: '2',
      type: 'donation',
      title: 'תרומה חדשה: 500 ₪',
      description: 'דני לוי תרם 500 ₪ לקניית ציוד',
      time: 'לפני 3 שעות',
      icon: 'heart',
      color: '#F44336' // error red
    },
    {
      id: '3',
      type: 'event',
      title: 'אירוע חדש: יום קהילה',
      description: 'אירוע קהילתי גדול יתקיים בשבוע הבא',
      time: 'לפני יום',
      icon: 'calendar',
      color: '#2196F3' // info blue
    }
  ];