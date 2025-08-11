import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import HeaderComp from '../components/HeaderComp';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { biDiTextAlign, isLandscape, scaleSize } from '../globals/responsive';
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

      <ScrollView contentContainerStyle={[
        styles.content,
        isLandscape() && { paddingHorizontal: LAYOUT_CONSTANTS.SPACING.XL },
      ]} showsVerticalScrollIndicator={false}>
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
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    paddingBottom: LAYOUT_CONSTANTS.SPACING.XL * 3 + LAYOUT_CONSTANTS.SPACING.SM,
  },
  hero: {
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    borderWidth: 1,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  title: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
    textAlign: biDiTextAlign('right'),
  },
  subtitle: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    textAlign: biDiTextAlign('right'),
  },
  description: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    lineHeight: Math.round(FontSizes.body * 1.4),
    textAlign: biDiTextAlign('right'),
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  sectionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: 'semibold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    textAlign: 'center',
  },
  sectionText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    lineHeight: Math.round(FontSizes.body * 1.3),
    textAlign: biDiTextAlign('right'),
  },
});

export default CategoryScreen;

