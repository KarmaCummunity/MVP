import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function PlantsScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'plants',
        title: 'צמחים',
        subtitle: 'גינון ושתילה',
        icon: 'flower-outline',
        color: colors.success,
        bgColor: colors.successLight,
        description: 'גינון קהילתי, שתילים והחלפת צמחים',
      }}
    />
  );
}

