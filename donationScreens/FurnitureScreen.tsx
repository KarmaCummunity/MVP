import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function FurnitureScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'furniture',
        title: 'רהיטים',
        subtitle: 'תרומת רהיטים',
        icon: 'bed-outline',
        color: colors.textPrimary,
        bgColor: colors.backgroundSecondary,
        description: 'תרומת רהיטים ושיפור בתים למען הקהילה',
      }}
    />
  );
}

