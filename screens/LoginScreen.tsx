import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { characterTypes } from '../globals/characterTypes';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const { setSelectedUser, setGuestMode, selectedUser, isGuestMode } = useUser();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleLoginWithGoogle = async () => {
    if (!selectedCharacter) {
      Alert.alert('בחירת דמות', 'אנא בחר דמות לפני הכניסה');
      return;
    }

    const character = characterTypes.find(c => c.id === selectedCharacter);
    console.log('🔐 LoginScreen - character:', character);
    if (character) {
      // המר את הדמות לפורמט User
      const userData = {
        id: character.id,
        name: character.name,
        email: `${character.id}@karmacommunity.com`,
        phone: '+972501234567',
        avatar: character.avatar,
        bio: character.bio,
        karmaPoints: character.karmaPoints,
        joinDate: character.joinDate,
        isActive: true,
        lastActive: new Date().toISOString(),
        location: character.location,
        interests: character.interests,
        roles: character.roles,
        postsCount: character.postsCount,
        followersCount: character.followersCount,
        followingCount: character.followingCount,
        notifications: [
          { type: 'system', text: 'ברוך הבא!', date: new Date().toISOString() },
        ],
        settings: {
          language: character.preferences.language,
          darkMode: false,
          notificationsEnabled: character.preferences.notifications,
        },
      };
      
      await setSelectedUser(userData);
    }
  };

  const handleGuestMode = async () => {
    console.log('🔐 LoginScreen - handleGuestMode');
    await setGuestMode();
  };

  // useEffect לניווט אוטומטי - כמו באפליקציה הפשוטה
  useEffect(() => {
    if (selectedUser || isGuestMode) {
      console.log('🔐 LoginScreen - useEffect - מנווט ל-Home', { 
        selectedUser: !!selectedUser, 
        isGuestMode,
        userName: selectedUser?.name 
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    }
  }, [selectedUser, isGuestMode, navigation]);

  const handleClearData = async () => {
    try {
      await AsyncStorage.removeItem('current_user');
      await AsyncStorage.removeItem('guest_mode');
      Alert.alert('ניקוי נתונים', 'הנתונים נוקו בהצלחה. אנא הפעל מחדש את האפליקציה.');
    } catch (error) {
      Alert.alert('שגיאה', 'אירעה שגיאה בניקוי הנתונים');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>ברוכים הבאים!</Text>
          <Text style={styles.subtitle}>KC - הקיבוץ הקפיטליסטי של ישראל</Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.googleButton,
                !selectedCharacter && styles.disabledButton
              ]}
              onPress={handleLoginWithGoogle}
              disabled={!selectedCharacter}
            >
              <Text style={styles.googleButtonText}>התחבר עם Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
            >
              <Text style={styles.guestButtonText}>המשך כאורח</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Characters Section */}
        <View style={styles.charactersSection}>
          <Text style={styles.characterTitle}>בחר דמות להתחברות:</Text>
          
          <ScrollView 
            horizontal 
            style={styles.charactersContainer} 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.charactersContent}
          >
            {characterTypes && characterTypes.length > 0 ? (
              characterTypes.map((character) => (
                <TouchableOpacity
                  key={character.id}
                  style={[
                    styles.characterCard,
                    selectedCharacter === character.id && styles.selectedCharacter
                  ]}
                  onPress={() => handleCharacterSelect(character.id)}
                >
                  <Image source={{ uri: character.avatar }} style={styles.characterAvatar} />
                  <View style={styles.characterInfo}>
                    <Text style={styles.characterName}>{character.name}</Text>
                    <Text style={styles.characterDescription}>{character.description}</Text>
                    <View style={styles.characterStats}>
                      <Text style={styles.characterStat}>💎 {character.karmaPoints} נקודות</Text>
                      <Text style={styles.characterStat}>📍 {character.location.city}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>שגיאה בטעינת הדמויות</Text>
                <Text style={styles.errorSubtext}>characterTypes length: {characterTypes?.length || 'undefined'}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.infoText}>
            האפליקציה חינמית לחלוטין ללא מטרות רווח
          </Text>

          <TouchableOpacity
            style={styles.clearDataButton}
            onPress={handleClearData}
          >
            <Text style={styles.clearDataButtonText}>ניקוי נתונים (לבדיקה)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    marginBottom: 30,
  },
  charactersSection: {
    flex: 1,
    marginBottom: 20,
  },
  footerSection: {
    marginTop: 20,
  },
  title: {
    marginTop: 40,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 100,
  },
  characterTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 5,
    textAlign: 'center',
  },
  charactersContainer: {
    flex: 1,
  },
  charactersContent: {
    paddingHorizontal: 15,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 5,
  },
  characterCard: {
    flexDirection: 'column',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '3%',
    alignItems: 'center',
  },
  selectedCharacter: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF0F5',
  },
  characterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  characterInfo: {
    alignItems: 'center',
    width: '100%',
  },
  characterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  characterDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 6,
    lineHeight: 16,
  },
  characterStats: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  },
  characterStat: {
    fontSize: 10,
    color: '#888888',
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  guestButton: {
    backgroundColor: '#FFF8F8',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  clearDataButton: {
    backgroundColor: '#FF4444',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  clearDataButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 