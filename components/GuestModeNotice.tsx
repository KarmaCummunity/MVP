import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import colors from '../globals/colors';
import { useUser } from '../context/UserContext';

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

  const handleLoginPress = async () => {
    console.log('🔐 GuestModeNotice - Login button pressed, performing sign out');
    try {
      // ביצוע התנתקות כמו כפתור היציאה במסך ההגדרות
      await signOut();
      console.log('🔐 GuestModeNotice - Sign out completed');
      
      // השהייה קצרה לוודא שהמצב התעדכן לפני הניווט
      setTimeout(() => {
        console.log('🔐 GuestModeNotice - Navigating to LoginScreen');
        navigation.navigate('LoginScreen');
      }, 100);
    } catch (error) {
      console.error('🔐 GuestModeNotice - Error during sign out:', error);
      // גם במקרה של שגיאה - נווט למסך לוגין
      navigation.navigate('LoginScreen');
    }
  };

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="person-outline" size={16} color={colors.warning} />
        <Text style={styles.compactText}>אתה במצב אורח</Text>
        {showLoginButton && (
          <TouchableOpacity style={styles.compactLoginButton} onPress={handleLoginPress}>
            <Text style={styles.compactLoginText}>התחבר</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>
          אתה במצב אורח. התחבר כדי לגשת לכל הפיצ'רים
        </Text>
        <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
      </View>
      {showLoginButton && (
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>התחבר</Text>
        </TouchableOpacity>
      )}
    </View>
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
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
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