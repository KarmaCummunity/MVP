
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";


  function TopBarNavigator({title}:{title:string}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.getParent()?.navigate('ChatScreen')}>
          <Icon name={Platform.OS === 'ios' ? 'ios-chatbubbles' : 'md-chatbubbles'} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.getParent()?.navigate('NotificationsScreen')}>
          <Icon name={Platform.OS === 'ios' ? 'ios-notifications' : 'md-notifications'} size={24} color="black" />
        </TouchableOpacity>
      </View>
                
      <Text style={styles.title}>{title}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.getParent()?.navigate('AboutScreen')}>
          <Icon name={Platform.OS === 'ios' ? 'ios-information-circle' : 'md-information-circle'} size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.getParent()?.navigate('SettingsScreen')}>
          <Icon name={Platform.OS === 'ios' ? 'ios-settings' : 'md-settings'} size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'lightgray',
    padding: 10,
    ...Platform.select({
      ios: {
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
      },
      android: {
        elevation: 4, // For shadow on Android
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    marginLeft: 10,
  },
});

export default TopBarNavigator;
