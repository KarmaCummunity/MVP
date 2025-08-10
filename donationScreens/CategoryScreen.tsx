import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import HeaderComp from '../components/HeaderComp';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { biDiTextAlign, isLandscape } from '../globals/responsive';
import { useTranslation } from 'react-i18next';

export interface CategoryConfig {
  id: string;
  title?: string;
  subtitle?: string;
  icon: string;
  color: string;
  bgColor: string;
  description?: string;
}

interface Props {
  route?: { params?: { config?: CategoryConfig } };
  config?: CategoryConfig;
}

const CategoryScreen: React.FC<Props> = ({ route, config: propConfig }) => {
  const { t } = useTranslation(['donations','common']);
  const config: CategoryConfig = propConfig || route?.params?.config || {
    id: 'generic',
    icon: 'help-circle-outline',
    color: colors.info,
    bgColor: colors.infoLight,
  };
  const [mode, setMode] = useState(true);

  const title = config.title ?? t(`donations:categories.${config.id}.title`);
  const subtitle = config.subtitle ?? t(`donations:categories.${config.id}.subtitle`);
  const description = config.description ?? t(`donations:categories.${config.id}.description`);

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
        menuOptions={[`${t('donations:share')} ${title}`, t('common:settings'), t('common:report')]}
        onToggleMode={handleToggleMode}
        onSelectMenuItem={handleSelectMenuItem}
        placeholder={`${t('donations:searchWithin')} ${title}`}
        filterOptions={[t('donations:filter.nearMe'), t('donations:filter.popular'), t('donations:filter.new')]}
        sortOptions={[t('donations:sort.name'), t('donations:sort.date'), t('donations:sort.rating')]}
        searchData={[]}
        onSearch={handleSearch}
      />

      <ScrollView contentContainerStyle={[styles.content, isLandscape() && { paddingHorizontal: 24 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: config.bgColor, borderColor: config.color }]}> 
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {!!subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
          {!!description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('donations:section.content')}</Text>
          <Text style={styles.sectionText}>
            {t('donations:section.contentBody', { title })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('donations:section.relatedStats')}</Text>
          <DonationStatsFooter
            stats={[
              { label: t('donations:stats.newPosts'), value: 12, icon: 'megaphone-outline' },
              { label: t('donations:stats.activeRequests'), value: 7, icon: 'help-circle-outline' },
              { label: t('donations:stats.activePartners'), value: 5, icon: 'people-outline' },
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

