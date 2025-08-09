import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import HeaderComp from '../components/HeaderComp';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { biDiTextAlign, isLandscape } from '../globals/responsive';

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
  route?: { params?: { config?: CategoryConfig } };
}

const CategoryScreen: React.FC<Props> = ({ route }) => {
  const config: CategoryConfig = route?.params?.config || {
    id: 'generic',
    title: 'קטגוריה',
    icon: 'help-circle-outline',
    color: colors.info,
    bgColor: colors.infoLight,
    description: 'מסך קטגוריה כללי.'
  };
  const [mode, setMode] = useState(true);

  const handleToggleMode = () => setMode((prev) => !prev);
  const handleSelectMenuItem = (option: string) => {
    console.log('Category menu selected:', option);
  };

  const handleSearch = (
    query: string,
    filters?: string[],
    sorts?: string[],
    results?: any[]
  ) => {
    console.log('Category search:', {
      query,
      filters: filters ?? [],
      sorts: sorts ?? [],
      results: results ?? [],
    });
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

      <ScrollView contentContainerStyle={[styles.content, isLandscape() && { paddingHorizontal: 24 }]} showsVerticalScrollIndicator={false}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>סטטיסטיקות קשורות</Text>
          <DonationStatsFooter
            stats={[
              { label: 'פרסומים חדשים', value: 12, icon: 'megaphone-outline' },
              { label: 'בקשות פעילות', value: 7, icon: 'help-circle-outline' },
              { label: 'שותפים פעילים', value: 5, icon: 'people-outline' },
            ]}
          />
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
    textAlign: biDiTextAlign('right'),
  },
  subtitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: biDiTextAlign('right'),
  },
  description: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    lineHeight: 20,
    textAlign: biDiTextAlign('right'),
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
    textAlign: 'center',
  },
  sectionText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: biDiTextAlign('right'),
  },
});

export default CategoryScreen;

