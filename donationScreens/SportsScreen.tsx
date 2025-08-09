import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function SportsScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'sports',
        title: 'ספורט',
        subtitle: 'אורח חיים פעיל',
        icon: 'football-outline',
        color: colors.orange,
        bgColor: colors.orangeLight,
        description: 'מפגשי ספורט, ריצות קהילתיות ופעילות גופנית',
      }}
    />
  );
}

