import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { texts } from '../globals/texts';
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

const STATS: CommunityStat[] = [
  { key: 'money', icon: '💵', label: texts.moneyDonations, value: '125K', color: colors.legacyDarkGreen },
  { key: 'food', icon: '🍎', label: texts.foodKg, value: '2.1K', color: colors.success },
  { key: 'clothes', icon: '👕', label: texts.clothingKg, value: '1.5K', color: colors.info },
  { key: 'blood', icon: '🩸', label: texts.bloodLiters, value: '350', color: colors.error },
  { key: 'time', icon: '⏰', label: texts.volunteerHours, value: '500', color: colors.warning },
  { key: 'rides', icon: '🚗', label: texts.rides, value: '1.8K', color: colors.info },
  { key: 'courses', icon: '📚', label: texts.courses, value: '67', color: colors.success },
  { key: 'trees', icon: '🌳', label: texts.treesPlanted, value: '750', color: colors.legacyDarkGreen },
  { key: 'animals', icon: '🐕', label: texts.animalsAdopted, value: '120', color: colors.warning },
  { key: 'events', icon: '🎉', label: texts.events, value: '78', color: colors.pink },
  { key: 'recycle', icon: '♻️', label: texts.recyclingBags, value: '900', color: colors.success },
  { key: 'culture', icon: '🎭', label: texts.culturalEvents, value: '60', color: colors.info },
  { key: 'health', icon: '🏥', label: texts.doctorVisits, value: '45', color: colors.error },
  { key: 'elderly', icon: '👴', label: texts.elderlySupportCount, value: '89', color: colors.info },
  { key: 'children', icon: '👶', label: texts.childrenSupportCount, value: '156', color: colors.pink },
  { key: 'sports', icon: '⚽', label: texts.sportsGroups, value: '23', color: colors.success },
  { key: 'music', icon: '🎵', label: texts.musicLessons, value: '34', color: colors.info },
  { key: 'art', icon: '🎨', label: texts.artWorkshops, value: '45', color: colors.warning },
  { key: 'tech', icon: '💻', label: texts.computerLessons, value: '28', color: colors.info },
  { key: 'garden', icon: '🌱', label: texts.communityGardens, value: '9', color: colors.success },
  { key: 'leadership', icon: '👑', label: texts.communityLeaderships, value: '8', color: colors.warning },
];

const makeDetails = (stat: CommunityStat): StatDetails => ({
  key: stat.key,
  title: stat.label,
  icon: stat.icon,
  value: stat.value,
  color: stat.color,
  description: `סקירה מפורטת על "${stat.label}" בקהילה. הנתונים מבוססים על פעילות משתמשים, עמותות ומתנדבים.`,
  bullets: [
    'מגמות חודשיות והשוואות לשבוע שעבר',
    'פילוח לפי ערים ותחומי פעילות',
    'תרומה/פעילות בולטת השבוע',
  ],
  breakdownByCity: [
    { label: 'ת"א', value: 42 },
    { label: 'ירושלים', value: 35 },
    { label: 'חיפה', value: 28 },
    { label: 'ב"ש', value: 19 },
    { label: 'אשדוד', value: 16 },
  ],
  trend: [8, 12, 9, 15, 13, 17, 21, 18, 24, 22],
});

const CommunityStatsGrid: React.FC<CommunityStatsGridProps> = ({ onSelect }) => {
  return (
    <View style={styles.container}>
      {STATS.map((s) => (
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


