import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import TopBarNavigator from '../navigations/TopBarNavigator';
import styles from '../globals/styles';

interface ScreenWrapperProps {
  children: React.ReactNode;
  navigation: NavigationProp<ParamListBase>;
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
      {!hideTopBar && (
        <View style={{ overflow: 'hidden' }}>
          <TopBarNavigator 
            navigation={navigation} 
            hideTopBar={hideTopBar} 
            showPosts={showPosts} 
          />
        </View>
      )}
      {children}
    </SafeAreaView>
  );
}
