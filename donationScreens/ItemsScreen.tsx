import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import colors from '../globals/colors';
import { fontSizes as FontSizes } from '../globals/appConstants';
import HeaderComp from '../components/HeaderComp';
import DonationStatsFooter from '../components/DonationStatsFooter';
import { Ionicons as Icon } from '@expo/vector-icons';
import { db } from '../utils/databaseService';
import { useUser } from '../context/UserContext';
import { biDiTextAlign, rowDirection, isLandscape, marginStartEnd } from '../globals/responsive';

type ItemType = 'furniture' | 'clothes' | 'general';

export interface ItemsScreenProps {
  navigation: NavigationProp<ParamListBase>;
  route?: any;
}

interface DonationItem {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  category: ItemType;
  condition?: 'new' | 'like_new' | 'used' | 'for_parts';
  location?: string;
  price?: number; // 0 means free
  images?: string[];
  rating?: number;
  timestamp: string;
  tags?: string[];
  qty?: number;
}

const itemsFilterOptionsBase = [
  'בחינם',
  'כמו חדש',
  'משומש',
  'לחלפים',
  'עם איסוף עצמי',
  'משלוח בתשלום',
  'נגישות',
];

const itemsSortOptions = [
  'אלפביתי',
  'לפי מיקום',
  'לפי תאריך',
  'לפי דירוג',
  'לפי רלוונטיות',
];

export default function ItemsScreen({ navigation, route }: ItemsScreenProps) {
  const itemType: ItemType = (route?.params?.itemType as ItemType) || 'general';
  const [mode, setMode] = useState(true); // false = מחפש, true = מציע
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSorts, setSelectedSorts] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<DonationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DonationItem[]>([]);
  const [recentMine, setRecentMine] = useState<DonationItem[]>([]);
  const titleInputRef = useRef<TextInput | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [location, setLocation] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [condition, setCondition] = useState<'new' | 'like_new' | 'used' | 'for_parts' | ''>('');
  const { selectedUser } = useUser();

  useFocusEffect(
    useCallback(() => {
      setTitle('');
      setDescription('');
      setPrice('0');
      setLocation('');
      setQty(1);
      setCondition('');
    }, [])
  );

  const filterOptions = useMemo(() => {
    const typeSpecific = itemType === 'furniture' ? ['ספות', 'ארונות', 'מיטות']
      : itemType === 'clothes' ? ['גברים', 'נשים', 'ילדים']
      : ['מטבח', 'חשמל', 'צעצועים'];
    return [...typeSpecific, ...itemsFilterOptionsBase];
  }, [itemType]);

  // Demo items removed - using only real data from backend

  useEffect(() => {
    const load = async () => {
      try {
        const uid = selectedUser?.id || 'guest';
        const my = (await db.listDonations(uid)) as DonationItem[];
        const merged: DonationItem[] = [...my];
        const forType: DonationItem[] = merged.filter(i => itemType === 'general' ? true : i.category === itemType);
        setAllItems(forType);
        setFilteredItems(forType);
        setRecentMine(my.filter(i => itemType === 'general' ? true : i.category === itemType));
      } catch (e) {
        setAllItems([]);
        setFilteredItems([]);
        setRecentMine([]);
      }
    };
    load();
  }, [selectedUser, itemType]);

  const getFilteredItems = useCallback(() => {
    let filtered = [...allItems];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.location || '').toLowerCase().includes(q) ||
        (i.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedFilters.length > 0) {
      selectedFilters.forEach(f => {
        if (f === 'בחינם') filtered = filtered.filter(i => (i.price ?? 0) === 0);
        if (f === 'כמו חדש') filtered = filtered.filter(i => i.condition === 'like_new' || i.condition === 'new');
        if (f === 'משומש') filtered = filtered.filter(i => i.condition === 'used');
        if (f === 'לחלפים') filtered = filtered.filter(i => i.condition === 'for_parts');
        // type specific
        if (['ספות','ארונות','מיטות','גברים','נשים','ילדים','מטבח','חשמל','צעצועים'].includes(f)) {
          filtered = filtered.filter(i => (i.tags || []).includes(f));
        }
      });
    }

    const selectedSort = selectedSorts[0];
    switch (selectedSort) {
      case 'אלפביתי':
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'he'));
        break;
      case 'לפי מיקום':
        filtered.sort((a, b) => (a.location || '').localeCompare((b.location || ''), 'he'));
        break;
      case 'לפי תאריך':
        filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'לפי דירוג':
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case 'לפי רלוונטיות':
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
    }

    return filtered;
  }, [allItems, searchQuery, selectedFilters, selectedSorts]);

  const handleSearch = (query: string, filters: string[] = [], sorts: string[] = [], _results?: any[]) => {
    setSearchQuery(query);
    setSelectedFilters(filters);
    setSelectedSorts(sorts);
    setFilteredItems(getFilteredItems());
  };

  const handleCreateItem = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('שגיאה', 'נא לתת כותרת לפריט');
        titleInputRef.current?.focus();
        return;
      }
      const uid = selectedUser?.id || 'guest';
      const id = `${Date.now()}`;
      const item: DonationItem = {
        id,
        ownerId: uid,
        title: title.trim(),
        description: description.trim() || undefined,
        category: itemType,
        condition: (condition || undefined) as any,
        location: location || undefined,
        price: Number(price) || 0,
        images: [],
        rating: 5,
        timestamp: new Date().toISOString(),
        tags: selectedFilters,
        qty,
      };
      await db.createDonation(uid, id, item);
      setFilteredItems(prev => [item, ...prev]);
      setRecentMine(prev => [item, ...prev]);
      setTitle('');
      setDescription('');
      setPrice('0');
      setLocation('');
      setQty(1);
      setCondition('');
      Alert.alert('הצלחה', 'הפריט פורסם ונשמר במסד הנתונים');
    } catch (e) {
      Alert.alert('שגיאה', 'נכשל לשמור את הפריט');
    }
  };

  const menuOptions = ['היסטוריית פריטים', 'הגדרות', 'עזרה', 'צור קשר'];

  const renderItemCard = ({ item }: { item: DonationItem }) => (
    <TouchableOpacity style={localStyles.itemCard} onPress={() => Alert.alert(item.title, item.description || 'אין תיאור')}>
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={localStyles.itemBadge}><Text style={localStyles.itemBadgeText}>{item.category === 'furniture' ? 'רהיטים' : item.category === 'clothes' ? 'בגדים' : 'חפצים'}</Text></View>
      </View>
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemMeta} numberOfLines={1}>{item.location || 'מיקום לא זמין'}</Text>
        <Text style={localStyles.itemPrice}>{(item.price ?? 0) === 0 ? 'בחינם' : `₪${item.price}`}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentCard = ({ item }: { item: DonationItem }) => (
    <View style={localStyles.itemCard}>
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={localStyles.itemMeta}>📅 {new Date(item.timestamp).toLocaleDateString('he-IL')}</Text>
      </View>
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemMeta} numberOfLines={1}>{item.location || 'מיקום לא זמין'}</Text>
        <TouchableOpacity style={localStyles.restoreChip} onPress={() => { setTitle(item.title); setLocation(item.location || ''); setPrice(String(item.price ?? 0)); setQty(item.qty || 1); }}>
          <Text style={localStyles.restoreChipText}>שחזר</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <HeaderComp
        mode={mode}
        menuOptions={menuOptions}
        onToggleMode={() => setMode(!mode)}
        onSelectMenuItem={(o) => Alert.alert('תפריט', `נבחר: ${o}`)}
        title=""
        placeholder={mode ? 'שם הפריט' : 'חפש פריטים זמינים'}
        filterOptions={filterOptions}
        sortOptions={itemsSortOptions}
        searchData={allItems}
        onSearch={handleSearch}
      />

      {mode ? (
        <ScrollView style={localStyles.container} contentContainerStyle={localStyles.scrollContent} keyboardShouldPersistTaps="always">
          <View style={localStyles.formContainer}>
            <View style={localStyles.row}>
              <View style={localStyles.field}>
                <Text style={localStyles.label}>כותרת הפריט</Text>
                <TextInput ref={titleInputRef} style={localStyles.input} value={title} onChangeText={setTitle} placeholder="לדוגמה: ספה 3 מושבים" />
              </View>
            </View>

            <View style={localStyles.row}>
              <View style={localStyles.field}>
                <Text style={localStyles.label}>תיאור</Text>
                <TextInput style={[localStyles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="מצב הפריט, מידות, הערות" multiline />
              </View>
            </View>

            <View style={localStyles.row}>
            <View style={localStyles.fieldSmall}>
                <Text style={localStyles.label}>מיקום</Text>
                <TextInput style={localStyles.input} value={location} onChangeText={setLocation} placeholder="לדוגמה: תל אביב" />
              </View>
              <View style={localStyles.fieldSmall}>
                <Text style={localStyles.label}>כמות</Text>
                <View style={localStyles.counterRow}>
                  <TouchableOpacity style={localStyles.counterBtn} onPress={() => setQty(Math.max(1, qty - 1))}><Text style={localStyles.counterText}>-</Text></TouchableOpacity>
                  <Text style={localStyles.counterValue}>{qty}</Text>
                  <TouchableOpacity style={localStyles.counterBtn} onPress={() => setQty(qty + 1)}><Text style={localStyles.counterText}>+</Text></TouchableOpacity>
                </View>
              </View>
            </View>

            <Text style={localStyles.labelInline}>מצב</Text>
            <View style={localStyles.row}>
              <View style={localStyles.field}>
                <View style={localStyles.tagsRow}>
                  {[
                    { key: 'new', label: 'חדש' },
                    { key: 'like_new', label: 'כמו חדש' },
                    { key: 'used', label: 'משומש' },
                    { key: 'for_parts', label: 'לחלפים' },
                  ].map(opt => (
                    <TouchableOpacity
                    key={opt.key}
                    style={[
                      localStyles.tag,
                      localStyles.tagSmall,
                      condition === (opt.key as any) && localStyles.tagSelected,
                    ]}
                    onPress={() => setCondition(opt.key as any)}
                    >
                      <Text
                        style={[
                          localStyles.tagText,
                          localStyles.tagTextSm,
                          condition === (opt.key as any) && localStyles.tagTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity style={[localStyles.offerButton, !title && { opacity: 0.5 }]} onPress={handleCreateItem} disabled={!title}>
              <Text style={localStyles.offerButtonText}>פרסם פריט</Text>
            </TouchableOpacity>
          </View>

          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>פריטים שפרסמת לאחרונה</Text>
            <View style={localStyles.recentContainer}>
              {recentMine.map((it) => (
                <View key={it.id} style={localStyles.recentItemWrapper}>{renderRecentCard({ item: it })}</View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <>
          <View style={[localStyles.container, localStyles.noOuterScrollContainer]}>
            <View style={localStyles.sectionWithScroller}>
              <Text style={localStyles.sectionTitle}>{searchQuery || selectedFilters.length > 0 ? 'פריטים זמינים' : 'פריטים מומלצים'}</Text>
              <ScrollView style={localStyles.innerScroll} contentContainerStyle={[localStyles.itemsGridContainer, isLandscape() && { paddingHorizontal: 16 }]} showsVerticalScrollIndicator nestedScrollEnabled>
                {filteredItems.map((it) => (
                  <View key={it.id} style={localStyles.itemCardWrapper}>{renderItemCard({ item: it })}</View>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={localStyles.section}>
            <DonationStatsFooter
              stats={[
                { label: 'פריטים שפורסמו', value: getFilteredItems().length, icon: 'cube-outline' },
                { label: 'פריטים בחינם', value: getFilteredItems().filter(i => (i.price ?? 0) === 0).length, icon: 'pricetag-outline' },
                { label: 'מיקומים ייחודיים', value: new Set(getFilteredItems().map(i => i.location || 'לא צויין')).size, icon: 'pin-outline' },
              ]}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundSecondary_2 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  scrollContent: { paddingBottom: 100 },
  formContainer: { padding: 5, alignItems: 'center', borderRadius: 15, marginBottom: 15 },
  row: { flexDirection: rowDirection('row-reverse'), gap: 10, width: '100%', paddingHorizontal: 8 },
  field: { flex: 1 },
  fieldSmall: { flex: 0.5 },
  label: { fontSize: FontSizes.medium, fontWeight: '600', color: colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  labelInline: { marginTop: 3, flex: 1, fontSize: FontSizes.medium, fontWeight: '600', color: colors.textPrimary, ...marginStartEnd(6, 0) },
  input: { backgroundColor: colors.moneyInputBackground, borderRadius: 10, padding: 12, fontSize: FontSizes.body, textAlign: biDiTextAlign('right'), color: colors.textPrimary, borderWidth: 1, borderColor: colors.moneyFormBorder },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  inputWithAdornment: { paddingRight: 30 },
  inputAdornment: { position: 'absolute', right: 10, color: colors.textSecondary, fontSize: FontSizes.body },
  counterRow: { flexDirection: rowDirection('row'), alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.moneyInputBackground, borderRadius: 10, borderWidth: 1, borderColor: colors.moneyFormBorder, paddingHorizontal: 8, paddingVertical: 6 },
  counterBtn: { backgroundColor: colors.moneyFormBackground, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  counterText: { fontSize: FontSizes.medium, fontWeight: 'bold', color: colors.textPrimary },
  counterValue: { fontSize: FontSizes.medium, fontWeight: 'bold', color: colors.textPrimary, minWidth: 30, textAlign: 'center' },
  tagsRow: {marginTop: 10, alignItems: 'stretch', flexDirection: rowDirection('row-reverse'), flexWrap: 'wrap', gap: 3 },
  tag: { backgroundColor: colors.moneyFormBackground, borderWidth: 1, borderColor: colors.moneyFormBorder, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  tagSmall: { paddingHorizontal: 8, marginHorizontal: "4%", paddingVertical: 4 },
  tagSelected: { backgroundColor: colors.moneyStatusBackground, borderColor: colors.moneyStatusBackground },
  tagText: { fontSize: FontSizes.small, color: colors.textPrimary },
  tagTextSm: { fontSize: FontSizes.caption },
  tagTextSelected: { color: colors.moneyStatusText, fontWeight: '600' },
  offerButton: { backgroundColor: colors.moneyButtonBackground, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  offerButtonText: { color: colors.backgroundPrimary, fontSize: FontSizes.medium, fontWeight: 'bold' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: FontSizes.body, fontWeight: 'bold', alignSelf: 'center', color: colors.textPrimary, textAlign: 'center' },
  noOuterScrollContainer: { flex: 1 },
  sectionWithScroller: { flex: 1, backgroundColor: colors.moneyFormBackground, borderRadius: 12, borderWidth: 1, borderColor: colors.moneyFormBorder, paddingVertical: 8, paddingHorizontal: 8 },
  innerScroll: { flex: 1 },
  itemsGridContainer: {},
  itemCardWrapper: { marginBottom: 8, width: '100%' },
  itemCard: { backgroundColor: colors.moneyCardBackground, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: colors.moneyFormBorder },
  itemRow: { flexDirection: rowDirection('row-reverse'), justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: FontSizes.small, fontWeight: 'bold', color: colors.textPrimary, textAlign: biDiTextAlign('right'), flex: 1, marginLeft: 6 },
  itemMeta: { fontSize: FontSizes.small, color: colors.textSecondary },
  itemPrice: { fontSize: FontSizes.small, color: colors.moneyHistoryAmount, fontWeight: '600' },
  itemBadge: { backgroundColor: colors.moneyStatusBackground, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  itemBadgeText: { fontSize: FontSizes.small, color: colors.moneyStatusText, fontWeight: 'bold' },
  recentContainer: { paddingHorizontal: 8, paddingVertical: 8 },
  recentItemWrapper: { marginBottom: 8, width: '100%' },
  restoreChip: { backgroundColor: colors.moneyFormBackground, borderWidth: 1, borderColor: colors.moneyFormBorder, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  restoreChipText: { fontSize: FontSizes.small, color: colors.textPrimary, fontWeight: '600' },
});


