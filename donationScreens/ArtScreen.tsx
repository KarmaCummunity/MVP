import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function ArtScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'art',
        title: 'אמנות',
        subtitle: 'יצירה ושיתוף',
        icon: 'color-palette-outline',
        color: colors.pink,
        bgColor: colors.pinkLight,
        description: 'יצירה אומנותית, סדנאות ושיתופי קהילה',
      }}
    />
  );
}

