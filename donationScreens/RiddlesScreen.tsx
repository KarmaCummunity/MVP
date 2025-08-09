import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function RiddlesScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'riddles',
        title: 'חידות',
        subtitle: 'חשיבה ואתגר',
        icon: 'help-circle-outline',
        color: colors.info,
        bgColor: colors.infoLight,
        description: 'חידות, אתגרים ומשימות חשיבה לקהילה',
      }}
    />
  );
}

