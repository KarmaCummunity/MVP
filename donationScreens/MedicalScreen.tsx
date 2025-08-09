import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function MedicalScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'medical',
        title: 'רפואה',
        subtitle: 'עזרה רפואית',
        icon: 'medical-outline',
        color: colors.error,
        bgColor: colors.errorLight,
        description: 'סיוע רפואי, ציוד תרופתי ותרומת דם',
      }}
    />
  );
}

