import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';  
import { Ionicons as Icon } from '@expo/vector-icons';
import HeaderComp from '../components/HeaderComp';
import TimePicker from '../components/TimePicker';

export default function TrumpScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  // Debug log for TrumpScreen
  console.log('🚗 TrumpScreen - Component rendered');
  console.log('🚗 TrumpScreen - Navigation object:', navigation);
  
  const [mode, setMode] = useState(false); // false = seeker (needs ride), true = offerer (offers ride)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");

  // עדכון חיפוש לפי SearchBar
  useEffect(() => {
    console.log('🚗 TrumpScreen - Search updated:', { searchQuery, selectedFilter, selectedSort });
  }, [searchQuery, selectedFilter, selectedSort]);

  // נתונים דמה לטרמפים
  const dummyRides = [
    {
      id: 1,
      driverName: "דוד כהן",
      from: "תל אביב",
      to: "ירושלים",
      date: "15.12.2023",
      time: "08:30",
      seats: 3,
      price: 25,
      rating: 4.8,
      image: "👨‍💼",
      category: "עבודה",
    },
    {
      id: 2,
      driverName: "שרה לוי",
      from: "חיפה",
      to: "תל אביב",
      date: "15.12.2023",
      time: "07:00",
      seats: 2,
      price: 30,
      rating: 4.9,
      image: "👩‍💼",
      category: "עבודה",
    },
    {
      id: 3,
      driverName: "משה גולדברג",
      from: "באר שבע",
      to: "תל אביב",
      date: "16.12.2023",
      time: "09:15",
      seats: 4,
      price: 35,
      rating: 4.7,
      image: "👨‍🎓",
      category: "לימודים",
    },
    {
      id: 4,
      driverName: "רחל אברהם",
      from: "אשדוד",
      to: "ירושלים",
      date: "15.12.2023",
      time: "10:00",
      seats: 1,
      price: 20,
      rating: 4.6,
      image: "👩‍⚕️",
      category: "בריאות",
    },
    {
      id: 5,
      driverName: "יוסי שפירא",
      from: "פתח תקווה",
      to: "חיפה",
      date: "16.12.2023",
      time: "14:30",
      seats: 3,
      price: 40,
      rating: 4.8,
      image: "👨‍🔧",
      category: "עבודה",
    },
    {
      id: 6,
      driverName: "מיכל רוזן",
      from: "רמת גן",
      to: "באר שבע",
      date: "15.12.2023",
      time: "16:00",
      seats: 2,
      price: 45,
      rating: 4.9,
      image: "👩‍🎨",
      category: "בילוי",
    },
  ];

  // נתונים דמה לטרמפים אחרונים
  const dummyRecentRides = [
    {
      id: 1,
      driverName: "דוד כהן",
      from: "תל אביב",
      to: "ירושלים",
      date: "10.12.2023",
      status: "הושלם",
      price: 25,
    },
    {
      id: 2,
      driverName: "שרה לוי",
      from: "חיפה",
      to: "תל אביב",
      date: "08.12.2023",
      status: "הושלם",
      price: 30,
    },
    {
      id: 3,
      driverName: "משה גולדברג",
      from: "באר שבע",
      to: "תל אביב",
      date: "05.12.2023",
      status: "הושלם",
      price: 35,
    },
  ];

  // נתונים דמה לקבוצות
  const dummyGroups = [
    {
      id: 1,
      name: "טרמפים תל אביב - ירושלים",
      members: 1250,
      image: "🚗",
      type: "whatsapp",
    },
    {
      id: 2,
      name: "טרמפים חיפה - תל אביב",
      members: 890,
      image: "🚙",
      type: "whatsapp",
    },
    {
      id: 3,
      name: "טרמפים באר שבע - תל אביב",
      members: 650,
      image: "🚐",
      type: "facebook",
    },
  ];

  // פונקציה לסינון טרמפים
  const getFilteredRides = () => {
    let filtered = [...dummyRides];

    // סינון לפי חיפוש
    if (searchQuery) {
      filtered = filtered.filter(ride =>
        ride.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.to.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // סינון לפי קטגוריה
    if (selectedFilter) {
      filtered = filtered.filter(ride => ride.category === selectedFilter);
    }

    // מיון
    switch (selectedSort) {
      case "אלפביתי":
        filtered.sort((a, b) => a.driverName.localeCompare(b.driverName));
        break;
      case "לפי מיקום":
        filtered.sort((a, b) => a.from.localeCompare(b.from));
        break;
      case "לפי מחיר":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "לפי שעה":
        filtered.sort((a, b) => a.time.localeCompare(b.time));
        break;
      case "לפי דירוג":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  };

  // פונקציה להצגת פרטי טרמפ
  const showRideDetailsModal = (ride: any) => {
    Alert.alert(
      `טרמפ של ${ride.driverName}`,
      `מ: ${ride.from}\nאל: ${ride.to}\nתאריך: ${ride.date}\nשעה: ${ride.time}\nמחיר: ₪${ride.price}\nמקומות פנויים: ${ride.seats}\n\nהאם תרצה להצטרף לטרמף זה?`,
      [
        {
          text: 'לא עכשיו',
          style: 'cancel',
        },
        {
          text: 'הצטרף לטרמף',
          onPress: () => {
            Alert.alert(
              'בקשה נשלחה',
              `בקשה להצטרף לטרמף של ${ride.driverName} נשלחה בהצלחה!`
            );
          },
        },
      ]
    );
  };

  const menuOptions = [
    'היסטוריית טרמפים',
    'הגדרות',
    'עזרה',
    'צור קשר'
  ];

  const handleToggleMode = useCallback(() => {
    setMode(!mode);
    console.log('Mode toggled:', !mode ? 'נזקק' : 'תורם');
  }, [mode]);

  const handleSelectMenuItem = useCallback((option: string) => {
    console.log('Menu option selected:', option);
    Alert.alert('תפריט', `נבחר: ${option}`);
  }, []);

  const renderRideCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={localStyles.rideCard}
      onPress={() => {
        if (mode) {
          // מצב תורם - בוחר טרמפ להצטרף
          Alert.alert('טרמפ נבחר', `נבחר: ${item.driverName}`);
        } else {
          // מצב נזקק - מציג פרטי טרמפ עם אפשרות להצטרף
          showRideDetailsModal(item);
        }
      }}
    >
      <View style={localStyles.rideCardHeader}>
        <Text style={localStyles.rideEmoji}>{item.image}</Text>
        <View style={localStyles.rideRating}>
          <Text style={localStyles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>
      <Text style={localStyles.rideDriverName}>{item.driverName}</Text>
      <View style={localStyles.rideRoute}>
        <Text style={localStyles.rideFrom}>📍 {item.from}</Text>
        <Text style={localStyles.rideArrow}>→</Text>
        <Text style={localStyles.rideTo}>📍 {item.to}</Text>
      </View>
      <View style={localStyles.rideDetails}>
        <Text style={localStyles.rideDateTime}>📅 {item.date} | 🕐 {item.time}</Text>
        <Text style={localStyles.rideCategory}>🏷️ {item.category}</Text>
      </View>
      <View style={localStyles.rideStats}>
        <Text style={localStyles.rideSeats}>💺 {item.seats} מקומות</Text>
        <Text style={localStyles.ridePrice}>💰 ₪{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentRideCard = ({ item }: { item: any }) => (
    <View style={localStyles.recentRideCard}>
      <View style={localStyles.recentRideHeader}>
        <Text style={localStyles.recentRideDriver}>{item.driverName}</Text>
        <Text style={localStyles.recentRidePrice}>₪{item.price}</Text>
      </View>
      <View style={localStyles.recentRideDetails}>
        <Text style={localStyles.recentRideRoute}>{item.from} → {item.to}</Text>
        <Text style={localStyles.recentRideDate}>📅 {item.date}</Text>
      </View>
      <View style={localStyles.recentRideStatus}>
        <Text style={localStyles.recentRideStatusText}>✅ {item.status}</Text>
      </View>
      <TouchableOpacity 
        style={localStyles.restoreButton}
        onPress={() => {
          setFromLocation(item.from);
          setToLocation(item.to);
          Alert.alert('שחזור הושלם', `יעד שוחזר: ${item.from} → ${item.to}`);
        }}
      >
        <Text style={localStyles.restoreButtonText}>שחזר</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGroupCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={localStyles.groupCard}>
      <View style={localStyles.groupCardHeader}>
        <Text style={localStyles.groupEmoji}>{item.image}</Text>
        <View style={localStyles.groupType}>
          <Text style={localStyles.groupTypeText}>
            {item.type === 'whatsapp' ? '📱' : '📘'}
          </Text>
        </View>
      </View>
      <Text style={localStyles.groupName}>{item.name}</Text>
      <View style={localStyles.groupStats}>
        <Text style={localStyles.groupMembers}>👥 {item.members} חברים</Text>
        <Text style={localStyles.groupJoin}>הצטרף לקבוצה</Text>
      </View>
    </TouchableOpacity>
  );

  const FormHeader = () => (
    <View>
      {/* Mode toggle is now handled by HeaderComp */}

      {mode ? (
        <View style={localStyles.formContainer}>
          {/* מצב מציע - טופס יצירת טרמפ */}
          <TimePicker
            value={departureTime}
            onTimeChange={setDepartureTime}
            label="שעת יציאה"
            placeholder="בחר שעת יציאה"
          />
        </View>
      ) : (
        <View style={localStyles.formContainer}>
          {/* מצב נזקק - הודעה לחיפוש טרמפ */}
 

          <TimePicker
            value={departureTime}
            onTimeChange={setDepartureTime}
            label="שעת יציאה"
            placeholder="בחר שעת יציאה"
          />
        </View>
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={localStyles.safeArea}>
      <HeaderComp
        mode={mode}
        menuOptions={menuOptions}
        onToggleMode={handleToggleMode}
        onSelectMenuItem={handleSelectMenuItem}
        title=""
        placeholder={mode ? "בחד יעד" : "חפש טרמפים זמינים"}
      />

      <FormHeader />
      
      <ScrollView 
        style={localStyles.container} 
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {mode ? (
        
            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>היסטוריית טרמפים שלך</Text>
              <View style={localStyles.recentRidesContainer}>
                {dummyRecentRides.map((ride) => (
                  <View key={ride.id} style={localStyles.recentRideCardWrapper}>
                    {renderRecentRideCard({ item: ride })}
                  </View>
                ))}
              </View>
            </View>
        ) : (
          // מצב נזקק - מציג טרמפים זמינים וקבוצות
          <>
            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>
                {searchQuery || selectedFilter ? 'טרמפים זמינים' : 'טרמפים מומלצים'}
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={localStyles.ridesScrollContainer}
              >
                {getFilteredRides().map((ride) => (
                  <View key={ride.id} style={localStyles.rideCardWrapper}>
                    {renderRideCard({ item: ride })}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>קבוצות טרמפים</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={localStyles.groupsScrollContainer}
              >
                {dummyGroups.map((group) => (
                  <View key={group.id} style={localStyles.groupCardWrapper}>
                    {renderGroupCard({ item: group })}
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundPrimary,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    scrollContent: {
        paddingBottom: 100, // מרווח בתחתית המסך
    },
    formContainer: {
      padding: 5,
      alignItems: 'center',
      borderRadius: 15,
      marginBottom: 15,
    },
    locationContainer: {
        marginBottom: 20,
    },
    timeContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: FontSizes.medium,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'right',
    },
    input: {
        backgroundColor: colors.moneyInputBackground,
        borderRadius: 10,
        padding: 15,
        fontSize: FontSizes.body,
        textAlign: 'right',
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
    },
    offerButton: {
        backgroundColor: colors.moneyButtonBackground,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    offerButtonText: {
        color: colors.backgroundPrimary,
        fontSize: FontSizes.medium,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: FontSizes.heading2,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'right',
    },
    // Ride Cards Styles
    ridesScrollContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    rideCardWrapper: {
        marginRight: 12,
        width: 280,
    },
    rideCard: {
        backgroundColor: colors.moneyCardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        minHeight: 200,
    },
    rideCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rideEmoji: {
        fontSize: FontSizes.displayLarge,
    },
    rideRating: {
        backgroundColor: colors.moneyStatusBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: FontSizes.small,
        color: colors.moneyStatusText,
        fontWeight: 'bold',
    },
    rideDriverName: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'right',
    },
    rideRoute: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rideFrom: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        flex: 1,
        textAlign: 'right',
    },
    rideArrow: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        marginHorizontal: 8,
    },
    rideTo: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        flex: 1,
        textAlign: 'left',
    },
    rideDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    rideDateTime: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    rideCategory: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    rideStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    rideSeats: {
        fontSize: FontSizes.small,
        color: colors.moneyHistoryAmount,
        fontWeight: '600',
    },
    ridePrice: {
        fontSize: FontSizes.small,
        color: colors.moneyHistoryAmount,
        fontWeight: '600',
    },
    // Recent Rides Styles
    recentRidesContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    recentRideCardWrapper: {
        marginBottom: 12,
        width: '100%',
    },
    recentRideCard: {
        backgroundColor: colors.moneyCardBackground,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        minHeight: 120,
    },
    recentRideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    recentRideDriver: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'right',
        flex: 1,
    },
    recentRidePrice: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.moneyHistoryAmount,
    },
    recentRideDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    recentRideRoute: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
        flex: 1,
        textAlign: 'right',
    },
    recentRideDate: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    recentRideStatus: {
        alignItems: 'flex-end',
    },
    recentRideStatusText: {
        fontSize: FontSizes.small,
        color: colors.moneyStatusText,
        fontWeight: '600',
    },
    restoreButton: {
        backgroundColor: colors.moneyButtonBackground,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    restoreButtonText: {
        color: colors.backgroundPrimary,
        fontSize: FontSizes.body,
        fontWeight: 'bold',
    },
    // Groups Styles
    groupsScrollContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    groupCardWrapper: {
        marginRight: 12,
        width: 200,
    },
    groupCard: {
        backgroundColor: colors.moneyCardBackground,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        minHeight: 120,
    },
    groupCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    groupEmoji: {
        fontSize: FontSizes.heading1,
    },
    groupType: {
        backgroundColor: colors.moneyStatusBackground,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    groupTypeText: {
        fontSize: FontSizes.caption,
        color: colors.moneyStatusText,
    },
    groupName: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'right',
    },
    groupStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
    },
    groupMembers: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    groupJoin: {
        fontSize: FontSizes.small,
        color: colors.moneyHistoryAmount,
        fontWeight: '600',
    },
    // Search Help Styles
    searchHelpContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    searchHelpTitle: {
        fontSize: FontSizes.heading2,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    searchHelpText: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    searchHelpTipsContainer: {
        backgroundColor: colors.moneyInputBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        width: '100%',
    },
    searchHelpTipsTitle: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'right',
    },
    searchHelpTip: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        marginBottom: 6,
        textAlign: 'right',
        lineHeight: 20,
    },
});
