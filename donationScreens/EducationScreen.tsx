import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function EducationScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'education',
        title: 'חינוך',
        subtitle: 'עזרה בלימודים',
        icon: 'book-outline',
        color: colors.info,
        bgColor: colors.infoLight,
        description: 'תגבור בלימודים, חונכות, קורסים ופעילויות למידה',
      }}
    />
  );
}

