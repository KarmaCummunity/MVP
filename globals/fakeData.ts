// data/fakeData.ts

export interface Message {
    id: string;
    senderId: string; // 'me' for current user, or user ID for others
    text?: string;
    image?: string; // URL for image messages
    timestamp: string; // ISO string for easy sorting/display
    read?: boolean; // For read receipts
  }
  
  export interface ChatUser {
    id: string;
    name: string;
    avatar: string; // URL for avatar
    isOnline: boolean;
  }
  
  export interface ChatConversation {
    id: string;
    userId: string; // The ID of the user you are chatting with
    messages: Message[];
    lastMessageText: string; // For display in chat list
    lastMessageTimestamp: string;
  }
  
  export const users: ChatUser[] = [
    { id: 'user1', name: 'אנה כהן', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', isOnline: true },
    { id: 'user2', name: 'דני לוי', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', isOnline: false },
    { id: 'user3', name: 'שרה מזרחי', avatar: 'https://randomuser.me/api/portraits/women/3.jpg', isOnline: true },
    { id: 'user4', name: 'חיים חדד', avatar: 'https://randomuser.me/api/portraits/men/4.jpg', isOnline: false },
    { id: 'user5', name: 'נועה פרץ', avatar: 'https://randomuser.me/api/portraits/women/5.jpg', isOnline: true },
  ];
  
  const generateMessages = (userId: string): Message[] => {
    const now = new Date();
    const messages: Message[] = [
      {
        id: 'm1',
        senderId: userId,
        text: 'היי, מה קורה?',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        read: true,
      },
      {
        id: 'm2',
        senderId: 'me',
        text: 'בסדר גמור, מה איתך?',
        timestamp: new Date(now.getTime() - 4 * 60 * 1000).toISOString(), // 4 minutes ago
        read: true,
      },
      {
        id: 'm3',
        senderId: userId,
        text: 'גם אני בסדר, רציתי לשאול משהו...',
        timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString(), // 3 minutes ago
        read: false,
      },
      {
        id: 'm4',
        senderId: 'me',
        text: 'בטח, דבר/י',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        read: false,
      },
      {
        id: 'm5',
        senderId: userId,
        image: 'https://picsum.photos/id/237/200/200', // Example image
        timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(), // 1 minute ago
        read: false,
      },
      {
        id: 'm6',
        senderId: 'me',
        text: 'וואו, תמונה י111פה!',
        timestamp: now.toISOString(), // Now
        read: false,
      },
    ];
    return messages;
  };
  
  export const conversations: ChatConversation[] = users.map((user) => {
    const messages = generateMessages(user.id);
    const lastMessage = messages[messages.length - 1];
    return {
      id: user.id,
      userId: user.id,
      messages: messages,
      lastMessageText: lastMessage.text || 'תמונה',
      lastMessageTimestamp: lastMessage.timestamp,
    };
  });

export const communityStats = [
    { value: 125000, name: "תרומות בדולרים" }, // Donations in Dollars
    { value: 2345, name: "מתנדבים פעילים" }, // Active Volunteers
    { value: 78, name: "אירועים קהילתיים" }, // Community Events
    { value: 15, name: "פרויקטים חדשים" }, // New Projects
    { value: 3200, name: "חברים פעילים" }, // Active Members
    { value: 95, name: "שותפים בקהילה" }, // Community Partners
    { value: 500, name: "שעות התנדבות" }, // Volunteer Hours
    { value: 12, name: "יוזמות חדשניות" }, // Innovative Initiatives
    { value: 8, name: "הנהגות קהילתיות" }, // Community Leaderships
    { value: 250, name: "משפחות נתמכות" }, // Families Supported
  
    // --- New Categories You Provided ---
    { value: 1876, name: "טרמפים שנוצרו" }, // Rides created through us
    { value: 450, name: "חפצים שנתרמו" }, // Items donated through us
    { value: 23, name: "עמותות שותפות" }, // Partner organizations
    { value: 1500, name: "ק''ג בגדים נתרמו" }, // kg of clothes donated
    { value: 2100, name: "ק''ג אוכל נתרם" }, // kg of food donated
    { value: 67, name: "קורסים נלמדו בספרייה" }, // Courses learned in our library
    { value: 120, name: "חיות שמצאו בית" }, // Animals that found a home
    { value: 350, name: "ליטר דם נתרם" }, // Liters of blood donated
    { value: 18, name: "משפחות אומנה נמצאו" }, // Foster families found
  
    // --- More Creative Additions ---
    { value: 45, name: "סדנאות יצירה" }, // Creative workshops held
    { value: 9, name: "גינות קהילתיות" }, // Community gardens established
    { value: 750, name: "עצים ניטעו" }, // Trees planted
    { value: 110, name: "שעות ייעוץ אישי" }, // Personal counseling hours
    { value: 5, name: "פרסים קהילתיים" }, // Community awards received
    { value: 1200, name: "ק''מ של שבילי קהילה" }, // km of community paths maintained
    { value: 30, name: "פודקאסטים קהילתיים" }, // Community podcasts produced
    { value: 900, name: "שקיות מיחזור" }, // Recycling bags collected
    { value: 200, name: "הכשרות מנהיגות" }, // Leadership trainings provided
    { value: 60, name: "אירועי תרבות" }, // Cultural events hosted
  ];