import React, { useState } from "react";
import styles from "../globals/styles";
import BottomNavigator from "../navigations/BottomNavigator";
import TopBarNavigator from "../navigations/TopBarNavigator";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { useRoute, useFocusEffect } from "@react-navigation/native";

export default function Home({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  const [hideTopBar, setHideTopBar] = useState(false);
  const route = useRoute();
  
  // console.log('🏠 Home - Component rendered');
  // console.log('🏠 Home - hideTopBar state:', hideTopBar);
  
  // בדיקת route params של HomeScreen
  useFocusEffect(
    React.useCallback(() => {
      const checkHomeScreenParams = () => {
        const state = navigation.getState();
        const homeScreenRoute = state.routes.find(r => r.name === 'HomeMain')?.state?.routes?.find(r => r.name === 'HomeScreen');
        const homeScreenHideTopBar = (homeScreenRoute?.params as any)?.hideTopBar || false;
        // console.log('🏠 Home - HomeScreen hideTopBar:', homeScreenHideTopBar);
        setHideTopBar(homeScreenHideTopBar);
      };
      
      checkHomeScreenParams();
      
      // בדיקה כל 100ms
      const interval = setInterval(checkHomeScreenParams, 100);
      return () => clearInterval(interval);
    }, [navigation])
  );
  
  return (
      <SafeAreaView style={styles.safeArea}>
        {hideTopBar ? (<></>) : (
        <View style={{ overflow: 'hidden' }}>
          <TopBarNavigator navigation={navigation} hideTopBar={hideTopBar} />
        </View>
        )}
        <BottomNavigator />
      </SafeAreaView>
  );
}
