import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSimpleUser } from './SimpleUserContext';

const SimpleHomeScreen = () => {
  const navigation = useNavigation<any>();
  const { selectedUser, isGuestMode, signOut } = useSimpleUser();

  const handleLogout = () => {
    console.log('🏠 SimpleHomeScreen - handleLogout');
    signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with User Info */}
        <View style={styles.header}>
          {isGuestMode ? (
            <View style={styles.guestHeader}>
              <View style={styles.guestAvatar}>
                <Text style={styles.guestAvatarText}>👤</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>שלום, אורח!</Text>
                <Text style={styles.guestText}>אתה במצב אורח</Text>
              </View>
            </View>
          ) : selectedUser ? (
            <View style={styles.userHeader}>
              <Image source={{ uri: selectedUser.avatar }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.welcomeText}>שלום, {selectedUser.name}!</Text>
                <Text style={styles.karmaText}>💎 {selectedUser.karmaPoints} נקודות קארמה</Text>
                <Text style={styles.locationText}>📍 {selectedUser.location.city}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Guest Mode Notice */}
        {isGuestMode && (
          <View style={styles.guestNotice}>
            <Text style={styles.guestNoticeText}>
              ⚠️ אתה במצב אורח. התחבר כדי לגשת לכל הפיצ'רים
            </Text>
          </View>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>מסך הבית!</Text>
          <Text style={styles.subtitle}>הניווט עובד! 🎉</Text>
          
          {selectedUser && (
            <View style={styles.userDetails}>
              <Text style={styles.detailsTitle}>פרטי המשתמש:</Text>
              <Text style={styles.detailText}>📧 {selectedUser.email}</Text>
              <Text style={styles.detailText}>📝 {selectedUser.bio}</Text>
              <Text style={styles.detailText}>🏆 {selectedUser.karmaPoints} נקודות קארמה</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>
              {isGuestMode ? 'חזור למסך לוגין' : 'התנתק'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  guestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  guestAvatarText: {
    fontSize: 30,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  guestText: {
    fontSize: 14,
    color: '#666',
  },
  karmaText: {
    fontSize: 14,
    color: '#FF6B9D',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  guestNotice: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 20,
  },
  guestNoticeText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  userDetails: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SimpleHomeScreen; 