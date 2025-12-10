import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import HeaderComp from '../components/HeaderComp';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { db } from '../utils/databaseService';
import { useUser } from '../stores/userStore';
import ScrollContainer from '../components/ScrollContainer';
import AddLinkComponent from '../components/AddLinkComponent';

// New Modular Components
import RideCard from '../components/rides/RideCard';
import RideHistoryCard from '../components/rides/RideHistoryCard';
import RideOfferForm from '../components/rides/RideOfferForm';

export default function TrumpScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  console.log('🚗 TrumpScreen - Refactored Component Rendered');

  const [mode, setMode] = useState(true); // true = Offer Mode (Driver), false = Search Mode (Passenger)
  const { t } = useTranslation(['donations', 'common', 'trump', 'search']);

  // === Shared State ===
  const { selectedUser } = useUser();
  const tabBarHeight = useBottomTabBarHeight() || 0;
  const [refreshKey, setRefreshKey] = useState(0);

  // === Data State ===
  const [allRides, setAllRides] = useState<any[]>([]); // Active rides for search
  const [filteredRides, setFilteredRides] = useState<any[]>([]); // Filtered active rides
  const [recentRides, setRecentRides] = useState<any[]>([]); // User's Published History

  // === Search Mode State ===
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSorts, setSelectedSorts] = useState<string[]>([]);

  // === Offer Mode Form State ===
  const [toLocation, setToLocation] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [detectedAddress, setDetectedAddress] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);

  // Location Fetching Effect
  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      if (!useCurrentLocation) {
        setDetectedAddress("");
        return;
      }

      setIsLocating(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setDetectedAddress(t('trump:errors.locationPermissionDenied') || "Permission denied");
            setIsLocating(false);
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        console.log('📍 Reverse Geocode Result:', JSON.stringify(reverseGeocode, null, 2));

        if (isMounted && reverseGeocode && reverseGeocode.length > 0) {
          const addr = reverseGeocode[0];

          // Construct a robust address string
          // 1. Street + Number
          const streetPart = [addr.street, addr.streetNumber].filter(Boolean).join(' ');

          // 2. Fallback to 'name' if street is missing (often 'name' contains the PoI or street equivalent)
          const firstPart = streetPart || addr.name || '';

          // 3. City hierarchy: City -> Subregion -> District -> Region
          const cityPart = addr.city || addr.subregion || addr.district || addr.region || '';

          // 4. Combine
          let formattedAddress = [firstPart, cityPart].filter(Boolean).join(', ');

          // 5. Final fallback if empty
          if (!formattedAddress.trim()) {
            formattedAddress = `${t('trump:near')} ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
          }

          setDetectedAddress(formattedAddress);
        } else {
          if (isMounted) setDetectedAddress(t('trump:errors.locationFetchFailed') || "Address not found");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        if (isMounted) setDetectedAddress(t('trump:errors.locationFetchFailed') || "Location unavailable");
      } finally {
        if (isMounted) setIsLocating(false);
      }
    };

    if (useCurrentLocation) {
      getLocation();
    }

    return () => { isMounted = false; };
  }, [useCurrentLocation, t]);

  // Advanced Scheduling State
  const [immediateDeparture, setImmediateDeparture] = useState(true); // 1. Immediate?
  const [departureTime, setDepartureTime] = useState("");           // 2. If not, what time?
  const [leavingToday, setLeavingToday] = useState(true);           // 3. If time set, is it today?
  const [rideDate, setRideDate] = useState(new Date());             // 4. If not today, what date?
  const [isRecurring, setIsRecurring] = useState(false);            // 5. Recurring?
  const [recurrenceFrequency, setRecurrenceFrequency] = useState(1);
  const [recurrenceUnit, setRecurrenceUnit] = useState<'day' | 'week' | 'month' | null>(null);

  // Other Offer Details
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState("0");
  const [needToPay, setNeedToPay] = useState(false);
  const [selectedFormTags, setSelectedFormTags] = useState<string[]>([]);

  // Static Options (Now Translated Keys mapped to Labels)
  // trump:filters is now an object with keys like {noCostSharing: "...", noSmoking: "...", ...}
  const filtersObj = (t('trump:filters', { returnObjects: true }) as Record<string, string>) || {};
  const trumpFilterOptions = Object.values(filtersObj);

  const trumpSortOptions = (t('trump:sorts', { returnObjects: true }) as unknown as string[]) || [];

  // Inside render / HeaderComp prop:
  // placeholder={mode ? t('trump:ui.searchPlaceholder.offer') : t('trump:ui.searchPlaceholder.seek')}

  // --- 1. Data Loading ---
  const loadRides = useCallback(async () => {
    try {
      const uid = selectedUser?.id || 'guest';

      const [activeRides, myHistory] = await Promise.all([
        db.listRides(uid, { includePast: true }), // Active Search Data
        selectedUser?.id ? db.getUserRides(selectedUser.id, 'driver') : Promise.resolve([]) // History Data
      ]);

      // Enrich activeRides with real user names
      const enrichedRides = await Promise.all((activeRides || []).map(async (ride: any) => {
        // If driverName is missing or looks like an ID (matches driverId or is a UUID), try to fetch user
        const driverId = ride.driverId;

        // Simple heuristic: if name equals ID, or is "Driver", or missing, we want to fetch
        const needsFetch = !ride.driverName || ride.driverName === driverId || ride.driverName === 'Driver';

        if (needsFetch && driverId) {
          try {
            // Try fetching user from DB/API
            const user = await db.getUser(driverId) as any;
            if (user && user.name && user.name !== driverId) {
              return { ...ride, driverName: user.name };
            }
          } catch (e) {
            // Ignore error, keep original
          }
        }
        return ride;
      }));

      setAllRides(enrichedRides);

      // Map history to UI format if needed (or ensure backend consistency)
      const userRecent = (myHistory || []).map((r: any) => ({
        ...r,
        status: r.status || t('trump:status.published') as string,
        price: r.price || 0,
      }));
      setRecentRides(userRecent);
    } catch (e) {
      console.error("Failed to load rides", e);
      setAllRides([]);
      setRecentRides([]);
    }
  }, [selectedUser?.id, t]);

  useFocusEffect(
    useCallback(() => {
      loadRides();
    }, [loadRides, refreshKey])
  );

  // --- 2. Search Logic (Search Mode) ---
  const getFilteredRides = useCallback(() => {
    let filtered = [...allRides];

    // Filter by text
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(ride =>
        (ride.driverName?.toLowerCase()?.includes(q) ?? false) ||
        (ride.from?.toLowerCase()?.includes(q) ?? false) ||
        (ride.to?.toLowerCase()?.includes(q) ?? false) ||
        (ride.category?.toLowerCase()?.includes(q) ?? false)
      );
    }

    // Apply Filters (Search Mode Tags)
    if (selectedFilters.length > 0) {
      selectedFilters.forEach(f => {
        if (f === t('trump:filters.noCostSharing')) filtered = filtered.filter(r => (r.price ?? 0) === 0);
        if (f === t('trump:filters.noSmoking')) filtered = filtered.filter(r => r.noSmoking);
        if (f === t('trump:filters.withPets')) filtered = filtered.filter(r => r.petsAllowed);
        if (f === t('trump:filters.withKids')) filtered = filtered.filter(r => r.kidsFriendly);
      });
    }

    // Sorting
    const selectedSort = selectedSorts[0];
    if (selectedSort) {
      if (selectedSort === t('trump:sort.byPrice')) filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      else if (selectedSort === t('trump:sort.byDate')) filtered.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
      // Add other sorts as needed
    }

    return filtered;
  }, [allRides, searchQuery, selectedFilters, selectedSorts, t]);

  useEffect(() => {
    setFilteredRides(getFilteredRides());
  }, [getFilteredRides]);

  const handleSearch = (query: string, filters?: string[], sorts?: string[]) => {
    if (mode) {
      // Offer Mode: Header search input acts as "Destination"
      setToLocation(query);
    } else {
      // Search Mode: Standard search
      setSearchQuery(query);
      setSelectedFilters(filters || []);
      setSelectedSorts(sorts || []);
    }
  };

  // --- 3. Offer Logic (Create Ride) ---
  const isFormValid = (): boolean => {
    const hasDest = Boolean(toLocation && toLocation.trim().length > 0);
    // Origin validity:
    // If using current location, we MUST have a detected address.
    // Otherwise, we need a manual fromLocation.
    const hasOrigin = useCurrentLocation
      ? Boolean(detectedAddress && detectedAddress.length > 0)
      : Boolean(fromLocation && fromLocation.trim().length > 0);

    // Time validity:
    // If immediate, valid.
    // If not immediate, must have time.
    // If not immediate and not today, Date is technically always present (default), but conceptually checked.
    const hasTime = immediateDeparture || Boolean(departureTime && departureTime.trim().length > 0);

    // If recurring is selected, recurrence unit must be selected
    const hasRecurrenceUnit = !isRecurring || Boolean(recurrenceUnit);

    return Boolean(hasDest && hasOrigin && hasTime && hasRecurrenceUnit);
  };

  const handleCreateRide = async () => {
    if (!isFormValid()) {
      if (useCurrentLocation && !detectedAddress) {
        Alert.alert(t('common:errorTitle') || 'שגיאה', t('trump:errors.locationNotResolved') || 'אנא המתן לזיהוי המיקום או הזן כתובת ידנית');
      }
      return;
    }

    try {
      const uid = selectedUser?.id || 'guest';
      const rideId = `${Date.now()}`; // Or DB generated

      // --- Calculate Final Date ---
      let dateToSave: string;
      if (immediateDeparture || leavingToday) {
        dateToSave = new Date().toISOString().split('T')[0]; // Current date YYYY-MM-DD
      } else {
        dateToSave = rideDate.toISOString().split('T')[0]; // Selected date YYYY-MM-DD
      }

      // --- Calculate Final Time ---
      let timeToSave: string;
      if (immediateDeparture) {
        // Current time HH:MM
        const now = new Date();
        timeToSave = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      } else {
        timeToSave = departureTime; // Selected HH:MM
      }

      const baseRideData = {
        driverId: uid,
        driverName: selectedUser?.name || 'Me', // Fallback name
        from: useCurrentLocation ? (detectedAddress || (t('trump:currentLocation') as string)) : fromLocation,
        to: toLocation,
        date: dateToSave,
        time: timeToSave,
        seats: seats,
        price: Number(price) || 0,
        noSmoking: selectedFormTags.includes(t('trump:filters.noSmoking') as string),
        petsAllowed: selectedFormTags.includes(t('trump:filters.withPets') as string),
        kidsFriendly: selectedFormTags.includes(t('trump:filters.withKids') as string),
        isRecurring: isRecurring,
        recurrenceFrequency: recurrenceFrequency,
        recurrenceUnit: recurrenceUnit,
        status: 'published'
      };

      // Calculate base departure datetime for recurring rides
      const [hours, minutes] = timeToSave.split(':').map(Number);
      const baseDate = new Date(dateToSave);
      baseDate.setHours(hours, minutes, 0, 0);

      // Create the first ride
      await db.createRide(uid, rideId, baseRideData);

      // If recurring, create 5 future instances
      if (isRecurring && recurrenceUnit) {
        const instancesToCreate = 5;
        for (let i = 1; i <= instancesToCreate; i++) {
          const nextDate = new Date(baseDate);

          // Calculate next occurrence based on frequency and unit
          switch (recurrenceUnit) {
            case 'day':
              // Every X days
              nextDate.setDate(nextDate.getDate() + (recurrenceFrequency * i));
              break;
            case 'week':
              // Every X weeks
              nextDate.setDate(nextDate.getDate() + (recurrenceFrequency * 7 * i));
              break;
            case 'month':
              // Every X months
              nextDate.setMonth(nextDate.getMonth() + (recurrenceFrequency * i));
              break;
          }

          const nextDateStr = nextDate.toISOString().split('T')[0];
          const nextTimeStr = `${String(nextDate.getHours()).padStart(2, '0')}:${String(nextDate.getMinutes()).padStart(2, '0')}`;

          const recurringRideData = {
            ...baseRideData,
            date: nextDateStr,
            time: nextTimeStr,
          };

          const recurringRideId = `${Date.now()}_${i}`;
          await db.createRide(uid, recurringRideId, recurringRideData);
        }
      }

      // Reset Form
      setToLocation('');
      setFromLocation('');
      setDepartureTime('');
      setImmediateDeparture(true); // Default back to immediate
      setLeavingToday(true);         // Default back to today
      setRideDate(new Date());       // Reset date
      setIsRecurring(false);         // Reset recurring
      setRecurrenceFrequency(1);     // Reset recurrence frequency
      setRecurrenceUnit(null);       // Reset recurrence unit
      setUseCurrentLocation(true);
      setSeats(3);
      setPrice('0');
      setSelectedFormTags([]);

      // Also clear header search if possible via searchQuery state if it was bound
      if (mode) setSearchQuery('');

      Alert.alert(t('trump:success.title') as string, t('trump:success.ridePublished') as string);

      // Refresh Data
      setRefreshKey(prev => prev + 1);

    } catch (e) {
      console.error("Failed to create ride", e);
      Alert.alert(t('common:errorTitle') as string, t('trump:errors.saveFailed') as string);
    }
  };

  // --- 4. History Actions ---
  const handleDeleteRide = async (ride: any) => {
    Alert.alert(
      t('trump:alerts.deleteRideTitle') || 'מחיקת טרמפ',
      t('trump:alerts.deleteRideBody') || 'האם למחוק טרמפ זה?',
      [
        { text: t('common:cancel') as string, style: 'cancel' },
        {
          text: t('common:delete') as string,
          style: 'destructive',
          onPress: async () => {
            try {
              await db.updateRide(selectedUser?.id || 'guest', ride.id, { status: 'cancelled' });
              // Optimistic UI Update
              setRecentRides(prev => prev.map(r => r.id === ride.id ? { ...r, status: 'cancelled' } : r));
            } catch (e) {
              console.error('Delete ride failed', e);
              Alert.alert('Error', 'Failed to delete ride');
            }
          }
        }
      ]
    );
  };

  const handleRestoreRide = (ride: any) => {
    // Populate form with ride data
    setToLocation(ride.to || '');
    setFromLocation(ride.from || '');
    setUseCurrentLocation(ride.from === t('trump:currentLocation'));
    setDepartureTime(ride.time || '');

    // Logic for restoring specific time vs immediate is tricky, default to explicit time
    setImmediateDeparture(false);
    setSeats(ride.seats || 3);
    setPrice(String(ride.price || 0));
    // If date is in future, we set it, otherwise default to today logic or keep it old? 
    // Usually restore is for convenience, so let's default to logic that user can adjust.
    // Let's assume user wants to repost for today or same settings
    setLeavingToday(true);
    setRideDate(new Date());

    Alert.alert(t('trump:alerts.restoreDoneTitle') || 'שוחזר', 'פרטי הטרמפ הועתקו לטופס');
  };

  // --- Render Helpers ---
  const handleToggleMode = () => setMode(!mode);

  const handleSelectRide = (ride: any) => {
    // In Search Mode: Show join details/contact
    Alert.alert(
      t('trump:rideOf', { name: ride.driverName }) as string,
      `${ride.from} ➝ ${ride.to}\n⏰ ${ride.time}\n💰 ₪${ride.price}\n\n${t('trump:joinQuestion')}`,
      [
        { text: t('common:cancel') as string, style: 'cancel' },
        { text: t('trump:joinRide') as string, onPress: () => Alert.alert('בקשה נשלחה') }
      ]
    );
  };

  return (
    <SafeAreaView style={localStyles.safeArea}>
      {/* Header handles Search Mode inputs & Mode Toggle */}
      <HeaderComp
        mode={mode}
        menuOptions={['היסטוריה', 'הגדרות']}
        onToggleMode={handleToggleMode}
        onSelectMenuItem={() => { }}
        title=""
        // Dynamic placeholder based on mode
        placeholder={mode ? t('trump:ui.searchPlaceholder.offer') : t('trump:ui.searchPlaceholder.seek')}
        filterOptions={trumpFilterOptions}
        sortOptions={trumpSortOptions}
        searchData={allRides}
        onSearch={handleSearch}
        // Hide sort button in offer mode (mode === true)
        hideSortButton={mode}
      />

      {mode ? (
        // === OFFER MODE ===
        <ScrollContainer
          style={localStyles.container}
          contentStyle={localStyles.scrollContent}
          keyboardShouldPersistTaps="always"
        >
          {/* 1. Form */}
          <RideOfferForm
            destination={toLocation}
            onDestinationChange={setToLocation}

            fromLocation={fromLocation}
            onFromLocationChange={setFromLocation}
            useCurrentLocation={useCurrentLocation}
            onToggleCurrentLocation={setUseCurrentLocation}
            detectedAddress={detectedAddress}
            isLocating={isLocating}

            // Scheduling
            departureTime={departureTime}
            onDepartureTimeChange={setDepartureTime}
            immediateDeparture={immediateDeparture}
            onToggleImmediateDeparture={setImmediateDeparture}
            leavingToday={leavingToday}
            onToggleLeavingToday={setLeavingToday}
            rideDate={rideDate}
            onDateChange={setRideDate}
            isRecurring={isRecurring}
            onToggleRecurring={setIsRecurring}
            recurrenceFrequency={recurrenceFrequency}
            onRecurrenceFrequencyChange={setRecurrenceFrequency}
            recurrenceUnit={recurrenceUnit}
            onRecurrenceUnitChange={setRecurrenceUnit}

            seats={seats}
            onSeatsChange={setSeats}
            price={price}
            onPriceChange={setPrice}

            selectedTags={selectedFormTags}
            onToggleTag={(tag) => {
              setSelectedFormTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
            }}
            availableTags={trumpFilterOptions}

            onSubmit={handleCreateRide}
            isValid={isFormValid()}
            hideDestinationInput={true} // New prop to hide internal input
          />

          {/* 2. History */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>{t('trump:ui.yourRecentRides')}</Text>
            {recentRides.length === 0 ? (
              <Text style={localStyles.emptyStateText}>{t('trump:ui.noRecentRides')}</Text>
            ) : (
              recentRides.map((ride, idx) => (
                <RideHistoryCard
                  key={ride.id || idx}
                  ride={ride}
                  onDelete={handleDeleteRide}
                  onRestore={handleRestoreRide}
                />
              ))
            )}
          </View>

          {/* 3. Groups Section */}
          <View style={[localStyles.section, { marginTop: 30, paddingBottom: 20 }]}>
            <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={localStyles.sectionTitle}>{t('trump:ui.whatsappGroups')}</Text>
            </View>
            <AddLinkComponent category="trump" />
          </View>
        </ScrollContainer>
      ) : (
        // === SEARCH MODE ===
        <View style={localStyles.searchContainer}>
          <View style={localStyles.resultsHeader}>
            <Text style={localStyles.resultsTitle}>
              {searchQuery ? `${t('trump:ui.searchResultsPrefix')} "${searchQuery}"` : t('trump:ui.availableRides')} ({filteredRides.length})
            </Text>
          </View>

          <ScrollContainer
            contentStyle={localStyles.resultsList}
            showsVerticalScrollIndicator={false}
          >
            {filteredRides.length === 0 ? (
              <View style={localStyles.emptyState}>
                <Text style={localStyles.emptyStateTitle}>{t('trump:ui.noRidesFoundTitle')}</Text>
                <Text style={localStyles.emptyStateText}>{t('trump:ui.noRidesFoundBody')}</Text>
              </View>
            ) : (
              filteredRides.map((ride, idx) => (
                <RideCard
                  key={ride.id || idx}
                  ride={ride}
                  onPress={handleSelectRide}
                />
              ))
            )}

            {/* Groups Section (Restored) */}
            <View style={[localStyles.section, { marginTop: 30, paddingBottom: 40 }]}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={localStyles.sectionTitle}>
                  {t('trump:ui.whatsappGroups')}
                </Text>
              </View>
              <AddLinkComponent category="trump" />
            </View>

          </ScrollContainer>
        </View>
      )}

      {/* Footer Stats (Visible in Search Mode usually, or always) */}
      {!mode && (
        <DonationStatsFooter
          stats={[
            { label: t('trump:stats.availableRides') || 'זמינים', value: filteredRides.length, icon: 'car-outline' },
            { label: t('trump:stats.noCost') || 'חינם', value: filteredRides.filter(r => (r.price || 0) === 0).length, icon: 'pricetag-outline' },
          ]}
        />
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FontSizes.body,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 20,
  },
  // Search Mode Styles
  searchContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    // paddingBottom: 80, // Removed to allow full usage of space; footer is in-flow
  },
  resultsHeader: {
    marginBottom: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsTitle: {
    fontSize: FontSizes.body,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  resultsList: {
    paddingBottom: 20,
    flexGrow: 1, // ensure it fills space if needed
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
});
