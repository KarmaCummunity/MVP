// Clean version of fake data file - all demo data removed
// Import types from proper types file
export type {
  Message,
  ChatUser,
  ChatConversation,
  Donation,
  User,
  CommunityEvent,
  Charity,
  DonationItem,
  ItemType
} from '../types/models';

// Empty arrays for backward compatibility
// These should be replaced with proper API calls
export const users: any[] = [];
export const donations: any[] = [];
export const communityEvents: any[] = [];
export const categories: any[] = [
  'כסף',
  'חפצים',
  'זמן',
  'ידע',
  'תחבורה',
  'מזון',
  'בגדים',
  'רהיטים',
  'משחקים',
  'ספרים',
  'טכנולוגיה',
  'אמנות',
  'מוזיקה',
  'ספורט',
  'בעלי חיים',
  'צמחים',
  'אירועים',
  'בריאות',
  'משפחה',
  'חינוך'
]; // Keep basic categories as these are likely needed
export const charities: any[] = [];
export const charityNames: string[] = [];

// Remove currentUser export - should come from proper user context
export const WHATSAPP_GROUP_DETAILS: any[] = [];

console.log('✅ Fake data file loaded (demo data removed)');
