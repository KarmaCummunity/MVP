import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../globals/colors';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';

interface GuestModeNoticeProps {
  variant?: 'default' | 'compact';
  showLoginButton?: boolean;
}

const GuestModeNotice: React.FC<GuestModeNoticeProps> = ({ 
  variant = 'default',
  showLoginButton = true 
}) => {
  const navigation = useNavigation<any>();
  const { signOut } = useUser();
  const { t } = useTranslation(['common']);

  const handleLoginPress = async () => {
    console.log('🔐 GuestModeNotice - Login button pressed, performing sign out');
    try {
      await signOut();
      console.log('🔐 GuestModeNotice - Sign out completed');
      setTimeout(() => {
        console.log('🔐 GuestModeNotice - Navigating to LoginScreen');
        navigation.navigate('LoginScreen');
      }, 100);
    } catch (error) {
      console.error('🔐 GuestModeNotice - Error during sign out:', error);
      navigation.navigate('LoginScreen');
    }
  };

  return (
    <>
      {showLoginButton && (
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>{t('guestLoginHint', 'אתה במצב אורח, מומלץ להתחבר')}</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRightWidth: 4,
    borderRightColor: colors.warning,
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
  },
  text: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 20,
  },
  loginButton: {
    margin: 10,
    backgroundColor: colors.pink,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  compactContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 20,
    marginVertical: 5,
  },
  compactText: {
    flex: 1,
    marginRight: 6,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  compactLoginButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  compactLoginText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});

export default GuestModeNotice; 