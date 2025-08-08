import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function TechnologyScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'technology',
        title: 'טכנולוגיה',
        subtitle: 'עזרה טכנית',
        icon: 'laptop-outline',
        color: colors.info,
        bgColor: colors.infoLight,
        description: 'עזרה טכנית, הדרכות דיגיטל ותרומת ציוד מחשוב',
      }}
    />
  );
}

