import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { AdminStackParamList } from '../globals/types';
import { useUser } from '../stores/userStore';

interface AdminDashboardScreenProps {
  navigation: NavigationProp<AdminStackParamList>;
}

interface AdminButton {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  route: keyof AdminStackParamList;
}

const adminButtons: AdminButton[] = [
  {
    id: 'money',
    title: 'כסף',
    icon: 'card-outline',
    color: colors.success,
    bgColor: colors.successLight,
    route: 'AdminMoney',
  },
  {
    id: 'tasks',
    title: 'משימות',
    icon: 'checkmark-done-outline',
    color: colors.primary,
    bgColor: colors.successLight,
    route: 'AdminTasks',
  },
  {
    id: 'people',
    title: 'אנשים',
    icon: 'people-outline',
    color: colors.primary,
    bgColor: colors.infoLight,
    route: 'AdminPeople',
  },
  {
    id: 'review',
    title: 'ביקורת',
    icon: 'shield-checkmark-outline',
    color: colors.secondary,
    bgColor: colors.pinkLight,
    route: 'AdminReview',
  }
];

import { useAdminProtection } from '../hooks/useAdminProtection';

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const { selectedUser } = useUser();
  useAdminProtection();

  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await import('../utils/apiService').then(m => m.apiService.getDashboardStats());
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    loadStats();
  }, []);

  const handleButtonPress = (button: AdminButton) => {
    if (button.route === 'AdminDashboard') {
      return;
    }
    (navigation as any).navigate(button.route);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>לוח בקרה</Text>
          <Text style={styles.subtitleText}>
            {selectedUser?.name ? `שלום ${selectedUser.name}` : 'מנהל'}
          </Text>
        </View>

        {stats && stats.metrics && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={24} color={colors.success} />
              <Text style={styles.statValue}>{formatMoney(Number(stats.metrics.total_money_donated || 0))}</Text>
              <Text style={styles.statLabel}>סה"כ תרומות</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{stats.metrics.total_users || 0}</Text>
              <Text style={styles.statLabel}>משתמשים</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="gift-outline" size={24} color={colors.secondary} />
              <Text style={styles.statValue}>{stats.metrics.total_donations || 0}</Text>
              <Text style={styles.statLabel}>תרומות</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="car-outline" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{stats.metrics.total_rides || 0}</Text>
              <Text style={styles.statLabel}>נסיעות</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          {adminButtons.map((button) => (
            <TouchableOpacity
              key={button.id}
              style={[styles.button, { backgroundColor: button.bgColor }]}
              onPress={() => handleButtonPress(button)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: button.color }]}>
                <Ionicons name={button.icon} size={32} color="white" />
              </View>
              <Text style={styles.buttonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}

          {/* Only the super admin can manage other admins */}
          {selectedUser?.email?.toLowerCase() === 'navesarussi@gmail.com' && (
            <TouchableOpacity
              key="admins"
              style={[styles.button, { backgroundColor: colors.errorLight }]}
              onPress={() => (navigation as any).navigate('AdminAdmins')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.error }]}>
                <Ionicons name="shield-outline" size={40} color="white" />
              </View>
              <Text style={styles.buttonText}>ניהול מנהלים</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    paddingBottom: 150,
    flexGrow: 1,
    minHeight: '150%', // Ensure content is always scrollable, especially on web
  },
  header: {
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL,
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
  },
  welcomeText: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  subtitleText: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.MD,
  },
  button: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

