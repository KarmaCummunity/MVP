import React from 'react';
import CategoryScreen from './CategoryScreen';
import colors from '../globals/colors';

export default function BooksScreen() {
  return (
    <CategoryScreen
      config={{
        id: 'books',
        title: 'ספרים',
        subtitle: 'תרומת ספרים',
        icon: 'library-outline',
        color: colors.success,
        bgColor: colors.successLight,
        description: 'תרומת ספרים, ספריות קהילתיות ומעגלי קריאה',
      }}
    />
  );
}

