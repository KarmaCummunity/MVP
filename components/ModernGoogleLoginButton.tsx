import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import { USE_BACKEND } from '../utils/dbConfig';
import { db } from '../utils/databaseService';
import { useTranslation } from 'react-i18next';
import GoogleAccountPickerModal from './GoogleAccountPickerModal';

type ModernGoogleLoginButtonProps = {
  onSuccess?: (user: any) => void;
  disabled?: boolean;
  style?: any;
};

export default function ModernGoogleLoginButton({ 
  onSuccess, 
  disabled = false,
  style 
}: ModernGoogleLoginButtonProps) {
  const { setSelectedUserWithMode } = useUser();
  const { t } = useTranslation(['auth']);
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    setModalVisible(true);
  };

  const handleAccountSelected = async (userData: any) => {
    try {
      console.log('🔑 ModernGoogleLoginButton - Account selected:', userData);
      
      // Set user in context
      await setSelectedUserWithMode(userData, 'real');
      console.log('🔑 ModernGoogleLoginButton - setSelectedUserWithMode done');
      
      // Save to backend if enabled
      if (USE_BACKEND) {
        try {
          await db.createUser(userData.id, userData);
          console.log('🔑 ModernGoogleLoginButton - user saved to backend');
        } catch (error) {
          console.warn('🔑 ModernGoogleLoginButton - Failed to save user to backend:', error);
        }
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess(userData);
      }

      // Navigate to home screen
      console.log('🔑 ModernGoogleLoginButton - navigating to HomeStack');
      navigation.replace('HomeStack');
    } catch (error) {
      console.error('❌ ModernGoogleLoginButton - Error handling account selection:', error);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.button, disabled && styles.disabled, style]} 
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.text}>
            {t('auth:googleCta') || 'התחבר עם Google'}
          </Text>
        </View>
      </TouchableOpacity>
      
      <GoogleAccountPickerModal
        visible={modalVisible}
        onClose={handleModalClose}
        onAccountSelected={handleAccountSelected}
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.6,
  },
});
