import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function WasteScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'waste',
        title: 'פסולת',
        subtitle: 'מיחזור והפרדה',
        icon: 'trash-outline',
        color: colors.warning,
        bgColor: colors.warningLight,
        description: 'פרויקטי ניקיון, מיחזור והפרדת פסולת',
      }}
    />
  );
}

