import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function SupportScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'support',
        title: 'תמיכה',
        subtitle: 'תמיכה נפשית',
        icon: 'heart-outline',
        color: colors.pinkDark,
        bgColor: colors.pinkLight,
        description: 'תמיכה נפשית, קווי סיוע וקבוצות קהילה',
      }}
    />
  );
}

