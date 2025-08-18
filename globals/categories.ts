// Donation categories for the Karma Community app
// These are the main categories users can donate and receive help in

export const donationCategories = [
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
] as const;

export type DonationCategory = typeof donationCategories[number];

export default donationCategories;
