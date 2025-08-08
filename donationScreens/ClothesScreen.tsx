import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function ClothesScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'clothes',
        title: 'בגדים',
        subtitle: 'תרומת בגדים',
        icon: 'shirt-outline',
        color: colors.info,
        bgColor: colors.infoLight,
        description: 'תרומת בגדים, החלפות קהילתיות ואיסוף פריטים',
      }}
    />
  );
}

