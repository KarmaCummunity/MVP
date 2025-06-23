import Ionicons from "react-native-vector-icons/Ionicons";
import SearchScreen from "../bottomBarScreens/SearchScreen";
import ProfileScreen from "../bottomBarScreens/ProfileScreen";
import styles from '../globals/styles';
import DonationsStack from "./DonationsStack";
import HomeScreen from "../bottomBarScreens/HomeScreen";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TodoListScreen from "../bottomBarScreens/TodoListScreen";
import colors from "../globals/colors";

const Tab = createBottomTabNavigator();

export default function BottomNavigator() {
  return (
    <View style={styles.container_bottom_nav}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = "";

            if (route.name === "HomeScreen") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "SearchScreen") {
              iconName = focused ? "search" : "search-outline";
            } else if (route.name === "DonationsScreen") {
              iconName = focused ? "heart" : "heart-outline";
            } else if (route.name === "ProfileScreen") {
              iconName = focused ? "person" : "person-outline";
            } else if (route.name === "TodoListScreen") {
              iconName = focused ? "checkbox" : "checkbox-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },

          tabBarActiveTintColor: "",
          tabBarInactiveTintColor: "black",
          tabBarShowLabel: false, // <-- hides the text labels under icons
          tabBarStyle: {
            position: 'absolute', // This is the key for floating!
            borderTopLeftRadius: 20, // Apply radius to the top-left corner
            borderTopRightRadius: 20, // Apply radius to the top-right corner
            elevation: 5, // Removes Android's default shadow/elevation
            shadowOpacity: 10, // Removes iOS's default shadow
            // You can add your own custom shadow here if you want, ensuring it's compatible
            // For example, a subtle shadow that respects the rounded corners:
            // shadowColor: Colors.black,
            // shadowOffset: { width: 0, height: -3 }, // Shadow coming from the top
            // shadowOpacity: 0.15,
            // shadowRadius: 3,
            height: 40, // Optional: fixed height for consistency
            backgroundColor: colors.backgroundPrimary, // Set the background color to transparent
            opacity: 0.9, // Optional: adjust opacity for a more subtle look
          },
        })}
      >
        <Tab.Screen name="TodoListScreen" component={TodoListScreen} />
        <Tab.Screen name="DonationsScreen" component={DonationsStack} />
        <Tab.Screen name="HomeScreen" component={HomeScreen}/>
        <Tab.Screen name="SearchScreen" component={SearchScreen} />
        <Tab.Screen name="ProfileScreen" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
}
/* {cool bottom in center of bottom bar nav} */
/* Bottom Navigation */
/* <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavItem}>
          <View style={styles.bottomNavCenterIconContainer}>
            <Text style={styles.bottomNavCenterIcon}>👐</Text>
          </View>
        </TouchableOpacity>
      </View> 
      */
