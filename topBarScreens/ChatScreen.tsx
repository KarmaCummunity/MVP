// File overview:
// - Purpose: Placeholder chat screen (legacy). Not part of the main chat flow which uses ChatList/ChatDetail.
// - Reached from: Rare/deprecated routes; kept for compatibility.
// - Behavior: Logs focus and provides a button to navigate back to 'FirstScreen'.
import React from 'react';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { View, Button, Alert } from 'react-native';
import styles from '../globals/styles';

function ChatScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // console removed
      // Force re-render by updating a timestamp
      const refreshTimestamp = Date.now();
      // console removed
    }, [])
  );

  return (
    <View style={styles.container}>
      <Button title="return from chat" onPress={() => navigation.navigate('FirstScreen')} />
    </View>
  );
}

export default ChatScreen;