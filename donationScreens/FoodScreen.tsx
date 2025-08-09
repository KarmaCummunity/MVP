import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function FoodScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'food',
        title: 'אוכל',
        subtitle: 'תרומת מזון',
        icon: 'restaurant-outline',
        color: colors.textPrimary,
        bgColor: colors.backgroundSecondary,
        description: 'תרומת מזון, אריזות, שיתופי ארוחות ומיזמי הצלת מזון',
      }}
    />
  );
}

