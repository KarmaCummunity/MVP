import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function RecipesScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'recipes',
        title: 'מתכונים',
        subtitle: 'בישול ושיתוף',
        icon: 'fast-food-outline',
        color: colors.success,
        bgColor: colors.successLight,
        description: 'שיתוף מתכונים, ארוחות קהילתיות ובישול יחד',
      }}
    />
  );
}

