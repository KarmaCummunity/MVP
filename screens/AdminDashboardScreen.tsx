import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
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
    color: colors.green,
    bgColor: colors.successLight,
    route: 'AdminMoney',
  },
  {
    id: 'tasks',
    title: 'משימות',
    icon: 'checkmark-done-outline',
    color: colors.blue,
    bgColor: colors.successLight,
    route: 'AdminTasks',
  },
  {
    id: 'challenges',
    title: 'האתגרים שלי',
    icon: 'trophy',
    color: '#FFA726',
    bgColor: '#FFF3E0',
    route: 'Challenges',
  },
  {
    id: 'people',
    title: 'אנשים',
    icon: 'people-outline',
    color: colors.blue,
    bgColor: colors.infoLight,
    route: 'AdminPeople',
  },
  {
    id: 'review',
    title: 'ביקורת',
    icon: 'shield-checkmark-outline',
    color: colors.pink,
    bgColor: colors.pinkLight,
    route: 'AdminReview',
  }
];

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const { selectedUser } = useUser();

  const handleButtonPress = (button: AdminButton) => {
    if (button.route === 'AdminDashboard') {
      // Placeholder for settings - could navigate to settings screen in the future
      return;
    }
    navigation.navigate(button.route);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>לוח בקרה</Text>
          <Text style={styles.subtitleText}>
            {selectedUser?.name ? `שלום ${selectedUser.name}` : 'מנהל'}
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          {adminButtons.map((button) => (
            <TouchableOpacity
              key={button.id}
              style={[styles.button, { backgroundColor: button.bgColor }]}
              onPress={() => handleButtonPress(button)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: button.color }]}>
                <Ionicons name={button.icon} size={40} color="white" />
              </View>
              <Text style={styles.buttonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: LAYOUT_CONSTANTS.SPACING.LG,
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
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: FontSizes.large,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

