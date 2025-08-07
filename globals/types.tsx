import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import {
  NavigationProp,
  NavigatorScreenParams,
  ParamListBase,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ImageSourcePropType } from "react-native";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: "Low" | "Medium" | "High";
  createdAt: Date;
  category?: string;
  location?: string;
  tags?: string[];
}

export type Filter = "All" | "Pending" | "Completed";
export type SortBy = "createdAt" | "dueDate" | "priority";
export type SortOrder = "asc" | "desc";

// Interface for defining the structure of bubble data
export interface BubbleData {
  id: string;
  size: number;
  x: number;
  y: number;
  value: number | null;
  name: string | null;
  directionX: number;
  directionY: number;
  delay: number;
  isBackground: boolean;
}

export type DonationsStackParamList = {
  DonationsScreen: undefined;
  MoneyScreen: undefined;
  TrumpScreen: undefined;
  KnowledgeScreen: undefined;
  TimeScreen: undefined;
  // Add more screens here as needed
};

export type SettingItemType = "navigate" | "toggle" | "button" | "value";

export interface SettingsItemProps {
  title: string;
  description?: string;
  iconName?: string;
  type: SettingItemType;
  onPress?: () => void;
  value?: boolean;
  onValueChange?: (newValue: boolean) => void;
  displayValue?: string;
  isDestructive?: boolean;
  children?: React.ReactNode;
}

export interface SectionHeaderItem {
  type: "sectionHeader";
  title?: string;
}

export type SettingsDataItem = SettingsItemProps | SectionHeaderItem;

export interface WhatsAppGroup {
  name: string;
  link: string;
  image: ImageSourcePropType;
}

export interface Filters {
  to: string;
  from: string;
  when: string;
}

export interface TrumpResult {
  id: string;
  name: string;
  from: string;
  to: string;
  date: string;
  time: string;
}

export type ListItem =
  | { type: "form"; key: string }
  | { type: "results-header"; key: string }
  | { type: "result"; key: string; data: TrumpResult }
  | { type: "groups-header"; key: string }
  | { type: "group"; key: string; data: WhatsAppGroup }
  | { type: "thank-you"; key: string };

export interface TrumpScreenProps {
  navigation: NavigationProp<ParamListBase>;
}
// --- Root Stack Navigator (MainNavigator) Parameter List ---
// This lists all the screens directly in your MainNavigator.tsx
export type RootStackParamList = {
  HomeStack: NavigatorScreenParams<BottomTabNavigatorParamList>;
  FirstScreen: undefined;
  LoginScreen: undefined;
  SettingsScreen: undefined;
  ChatListScreen: undefined;
  NewChatScreen: undefined;
  ChatDetailScreen: {
    conversationId: string;
    userName: string;
    userAvatar: string;
    otherUserId: string;
  };
  NotificationsScreen: undefined;
  AboutKarmaCommunityScreen: undefined;
  InactiveScreen: undefined;
  WebViewScreen: undefined;
  PostsReelsScreen: undefined; // ADD THIS LINE - this was probably missing
  BookmarksScreen: undefined;
  UserProfileScreen: undefined;
  FollowersScreen: {
    userId: string;
    type: 'followers' | 'following';
    title: string;
  };
  DiscoverPeopleScreen: undefined;
};

// --- Bottom Tab Navigator (BottomNavigator) Parameter List ---
// This lists all the screens within your BottomNavigator.tsx
export type BottomTabNavigatorParamList = {
  DonationsScreen: undefined; // Assuming DonationsStack is just a wrapper for its root screen here
  HomeScreen: undefined; // This is the HomeScreen with the drag handle
  SearchScreen: undefined;
  ProfileScreen: undefined;
  SettingsScreen: undefined;
  ChatListScreen: undefined;
  AboutKarmaCommunityScreen: undefined;
  NotificationsScreen: undefined;
};

// --- Donations Stack (Example - adjust if you have internal screens) ---
// If DonationsStack is just one screen, you might not need this,
// but if it has multiple internal screens, define its own param list.
// export type DonationsStackParamList = {
//   DonationsMain: undefined;
//   DonationDetails: { itemId: string };
// };

// Define the screens that will appear *inside* your PostsReelsScreen modal
export type PostsReelsStackParamList = {
  PostsReels: undefined; // The content screen you want to show
  SomeOtherContent: undefined; // Example of another screen within the modal
  // Add any other screens that can be displayed inside the PostsReelsScreen modal
};

// --- Helper Types for Navigation Props ---

// For use with `useNavigation()` within screens that are part of the RootStack
export type RootStackNavigationProp<
  RouteName extends keyof RootStackParamList
> = StackNavigationProp<RootStackParamList, RouteName>;

// For use with `useNavigation()` within screens that are part of the BottomTabNavigator
export type BottomTabNavigationPropType<
  RouteName extends keyof BottomTabNavigatorParamList
> = BottomTabNavigationProp<BottomTabNavigatorParamList, RouteName>;

// You might also need a type for the 'route' prop if you're accessing params:
// import { RouteProp } from '@react-navigation/native';
// export type PostsReelsScreenRouteProp = RouteProp<RootStackParamList, 'PostsReelsScreen'>;
