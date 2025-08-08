import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function EnvironmentScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'environment',
        title: 'סביבה',
        subtitle: 'פרויקטים ירוקים',
        icon: 'leaf-outline',
        color: colors.success,
        bgColor: colors.successLight,
        description: 'פרויקטים סביבתיים, נטיעות, ניקיון חופים ושמירה על הטבע',
      }}
    />
  );
}

