/**
 * 🚗 TrumpScreen - מסך טרמפים
 * 
 * מסך זה מאפשר למשתמשים לפרסם ולחפש טרמפים בקהילה.
 * 
 * פיצ'רים עיקריים:
 * - מצב תורם: פרסום טרמפים עם הגדרות מיקום, זמן, מקומות ומחיר
 * - מצב נזקק: חיפוש טרמפים זמינים עם פילטרים ומיון
 * - היסטוריית טרמפים אישית
 * - קישורים לקבוצות וואטסאפ ופייסבוק רלוונטיות
 * - אינטגרציה עם וייז לניווט מיידי
 * 
 * מצבי פעולה:
 * - mode = false: מצב נזקק (מחפש טרמפ)
 * - mode = true: מצב תורם (מפרסם טרמפ)
 * 
 * נתונים:
 * - שילוב נתונים מה-DB של המשתמש עם נתוני דמה
 * - פילטרים ייעודיים לטרמפים (מגדר, גיל, עישון, חיות וכו')
 * - מיון לפי אלפביתי, מיקום, תאריך, שעה, מחיר ודירוג
 * 
 * אינטגרציות:
 * - מסד נתונים: שמירה וטעינה של טרמפים
 * - וייז: ניווט אוטומטי ליעד
 * - קישורים חיצוניים: קבוצות וואטסאפ ופייסבוק
 * 
 * @author Karma Community Team
 * @version 1.0.0
 * @since 2023
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  Linking,
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
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [seats, setSeats] = useState<number>(3);
  const [price, setPrice] = useState<string>('0');
  const [need_to_pay, setNeedToPay] = useState<boolean>(false);
  const priceInputRef = useRef<TextInput | null>(null);
  const [allRides, setAllRides] = useState<any[]>([]);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [recentRides, setRecentRides] = useState<any[]>([]);
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
        // בנה היסטוריה מהטרמפים של המשתמש
        const userRecent = (userRides || []).map((r: any) => ({
          id: r.id,
          driverName: r.driverName || selectedUser?.name || 'משתמש',
          from: r.from,
          to: r.to,
          date: r.date,
          status: 'פורסם',
          price: r.price || 0,
        }));
        setRecentRides(userRecent);
      } catch (e) {
        setAllRides(dummyRides);
        setFilteredRides(dummyRides);
        // אם נכשל, נישאר עם דמה
        setRecentRides([]);
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
      price: 0,
    },
    {
      id: 2,
      driverName: "שרה לוי",
      from: "חיפה",
      to: "תל אביב",
      date: "08.12.2023",
      status: "הושלם",
      price: 0,
    },
    {
      id: 3,
      driverName: "משה גולדברג",
      from: "באר שבע",
      to: "תל אביב",
      date: "05.12.2023",
      status: "הושלם",
      price: 3,
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
      link: 'https://chat.whatsapp.com/invite/te-aviv-jerusalem'
    },
    {
      id: 2,
      name: "טרמפים חיפה - תל אביב",
      members: 890,
      image: "🚙",
      type: "whatsapp",
      link: 'https://chat.whatsapp.com/invite/haifa-telaviv'
    },
    {
      id: 3,
      name: "טרמפים באר שבע - תל אביב",
      members: 650,
      image: "🚐",
      type: "facebook",
      link: 'https://www.facebook.com/groups/beer-sheva-telaviv'
    },
  ];

  /**
   * טיפול בתוצאות חיפוש מהרכיב HeaderComp
   * 
   * הפונקציה מקבלת תוצאות חיפוש, פילטרים ומיון
   * ומעדכנת את המצב המקומי בהתאם.
   * 
   * @param {string} query - שאילתת החיפוש
   * @param {string[]} filters - פילטרים נבחרים
   * @param {string[]} sorts - אפשרויות מיון
   * @param {any[]} results - תוצאות החיפוש
   */
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

  /**
   * סינון ומיון טרמפים לפי חיפוש, פילטרים ומיון
   * 
   * הפונקציה מסננת את כל הטרמפים לפי:
   * - שאילתת חיפוש (שם נהג, מיקום, קטגוריה)
   * - פילטרים נבחרים (מחיר, עישון, חיות וכו')
   * - מיון (אלפביתי, מיקום, תאריך, שעה, מחיר, דירוג)
   * 
   * @returns {any[]} מערך טרמפים מסוננים וממוינים
   */
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

  // ללא תלות בחבילת מיקום - וייז ישתמש במיקום הנוכחי של המכשיר בעת הניווט

  /**
   * יצירת טרמפ חדש ושמירה במסד הנתונים
   * 
   * הפונקציה בודקת תקינות הנתונים, יוצרת אובייקט טרמפ
   * ושומרת אותו במסד הנתונים. אם נבחרה יציאה מיידית
   * עם מיקום נוכחי, נפתח וייז לניווט אוטומטי.
   * 
   * @returns {Promise<void>}
   */
  const handleCreateRide = async () => {
    try {
      // יעד מגיע מתיבת החיפוש (searchQuery)
      if (!searchQuery) {
        Alert.alert('שגיאה', 'נא למלא יעד בתיבת החיפוש למעלה');
        return;
      }
      if (!useCurrentLocation && !fromLocation) {
        Alert.alert('שגיאה', 'נא למלא נקודת יציאה או לבחור יציאה מהמיקום הנוכחי');
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
        from: useCurrentLocation ? (fromLocation || 'מיקום נוכחי') : fromLocation,
        to: searchQuery,
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
      // עדכן היסטוריה מיידית
      setRecentRides(prev => [
        {
          id: rideId,
          driverName: ride.driverName,
          from: ride.from,
          to: ride.to,
          date: ride.date,
          status: 'פורסם',
          price: ride.price,
        },
        ...prev,
      ]);
      setFromLocation('');
      setDepartureTime('');
      setImmediateDeparture(false);
      setUseCurrentLocation(true);
      setSeats(3);
      setPrice('0');

      Alert.alert('הצלחה', 'הטרמפ פורסם ונשמר במסד הנתונים');

      // אם יציאה מיידית ומיקום נוכחי - פותחים וייז ליעד
      if (immediateDeparture && useCurrentLocation && searchQuery) {
        const encodedDest = encodeURIComponent(searchQuery);
        const wazeUrl = `waze://?q=${encodedDest}&navigate=yes`;
        const fallback = `https://waze.com/ul?q=${encodedDest}&navigate=yes`;
        try {
          const canOpen = await Linking.canOpenURL(wazeUrl);
          if (canOpen) {
            await Linking.openURL(wazeUrl);
          } else {
            await Linking.openURL(fallback);
          }
        } catch {}
      }
    } catch (e) {
      Alert.alert('שגיאה', 'נכשל לשמור את הטרמפ');
    }
  };

  /**
   * הצגת פרטי טרמפ בחלון דו-שיח
   * 
   * מציגה את כל פרטי הטרמפ ומאפשרת למשתמש
   * להצטרף לטרמפ או לבטל.
   * 
   * @param {any} ride - אובייקט הטרמפ להצגה
   */
  const showRideDetailsModal = (ride: any) => {
    Alert.alert(
      `טרמפ של ${ride.driverName}`,
      `מ: ${ride.from}\nאל: ${ride.to}\nתאריך: ${ride.date}\nשעה: ${ride.time}\nמחיר: ₪${ride.price}\nמקומות פנויים: ${ride.seats}\n\nהאם תרצה להצטרף לטרמפ זה?`,
      [
        {
          text: 'לא עכשיו',
          style: 'cancel',
        },
        {
          text: 'הצטרף לטרמפ',
          onPress: () => {
            Alert.alert(
              'בקשה נשלחה',
              `בקשה להצטרף לטרמפ של ${ride.driverName} נשלחה בהצלחה!`
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
      {/* Row 1: emoji + driver name | rating */}
      <View style={localStyles.rideRow}>
        <View style={localStyles.rideRowLeft}>
          <Text style={localStyles.rideEmoji}>{item.image}</Text>
          <Text style={localStyles.rideDriverName}>{item.driverName}</Text>
        </View>
        <View style={localStyles.rideRating}>
          <Text style={localStyles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>

      {/* Row 2: route | seats + price */}
      <View style={localStyles.rideRow}>
        <View style={localStyles.rideRowLeft}>
          <Text numberOfLines={1} style={localStyles.rideRouteText}>{`${item.from} → ${item.to}`}</Text>
        </View>
        <View style={localStyles.rideRowRight}>
          <Text style={localStyles.rideSeats}>💺 {item.seats}</Text>
          <Text style={localStyles.ridePrice}>₪{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentRideCard = ({ item }: { item: any }) => (
    <View style={localStyles.rideCard}>
      {/* Row 1: emoji + driver name | status */}
      <View style={localStyles.rideRow}>
        <View style={localStyles.rideRowLeft}>
          <Text style={localStyles.rideEmoji}>🚗</Text>
          <Text style={localStyles.rideDriverName}>{item.driverName}</Text>
        </View>
        <View style={localStyles.rideRating}>
          <Text style={localStyles.ratingText}>{item.status}</Text>
        </View>
      </View>

      {/* Row 2: route | date + restore */}
      <View style={localStyles.rideRow}>
        <View style={localStyles.rideRowLeft}>
          <Text numberOfLines={1} style={localStyles.rideRouteText}>{`${item.from} → ${item.to}`}</Text>
        </View>
        <View style={localStyles.rideRowRight}>
          {typeof item.price === 'number' && item.price > 0 && (
            <Text style={localStyles.ridePrice}>₪{item.price}</Text>
          )}
          <Text style={localStyles.recentRideDateCompact}>📅 {item.date}</Text>
          <TouchableOpacity
            style={localStyles.restoreChip}
            onPress={() => {
              setFromLocation(item.from);
              setToLocation(item.to);
              Alert.alert('שחזור הושלם', `יעד שוחזר: ${item.from} → ${item.to}`);
            }}
          >
            <Text style={localStyles.restoreChipText}>שחזר</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderGroupCard = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => item.link && typeof item.link === 'string' ? Linking.openURL(item.link) : Alert.alert('שגיאה', 'אין קישור לקבוצה')}>
      <Text style={localStyles.groupLinkText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const FormHeader = () => (
    <View>
      {mode ? (
        <View style={localStyles.formContainer}>
          <View style={localStyles.row}>
            <View style={[localStyles.field, { flex: 1 }]}>
              <View style={localStyles.timeRow}>
                <View style={{ flex: 1 }}>
                  <TimePicker
                    value={departureTime}
                    onTimeChange={setDepartureTime}
                    placeholder="בחר שעת יציאה"
                  />
                </View>
                <View>
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
                <TouchableOpacity
                  onPress={() => setUseCurrentLocation(!useCurrentLocation)}
                  style={localStyles.checkbox}
                  >
                  <Icon
                    name={useCurrentLocation ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={colors.pink}
                    />
                  <Text style={localStyles.checkboxLabel}>יציאה מהמיקום</Text>
                </TouchableOpacity>
                    </View>
              </View>
            </View>
          </View>

          {!useCurrentLocation && (
            <View style={localStyles.row}>
              <View style={localStyles.field}>
                <Text style={localStyles.label}>נקודת יציאה</Text>
                <TextInput
                  style={localStyles.input}
                  value={fromLocation}
                  onChangeText={setFromLocation}
                  placeholder="כתוב מאיפה יוצאים"
                />
              </View>
            </View>
          )}

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
              <TouchableOpacity onPress={() => setNeedToPay(p => !p)} activeOpacity={0.8}>
                <Text
                  style={[
                    localStyles.label,
                    { color: need_to_pay ? colors.textPrimary : colors.textSecondary },
                  ]}
                >
                  השתתפות בדלק (₪)
                </Text>
              </TouchableOpacity>
              {need_to_pay && (
                <View style={localStyles.inputWrapper}>
                  <TextInput
                    ref={priceInputRef}
                    style={[localStyles.input, localStyles.inputWithAdornment]}
                    keyboardType="number-pad"
                    value={price}
                    onChangeText={(t) => {
                      const v = t.replace(/[^0-9]/g, '');
                      setPrice(v);
                      requestAnimationFrame(() => priceInputRef.current?.focus());
                    }}
                    placeholder="0"
                    returnKeyType="done"
                    blurOnSubmit={false}
                  />
                  <Text pointerEvents="none" style={localStyles.inputAdornment}>₪</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              localStyles.offerButton,
              !searchQuery && { opacity: 0.5 },
            ]}
            onPress={handleCreateRide}
            disabled={!searchQuery}
          >
            <Text style={localStyles.offerButtonText}>פרסם טרמפ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={localStyles.formContainer}>
          <View style={localStyles.row}>
            <View style={[localStyles.field, { flex: 1 }]}>
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
        placeholder={mode ? "הכנס יעד" : "חפש טרמפים זמינים"}
        filterOptions={trumpFilterOptions}
        sortOptions={trumpSortOptions}
        searchData={dummyRides}
        onSearch={handleSearch}
      />

      <FormHeader />

      {mode ? (
        <ScrollView
          style={localStyles.container}
          contentContainerStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>היסטוריית טרמפים שלך</Text>
            <View style={localStyles.recentRidesContainer}>
              {(recentRides.length > 0 ? recentRides : dummyRecentRides).map((ride) => (
                <View key={ride.id} style={localStyles.recentRideCardWrapper}>
                  {renderRecentRideCard({ item: ride })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        // Beneficiary (seeker) mode - two independent vertical scroll sections
        <View style={[localStyles.container, localStyles.noOuterScrollContainer]}> 
          <View style={localStyles.sectionsContainer}>
            {/* Rides section */}
            <View style={localStyles.sectionWithScroller}>
              <Text style={localStyles.sectionTitle}>
                {searchQuery || selectedFilters.length > 0 ? 'טרמפים זמינים' : 'טרמפים מומלצים'}
              </Text>
              <ScrollView
                style={localStyles.innerScroll}
                contentContainerStyle={localStyles.ridesGridContainer}
                showsVerticalScrollIndicator
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {filteredRides.map((ride) => (
                  <View key={ride.id} style={localStyles.rideCardWrapper}>
                    {renderRideCard({ item: ride })}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Groups section */}
            <View style={localStyles.sectionWithScroller}>
              <Text style={localStyles.sectionTitle}>קבוצות רלוונטיות</Text>
              <ScrollView
                style={localStyles.innerScroll}
                contentContainerStyle={localStyles.groupsContainer}
                showsVerticalScrollIndicator
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                <View style={localStyles.groupsTwoCols}>
                  <View style={localStyles.groupColumn}>
                    <Text style={localStyles.groupColumnTitle}>וואטסאפ</Text>
                    {dummyGroups
                      .filter(g => g.type === 'whatsapp')
                      .filter(g => !searchQuery || g.name.includes(searchQuery))
                      .map((group) => (
                        <View key={`wa-${group.id}`} style={localStyles.groupLinkWrapper}>
                          {renderGroupCard({ item: group })}
                        </View>
                      ))}
                  </View>
                  <View style={localStyles.groupColumn}>
                    <Text style={localStyles.groupColumnTitle}>פייסבוק</Text>
                    {dummyGroups
                      .filter(g => g.type === 'facebook')
                      .filter(g => !searchQuery || g.name.includes(searchQuery))
                      .map((group) => (
                        <View key={`fb-${group.id}`} style={localStyles.groupLinkWrapper}>
                          {renderGroupCard({ item: group })}
                        </View>
                      ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * סטיילים מקומיים למסך הטרמפים
 * 
 * הסטיילים מחולקים לקטגוריות:
 * - Layout: safeArea, container, sections
 * - Forms: inputs, buttons, checkboxes
 * - Cards: ride cards, recent rides, groups
 * - Typography: labels, text styles
 * - Interactive: buttons, touchable elements
 */
const localStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary_2,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 4,
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
      gap: "15%",
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginVertical: 3,
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
    inputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    inputWithAdornment: {
        paddingRight: 36,
    },
    inputAdornment: {
        position: 'absolute',
        right: 12,
        color: colors.textSecondary,
        fontSize: FontSizes.body,
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
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: colors.textPrimary,
        textAlign: 'right',
    },
    // Container that disables outer scroll in seeker mode
    noOuterScrollContainer: {
        flex: 1,
    },
    sectionsContainer: {
        flex: 1,
        gap: 5,
    },
    sectionWithScroller: {
        flex: 1,
        backgroundColor: colors.moneyFormBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    innerScroll: {
        flex: 1,
    },
    // Ride Cards Styles
    ridesGridContainer: {
        // paddingHorizontal: 8,
        // paddingVertical: 8,
        // paddingBottom: 8,
    },
    rideCardWrapper: {
        marginBottom: 8,
        width: '100%',
    },
    rideCard: {
        backgroundColor: colors.moneyCardBackground,
        borderRadius: 10,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
    },
    rideRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    rideRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 1,
    },
    rideRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rideEmoji: {
        fontSize: FontSizes.heading2,
    },
    rideRating: {
        backgroundColor: colors.moneyStatusBackground,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    ratingText: {
        fontSize: FontSizes.small,
        color: colors.moneyStatusText,
        fontWeight: 'bold',
    },
    rideDriverName: {
        fontSize: FontSizes.small,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'right',
    },
    rideRouteText: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
        flex: 1,
        textAlign: 'right',
        marginLeft: 6,
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
        paddingHorizontal: 8,
        paddingVertical: 8,
    },
    recentRideCardWrapper: {
        marginBottom: 8,
        width: '100%',
    },
    recentRideDateCompact: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    restoreChip: {
        backgroundColor: colors.moneyFormBackground,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    restoreChipText: {
        fontSize: FontSizes.small,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    // Groups Styles (compact two columns)
    groupsContainer: {
      paddingHorizontal: 8,
      paddingVertical: 8,
      paddingBottom: 8,
    },
    groupsTwoCols: {
      flexDirection: 'row-reverse',
      gap: 16,
      paddingHorizontal: 16,
    },
    groupColumn: {
      flex: 1,
    },
    groupColumnTitle: {
      fontSize: FontSizes.body,
      color: colors.textSecondary,
      marginBottom: 6,
      textAlign: 'right',
    },
    groupLinkWrapper: {
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    groupLinkText: {
      fontSize: FontSizes.small,
      color: colors.blue,
      textDecorationLine: 'underline',
      textAlign: 'right',
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

