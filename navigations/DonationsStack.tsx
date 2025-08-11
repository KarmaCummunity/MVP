import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import DonationsScreen from "../bottomBarScreens/DonationsScreen";
import MoneyScreen from "../donationScreens/MoneyScreen";
import TimeScreen from "../donationScreens/TimeScreen";
import KnowledgeScreen from "../donationScreens/KnowledgeScreen";
import TrumpScreen from "../donationScreens/TrumpScreen";
import FoodScreen from "../donationScreens/FoodScreen";
import ClothesScreen from "../donationScreens/ClothesScreen";
import BooksScreen from "../donationScreens/BooksScreen";
import FurnitureScreen from "../donationScreens/FurnitureScreen";
import MedicalScreen from "../donationScreens/MedicalScreen";
import AnimalsScreen from "../donationScreens/AnimalsScreen";
import HousingScreen from "../donationScreens/HousingScreen";
import SupportScreen from "../donationScreens/SupportScreen";
import EducationScreen from "../donationScreens/EducationScreen";
import EnvironmentScreen from "../donationScreens/EnvironmentScreen";
import TechnologyScreen from "../donationScreens/TechnologyScreen";
import MusicScreen from "../donationScreens/MusicScreen";
import GamesScreen from "../donationScreens/GamesScreen";
import RiddlesScreen from "../donationScreens/RiddlesScreen";
import RecipesScreen from "../donationScreens/RecipesScreen";
import PlantsScreen from "../donationScreens/PlantsScreen";
import WasteScreen from "../donationScreens/WasteScreen";
import ArtScreen from "../donationScreens/ArtScreen";
import SportsScreen from "../donationScreens/SportsScreen";
import ItemsScreen from "../donationScreens/ItemsScreen";
import CategoryScreen from "../donationScreens/CategoryScreen";
import DreamsScreen from "../donationScreens/DreamsScreen";
import FertilityScreen from "../donationScreens/FertilityScreen";
import JobsScreen from "../donationScreens/JobsScreen";
import MatchmakingScreen from "../donationScreens/MatchmakingScreen";
import ChatListScreen from "../topBarScreens/ChatListScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import AboutKarmaCommunityScreen from "../topBarScreens/AboutKarmaCommunityScreen";
import SettingsScreen from "../topBarScreens/SettingsScreen";
import TopBarNavigator from "./TopBarNavigator";
import { DonationsStackParamList } from "../globals/types";

const Stack = createStackNavigator<DonationsStackParamList>();

export default function DonationsStack() {
  // Refresh data when navigator comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('💰 DonationsStack - Navigator focused, checking state...');
      // This will trigger re-renders of child screens when needed
    }, [])
  );

  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="DonationsScreen"
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        header: () => (
          <TopBarNavigator
            navigation={navigation as any}
            hideTopBar={(route?.params as any)?.hideTopBar === true}
          />
        ),
      })}
    >
      <Stack.Screen name="DonationsScreen" component={DonationsScreen} />
      <Stack.Screen name="MoneyScreen" component={MoneyScreen} />
      <Stack.Screen name="ItemsScreen" component={ItemsScreen} />
      <Stack.Screen name="TimeScreen" component={TimeScreen} />
      <Stack.Screen name="KnowledgeScreen" component={KnowledgeScreen} />
      <Stack.Screen name="TrumpScreen" component={TrumpScreen} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
      <Stack.Screen name="DreamsScreen" component={DreamsScreen} />
      <Stack.Screen name="FertilityScreen" component={FertilityScreen} />
      <Stack.Screen name="JobsScreen" component={JobsScreen} />
      <Stack.Screen name="MatchmakingScreen" component={MatchmakingScreen} />
      {/* Category screens */}
      <Stack.Screen name="FoodScreen" component={FoodScreen} />
      <Stack.Screen name="ClothesScreen" component={ClothesScreen} />
      <Stack.Screen name="BooksScreen" component={BooksScreen} />
      <Stack.Screen name="FurnitureScreen" component={FurnitureScreen} />
      <Stack.Screen name="MedicalScreen" component={MedicalScreen} />
      <Stack.Screen name="AnimalsScreen" component={AnimalsScreen} />
      <Stack.Screen name="HousingScreen" component={HousingScreen} />
      <Stack.Screen name="SupportScreen" component={SupportScreen} />
      <Stack.Screen name="EducationScreen" component={EducationScreen} />
      <Stack.Screen name="EnvironmentScreen" component={EnvironmentScreen} />
      <Stack.Screen name="TechnologyScreen" component={TechnologyScreen} />
      <Stack.Screen name="MusicScreen" component={MusicScreen} />
      <Stack.Screen name="GamesScreen" component={GamesScreen} />
      <Stack.Screen name="RiddlesScreen" component={RiddlesScreen} />
      <Stack.Screen name="RecipesScreen" component={RecipesScreen} />
      <Stack.Screen name="PlantsScreen" component={PlantsScreen} />
      <Stack.Screen name="WasteScreen" component={WasteScreen} />
      <Stack.Screen name="ArtScreen" component={ArtScreen} />
      <Stack.Screen name="SportsScreen" component={SportsScreen} />
      <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
      <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
      <Stack.Screen name="AboutKarmaCommunityScreen" component={AboutKarmaCommunityScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
