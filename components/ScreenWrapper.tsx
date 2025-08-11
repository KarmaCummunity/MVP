import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import styles from '../globals/styles';

interface ScreenWrapperProps {
  children?: React.ReactNode;
  navigation?: NavigationProp<ParamListBase>;
  hideTopBar?: boolean;
  showPosts?: boolean;
  style?: object;
}

export default function ScreenWrapper({ 
  children, 
  navigation, 
  hideTopBar = false, 
  showPosts = false,
  style = {}
}: ScreenWrapperProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      {children}
    </SafeAreaView>
  );
}
