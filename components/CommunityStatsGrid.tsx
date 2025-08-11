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
  // TODO: Replace with actual data
  // Dummy data for now
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
    { key: 'waterBottlesSaved', icon: '💧', label: t('home:stats.waterBottlesSaved'), value: '4.2K', color: colors.info },
    { key: 'co2ReducedKg', icon: '🌿', label: t('home:stats.co2ReducedKg'), value: '12.5K', color: colors.success },
    { key: 'plasticBagsSaved', icon: '🛍️', label: t('home:stats.plasticBagsSaved'), value: '8.3K', color: colors.warning },
    { key: 'mealsServed', icon: '🍽️', label: t('home:stats.mealsServed'), value: '6.7K', color: colors.pink },
    { key: 'foodParcels', icon: '📦', label: t('home:stats.foodParcels'), value: '2.9K', color: colors.orange },
    { key: 'schoolKits', icon: '🎒', label: t('home:stats.schoolKits'), value: '1.1K', color: colors.legacyMediumBlue },
    { key: 'booksDonated', icon: '📚', label: t('home:stats.booksDonated'), value: '3.6K', color: colors.legacyMediumPurple },
    { key: 'laptopsDonated', icon: '💻', label: t('home:stats.laptopsDonated'), value: '210', color: colors.info },
    { key: 'phonesDonated', icon: '📱', label: t('home:stats.phonesDonated'), value: '340', color: colors.info },
    { key: 'toysDonated', icon: '🧸', label: t('home:stats.toysDonated'), value: '1.9K', color: colors.pink },
    { key: 'hygieneKits', icon: '🧼', label: t('home:stats.hygieneKits'), value: '2.4K', color: colors.info },
    { key: 'masksDistributed', icon: '😷', label: t('home:stats.masksDistributed'), value: '15K', color: colors.warning },
    { key: 'vaccinations', icon: '💉', label: t('home:stats.vaccinations'), value: '980', color: colors.success },
    { key: 'medicalKits', icon: '🧰', label: t('home:stats.medicalKits'), value: '750', color: colors.error },
    { key: 'counselingSessions', icon: '🗣️', label: t('home:stats.counselingSessions'), value: '1.2K', color: colors.legacyMediumGreen },
    { key: 'mentalHealthSessions', icon: '🧠', label: t('home:stats.mentalHealthSessions'), value: '870', color: colors.legacyMediumPurple },
    { key: 'hotlineCalls', icon: '☎️', label: t('home:stats.hotlineCalls'), value: '5.4K', color: colors.info },
    { key: 'legalAssistCases', icon: '⚖️', label: t('home:stats.legalAssistCases'), value: '320', color: colors.legacyDarkBlue },
    { key: 'jobsFound', icon: '💼', label: t('home:stats.jobsFound'), value: '410', color: colors.success },
    { key: 'internships', icon: '🧑‍💼', label: t('home:stats.internships'), value: '95', color: colors.info },
    { key: 'workshops', icon: '🛠️', label: t('home:stats.workshops'), value: '140', color: colors.orange },
    { key: 'hackathons', icon: '🧑‍💻', label: t('home:stats.hackathons'), value: '12', color: colors.info },
    { key: 'compostKg', icon: '🪱', label: t('home:stats.compostKg'), value: '3.3K', color: colors.success },
    { key: 'wasteCollectedKg', icon: '🗑️', label: t('home:stats.wasteCollectedKg'), value: '7.4K', color: colors.warning },
    { key: 'beachesCleaned', icon: '🏖️', label: t('home:stats.beachesCleaned'), value: '26', color: colors.info },
    { key: 'parksCleaned', icon: '🌳', label: t('home:stats.parksCleaned'), value: '48', color: colors.success },
    { key: 'treesTrimmed', icon: '🌲', label: t('home:stats.treesTrimmed'), value: '1.1K', color: colors.legacyDarkGreen },
    { key: 'gardensBuilt', icon: '🌼', label: t('home:stats.gardensBuilt'), value: '34', color: colors.success },
    { key: 'muralsPainted', icon: '🖌️', label: t('home:stats.muralsPainted'), value: '57', color: colors.pink },
    { key: 'concerts', icon: '🎤', label: t('home:stats.concerts'), value: '22', color: colors.info },
    { key: 'sportsEvents', icon: '🏅', label: t('home:stats.sportsEvents'), value: '31', color: colors.success },
    { key: 'marathons', icon: '🏃', label: t('home:stats.marathons'), value: '9', color: colors.warning },
    { key: 'bloodDonors', icon: '🩸', label: t('home:stats.bloodDonors'), value: '1.4K', color: colors.error },
    { key: 'firstAidCourses', icon: '⛑️', label: t('home:stats.firstAidCourses'), value: '76', color: colors.info },
    { key: 'sheltersBeds', icon: '🛏️', label: t('home:stats.sheltersBeds'), value: '540', color: colors.legacyMediumBlue },
    { key: 'refugeesAssisted', icon: '🧳', label: t('home:stats.refugeesAssisted'), value: '1.2K', color: colors.legacyMediumPurple },
    { key: 'seniorsVisits', icon: '👴', label: t('home:stats.seniorsVisits'), value: '2.8K', color: colors.info },
    { key: 'homeRepairs', icon: '🪚', label: t('home:stats.homeRepairs'), value: '640', color: colors.orange },
    { key: 'wheelchairRamps', icon: '♿', label: t('home:stats.wheelchairRamps'), value: '84', color: colors.info },
    { key: 'accessiblePaths', icon: '🛣️', label: t('home:stats.accessiblePaths'), value: '42', color: colors.legacyDarkBlue },
    { key: 'communityMeals', icon: '🍲', label: t('home:stats.communityMeals'), value: '3.7K', color: colors.pink },
    { key: 'communityFridges', icon: '🧊', label: t('home:stats.communityFridges'), value: '18', color: colors.info },
    { key: 'solarPanelsInstalled', icon: '☀️', label: t('home:stats.solarPanelsInstalled'), value: '260', color: colors.warning },
    { key: 'kmCarpooled', icon: '🚗', label: t('home:stats.kmCarpooled'), value: '92K', color: colors.info },
    { key: 'bikesDonated', icon: '🚲', label: t('home:stats.bikesDonated'), value: '780', color: colors.success },
    { key: 'clothesRecycledKg', icon: '♻️', label: t('home:stats.clothesRecycledKg'), value: '4.6K', color: colors.info },
    { key: 'electronicsRecycledKg', icon: '🔌', label: t('home:stats.electronicsRecycledKg'), value: '2.2K', color: colors.info },
    { key: 'animalsRescued', icon: '🐾', label: t('home:stats.animalsRescued'), value: '560', color: colors.success },
    { key: 'petsFostered', icon: '🐶', label: t('home:stats.petsFostered'), value: '430', color: colors.warning },
    { key: 'adoptionEvents', icon: '🐱', label: t('home:stats.adoptionEvents'), value: '39', color: colors.info },
    { key: 'languageLessons', icon: '📝', label: t('home:stats.languageLessons'), value: '1.6K', color: colors.legacyMediumBlue },
    { key: 'codingMentorships', icon: '🧑‍🏫', label: t('home:stats.codingMentorships'), value: '270', color: colors.info },
    { key: 'scholarships', icon: '🎓', label: t('home:stats.scholarships'), value: '120', color: colors.success },
    { key: 'microGrants', icon: '💸', label: t('home:stats.microGrants'), value: '310', color: colors.orange },
    { key: 'repairCafeEvents', icon: '🔧', label: t('home:stats.repairCafeEvents'), value: '44', color: colors.info },
    { key: 'devicesRepaired', icon: '🛠️', label: t('home:stats.devicesRepaired'), value: '980', color: colors.success },
    { key: 'clothesRepaired', icon: '🧵', label: t('home:stats.clothesRepaired'), value: '1.1K', color: colors.pink },
    { key: 'itemsExchanged', icon: '🔁', label: t('home:stats.itemsExchanged'), value: '2.3K', color: colors.info },
    { key: 'swapEvents', icon: '🔄', label: t('home:stats.swapEvents'), value: '36', color: colors.legacyMediumPurple },
    { key: 'seedlingsPlanted', icon: '🌱', label: t('home:stats.seedlingsPlanted'), value: '5.8K', color: colors.success },
    { key: 'seedsDistributed', icon: '🌾', label: t('home:stats.seedsDistributed'), value: '12.2K', color: colors.warning },
    { key: 'compostWorkshops', icon: '🪴', label: t('home:stats.compostWorkshops'), value: '28', color: colors.success },
    { key: 'recyclingWorkshops', icon: '♻️', label: t('home:stats.recyclingWorkshops'), value: '52', color: colors.info },
    { key: 'communityMeetups', icon: '🤝', label: t('home:stats.communityMeetups'), value: '63', color: colors.legacyMediumBlue },
    { key: 'volunteerSignups', icon: '✍️', label: t('home:stats.volunteerSignups'), value: '4.9K', color: colors.info },
    { key: 'activeVolunteers', icon: '🙋', label: t('home:stats.activeVolunteers'), value: '3.8K', color: colors.success },
    { key: 'appDownloads', icon: '📲', label: t('home:stats.appDownloads'), value: '18K', color: colors.info },
    { key: 'appActiveUsers', icon: '👥', label: t('home:stats.appActiveUsers'), value: '6.2K', color: colors.info },
    { key: 'bugReports', icon: '🐞', label: t('home:stats.bugReports'), value: '420', color: colors.error },
    { key: 'featureSuggestions', icon: '💡', label: t('home:stats.featureSuggestions'), value: '380', color: colors.warning },
    { key: 'newslettersSent', icon: '📰', label: t('home:stats.newslettersSent'), value: '95', color: colors.info },
    { key: 'subscribers', icon: '📬', label: t('home:stats.subscribers'), value: '7.7K', color: colors.legacyDarkBlue },
    { key: 'campaigns', icon: '📣', label: t('home:stats.campaigns'), value: '41', color: colors.pink },
    { key: 'fundsRaised', icon: '💰', label: t('home:stats.fundsRaised'), value: '₪820K', color: colors.success },
    { key: 'matchingDonations', icon: '🤝', label: t('home:stats.matchingDonations'), value: '260', color: colors.info },
    { key: 'emergencyAlerts', icon: '🚨', label: t('home:stats.emergencyAlerts'), value: '73', color: colors.error },
    { key: 'evacuationRides', icon: '🚐', label: t('home:stats.evacuationRides'), value: '190', color: colors.info },
    { key: 'rescuedFamilies', icon: '👪', label: t('home:stats.rescuedFamilies'), value: '86', color: colors.legacyMediumGreen },
    { key: 'sheltersOpened', icon: '🏠', label: t('home:stats.sheltersOpened'), value: '24', color: colors.legacyMediumBlue },
    { key: 'crisisInterventions', icon: '🆘', label: t('home:stats.crisisInterventions'), value: '410', color: colors.error },
    { key: 'callsHandled', icon: '📞', label: t('home:stats.callsHandled'), value: '9.3K', color: colors.info },
    { key: 'chatsHandled', icon: '💬', label: t('home:stats.chatsHandled'), value: '7.1K', color: colors.info },
    { key: 'treesWatered', icon: '🚿', label: t('home:stats.treesWatered'), value: '3.2K', color: colors.success },
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
    ...(Platform.OS === 'web' ? { overflowY: 'visible' } : {}),
  },
  card: {
    width: '31%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 1600,
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


