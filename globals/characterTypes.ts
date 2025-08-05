// 15 סוגי דמויות לאפליקציה KC - הקיבוץ הקפיטליסטי של ישראל
// כולל תורמים ומשתמשים בקהילה

export interface CharacterType {
  id: string;
  name: string;
  description: string;
  avatar: string;
  bio: string;
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
  preferences: {
    language: string;
    notifications: boolean;
    privacy: 'public' | 'private' | 'friends';
  };
  // נתונים ספציפיים לכל דמות
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

export const characterTypes: CharacterType[] = [
  {
    id: 'char1',
    name: 'יוסי התורם הגדול',
    description: 'איש עסקים מצליח שתורם הרבה כסף וזמן לקהילה',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'איש עסקים מצליח, מאמין גדול בערבות הדדית. תורם 10% מהכנסותיי לקהילה ומתנדב שבועית.',
    karmaPoints: 2500,
    joinDate: '2020-03-15',
    location: { city: 'תל אביב', country: 'ישראל' },
    interests: ['עסקים', 'קהילה', 'פילנתרופיה', 'ספורט'],
    roles: ['user', 'donor', 'volunteer'],
    postsCount: 45,
    followersCount: 500,
    followingCount: 200,
    completedTasks: 78,
    totalDonations: 25,
    receivedDonations: 0,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'public' },
    characterData: {
      donationHistory: [
        { type: 'money', amount: 5000, description: 'תרומה לקניית ציוד לספרייה קהילתית', date: '2024-07-15' },
        { type: 'money', amount: 3000, description: 'תרומה לעמותת מזון', date: '2024-06-20' },
        { type: 'time', description: 'התנדבות שבועית בהוראה לילדים', date: '2024-07-01' },
        { type: 'service', description: 'ייעוץ עסקי חינם לעמותות', date: '2024-05-10' }
      ],
      receivedHelp: [],
      activeProjects: ['תמיכה בספרייה קהילתית', 'ייעוץ לעמותות'],
      skills: ['ניהול עסקי', 'ייעוץ פיננסי', 'הוראה', 'גיוס כספים'],
      needs: [],
      availability: 'שבועי - 10 שעות',
      favoriteCategories: ['חינוך', 'עסקים', 'קהילה']
    }
  },
  {
    id: 'char2',
    name: 'שרה המתנדבת הפעילה',
    description: 'אמא לשלושה שמתנדבת הרבה זמן ומוסרת חפצים',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    bio: 'אמא לשלושה ילדים, אוהבת לעזור בקהילה. מתנדבת בספרייה ומעבירה סדנאות יצירה.',
    karmaPoints: 1800,
    joinDate: '2021-08-22',
    location: { city: 'חיפה', country: 'ישראל' },
    interests: ['יצירה', 'ספרים', 'ילדים', 'קהילה'],
    roles: ['user', 'volunteer', 'donor'],
    postsCount: 32,
    followersCount: 280,
    followingCount: 150,
    completedTasks: 65,
    totalDonations: 18,
    receivedDonations: 2,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'item', description: 'בגדים במצב מעולה לילדים', date: '2024-07-20' },
        { type: 'item', description: 'ספרים וצעצועים', date: '2024-06-15' },
        { type: 'time', description: 'התנדבות שבועית בספרייה', date: '2024-07-01' },
        { type: 'service', description: 'סדנאות יצירה לילדים', date: '2024-05-20' }
      ],
      receivedHelp: [
        { type: 'transport', description: 'טרמפ לטיול משפחתי', date: '2024-06-10' },
        { type: 'knowledge', description: 'ייעוץ לגידול ילדים', date: '2024-05-15' }
      ],
      activeProjects: ['ספרייה קהילתית', 'סדנאות יצירה'],
      skills: ['יצירה', 'הוראה', 'ארגון אירועים', 'עבודה עם ילדים'],
      needs: ['טרמפים מדי פעם', 'ייעוץ פיננסי'],
      availability: 'שבועי - 15 שעות',
      favoriteCategories: ['ילדים', 'חינוך', 'יצירה']
    }
  },
  {
    id: 'char3',
    name: 'עמותת "יד ביד"',
    description: 'עמותה שמארגנת אירועים קהילתיים ומקבלת תרומות',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    bio: 'עמותה שמטרתה לחבר בין אנשים בקהילה ולעזור לנזקקים. מארגנים אירועים, אוספים תרומות ומחלקים מזון.',
    karmaPoints: 3200,
    joinDate: '2019-11-10',
    location: { city: 'ירושלים', country: 'ישראל' },
    interests: ['קהילה', 'עזרה הדדית', 'אירועים', 'מזון'],
    roles: ['organization', 'donor', 'recipient'],
    postsCount: 89,
    followersCount: 1200,
    followingCount: 300,
    completedTasks: 120,
    totalDonations: 45,
    receivedDonations: 67,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'public' },
    characterData: {
      donationHistory: [
        { type: 'service', description: 'ארגון אירועים קהילתיים', date: '2024-07-25' },
        { type: 'time', description: 'חלוקת מזון לנזקקים', date: '2024-07-20' },
        { type: 'money', amount: 2000, description: 'תרומה לעמותה אחרת', date: '2024-06-30' }
      ],
      receivedHelp: [
        { type: 'money', description: 'תרומות כספיות מהקהילה', date: '2024-07-15' },
        { type: 'item', description: 'מזון ובגדים', date: '2024-07-10' },
        { type: 'service', description: 'עזרה בארגון אירועים', date: '2024-06-25' }
      ],
      activeProjects: ['חלוקת מזון', 'אירועים קהילתיים', 'תמיכה במשפחות'],
      skills: ['ארגון אירועים', 'גיוס כספים', 'עבודה עם קהילה', 'לוגיסטיקה'],
      needs: ['מתנדבים', 'תרומות כספיות', 'מזון', 'בגדים'],
      availability: 'יומי - 8 שעות',
      favoriteCategories: ['מזון', 'אירועים', 'קהילה']
    }
  },
  {
    id: 'char4',
    name: 'דני הסטודנט',
    description: 'סטודנט שמשתמש בידע מעמוד ידע ומדי פעם נוסע בטרמפים',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    bio: 'סטודנט למדעי המחשב, משתמש הרבה בעמוד הידע של הקהילה. נוסע בטרמפים ומתנדב מדי פעם.',
    karmaPoints: 450,
    joinDate: '2023-09-05',
    location: { city: 'באר שבע', country: 'ישראל' },
    interests: ['תכנות', 'טכנולוגיה', 'מוזיקה', 'טיולים'],
    roles: ['user', 'student', 'recipient'],
    postsCount: 8,
    followersCount: 45,
    followingCount: 120,
    completedTasks: 12,
    totalDonations: 3,
    receivedDonations: 15,
    isVerified: false,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'time', description: 'עזרה בתכנות לאתר הקהילה', date: '2024-07-10' },
        { type: 'knowledge', description: 'שיתוף ידע בתכנות', date: '2024-06-20' }
      ],
      receivedHelp: [
        { type: 'transport', description: 'טרמפים לאוניברסיטה', date: '2024-07-22' },
        { type: 'knowledge', description: 'ייעוץ בלימודים', date: '2024-07-15' },
        { type: 'knowledge', description: 'עזרה בהכנת פרויקט', date: '2024-06-30' },
        { type: 'transport', description: 'טרמפ הביתה', date: '2024-06-25' }
      ],
      activeProjects: ['פיתוח אתר הקהילה'],
      skills: ['תכנות', 'פיתוח אתרים', 'JavaScript', 'React'],
      needs: ['טרמפים', 'ייעוץ לימודים', 'מחשב'],
      availability: 'מדי פעם - 5 שעות שבועיות',
      favoriteCategories: ['טכנולוגיה', 'חינוך', 'תחבורה']
    }
  },
  {
    id: 'char5',
    name: 'רחל המשפחה החד הורית',
    description: 'אמא חד הורית שמקבלת עזרה מהקהילה ומתנדבת בחזרה',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    bio: 'אמא לשתי בנות, עובדת קשה לפרנס את המשפחה. מקבלת עזרה מהקהילה ומתנדבת בחזרה ככל יכולתי.',
    karmaPoints: 750,
    joinDate: '2022-05-12',
    location: { city: 'אשדוד', country: 'ישראל' },
    interests: ['משפחה', 'בישול', 'ספרים', 'קהילה'],
    roles: ['user', 'recipient', 'volunteer'],
    postsCount: 15,
    followersCount: 120,
    followingCount: 80,
    completedTasks: 25,
    totalDonations: 8,
    receivedDonations: 22,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'time', description: 'התנדבות בספרייה', date: '2024-07-18' },
        { type: 'service', description: 'בישול לאירוע קהילתי', date: '2024-06-30' },
        { type: 'item', description: 'בגדים לילדים', date: '2024-05-20' }
      ],
      receivedHelp: [
        { type: 'money', description: 'עזרה בקניית ספרים לילדים', date: '2024-07-20' },
        { type: 'item', description: 'בגדים לילדים', date: '2024-07-15' },
        { type: 'transport', description: 'טרמפ לרופא', date: '2024-07-10' },
        { type: 'service', description: 'עזרה בשיעורי בית', date: '2024-06-25' }
      ],
      activeProjects: ['תמיכה במשפחות חד הוריות'],
      skills: ['בישול', 'עבודה עם ילדים', 'ארגון', 'אמפתיה'],
      needs: ['עזרה פיננסית', 'טרמפים', 'בגדים לילדים', 'ייעוץ'],
      availability: 'מדי פעם - 8 שעות שבועיות',
      favoriteCategories: ['משפחה', 'ילדים', 'מזון']
    }
  },
  {
    id: 'char6',
    name: 'משה הפרילנסר',
    description: 'פרילנסר שמציע שירותים מקצועיים ומקבל עזרה בחזרה',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    bio: 'מעצב גרפי פרילנסר, מציע שירותי עיצוב חינם לעמותות. מקבל עזרה בפרויקטים ומתחבר לקהילה.',
    karmaPoints: 1100,
    joinDate: '2021-12-03',
    location: { city: 'פתח תקווה', country: 'ישראל' },
    interests: ['עיצוב', 'אמנות', 'טכנולוגיה', 'קהילה'],
    roles: ['user', 'donor', 'recipient'],
    postsCount: 28,
    followersCount: 200,
    followingCount: 150,
    completedTasks: 35,
    totalDonations: 20,
    receivedDonations: 12,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'public' },
    characterData: {
      donationHistory: [
        { type: 'service', description: 'עיצוב לוגו לעמותה', date: '2024-07-20' },
        { type: 'service', description: 'עיצוב פליירים לאירוע', date: '2024-07-15' },
        { type: 'time', description: 'סדנת עיצוב לילדים', date: '2024-06-30' }
      ],
      receivedHelp: [
        { type: 'knowledge', description: 'ייעוץ עסקי', date: '2024-07-18' },
        { type: 'service', description: 'עזרה בטכני', date: '2024-07-10' },
        { type: 'transport', description: 'טרמפ לפגישה', date: '2024-06-25' }
      ],
      activeProjects: ['עיצוב לעמותות', 'סדנאות עיצוב'],
      skills: ['עיצוב גרפי', 'Photoshop', 'Illustrator', 'עיצוב אתרים'],
      needs: ['ייעוץ עסקי', 'עזרה טכנית', 'קשרים עסקיים'],
      availability: 'גמיש - 10 שעות שבועיות',
      favoriteCategories: ['עיצוב', 'טכנולוגיה', 'חינוך']
    }
  },
  {
    id: 'char7',
    name: 'ליאת הקשישה הפעילה',
    description: 'קשישה שמתנדבת הרבה ומקבלת עזרה בחזרה',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    bio: 'פנסיונרית פעילה, מתנדבת בספרייה ומלמדת סריגה. מקבלת עזרה בקניות וטיפולים.',
    karmaPoints: 1600,
    joinDate: '2020-08-20',
    location: { city: 'רעננה', country: 'ישראל' },
    interests: ['סריגה', 'ספרים', 'גינה', 'קהילה'],
    roles: ['user', 'volunteer', 'recipient'],
    postsCount: 42,
    followersCount: 180,
    followingCount: 90,
    completedTasks: 55,
    totalDonations: 30,
    receivedDonations: 18,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'time', description: 'התנדבות בספרייה', date: '2024-07-22' },
        { type: 'service', description: 'סדנת סריגה', date: '2024-07-15' },
        { type: 'item', description: 'סוודרים סרוגים', date: '2024-06-30' }
      ],
      receivedHelp: [
        { type: 'transport', description: 'טרמפ לרופא', date: '2024-07-20' },
        { type: 'service', description: 'עזרה בקניות', date: '2024-07-18' },
        { type: 'service', description: 'תחזוקת גינה', date: '2024-07-10' }
      ],
      activeProjects: ['ספרייה קהילתית', 'סדנאות סריגה'],
      skills: ['סריגה', 'הוראה', 'עבודה עם ילדים', 'גינון'],
      needs: ['עזרה בקניות', 'טרמפים', 'תחזוקת בית'],
      availability: 'שבועי - 12 שעות',
      favoriteCategories: ['יצירה', 'חינוך', 'קשישים']
    }
  },
  {
    id: 'char8',
    name: 'דוד החקלאי',
    description: 'חקלאי שתורם מזון טרי ומקבל עזרה בעבודות',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    bio: 'חקלאי מזה 20 שנה, תורם ירקות ופירות טריים לקהילה. מקבל עזרה בעבודות חקלאיות.',
    karmaPoints: 1400,
    joinDate: '2021-03-10',
    location: { city: 'עמק יזרעאל', country: 'ישראל' },
    interests: ['חקלאות', 'טבע', 'מזון', 'קהילה'],
    roles: ['user', 'donor', 'recipient'],
    postsCount: 25,
    followersCount: 160,
    followingCount: 70,
    completedTasks: 40,
    totalDonations: 35,
    receivedDonations: 8,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'public' },
    characterData: {
      donationHistory: [
        { type: 'item', description: 'ירקות טריים למשפחות', date: '2024-07-22' },
        { type: 'item', description: 'פירות מהמטע', date: '2024-07-15' },
        { type: 'time', description: 'סיור חינוכי בחווה', date: '2024-06-30' }
      ],
      receivedHelp: [
        { type: 'service', description: 'עזרה בקטיף', date: '2024-07-20' },
        { type: 'service', description: 'תחזוקת ציוד', date: '2024-07-10' },
        { type: 'transport', description: 'הובלת תוצרת', date: '2024-06-25' }
      ],
      activeProjects: ['תרומת מזון', 'סיורים חינוכיים'],
      skills: ['חקלאות', 'גינון', 'הוראה', 'מכירה'],
      needs: ['עזרה בעבודות', 'תחזוקת ציוד', 'שיווק'],
      availability: 'שבועי - 20 שעות',
      favoriteCategories: ['מזון', 'חקלאות', 'חינוך']
    }
  },
  {
    id: 'char9',
    name: 'נועה הסטודנטית הרפואית',
    description: 'סטודנטית לרפואה שמציעה ייעוץ רפואי ומקבלת עזרה בלימודים',
    avatar: 'https://randomuser.me/api/portraits/women/9.jpg',
    bio: 'סטודנטית לרפואה, מציעה ייעוץ רפואי בסיסי לקהילה. מקבלת עזרה בלימודים וטרמפים.',
    karmaPoints: 850,
    joinDate: '2022-09-15',
    location: { city: 'תל אביב', country: 'ישראל' },
    interests: ['רפואה', 'בריאות', 'ספורט', 'קריאה'],
    roles: ['user', 'student', 'donor'],
    postsCount: 18,
    followersCount: 140,
    followingCount: 100,
    completedTasks: 22,
    totalDonations: 15,
    receivedDonations: 10,
    isVerified: false,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'service', description: 'ייעוץ רפואי בסיסי', date: '2024-07-20' },
        { type: 'time', description: 'התנדבות בבית חולים', date: '2024-07-15' },
        { type: 'knowledge', description: 'הרצאה על בריאות', date: '2024-06-30' }
      ],
      receivedHelp: [
        { type: 'knowledge', description: 'עזרה בלימודים', date: '2024-07-18' },
        { type: 'transport', description: 'טרמפ לאוניברסיטה', date: '2024-07-15' },
        { type: 'service', description: 'עזרה בטכני', date: '2024-07-10' }
      ],
      activeProjects: ['ייעוץ רפואי קהילתי'],
      skills: ['רפואה', 'ייעוץ רפואי', 'עזרה ראשונה', 'הוראה'],
      needs: ['עזרה בלימודים', 'טרמפים', 'ספרים רפואיים'],
      availability: 'מדי פעם - 8 שעות שבועיות',
      favoriteCategories: ['בריאות', 'חינוך', 'תחבורה']
    }
  },
  {
    id: 'char10',
    name: 'עומר המשפחה הגדולה',
    description: 'אבא למשפחה גדולה שמקבל עזרה ומתנדב בחזרה',
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    bio: 'אבא ל-5 ילדים, עובד קשה לפרנס את המשפחה. מקבל עזרה מהקהילה ומתנדב בחזרה.',
    karmaPoints: 650,
    joinDate: '2021-11-08',
    location: { city: 'בית שמש', country: 'ישראל' },
    interests: ['משפחה', 'ספורט', 'מוזיקה', 'קהילה'],
    roles: ['user', 'recipient', 'volunteer'],
    postsCount: 12,
    followersCount: 90,
    followingCount: 60,
    completedTasks: 18,
    totalDonations: 6,
    receivedDonations: 25,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'time', description: 'התנדבות באירוע קהילתי', date: '2024-07-20' },
        { type: 'service', description: 'עזרה בתחזוקת גינה', date: '2024-07-15' }
      ],
      receivedHelp: [
        { type: 'item', description: 'בגדים לילדים', date: '2024-07-22' },
        { type: 'money', description: 'עזרה בקניית ספרים', date: '2024-07-18' },
        { type: 'transport', description: 'טרמפ לטיול משפחתי', date: '2024-07-10' },
        { type: 'service', description: 'עזרה בשיעורי בית', date: '2024-06-30' }
      ],
      activeProjects: ['תמיכה במשפחות גדולות'],
      skills: ['עבודה פיזית', 'ארגון', 'עבודה עם ילדים', 'תחזוקה'],
      needs: ['עזרה פיננסית', 'בגדים לילדים', 'טרמפים', 'ייעוץ'],
      availability: 'מדי פעם - 6 שעות שבועיות',
      favoriteCategories: ['משפחה', 'ילדים', 'תחבורה']
    }
  },
  {
    id: 'char11',
    name: 'מיכל הפסיכולוגית',
    description: 'פסיכולוגית שמציעה ייעוץ חינם ומקבלת עזרה טכנית',
    avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
    bio: 'פסיכולוגית קלינית, מציעה ייעוץ חינם למשפחות נזקקות. מקבלת עזרה טכנית וטרמפים.',
    karmaPoints: 1900,
    joinDate: '2020-12-05',
    location: { city: 'הרצליה', country: 'ישראל' },
    interests: ['פסיכולוגיה', 'משפחה', 'ספרים', 'יוגה'],
    roles: ['user', 'professional', 'donor'],
    postsCount: 35,
    followersCount: 220,
    followingCount: 120,
    completedTasks: 45,
    totalDonations: 28,
    receivedDonations: 5,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'service', description: 'ייעוץ פסיכולוגי חינם', date: '2024-07-22' },
        { type: 'time', description: 'הרצאה על בריאות נפשית', date: '2024-07-15' },
        { type: 'service', description: 'סדנת הורות', date: '2024-06-30' }
      ],
      receivedHelp: [
        { type: 'service', description: 'עזרה טכנית במחשב', date: '2024-07-20' },
        { type: 'transport', description: 'טרמפ לפגישה', date: '2024-07-18' }
      ],
      activeProjects: ['ייעוץ פסיכולוגי קהילתי', 'סדנאות הורות'],
      skills: ['פסיכולוגיה', 'ייעוץ', 'הוראה', 'אמפתיה'],
      needs: ['עזרה טכנית', 'טרמפים', 'חומרי הדרכה'],
      availability: 'שבועי - 15 שעות',
      favoriteCategories: ['בריאות', 'חינוך', 'משפחה']
    }
  },
  {
    id: 'char12',
    name: 'יוסי הנהג הפעיל',
    description: 'נהג שמציע טרמפים ומקבל עזרה בתחזוקת הרכב',
    avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
    bio: 'נהג מקצועי, מציע טרמפים לקהילה ומתנדב בהובלת תרומות. מקבל עזרה בתחזוקת הרכב.',
    karmaPoints: 1200,
    joinDate: '2021-06-20',
    location: { city: 'מודיעין', country: 'ישראל' },
    interests: ['נהיגה', 'מוזיקה', 'ספורט', 'קהילה'],
    roles: ['user', 'driver', 'volunteer'],
    postsCount: 30,
    followersCount: 180,
    followingCount: 100,
    completedTasks: 40,
    totalDonations: 25,
    receivedDonations: 8,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'public' },
    characterData: {
      donationHistory: [
        { type: 'service', description: 'טרמפים לקהילה', date: '2024-07-22' },
        { type: 'time', description: 'הובלת תרומות', date: '2024-07-20' },
        { type: 'service', description: 'הובלת אנשים לאירועים', date: '2024-07-15' }
      ],
      receivedHelp: [
        { type: 'service', description: 'תחזוקת רכב', date: '2024-07-18' },
        { type: 'service', description: 'עזרה טכנית', date: '2024-07-10' }
      ],
      activeProjects: ['טרמפים קהילתיים', 'הובלת תרומות'],
      skills: ['נהיגה', 'לוגיסטיקה', 'עבודה עם אנשים', 'תחזוקה'],
      needs: ['תחזוקת רכב', 'עזרה טכנית', 'דלק'],
      availability: 'יומי - 6 שעות',
      favoriteCategories: ['תחבורה', 'לוגיסטיקה', 'קהילה']
    }
  },
  {
    id: 'char13',
    name: 'דנה המתכנתת הצעירה',
    description: 'מתכנתת שמציעה שירותי פיתוח ומקבלת ייעוץ עסקי',
    avatar: 'https://randomuser.me/api/portraits/women/13.jpg',
    bio: 'מתכנתת צעירה, מציעה שירותי פיתוח חינם לעמותות. מקבלת ייעוץ עסקי וטרמפים.',
    karmaPoints: 950,
    joinDate: '2022-01-15',
    location: { city: 'רמת גן', country: 'ישראל' },
    interests: ['תכנות', 'טכנולוגיה', 'ספורט', 'מוזיקה'],
    roles: ['user', 'developer', 'donor'],
    postsCount: 20,
    followersCount: 150,
    followingCount: 80,
    completedTasks: 25,
    totalDonations: 18,
    receivedDonations: 6,
    isVerified: false,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'service', description: 'פיתוח אתר לעמותה', date: '2024-07-20' },
        { type: 'time', description: 'סדנת תכנות לילדים', date: '2024-07-15' },
        { type: 'service', description: 'תחזוקת מערכות', date: '2024-06-30' }
      ],
      receivedHelp: [
        { type: 'knowledge', description: 'ייעוץ עסקי', date: '2024-07-18' },
        { type: 'transport', description: 'טרמפ לפגישה', date: '2024-07-15' }
      ],
      activeProjects: ['פיתוח לעמותות', 'סדנאות תכנות'],
      skills: ['תכנות', 'JavaScript', 'React', 'Node.js'],
      needs: ['ייעוץ עסקי', 'טרמפים', 'קשרים עסקיים'],
      availability: 'שבועי - 12 שעות',
      favoriteCategories: ['טכנולוגיה', 'חינוך', 'עסקים']
    }
  },
  {
    id: 'char14',
    name: 'אבי המשפחה החדשה',
    description: 'משפחה חדשה שמקבלת עזרה ומתנדבת בחזרה',
    avatar: 'https://randomuser.me/api/portraits/men/14.jpg',
    bio: 'משפחה חדשה שעברה לעיר, מקבלת עזרה מהקהילה ומתנדבת בחזרה. מחפשים חברים וחיבורים.',
    karmaPoints: 300,
    joinDate: '2024-01-10',
    location: { city: 'כפר סבא', country: 'ישראל' },
    interests: ['משפחה', 'טיולים', 'בישול', 'קהילה'],
    roles: ['user', 'recipient', 'volunteer'],
    postsCount: 5,
    followersCount: 30,
    followingCount: 50,
    completedTasks: 8,
    totalDonations: 4,
    receivedDonations: 12,
    isVerified: false,
    preferences: { language: 'he', notifications: true, privacy: 'friends' },
    characterData: {
      donationHistory: [
        { type: 'time', description: 'התנדבות באירוע קהילתי', date: '2024-07-20' },
        { type: 'service', description: 'עזרה בגינה קהילתית', date: '2024-07-15' }
      ],
      receivedHelp: [
        { type: 'knowledge', description: 'ייעוץ על העיר', date: '2024-07-22' },
        { type: 'item', description: 'חפצי בית', date: '2024-07-18' },
        { type: 'transport', description: 'טרמפ לסופר', date: '2024-07-15' },
        { type: 'service', description: 'עזרה בסידור הבית', date: '2024-07-10' }
      ],
      activeProjects: ['הכרת הקהילה'],
      skills: ['בישול', 'ארגון', 'עבודה עם ילדים', 'גינון'],
      needs: ['חברים', 'ייעוץ על העיר', 'חפצי בית', 'טרמפים'],
      availability: 'מדי פעם - 8 שעות שבועיות',
      favoriteCategories: ['משפחה', 'קהילה', 'תחבורה']
    }
  },
  {
    id: 'char15',
    name: 'שירה האמנית',
    description: 'אמנית שמציעה סדנאות יצירה ומקבלת עזרה בשיווק',
    avatar: 'https://randomuser.me/api/portraits/women/15.jpg',
    bio: 'אמנית פלסטית, מציעה סדנאות יצירה חינם לילדים ומבוגרים. מקבלת עזרה בשיווק וטרמפים.',
    karmaPoints: 1100,
    joinDate: '2021-07-25',
    location: { city: 'תל אביב', country: 'ישראל' },
    interests: ['אמנות', 'יצירה', 'טבע', 'מוזיקה'],
    roles: ['user', 'artist', 'donor'],
    postsCount: 38,
    followersCount: 200,
    followingCount: 120,
    completedTasks: 30,
    totalDonations: 22,
    receivedDonations: 8,
    isVerified: true,
    preferences: { language: 'he', notifications: true, privacy: 'public' },
    characterData: {
      donationHistory: [
        { type: 'service', description: 'סדנת ציור לילדים', date: '2024-07-22' },
        { type: 'item', description: 'ציורים לקישוט מרכז קהילתי', date: '2024-07-20' },
        { type: 'time', description: 'סדנת פיסול למבוגרים', date: '2024-07-15' }
      ],
      receivedHelp: [
        { type: 'knowledge', description: 'ייעוץ שיווקי', date: '2024-07-18' },
        { type: 'transport', description: 'טרמפ לתערוכה', date: '2024-07-15' },
        { type: 'service', description: 'עזרה בהקמת תערוכה', date: '2024-07-10' }
      ],
      activeProjects: ['סדנאות יצירה', 'קישוט מרכז קהילתי'],
      skills: ['ציור', 'פיסול', 'הוראה', 'עיצוב'],
      needs: ['ייעוץ שיווקי', 'טרמפים', 'חומרי יצירה'],
      availability: 'שבועי - 10 שעות',
      favoriteCategories: ['אמנות', 'יצירה', 'חינוך']
    }
  }
]; 