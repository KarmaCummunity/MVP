import React from 'react';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import ItemsScreen from './ItemsScreen';

export default function ClothesScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return <ItemsScreen navigation={navigation} itemType="clothes" />;
}

