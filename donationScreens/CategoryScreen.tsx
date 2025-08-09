import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import HeaderComp from '../components/HeaderComp';

export interface CategoryConfig {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  color: string;
  bgColor: string;
  description?: string;
}

interface Props {
  config: CategoryConfig;
}

const CategoryScreen: React.FC<Props> = ({ config }) => {
  const [mode, setMode] = useState(false);

  const handleToggleMode = () => setMode((prev) => !prev);
  const handleSelectMenuItem = (option: string) => {
    console.log('Category menu selected:', option);
  };

  const handleSearch = (query: string, filters: string[], sorts: string[], results: any[]) => {
    console.log('Category search:', { query, filters, sorts, results });
  };

  return (
    <View style={styles.container}>
      <HeaderComp
        mode={mode}
        menuOptions={[`שתף ${config.title}`, 'הגדרות', 'דווח']}
        onToggleMode={handleToggleMode}
        onSelectMenuItem={handleSelectMenuItem}
        placeholder={`חיפוש בתוך ${config.title}`}
        filterOptions={['קרוב אליי', 'פופולרי', 'חדש']}
        sortOptions={['שם', 'תאריך', 'דירוג']}
        searchData={[]}
        onSearch={handleSearch}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: config.bgColor, borderColor: config.color }]}> 
          <Text style={[styles.title, { color: colors.textPrimary }]}>{config.title}</Text>
          {!!config.subtitle && (
            <Text style={styles.subtitle}>{config.subtitle}</Text>
          )}
          {!!config.description && (
            <Text style={styles.description}>{config.description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>תוכן</Text>
          <Text style={styles.sectionText}>
            אזור זה יכיל תוכן מותאם לקטגוריית "{config.title}". נוכל להציג כאן רשימות, טפסים, פרויקטים קהילתיים,
            ומידע רלוונטי. כרגע זה תוכן התחלתי שניתן להרחיב.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  hero: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  description: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default CategoryScreen;

