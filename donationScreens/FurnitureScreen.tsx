import React from 'react';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import ItemsScreen from './ItemsScreen';

export default function FurnitureScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  // משמש כרגע כ"מסך חפצים" כללי בהתאם לבקשה
  return <ItemsScreen navigation={navigation} itemType="general" />;
}

