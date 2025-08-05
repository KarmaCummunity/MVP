import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSimpleUser, User } from './SimpleUserContext';

// נתוני משתמשים לדוגמה
const demoUsers: User[] = [
  {
    id: 'user1',
    name: 'יוסי התורם הגדול',
    email: 'yossi@karmacommunity.com',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'תורם פעיל בקהילה',
    karmaPoints: 1250,
    location: { city: 'תל אביב', country: 'ישראל' }
  },
  {
    id: 'user2',
    name: 'שרה המתנדבת',
    email: 'sarah@karmacommunity.com',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'מתנדבת בפרויקטים קהילתיים',
    karmaPoints: 890,
    location: { city: 'ירושלים', country: 'ישראל' }
  },
  {
    id: 'user3',
    name: 'דני העזרה',
    email: 'dani@karmacommunity.com',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    bio: 'עוזר לקשישים ומוגבלים',
    karmaPoints: 2100,
    location: { city: 'חיפה', country: 'ישראל' }
  }
];

const SimpleLoginScreen = () => {
  const navigation = useNavigation<any>();
  const { setSelectedUser, setGuestMode, selectedUser, isGuestMode } = useSimpleUser();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  const handleCharacterSelect = (characterId: string) => {
    setSelectedCharacter(characterId);
  };

  const handleLoginWithGoogle = async () => {
    if (!selectedCharacter) {
      Alert.alert('בחירת דמות', 'אנא בחר דמות לפני הכניסה');
      return;
    }

    const character = demoUsers.find(c => c.id === selectedCharacter);
    if (character) {
      setSelectedUser(character);
    }
  };

  const handleGuestMode = async () => {
    setGuestMode();
  };

  // useEffect לניווט אוטומטי
  useEffect(() => {
    if (selectedUser || isGuestMode) {
      console.log('🔐 SimpleLoginScreen - useEffect - מנווט ל-Home', { 
        selectedUser: !!selectedUser, 
        isGuestMode,
        userName: selectedUser?.name 
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [selectedUser, isGuestMode, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
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
            {demoUsers.map((character) => (
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
                  <Text style={styles.characterDescription}>{character.bio}</Text>
                  <View style={styles.characterStats}>
                    <Text style={styles.characterStat}>💎 {character.karmaPoints} נקודות</Text>
                    <Text style={styles.characterStat}>📍 {character.location.city}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.infoText}>
            האפליקציה חינמית לחלוטין ללא מטרות רווח
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  characterTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 15,
    textAlign: 'center',
  },
  charactersContainer: {
    flex: 1,
    marginBottom: 20,
  },
  charactersContent: {
    paddingHorizontal: 10,
  },
  characterCard: {
    flexDirection: 'column',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 200,
    alignItems: 'center',
  },
  selectedCharacter: {
    borderColor: '#FF6B9D',
    backgroundColor: '#FFF0F5',
  },
  characterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  characterInfo: {
    alignItems: 'center',
    width: '100%',
  },
  characterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 5,
  },
  characterDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  characterStats: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
  },
  characterStat: {
    fontSize: 12,
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
});

export default SimpleLoginScreen; 