import React from 'react';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { View, Button, Alert } from 'react-native';
import styles from '../globals/styles';

function ChatScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('💬 ChatScreen - Screen focused, refreshing data...');
      // Force re-render by updating a timestamp
      const refreshTimestamp = Date.now();
      console.log('ChatScreen refreshed at:', refreshTimestamp);
    }, [])
  );

  return (
    <View style={styles.container}>
      <Button title="return from chat" onPress={() => navigation.navigate('FirstScreen')} />
    </View>
  );
}

export default ChatScreen;