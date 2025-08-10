import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function SupportScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'support',
        icon: 'heart-outline',
        color: colors.pinkDark,
        bgColor: colors.pinkLight,
      }}
    />
  );
}

