import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function AnimalsScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'animals',
        title: 'חיות',
        subtitle: 'עזרה לחיות',
        icon: 'paw-outline',
        color: colors.orangeDark,
        bgColor: colors.backgroundTertiary,
        description: 'אימוץ, עזרה לחיות משוטטות ותמיכה בעמותות',
      }}
    />
  );
}

