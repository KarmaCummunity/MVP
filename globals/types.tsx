import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { ImageSourcePropType } from "react-native";

export type DonationsStackParamList = {
    DonationsScreen: undefined;
    MoneyScreen: undefined;
    TrumpScreen: undefined;
    // Add more screens here as needed
  };

  export type SettingItemType = 'navigate' | 'toggle' | 'button' | 'value';

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
  type: 'sectionHeader';
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