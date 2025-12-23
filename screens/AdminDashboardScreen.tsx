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
import AdminHierarchyTree from '../components/AdminHierarchyTree';

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
  },
  {
    id: 'files',
    title: 'קבצים',
    icon: 'folder-open-outline',
    color: colors.info,
    bgColor: colors.infoLight,
    route: 'AdminFiles',
  },
  {
    id: 'crm',
    title: 'ניהול קשרים',
    icon: 'people-circle-outline',
    color: colors.warning,
    bgColor: colors.warningLight,
    route: 'AdminCRM',
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
      console.log('📊 AdminDashboard - Loading stats...');
      const res = await import('../utils/apiService').then(m => m.apiService.getDashboardStats());
      console.log('📊 AdminDashboard - API Response:', res);

      if (res.success && res.data) {
        // Convert string values to numbers for proper display
        const processedData = {
          ...res.data,
          metrics: {
            ...res.data.metrics,
            total_users: Number(res.data.metrics.total_users || 0),
            total_donations: Number(res.data.metrics.total_donations || 0),
            total_rides: Number(res.data.metrics.total_rides || 0),
            total_money_donated: Number(res.data.metrics.total_money_donated || 0),
          }
        };
        console.log('📊 AdminDashboard - Processed stats:', processedData);
        setStats(processedData);
      } else {
        console.warn('⚠️ AdminDashboard - API call failed or returned no data:', res);
      }
    } catch (error) {
      console.error('❌ AdminDashboard - Failed to load dashboard stats:', error);
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

        {loading && !stats && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>טוען סטטיסטיקות...</Text>
          </View>
        )}

        {!loading && !stats && (
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>לא ניתן לטעון סטטיסטיקות</Text>
            <Text style={styles.emptySubtext}>משוך למטה לרענון</Text>
          </View>
        )}

        {stats && stats.metrics && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={24} color={colors.success} />
              <Text style={styles.statValue}>{formatMoney(stats.metrics.total_money_donated)}</Text>
              <Text style={styles.statLabel}>סה"כ תרומות</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{stats.metrics.total_users}</Text>
              <Text style={styles.statLabel}>משתמשים</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="gift-outline" size={24} color={colors.secondary} />
              <Text style={styles.statValue}>{stats.metrics.total_donations}</Text>
              <Text style={styles.statLabel}>תרומות</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="car-outline" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{stats.metrics.total_rides}</Text>
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
                <Ionicons name={button.icon} size={24} color="white" />
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
                <Ionicons name="shield-outline" size={24} color="white" />
              </View>
              <Text style={styles.buttonText}>ניהול מנהלים</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Management Hierarchy Section */}
        <View style={styles.hierarchySection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="git-network-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>מבנה הניהול</Text>
          </View>
          <Text style={styles.sectionSubtitle}>עץ היררכיית המנהלים בקהילה</Text>
          <View style={styles.hierarchyCard}>
            <AdminHierarchyTree />
          </View>
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
    justifyContent: 'flex-start',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  button: {
    width: '31%',
    minHeight: 100,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT_CONSTANTS.SPACING.XL,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL,
  },
  loadingText: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT_CONSTANTS.SPACING.XL,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL,
  },
  emptyText: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
  },
  emptySubtext: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: LAYOUT_CONSTANTS.SPACING.XS,
  },
  hierarchySection: {
    marginTop: LAYOUT_CONSTANTS.SPACING.XL,
    paddingTop: LAYOUT_CONSTANTS.SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: colors.borderSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  sectionTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },
  hierarchyCard: {
    backgroundColor: colors.background,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});

