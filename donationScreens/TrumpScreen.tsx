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
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';  
import { Ionicons as Icon } from '@expo/vector-icons';
import HeaderComp from '../components/HeaderComp';
import TimePicker from '../components/TimePicker';
import { db } from '../utils/databaseService';
import { useUser } from '../context/UserContext';

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
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSorts, setSelectedSorts] = useState<string[]>([]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [immediateDeparture, setImmediateDeparture] = useState(false);
  const [seats, setSeats] = useState<number>(3);
  const [price, setPrice] = useState<string>('0');
  const [allRides, setAllRides] = useState<any[]>([]);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const { selectedUser } = useUser();

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🚗 TrumpScreen - Screen focused, refreshing data...');
      // Reset form when returning to screen
      setFromLocation('');
      setToLocation('');
      setDepartureTime('');
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Filter options ייעודיים לטרמפים
  const trumpFilterOptions = [
    'בלי השתתפות בהוצאות',
    'לפי מגדר: נשים בלבד',
    'לפי מגדר: גברים בלבד',
    'לפי גיל: 18-25',
    'לפי גיל: 25-40',
    'לפי גיל: 40+',
    'בלי צמתים',
    'בלי אוטובוסים',
    'בלי עישון',
    'עם ילדים',
    'עם חיות',
    'מקום לציוד',
    'כביש 6',
    'מזגן',
    'מוסיקה',
    'נגישות',
  ];

  const trumpSortOptions = [
    "אלפביתי",
    "לפי מיקום",
    "לפי תאריך",
    "לפי שעה",
    "לפי מחיר",
    "לפי דירוג",
    "לפי רלוונטיות",
  ];

  // Mock data for rides (moved before use)
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

  // טען טרמפים - שילוב דמה + מה-DB של המשתמש
  useEffect(() => {
    const loadRides = async () => {
      try {
        const uid = selectedUser?.id || 'guest';
        const userRides = await db.listRides(uid);
        const merged = [...userRides, ...dummyRides];
        setAllRides(merged);
        setFilteredRides(merged);
      } catch (e) {
        setAllRides(dummyRides);
        setFilteredRides(dummyRides);
      }
    };
    loadRides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  // Mock data for recent rides
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

  // Mock data for groups
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

  // Function to filter rides
  // Function to handle search results from HeaderComp
  const handleSearch = (query: string, filters?: string[], sorts?: string[], results?: any[]) => {
    console.log('🚗 TrumpScreen - Search received:', { 
      query, 
      filters: filters || [], 
      sorts: sorts || [], 
      resultsCount: results?.length || 0 
    });
    
    // Update state with search results
    setSearchQuery(query);
    setSelectedFilters(filters || []);
    setSelectedSorts(sorts || []);
    
    const filtered = getFilteredRides();
    setFilteredRides(filtered);
  };

  const getFilteredRides = () => {
    let filtered = [...allRides];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(ride =>
        ride.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply selected filters (basic examples)
    if (selectedFilters.length > 0) {
      selectedFilters.forEach(f => {
        if (f.includes('בלי השתתפות')) {
          filtered = filtered.filter((ride: any) => (ride.price ?? 0) === 0);
        }
        if (f.includes('בלי עישון')) {
          filtered = filtered.filter((ride: any) => ride.noSmoking);
        }
        if (f.includes('עם חיות')) {
          filtered = filtered.filter((ride: any) => ride.petsAllowed);
        }
        if (f.includes('עם ילדים')) {
          filtered = filtered.filter((ride: any) => ride.kidsFriendly);
        }
      });
    }

    // Sorting
    const selectedSort = selectedSorts[0];
    switch (selectedSort) {
      case "אלפביתי":
        filtered.sort((a, b) => a.driverName.localeCompare(b.driverName));
        break;
      case "לפי מיקום":
        filtered.sort((a, b) => a.from.localeCompare(b.from));
        break;
      case "לפי תחום":
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "לפי תאריך":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "לפי שעה":
        filtered.sort((a, b) => a.time.localeCompare(b.time));
        break;
      case "לפי מחיר":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "לפי דירוג":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "לפי רלוונטיות":
        // Default - by rating
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  };

  // יצירת טרמפ ושמירה ל-DB
  const handleCreateRide = async () => {
    try {
      if (!fromLocation || !toLocation) {
        Alert.alert('שגיאה', 'נא למלא נקודת יציאה ויעד');
        return;
      }
      const uid = selectedUser?.id || 'guest';
      const rideId = `${Date.now()}`;
      const timeToSave = immediateDeparture
        ? new Date().toTimeString().slice(0, 5)
        : (departureTime || new Date().toTimeString().slice(0, 5));
      const ride = {
        id: rideId,
        driverId: uid,
        driverName: selectedUser?.name || 'משתמש',
        from: fromLocation,
        to: toLocation,
        date: new Date().toISOString().split('T')[0],
        time: timeToSave,
        seats: seats,
        price: Number(price) || 0,
        rating: 5,
        image: '🚗',
        category: 'אחר',
        timestamp: new Date().toISOString(),
        noSmoking: selectedFilters.includes('בלי עישון'),
        petsAllowed: selectedFilters.includes('עם חיות'),
        kidsFriendly: selectedFilters.includes('עם ילדים'),
      } as any;

      await db.createRide(uid, rideId, ride);
      setFilteredRides(prev => [ride, ...prev]);
      setFromLocation('');
      setToLocation('');
      setDepartureTime('');
      setImmediateDeparture(false);
      setSeats(3);
      setPrice('0');

      Alert.alert('הצלחה', 'הטרמפ פורסם ונשמר במסד הנתונים');
    } catch (e) {
      Alert.alert('שגיאה', 'נכשל לשמור את הטרמפ');
    }
  };

  // Function to show ride details
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
          // Donor mode - select ride to join
          Alert.alert('טרמפ נבחר', `נבחר: ${item.driverName}`);
        } else {
          // Beneficiary mode - show ride details with join option
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
      {mode ? (
        <View style={localStyles.formContainer}>
          <View style={localStyles.row}>
            <View style={localStyles.field}>
              <Text style={localStyles.label}>מאת</Text>
              <TextInput
                style={localStyles.input}
                value={fromLocation}
                onChangeText={setFromLocation}
                placeholder="מאיפה יוצאים"
              />
            </View>
            <View style={localStyles.field}>
              <Text style={localStyles.label}>אל</Text>
              <TextInput
                style={localStyles.input}
                value={toLocation}
                onChangeText={setToLocation}
                placeholder="לאן מגיעים"
              />
            </View>
          </View>

          <View style={localStyles.row}>
            <View style={[localStyles.field, { flex: 1 }]}>
              <Text style={localStyles.label}>שעת יציאה</Text>
              <View style={localStyles.timeRow}>
                <View style={{ flex: 1 }}>
                  <TimePicker
                    value={departureTime}
                    onTimeChange={setDepartureTime}
                    placeholder="בחר שעת יציאה"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const newVal = !immediateDeparture;
                    setImmediateDeparture(newVal);
                    if (newVal) {
                      const now = new Date();
                      const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                      setDepartureTime(t);
                    }
                  }}
                  style={localStyles.checkbox}
                >
                  <Icon
                    name={immediateDeparture ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={colors.pink}
                  />
                  <Text style={localStyles.checkboxLabel}>יציאה מיידית</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={localStyles.row}>
            <View style={localStyles.fieldSmall}>
              <Text style={localStyles.label}>מקומות</Text>
              <View style={localStyles.counterRow}>
                <TouchableOpacity style={localStyles.counterBtn} onPress={() => setSeats(Math.max(1, seats - 1))}>
                  <Text style={localStyles.counterText}>-</Text>
                </TouchableOpacity>
                <Text style={localStyles.counterValue}>{seats}</Text>
                <TouchableOpacity style={localStyles.counterBtn} onPress={() => setSeats(seats + 1)}>
                  <Text style={localStyles.counterText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={localStyles.fieldSmall}>
              <Text style={localStyles.label}>מחיר (₪)</Text>
              <TextInput
                style={localStyles.input}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                placeholder="0"
              />
            </View>
          </View>

          <TouchableOpacity style={localStyles.offerButton} onPress={handleCreateRide}>
            <Text style={localStyles.offerButtonText}>פרסם טרמפ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={localStyles.formContainer}>
          <View style={localStyles.row}>
            <View style={[localStyles.field, { flex: 1 }]}>
              <Text style={localStyles.label}>שעת יציאה</Text>
              <View style={localStyles.timeRow}>
                <View style={{ flex: 1 }}>
                  <TimePicker
                    value={departureTime}
                    onTimeChange={setDepartureTime}
                    placeholder="בחר שעת יציאה"
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const newVal = !immediateDeparture;
                    setImmediateDeparture(newVal);
                    if (newVal) {
                      const now = new Date();
                      const t = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                      setDepartureTime(t);
                    }
                  }}
                  style={localStyles.checkbox}
                >
                  <Icon
                    name={immediateDeparture ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={colors.pink}
                  />
                  <Text style={localStyles.checkboxLabel}>יציאה מיידית</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
        placeholder={mode ? "חפש יעד לטרמפ" : "חפש טרמפים זמינים"}
        filterOptions={trumpFilterOptions}
        sortOptions={trumpSortOptions}
        searchData={dummyRides}
        onSearch={handleSearch}
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
          // Beneficiary mode - show available rides and groups
          <>
            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>
                {searchQuery || selectedFilters.length > 0 ? 'טרמפים זמינים' : 'טרמפים מומלצים'}
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={localStyles.ridesScrollContainer}
              >
                {filteredRides.map((ride) => (
                  <View key={ride.id} style={localStyles.rideCardWrapper}>
                    {renderRideCard({ item: ride })}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>קבוצות וואטסאפ</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={localStyles.groupsScrollContainer}
              >
                {dummyGroups.filter(g => g.type === 'whatsapp').map((group) => (
                  <View key={`wa-${group.id}`} style={localStyles.groupCardWrapper}>
                    {renderGroupCard({ item: group })}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>קבוצות פייסבוק</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={localStyles.groupsScrollContainer}
              >
                {dummyGroups.filter(g => g.type === 'facebook').map((group) => (
                  <View key={`fb-${group.id}`} style={localStyles.groupCardWrapper}>
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
        paddingBottom: 100, // Bottom margin for screen
    },
    formContainer: {
      padding: 5,
      alignItems: 'center',
      borderRadius: 15,
      marginBottom: 15,
    },
    row: {
      flexDirection: 'row-reverse',
      gap: 10,
      width: '100%',
      marginBottom: 10,
      paddingHorizontal: 8,
    },
    field: {
      flex: 1,
    },
    fieldSmall: {
      flex: 0.5,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.moneyFormBorder,
      backgroundColor: colors.moneyInputBackground,
      marginLeft: 8,
    },
    checkboxLabel: {
      fontSize: FontSizes.small,
      color: colors.textPrimary,
      fontWeight: '600',
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
        textAlign: 'center',
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
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.moneyInputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.moneyFormBorder,
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    counterBtn: {
      backgroundColor: colors.moneyFormBackground,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    counterText: {
      fontSize: FontSizes.medium,
      fontWeight: 'bold',
      color: colors.textPrimary,
    },
    counterValue: {
      fontSize: FontSizes.medium,
      fontWeight: 'bold',
      color: colors.textPrimary,
      minWidth: 30,
      textAlign: 'center',
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
        alignSelf: 'center',
        color: colors.textPrimary,
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
