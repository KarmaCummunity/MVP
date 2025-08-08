import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function GamesScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'games',
        title: 'משחקים',
        subtitle: 'פעילויות ומשחקי חברה',
        icon: 'game-controller-outline',
        color: colors.orange,
        bgColor: colors.orangeLight,
        description: 'פעילויות קהילה ומשחקי חברה לכל הגילאים',
      }}
    />
  );
}

