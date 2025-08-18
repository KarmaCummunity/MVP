import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,

  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import colors from '../globals/colors';
import { fontSizes as FontSizes } from '../globals/appConstants';  
import { Ionicons as Icon } from '@expo/vector-icons';
import HeaderComp from '../components/HeaderComp';
import DonationStatsFooter from '../components/DonationStatsFooter';
import TimePicker from '../components/TimePicker';
import { db } from '../utils/databaseService';
import { useUser } from '../context/UserContext';
import ScrollContainer from '../components/ScrollContainer';

export default function TrumpScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  // Debug log for TrumpScreen
  console.log('🚗 TrumpScreen - Component rendered');
  console.log('🚗 TrumpScreen - Navigation object:', navigation);
  
  const [mode, setMode] = useState(true); // false = seeker (needs ride), true = offerer (offers ride)
  const { t } = useTranslation(['donations','common','trump']);
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
  const { selectedUser, isRealAuth } = useUser();

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

  // Filter options
  const trumpFilterOptions = (t('trump:filters', { returnObjects: true }) as unknown as string[]) || [];

  const trumpSortOptions = (t('trump:sorts', { returnObjects: true }) as unknown as string[]) || [];

  // Mock data for rides (moved before use)
  const dummyRides = [
    {
      id: 1,
      driverName: t('trump:mock.driver1') as string,
      from: t('trump:mock.tlv') as string,
      to: t('trump:mock.jerusalem') as string,
      date: "15.12.2023",
      time: "08:30",
      seats: 3,
      price: 25,
      rating: 4.8,
      image: "👨‍💼",
      category: t('trump:mock.category.work') as string,
    },
    {
      id: 2,
      driverName: t('trump:mock.driver2') as string,
      from: t('trump:mock.haifa') as string,
      to: t('trump:mock.tlv') as string,
      date: "15.12.2023",
      time: "07:00",
      seats: 2,
      price: 30,
      rating: 4.9,
      image: "👩‍💼",
      category: t('trump:mock.category.work') as string,
    },
    {
      id: 3,
      driverName: t('trump:mock.driver3') as string,
      from: t('trump:mock.beerSheva') as string,
      to: t('trump:mock.tlv') as string,
      date: "16.12.2023",
      time: "09:15",
      seats: 4,
      price: 35,
      rating: 4.7,
      image: "👨‍🎓",
      category: t('trump:mock.category.study') as string,
    },
    {
      id: 4,
      driverName: t('trump:mock.driver4') as string,
      from: t('trump:mock.ashdod') as string,
      to: t('trump:mock.jerusalem') as string,
      date: "15.12.2023",
      time: "10:00",
      seats: 1,
      price: 20,
      rating: 4.6,
      image: "👩‍⚕️",
      category: t('trump:mock.category.health') as string,
    },
    {
      id: 5,
      driverName: t('trump:mock.driver5') as string,
      from: t('trump:mock.petahTikva') as string,
      to: t('trump:mock.haifa') as string,
      date: "16.12.2023",
      time: "14:30",
      seats: 3,
      price: 40,
      rating: 4.8,
      image: "👨‍🔧",
      category: t('trump:mock.category.work') as string,
    },
    {
      id: 6,
      driverName: t('trump:mock.driver6') as string,
      from: t('trump:mock.ramatGan') as string,
      to: t('trump:mock.beerSheva') as string,
      date: "15.12.2023",
      time: "16:00",
      seats: 2,
      price: 45,
      rating: 4.9,
      image: "👩‍🎨",
      category: t('trump:mock.category.leisure') as string,
    },
    {
      id: 5,
      name: 'טרמפים בישראל (טלגרם) — קבוצה נוספת',
      members: 0,
      image: "🚗",
      type: "telegram",
      link: 'https://t.me/joinchat/Arw4c0AUY5IVdWf3MLqEHg'
    },
  ];

  useEffect(() => {
    const loadRides = async () => {
      try {
        const uid = selectedUser?.id || 'guest';
        const userRides = await db.listRides(uid);
        const merged = isRealAuth ? userRides : [...userRides, ...dummyRides];
        setAllRides(merged);
        setFilteredRides(merged);
        const userRecent = (userRides || []).map((r: any) => ({
          id: r.id,
          driverName: r.driverName || selectedUser?.name || (t('common:unknownUser', { defaultValue: 'User' }) as string),
          from: r.from,
          to: r.to,
          date: r.date,
          status: t('trump:status.published') as string,
          price: r.price || 0,
        }));
        setRecentRides(userRecent);
      } catch (e) {
         if (!isRealAuth) {
           setAllRides(dummyRides);
           setFilteredRides(dummyRides);
         } else {
           setAllRides([]);
           setFilteredRides([]);
         }
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
      driverName: t('trump:mock.driver1') as string,
      from: t('trump:mock.tlv') as string,
      to: t('trump:mock.jerusalem') as string,
      date: "10.12.2023",
      status: t('trump:status.completed') as string,
      price: 0,
    },
    {
      id: 2,
      driverName: t('trump:mock.driver2') as string,
      from: t('trump:mock.haifa') as string,
      to: t('trump:mock.tlv') as string,
      date: "08.12.2023",
      status: t('trump:status.completed') as string,
      price: 0,
    },
    {
      id: 3,
      driverName: t('trump:mock.driver3') as string,
      from: t('trump:mock.beerSheva') as string,
      to: t('trump:mock.tlv') as string,
      date: "05.12.2023",
      status: t('trump:status.completed') as string,
      price: 3,
    },
  ];

  // Mock data for groups
  const dummyGroups = [
    {
      id: 1,
      name: 'טרמפים בישראל (טלגרם)',
      members: 0,
      image: "🚗",
      type: "telegram",
      link: 'https://t.me/joinchat/SlQOMOekjOi2IWxo'
    },
    {
      id: 2,
      name: 'אתר הטרמפים הישראלי',
      members: 0,
      image: "🚙",
      type: "web",
      link: 'https://www.tremp.co.il/'
    },
    {
      id: 3,
      name: 'Trempist',
      members: 0,
      image: "🚐",
      type: "web",
      link: 'https://www.trempist.com/'
    },
    
  ];


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
        (ride.driverName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ?? false) ||
        (ride.from?.toLowerCase()?.includes(searchQuery.toLowerCase()) ?? false) ||
        (ride.to?.toLowerCase()?.includes(searchQuery.toLowerCase()) ?? false) ||
        (ride.category?.toLowerCase()?.includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    // Apply selected filters (basic examples)
    if (selectedFilters.length > 0) {
      const filterNoCost = t('trump:filters.noCostSharing') as string;
      const filterNoSmoking = t('trump:filters.noSmoking') as string;
      const filterWithPets = t('trump:filters.withPets') as string;
      const filterWithKids = t('trump:filters.withKids') as string;
      selectedFilters.forEach(f => {
        if (f === filterNoCost) {
          filtered = filtered.filter((ride: any) => (ride.price ?? 0) === 0);
        }
        if (f === filterNoSmoking) {
          filtered = filtered.filter((ride: any) => ride.noSmoking);
        }
        if (f === filterWithPets) {
          filtered = filtered.filter((ride: any) => ride.petsAllowed);
        }
        if (f === filterWithKids) {
          filtered = filtered.filter((ride: any) => ride.kidsFriendly);
        }
      });
    }

    // Sorting
    const selectedSort = selectedSorts[0];
    switch (selectedSort) {
      case (t('trump:sort.alphabetical') as string):
        filtered.sort((a, b) => (a.driverName || '').localeCompare(b.driverName || ''));
        break;
      case (t('trump:sort.byLocation') as string):
        filtered.sort((a, b) => (a.from || '').localeCompare(b.from || ''));
        break;
      case (t('trump:sort.byCategory') as string):
        filtered.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        break;
      case (t('trump:sort.byDate') as string):
        filtered.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case (t('trump:sort.byTime') as string):
        filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
        break;
      case (t('trump:sort.byPrice') as string):
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case (t('trump:sort.byRating') as string):
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case (t('trump:sort.byRelevance') as string):
        // Default - by rating
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return filtered;
  };

  const handleCreateRide = async () => {
    try {
      if (!searchQuery) {
        Alert.alert(t('common:errorTitle') as string, t('trump:errors.fillDestination') as string);
        return;
      }
      if (!useCurrentLocation && !fromLocation) {
        Alert.alert(t('common:errorTitle') as string, t('trump:errors.fillFromOrCurrent') as string);
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
        driverName: selectedUser?.name || (t('common:unknownUser', { defaultValue: 'User' }) as string),
        from: useCurrentLocation ? (fromLocation || (t('trump:currentLocation') as string)) : fromLocation,
        to: searchQuery,
        date: new Date().toISOString().split('T')[0],
        time: timeToSave,
        seats: seats,
        price: Number(price) || 0,
        rating: 5,
        image: '🚗',
        category: t('trump:category.other') as string,
        timestamp: new Date().toISOString(),
        noSmoking: selectedFilters.includes(t('trump:filters.noSmoking') as string),
        petsAllowed: selectedFilters.includes(t('trump:filters.withPets') as string),
        kidsFriendly: selectedFilters.includes(t('trump:filters.withKids') as string),
      } as any;

      await db.createRide(uid, rideId, ride);
      setFilteredRides(prev => [ride, ...prev]);
      setRecentRides(prev => [
        {
          id: rideId,
          driverName: ride.driverName,
          from: ride.from,
          to: ride.to,
          date: ride.date,
          status: t('trump:status.published') as string,
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

      Alert.alert(t('trump:success.title') as string, t('trump:success.ridePublished') as string);

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
      Alert.alert(t('common:errorTitle') as string, t('trump:errors.saveFailed') as string);
    }
  };

  /**
   * Show ride details in a dialog
   * Displays full ride details and allows the user to join or cancel
   * @param {any} ride - The ride object to display
   */
  const showRideDetailsModal = (ride: any) => {
    Alert.alert(
      t('trump:rideOf', { name: ride.driverName }) as string,
      `${t('trump:from')}: ${ride.from}\n${t('trump:to')}: ${ride.to}\n${t('trump:date')}: ${ride.date}\n${t('trump:time')}: ${ride.time}\n${t('trump:price')}: ₪${ride.price}\n${t('trump:seatsAvailable')}: ${ride.seats}\n\n${t('trump:joinQuestion')}`,
      [
        {
          text: t('common:cancel') as string,
          style: 'cancel',
        },
        {
          text: t('trump:joinRide') as string,
          onPress: () => {
            Alert.alert(
              t('trump:requestSentTitle') as string,
              t('trump:requestSentBody', { name: ride.driverName }) as string
            );
          },
        },
      ]
    );
  };

  const menuOptions = [
    t('trump:menu.history') as string,
    t('trump:menu.settings') as string,
    t('trump:menu.help') as string,
    t('trump:menu.contact') as string,
  ];

  const handleToggleMode = useCallback(() => {
    setMode(!mode);
    console.log('Mode toggled:', !mode ? 'seeker' : 'offerer');
  }, [mode]);

  const handleSelectMenuItem = useCallback((option: string) => {
    console.log('Menu option selected:', option);
    Alert.alert(t('trump:menu.title') as string, t('trump:menu.selected', { option }) as string);
  }, []);

  const renderRideCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={localStyles.rideCard}
      onPress={() => {
        if (mode) {
          // Donor mode - select ride to join
          Alert.alert(t('trump:alerts.rideSelectedTitle') as string, t('trump:alerts.rideSelectedBody', { name: item.driverName }) as string);
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
              Alert.alert(t('trump:alerts.restoreDoneTitle') as string, t('trump:alerts.restoreDoneBody', { from: item.from, to: item.to }) as string);
            }}
          >
            <Text style={localStyles.restoreChipText}>{t('trump:restore')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderGroupCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={localStyles.groupButton}
      onPress={async () => {
        if (item.link && typeof item.link === 'string') {
          try {
            const supported = await Linking.canOpenURL(item.link);
            if (supported) {
              await Linking.openURL(item.link);
            } else {
              Alert.alert(t('common:error') as string, t('common:cannotOpenLink') as string);
            }
          } catch {
            Alert.alert(t('common:error') as string, t('common:cannotOpenLink') as string);
          }
        } else {
          Alert.alert(t('common:errorTitle') as string, t('trump:errors.noGroupLink') as string);
        }
      }}>
      <View style={localStyles.groupButtonHeader}>
        <Text style={localStyles.groupButtonTitle}>{item.name}</Text>
        <Text style={localStyles.groupButtonPill}>{item.type === 'telegram' ? 'Telegram' : item.type === 'whatsapp' ? 'WhatsApp' : 'Web'}</Text>
      </View>
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
                    placeholder={t('trump:ui.timePickerPlaceholder') as string}
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
                  <Text style={localStyles.checkboxLabel}>{t('trump:ui.immediateDeparture')}</Text>
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
                  <Text style={localStyles.checkboxLabel}>{t('trump:ui.useCurrentLocation')}</Text>
                </TouchableOpacity>
                    </View>
              </View>
            </View>
          </View>

          {!useCurrentLocation && (
            <View style={localStyles.row}>
              <View style={localStyles.field}>
                <Text style={localStyles.label}>{t('trump:ui.fromPointLabel')}</Text>
                <TextInput
                  style={localStyles.input}
                  value={fromLocation}
                  onChangeText={setFromLocation}
                  placeholder={t('trump:ui.fromPlaceholder') as string}
                />
              </View>
            </View>
          )}

          <View style={localStyles.row}>
            <View style={localStyles.fieldSmall}>
              <Text style={localStyles.label}>{t('trump:ui.seatsLabel')}</Text>
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
                  {t('trump:ui.fuelContributionLabel')}
                </Text>
              </TouchableOpacity>
              {need_to_pay && (
                <View style={localStyles.inputWrapper}>
                  <TextInput
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
            <Text style={localStyles.offerButtonText}>{t('trump:ui.publishRide')}</Text>
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
                    placeholder={t('trump:ui.timePickerPlaceholder') as string}
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
                  <Text style={localStyles.checkboxLabel}>{t('trump:ui.immediateDeparture')}</Text>
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
        placeholder={mode ? (t('trump:ui.searchPlaceholder.offer') as string) : (t('trump:ui.searchPlaceholder.seek') as string)}
        filterOptions={trumpFilterOptions}
        sortOptions={trumpSortOptions}
        searchData={dummyRides}
        onSearch={handleSearch}
      />

      <FormHeader />

      {mode ? (
        <ScrollContainer
          style={localStyles.container}
          contentStyle={localStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>{t('trump:ui.yourHistoryTitle')}</Text>
            <View style={localStyles.recentRidesContainer}>
              {(recentRides.length > 0 ? recentRides : dummyRecentRides).map((ride, idx) => (
                <View key={`recent-${ride.id ?? idx}`} style={localStyles.recentRideCardWrapper}>
                  {renderRecentRideCard({ item: ride })}
                </View>
              ))}
            </View>
          </View>

          {/* Footer stats */}
          {(() => {
            const totalRides = filteredRides.length || allRides.length;
            const freeRides = (filteredRides.length ? filteredRides : allRides).filter((r: any) => (r.price ?? 0) === 0).length;
            const totalGroupMembers = dummyGroups.reduce((s, g) => s + (g.members || 0), 0);
            return (
                <DonationStatsFooter
                  stats={[
                    { label: t('trump:stats.availableRides'), value: totalRides, icon: 'car-outline' },
                    { label: t('trump:stats.noCost'), value: freeRides, icon: 'pricetag-outline' },
                    { label: t('trump:stats.groupMembers'), value: totalGroupMembers, icon: 'people-outline' },
                  ]}
                />
            );
          })()}
        </ScrollContainer>
      ) : (
        // Beneficiary (seeker) mode - two independent vertical scroll sections
          <View style={[localStyles.container, localStyles.noOuterScrollContainer]}> 
            <View style={localStyles.sectionsContainer}>
            {/* Rides section */}
            <View style={localStyles.sectionWithScroller}>
              <Text style={localStyles.sectionTitle}>
                {searchQuery || selectedFilters.length > 0 ? t('trump:ui.ridesAvailableTitle') : t('trump:ui.ridesRecommendedTitle')}
              </Text>
              <ScrollView
                style={localStyles.innerScroll}
                contentContainerStyle={localStyles.ridesGridContainer}
                showsVerticalScrollIndicator
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                 {filteredRides.map((ride, idx) => (
                  <View key={`ride-${ride.id ?? idx}`} style={localStyles.rideCardWrapper}>
                    {renderRideCard({ item: ride })}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Groups section */}
            <View style={localStyles.sectionWithScroller}>
              <Text style={localStyles.sectionTitle}>{t('trump:ui.groupsTitle')}</Text>
              <ScrollView
                style={localStyles.innerScroll}
                contentContainerStyle={localStyles.groupsContainer}
                showsVerticalScrollIndicator
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                <View style={localStyles.groupsTwoCols}>
                  <View style={localStyles.groupColumn}>
                    <Text style={localStyles.groupColumnTitle}>{t('trump:groups.whatsapp')}</Text>
                     {dummyGroups
                      .filter(g => g.type === 'whatsapp')
                      .filter(g => !searchQuery || (g.name?.includes(searchQuery) ?? false))
                      .map((group) => (
                         <View style={localStyles.groupLinkWrapper}>
                          {renderGroupCard({ item: group })}
                        </View>
                      ))}
                  </View>
                  <View style={localStyles.groupColumn}>
                    <Text style={localStyles.groupColumnTitle}>{t('trump:groups.facebook')}</Text>
                     {dummyGroups
                      .filter(g => g.type === 'facebook')
                      .filter(g => !searchQuery || (g.name?.includes(searchQuery) ?? false))
                      .map((group) => (
                         <View style={localStyles.groupLinkWrapper}>
                          {renderGroupCard({ item: group })}
                        </View>
                      ))}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
          {/* Footer stats */}
          {(() => {
          const totalRides = filteredRides.length || allRides.length;
          const freeRides = (filteredRides.length ? filteredRides : allRides).filter((r: any) => (r.price ?? 0) === 0).length;
          const totalGroupMembers = dummyGroups.reduce((s, g) => s + (g.members || 0), 0);
          return (
              <DonationStatsFooter
                stats={[
                  { label: t('trump:stats.availableRides'), value: totalRides, icon: 'car-outline' },
                  { label: t('trump:stats.noCost'), value: freeRides, icon: 'pricetag-outline' },
                  { label: t('trump:stats.groupMembers'), value: totalGroupMembers, icon: 'people-outline' },
                ]}
              />
          );
          })()}
        </View>
      )}
    </SafeAreaView>
  );
}

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
      borderBottomWidth: 0,
    },
    groupButton: {
      backgroundColor: colors.moneyCardBackground,
      borderWidth: 1,
      borderColor: colors.moneyFormBorder,
      borderRadius: 10,
      padding: 10,
    },
    groupButtonHeader: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    groupButtonTitle: {
      fontSize: FontSizes.body,
      color: colors.textPrimary,
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
      marginLeft: 8,
    },
    groupButtonPill: {
      borderWidth: 1,
      borderColor: colors.headerBorder,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
      color: colors.textSecondary,
      fontSize: FontSizes.caption,
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

