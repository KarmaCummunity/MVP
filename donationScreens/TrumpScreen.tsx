import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
  ImageSourcePropType,
  ListRenderItem,
  TextInput,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from "react-native";
import HeaderComp from "../components/HeaderComp";
import { menu_for_trumps, WHATSAPP_GROUP_DETAILS } from "../globals/constants";
import AutocompleteDropdownComp from "../components/AutocompleteDropdownComp";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import LocationSearchComp from "../components/LocationSearchComp";
import TimeInput from "../components/TimeInput";
import styles from "../globals/styles";
import {
  TrumpResult,
  WhatsAppGroup,
  Filters,
  TrumpScreenProps,
  ListItem,
} from "../globals/types";
import Clipboard from '@react-native-clipboard/clipboard'; // Import Clipboard

//TODO that it will be depend on the sort/filtr

const INITIAL_TOP_VIEW_HEIGHT =
  Platform.OS === "ios"
    ? 390
    : Platform.OS === "android"
    ? 390 //+ (StatusBar.currentHeight || 0)
    : 390; // e.g., web or default

export default function TrumpScreen({ navigation }: TrumpScreenProps) {
  // State management
  const [filters, setFilters] = useState<Filters>({
    to: "",
    from: "",
    when: "",
  });
  const [mode, setMode] = useState<boolean>(false); // false for "מחפש", true for "מציע"
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [hidden, setHidden] = useState(false);
  const lastOffset = useRef(0);

  const animatedViewHeight = useRef(
    new Animated.Value(INITIAL_TOP_VIEW_HEIGHT)
  ).current;
  // Sample search results - replace with actual data from your API
  const searchResults: TrumpResult[] = [
    // {
    //   id: "1",
    //   name: "נועם סרוסי",
    //   from: "יאשיהו",
    //   to: "הרכבת",
    //   date: "02/01/2023",
    //   time: "15:30",
    // },
    // {
    //   id: "2",
    //   name: "נועם סרוסי",
    //   from: "שטרן 29",
    //   to: "הרכבת לתל אביב",
    //   date: "היום",
    //   time: "15:30",
    // },
  ];

  const ANIMATION_COOLDOWN_MS = 400;
  const SCROLL_UP_THRESHOLD = 1;
  const SCROLL_DOWN_THRESHOLD = -30;

  const canAnimate = useRef(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const deltaY = lastOffset.current - offsetY;

    if (!canAnimate.current) return;

    // Scroll Up (strong enough)
    if (deltaY > SCROLL_UP_THRESHOLD && hidden) {
      // console.log("scrolling up - ", deltaY);
      canAnimate.current = false;
      setHidden(false);
      Animated.timing(animatedViewHeight, {
        toValue: INITIAL_TOP_VIEW_HEIGHT,
        duration: 200,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        canAnimate.current = true;
      }, ANIMATION_COOLDOWN_MS);
    }

    // Scroll Down (strong enough)
    else if (deltaY < SCROLL_DOWN_THRESHOLD && !hidden) {
      // console.log("scrolling down - ", deltaY);
      canAnimate.current = false;
      setHidden(true);
      Animated.timing(animatedViewHeight, {
        toValue: 0,
        duration: 20,
        useNativeDriver: false,
      }).start();

      setTimeout(() => {
        canAnimate.current = true;
      }, ANIMATION_COOLDOWN_MS);
    }

    lastOffset.current = offsetY;
  };

  /**
   * Handles menu item selection from header
   * @param option - Selected menu option
   */
  const handleSelectMenuItem = useCallback((option: string) => {
    Alert.alert("בחירה", `נבחר: ${option}`);
  }, []);

  /**
   * Updates filter values when dropdown selections change
   * @param field - The filter field to update
   * @param value - The new value for the field
   */
  const handleDropdownChange = useCallback(
    (field: keyof Filters, value: string): void => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /**
   * Toggles between search mode (מחפש) and offer mode (מציע)
   */
  const toggleMode = useCallback((): void => {
    setMode((prev) => !prev);
  }, []);

  /**
   * Opens WhatsApp group link with improved error handling for APK builds
   * @param url - WhatsApp group URL to open
   */
  const handleOpenWhatsAppGroup = useCallback(async (url: string) => {
    try {
      // For Android, try the intent approach first
      if (Platform.OS === 'android') {
        const intentUrl = `intent://send?text=${encodeURIComponent(url)}#Intent;package=com.whatsapp;end`;
        
        try {
          await Linking.openURL(intentUrl);
          return;
        } catch (error) {
          console.log('Intent failed, trying other methods');
        }
      }
      
      // Try the original URL
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
      
      // Fallback: copy to clipboard
      Clipboard.setString(url);
      Alert.alert(
        "קישור הועתק",
        "הקישור הועתק ללוח. פתח את WhatsApp והדבק אותו בצ'אט.",
        [{ text: "אישור" }]
      );
      
    } catch (error) {
      console.error("Failed to open WhatsApp:", error);
      Clipboard.setString(url);
      Alert.alert("שגיאה", "הקישור הועתק ללוח");
    }
  }, []);


  /**
   * Handles search/publish action
   */
  const handleSearchAction = useCallback(() => {
    if (selectedTime) {
    setSelectedTime(null);
    const timeString = selectedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    Alert.alert(
      mode ? "פרסום נסיעה" : "חיפוש נסיעה",
      `יציאה מ: ${filters.from || "לא צוין"}\nבשעה: ${timeString}\nליעד: ${
        filters.to || "לא צוין"
      }`
    );
  } else {
    console.log("No time selected for search.");
  }
  }, [filters, selectedTime, mode]);

  /**
   * Renders individual search result item
   */
  const renderSearchResult = useCallback(
    (item: TrumpResult) => (
      <View style={localStyles.trumpCard}>
        <Text style={localStyles.trumpCardTitle}>{item.name}</Text>
        <Text style={localStyles.trumpCardText}>
          מ: {item.from} ל: {item.to}
        </Text>
        <Text style={localStyles.trumpCardText}>
          ב: {item.date} - {item.time}
        </Text>
      </View>
    ),
    []
  );

  /**
   * Renders individual WhatsApp group item
   */
  const renderWhatsAppGroup = useCallback(
    (item: WhatsAppGroup) => (
      <TouchableOpacity
        style={localStyles.trumpCard}
        onPress={() => handleOpenWhatsAppGroup(item.link)}
        activeOpacity={0.7}
      >
        <View style={localStyles.groupCardContentWrapper}>
          <Image
            source={item.image}
            style={localStyles.groupCardImage}
            resizeMode="cover"
          />
          <View style={localStyles.groupCardTextContent}>
            <Text style={localStyles.trumpCardSubtitle}>{item.name}</Text>
            <Text style={localStyles.trumpCardText}>תיאור הקבוצה</Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleOpenWhatsAppGroup]
  );

  /**
   * Renders the main content based on current mode and data
   */
  const renderMainContent = useCallback((): ListItem[] => {
    const data: ListItem[] = [];

    // Add search form
    data.push({ type: "form", key: "form" });

    // Add search results if in search mode and results exist
    if (!mode && searchResults.length > 0) {
      data.push({ type: "results-header", key: "results-header" });
      searchResults.forEach((result) =>
        data.push({ type: "result", key: result.id, data: result })
      );
    }

    // Add WhatsApp groups if in search mode
    if (!mode) {
      data.push({ type: "groups-header", key: "groups-header" });
      WHATSAPP_GROUP_DETAILS.forEach((group, index) =>
        data.push({ type: "group", key: `group-${index}`, data: group })
      );
    }

    // Add thank you message if in offer mode
    if (mode) {
      data.push({ type: "thank-you", key: "thank-you" });
    }

    return data;
  }, [mode, searchResults]);

  /**
   * Renders different content types for the FlatList
   */
  const renderContent: ListRenderItem<ListItem> = useCallback(
    ({ item }) => {
      switch (item.type) {
        // case "form":
        //   return (
        //     <View>
        //       <TouchableOpacity
        //         onPress={handleSearchAction}
        //         style={styles.button}
        //         activeOpacity={0.8}
        //       >
        //         <Text style={localStyles.donateButtonText}>
        //           {mode ? "פרסם" : "חפש"}
        //         </Text>
        //       </TouchableOpacity>
        //     </View>
        //   );

        case "results-header":
          return <Text style={localStyles.sectionTitle}>טרמפים:</Text>;

        case "result":
          return renderSearchResult(item.data);

        case "groups-header":
          return <Text style={localStyles.sectionTitle}>קבוצות:</Text>;

        case "group":
          return renderWhatsAppGroup(item.data);

        case "thank-you":
          return (
            <View>
              <Text style={localStyles.sentences}>אנו מודים לך על תרומתך</Text>
              <Text style={localStyles.sentences}>
                ויותר מזה על השתתפותך בקהילה!
              </Text>
            </View>
          );

        default:
          return null;
      }
    },
    [
      handleDropdownChange,
      selectedTime,
      handleSearchAction,
      mode,
      renderSearchResult,
      renderWhatsAppGroup,
    ]
  );

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <View style={localStyles.wrapper}>
        <Animated.View
          style={[localStyles.topView, { height: animatedViewHeight }]}
        >
          <HeaderComp
            mode={mode}
            menuOptions={menu_for_trumps}
            onToggleMode={toggleMode}
            onSelectMenuItem={handleSelectMenuItem}
          />

          <View style={localStyles.rowContainer}>
            {/* <Text style={localStyles.search_Text}>מאיפה?</Text> */}
            <LocationSearchComp
              placeholder="מאיפה?"
              onLocationSelected={(location) =>
                handleDropdownChange("from", location)
              }
            />
          </View>

          <View style={localStyles.rowContainer}>
            {/* <Text style={localStyles.search_Text}>לאיפה?</Text> */}
            <LocationSearchComp
              placeholder="לאיפה?"
              onLocationSelected={(location) =>
                handleDropdownChange("to", location)
              }
            />
          </View>

          <View style={localStyles.rowContainerTime}>
            {/* <Text style={localStyles.search_Text}>מתי?</Text> */}
            {/* <View style={{ flex: 1 }}> */}
              <TimeInput 
               value={selectedTime}
                onChange={setSelectedTime} 
                placeholder="שעת יציאה"
                />
            {/* </View> */}
          </View>
          <View>
            <TouchableOpacity
              onPress={handleSearchAction}
              style={styles.button}
              activeOpacity={0.8}
            >
              <Text style={localStyles.donateButtonText}>
                {mode ? "פרסם" : "חפש"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <FlatList
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={localStyles.scroll}
          data={renderMainContent()}
          renderItem={renderContent}
          keyExtractor={(item) => item.key}
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFEDD5",
  },
  wrapper: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  scroll: {
    zIndex: 1000,
  },
  rowContainer: {
    marginHorizontal: 5,
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    // marginBottom: 16,
  },
  // rowContainerTime: {
  //   marginHorizontal: 5,
  //   flexDirection: "row-reverse", // RTL: text on right, input on left
  //   alignItems: "center",
  //   justifyContent: "space-between",
  // },

  scrollContent: {
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  donateButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  // search_Text: {
  //   fontWeight: "bold",
  //   fontSize: 16,
  //   marginTop: 10,
  //   // alignSelf: "flex-start",
  // },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginVertical: 10,
    alignSelf: "flex-end",
  },
  sentences: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 20,
    alignSelf: "center",
  },
  trumpCard: {
    alignItems: "flex-end",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    marginBottom: 12,
  },
  trumpCardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "right",
  },
  trumpCardSubtitle: {
    fontWeight: "600",
    fontSize: 15,
    textAlign: "right",
  },
  trumpCardText: {
    textAlign: "right",
    fontSize: 13,
    color: "#6B7280",
  },
  groupCardContentWrapper: {
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  groupCardImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  groupCardTextContent: {
    flex: 1,
    alignItems: "flex-end",
  },
  locationInput: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "right",
    minWidth: 200,
  },
  rowContainerTime: {
    marginHorizontal: 5,
    alignSelf: 'center'
  },

  search_Text: {
    fontWeight: "bold",
    fontSize: 16,
    // REMOVE marginTop here to fix vertical alignment
    // marginTop: 10,  <--- REMOVE THIS LINE
  },

  topView: {
    justifyContent: "flex-start",
    alignItems: "stretch", // change from "center" to "stretch" so children can take full width
    overflow: "hidden",
  },
});
