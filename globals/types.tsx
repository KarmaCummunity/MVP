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
