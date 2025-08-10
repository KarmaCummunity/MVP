import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useTranslation } from 'react-i18next';
import type { StatDetails } from './StatDetailsModal';

export type CommunityStat = {
  key: string;
  icon: string; // emoji
  label: string;
  value: string;
  color?: string;
};

interface CommunityStatsGridProps {
  onSelect: (details: StatDetails) => void;
}

const makeDetails = (stat: CommunityStat): StatDetails => ({
  key: stat.key,
  title: stat.label,
  icon: stat.icon,
  value: stat.value,
  color: stat.color,
  description: (require('i18next') as any).t('home:statsDetails.description', { label: stat.label }),
  bullets: [
    (require('i18next') as any).t('home:statsDetails.bullets.trends'),
    (require('i18next') as any).t('home:statsDetails.bullets.byCities'),
    (require('i18next') as any).t('home:statsDetails.bullets.highlight'),
  ],
  breakdownByCity: [
    { label: (require('i18next') as any).t('home:cities.tlv'), value: 42 },
    { label: (require('i18next') as any).t('home:cities.jerusalem'), value: 35 },
    { label: (require('i18next') as any).t('home:cities.haifa'), value: 28 },
    { label: (require('i18next') as any).t('home:cities.beerSheva'), value: 19 },
    { label: (require('i18next') as any).t('home:cities.ashdod'), value: 16 },
  ],
  trend: [8, 12, 9, 15, 13, 17, 21, 18, 24, 22],
});

const CommunityStatsGrid: React.FC<CommunityStatsGridProps> = ({ onSelect }) => {
  const { t } = useTranslation(['home']);

  const stats: CommunityStat[] = [
    { key: 'money', icon: '💵', label: t('home:stats.moneyDonations'), value: '125K', color: colors.legacyDarkGreen },
    { key: 'food', icon: '🍎', label: t('home:stats.foodKg'), value: '2.1K', color: colors.success },
    { key: 'clothes', icon: '👕', label: t('home:stats.clothingKg'), value: '1.5K', color: colors.info },
    { key: 'blood', icon: '🩸', label: t('home:stats.bloodLiters'), value: '350', color: colors.error },
    { key: 'time', icon: '⏰', label: t('home:stats.volunteerHours'), value: '500', color: colors.warning },
    { key: 'rides', icon: '🚗', label: t('home:stats.rides'), value: '1.8K', color: colors.info },
    { key: 'courses', icon: '📚', label: t('home:stats.courses'), value: '67', color: colors.success },
    { key: 'trees', icon: '🌳', label: t('home:stats.treesPlanted'), value: '750', color: colors.legacyDarkGreen },
    { key: 'animals', icon: '🐕', label: t('home:stats.animalsAdopted'), value: '120', color: colors.warning },
    { key: 'events', icon: '🎉', label: t('home:stats.events'), value: '78', color: colors.pink },
    { key: 'recycle', icon: '♻️', label: t('home:stats.recyclingBags'), value: '900', color: colors.success },
    { key: 'culture', icon: '🎭', label: t('home:stats.culturalEvents'), value: '60', color: colors.info },
    { key: 'health', icon: '🏥', label: t('home:stats.doctorVisits'), value: '45', color: colors.error },
    { key: 'elderly', icon: '👴', label: t('home:stats.elderlySupportCount'), value: '89', color: colors.info },
    { key: 'children', icon: '👶', label: t('home:stats.childrenSupportCount'), value: '156', color: colors.pink },
    { key: 'sports', icon: '⚽', label: t('home:stats.sportsGroups'), value: '23', color: colors.success },
    { key: 'music', icon: '🎵', label: t('home:stats.musicLessons'), value: '34', color: colors.info },
    { key: 'art', icon: '🎨', label: t('home:stats.artWorkshops'), value: '45', color: colors.warning },
    { key: 'tech', icon: '💻', label: t('home:stats.computerLessons'), value: '28', color: colors.info },
    { key: 'garden', icon: '🌱', label: t('home:stats.communityGardens'), value: '9', color: colors.success },
    { key: 'leadership', icon: '👑', label: t('home:stats.communityLeaderships'), value: '8', color: colors.warning },
  ];

  return (
    <View style={styles.container}>
      {stats.map((s) => (
        <TouchableOpacity key={s.key} style={[styles.card, styles.shadow]} onPress={() => onSelect(makeDetails(s))}>
          <Text style={styles.icon}>{s.icon}</Text>
          <Text style={styles.value}>{s.value}</Text>
          <Text style={styles.label} numberOfLines={2}>{s.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    width: '31%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shadow: {
    ...(Platform.OS === 'web' ? { boxShadow: '0 2px 6px rgba(0,0,0,0.08)' } : {
      elevation: 2,
      shadowColor: colors.shadowLight,
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 4,
    }),
  },
  icon: {
    fontSize: FontSizes.heading2,
    marginBottom: 4,
  },
  value: {
    fontSize: FontSizes.medium,
    fontWeight: '800',
    color: colors.legacyDarkBlue,
    marginBottom: 2,
  },
  label: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    writingDirection: 'rtl',
    paddingHorizontal: 4,
  },
});

export default CommunityStatsGrid;


