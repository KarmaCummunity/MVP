import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, Image } from 'react-native';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import HeaderComp from '../components/HeaderComp';
import DonationStatsFooter from '../components/DonationStatsFooter';
import ScrollContainer from '../components/ScrollContainer';
import { Ionicons as Icon } from '@expo/vector-icons';
import { db } from '../utils/databaseService';
import { useUser } from '../stores/userStore';
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
  
  // Location fields - separate
  city?: string;
  address?: string;
  coordinates?: string;
  
  price?: number; // 0 means free
  image_base64?: string; // base64 encoded image
  rating?: number;
  timestamp: string;
  tags?: string; // comma-separated string
  qty?: number;
  delivery_method?: string;
  status?: string;
  isDeleted?: boolean;
  deletedAt?: string;
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
  const [imageUri, setImageUri] = useState<string>('');
  const [price, setPrice] = useState('0');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [condition, setCondition] = useState<'new' | 'like_new' | 'used' | 'for_parts' | ''>('');
  const { selectedUser } = useUser();

  useFocusEffect(
    useCallback(() => {
      setTitle('');
      setDescription('');
      setPrice('0');
      setCity('');
      setAddress('');
      setQty(1);
      setCondition('');
      setImageUri('');
    }, [])
  );

  // Convert image URI to base64 with compression
  const convertImageToBase64 = async (uri: string): Promise<string | null> => {
    try {
      console.log('🖼️ Converting and compressing image...');
      
      // Fetch the image
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create canvas to compress the image
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          
          // Check size and compress if needed
          const sizeInMB = (base64.length * 0.75) / (1024 * 1024); // Approximate size
          console.log(`📏 Image size: ${sizeInMB.toFixed(2)} MB`);
          
          if (sizeInMB > 5) {
            console.warn('⚠️ Image too large, it may fail to upload. Consider using a smaller image.');
            Alert.alert(
              'תמונה גדולה',
              'התמונה שבחרת גדולה מאוד. מומלץ להשתמש בתמונה קטנה יותר.',
              [
                { text: 'המשך בכל זאת', onPress: () => resolve(base64) },
                { text: 'בטל', onPress: () => resolve(null), style: 'cancel' }
              ]
            );
          } else {
            console.log('✅ Image converted to base64');
            resolve(base64);
          }
        };
        reader.onerror = (error) => {
          console.error('❌ Error converting image:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error in convertImageToBase64:', error);
      Alert.alert('שגיאה', 'לא הצלחנו להמיר את התמונה');
      return null;
    }
  };

  const filterOptions = useMemo(() => {
    const typeSpecific = itemType === 'furniture' ? ['ספות', 'ארונות', 'מיטות']
      : itemType === 'clothes' ? ['גברים', 'נשים', 'ילדים']
      : ['מטבח', 'חשמל', 'צעצועים'];
    return [...typeSpecific, ...itemsFilterOptionsBase];
  }, [itemType]);

  const dummyItems: DonationItem[] = useMemo(() => [], []);

  // פונקציה נפרדת לטעינת פריטים שנוכל לקרוא לה גם אחרי שמירה
  const loadItems = async () => {
    try {
      console.log('📥 טוען פריטים מהשרת...');
      const uid = selectedUser?.id || 'guest';
      
      // קריאה מה-API החדש
      const serverItems = await db.getDedicatedItemsByOwner(uid);
      
      console.log('✅ התקבלו פריטים מהשרת:', serverItems.length || 0);
      
      // המרה לפורמט התצוגה
      const displayItems: DonationItem[] = (serverItems || []).map((item: any) => ({
        id: item.id,
        ownerId: item.owner_id,
        title: item.title,
        description: item.description,
        category: item.category,
        condition: item.condition,
        city: item.city,
        address: item.address,
        coordinates: item.coordinates,
        price: item.price,
        image_base64: item.image_base64,
        rating: item.rating,
        timestamp: item.created_at,
        tags: item.tags,
        qty: item.quantity,
        delivery_method: item.delivery_method,
        status: item.status,
        isDeleted: item.is_deleted,
        deletedAt: item.deleted_at,
      }));
      
      // סינון לפי קטגוריה
      const forType = displayItems.filter(i =>
        itemType === 'general' ? true : i.category === itemType
      );
      
      setAllItems(forType);
      setFilteredItems(forType);
      setRecentMine(forType);
      
      console.log('✅ פריטים טעונים בהצלחה:', forType.length);
      
    } catch (error) {
      console.error('❌ שגיאה בטעינת פריטים:', error);
      Alert.alert('שגיאה', 'לא הצלחנו לטעון את הפריטים');
      setAllItems([]);
      setFilteredItems([]);
      setRecentMine([]);
    }
  };

  useEffect(() => {
    loadItems();
  }, [selectedUser, itemType]);

  const getFilteredItems = useCallback(() => {
    let filtered = [...allItems];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.city || '').toLowerCase().includes(q) ||
        (i.address || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        (i.tags || '').toLowerCase().includes(q)
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
        filtered.sort((a, b) => (a.city || '').localeCompare((b.city || ''), 'he'));
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

  // Update filtered items whenever search/filter/sort changes
  useEffect(() => {
    const filtered = getFilteredItems();
    setFilteredItems(filtered);
  }, [getFilteredItems]);

  const handleSearch = (query: string, filters: string[] = [], sorts: string[] = [], _results?: any[]) => {
    setSearchQuery(query);
    setSelectedFilters(filters);
    setSelectedSorts(sorts);
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedFilters([]);
    setSelectedSorts([]);
  };

  const pickImage = async () => {
    try {
      // בקשת הרשאה
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('אין הרשאה', 'נדרשת הרשאה לגשת לגלריה');
        return;
      }

      // פתיחת הגלריה
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        console.log('✅ תמונה נבחרה:', result.assets[0].uri);
      }
    } catch (e) {
      console.error('❌ שגיאה בבחירת תמונה:', e);
      Alert.alert('שגיאה', 'לא הצלחנו לטעון את התמונה');
    }
  };

  const handleDeleteItem = async (item: DonationItem) => {
    console.warn('🗑️ מחיקת פריט - Soft Delete', { itemId: item.id, title: item.title });
    
    Alert.alert(
      '🗑️ מחיקת פריט',
      `האם אתה בטוח שברצונך למחוק את:\n"${item.title}"?`,
      [
        { 
          text: 'ביטול',
          style: 'cancel'
        },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ מוחק פריט:', item.id);
              
              // Soft Delete דרך ה-API החדש
              await db.deleteDedicatedItem(item.id);
              
              console.log('✅ פריט נמחק בשרת');
              
              // הסרה מה-UI
              setAllItems(prev => prev.filter(i => i.id !== item.id));
              setFilteredItems(prev => prev.filter(i => i.id !== item.id));
              setRecentMine(prev => prev.filter(i => i.id !== item.id));
              
              Alert.alert('✅ הצלחה', 'הפריט נמחק!');
            } catch (error: any) {
              console.error('❌ שגיאה במחיקה:', error);
              Alert.alert('שגיאה', `לא הצלחנו למחוק את הפריט:\n${error.message || 'שגיאה לא ידועה'}`);
            }
          }
        }
      ]
    );
  };

  const handleCreateItem = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('שגיאה', 'נא למלא כותרת');
        titleInputRef.current?.focus();
        return;
      }
      
      console.log('🔵 מתחיל תהליך שמירת פריט...');
      
      const uid = selectedUser?.id || 'guest';
      const id = `${Date.now()}`;
      
      // המרת תמונה ל-base64
      let imageBase64 = null;
      if (imageUri) {
        console.log('🖼️ ממיר תמונה ל-base64...');
        imageBase64 = await convertImageToBase64(imageUri);
        if (imageBase64) {
          console.log('✅ התמונה הומרה בהצלחה (גודל:', imageBase64.length, 'תווים)');
        }
      }
      
      // הכנת אובייקט עם כל השדות הנפרדים
      const itemData = {
        id,
        owner_id: uid,
        title: title.trim(),
        description: description.trim() || '',
        category: itemType,
        condition: condition || 'used',
        
        // שדות מיקום נפרדים
        city: city.trim() || '',
        address: address.trim() || '',
        coordinates: '',
        
        price: Number(price) || 0,
        image_base64: imageBase64,
        rating: 0,
        tags: selectedFilters.join(','),  // המרה ל-string מופרד בפסיקים
        quantity: qty || 1,
        delivery_method: 'pickup',
        status: 'available',
      };
      
      console.log('📤 שולח לשרת:', {
        id: itemData.id,
        title: itemData.title,
        city: itemData.city,
        address: itemData.address,
        hasImage: !!itemData.image_base64,
        tagsCount: selectedFilters.length,
      });
      
      // שליחה לשרת דרך API החדש
      const savedItem = await db.createDedicatedItem(itemData);
      
      console.log('✅ נשמר בהצלחה בשרת:', savedItem);
      
      // טעינה מחדש של כל הפריטים מהשרת כדי להבטיח שהמידע מעודכן
      console.log('🔄 טוען מחדש את הפריטים מהשרת...');
      await loadItems();
      
      // איפוס כל השדות
      setTitle('');
      setDescription('');
      setPrice('0');
      setCity('');
      setAddress('');
      setQty(1);
      setCondition('');
      setImageUri('');
      setSelectedFilters([]);
      
      Alert.alert(
        '✅ נשמר בהצלחה!',
        `הפריט "${savedItem.title}" נשמר במערכת`,
        [{ text: 'אישור', style: 'default' }]
      );
      
    } catch (error: any) {
      console.error('❌ שגיאה בשמירת פריט:', error);
      Alert.alert(
        '❌ שגיאה',
        `לא הצלחנו לשמור את הפריט:\n${error.message || 'שגיאה לא ידועה'}`,
        [{ text: 'סגור', style: 'cancel' }]
      );
    }
  };

  const menuOptions = ['היסטוריית פריטים', 'הגדרות', 'עזרה', 'צור קשר'];

  const renderItemCard = ({ item }: { item: DonationItem }) => (
    <TouchableOpacity style={localStyles.itemCard} onPress={() => Alert.alert(item.title, item.description || 'אין תיאור')}>
      {/* תמונה base64 */}
      {item.image_base64 && (
        <Image 
          source={{ uri: item.image_base64 }} 
          style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: 8 }} 
          resizeMode="cover"
        />
      )}
      
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={localStyles.itemBadge}>
          <Text style={localStyles.itemBadgeText}>
            {item.category === 'furniture' ? 'רהיטים' : item.category === 'clothes' ? 'בגדים' : 'חפצים'}
          </Text>
        </View>
      </View>
      
      {/* מיקום מפוצל */}
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemMeta} numberOfLines={1}>
          📍 {item.city || 'מיקום לא זמין'}{item.address ? `, ${item.address}` : ''}
        </Text>
        <Text style={localStyles.itemPrice}>{(item.price ?? 0) === 0 ? 'בחינם' : `₪${item.price}`}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentCard = ({ item }: { item: DonationItem }) => (
    <View style={localStyles.itemCard}>
      {/* תמונה base64 */}
      {item.image_base64 && (
        <Image 
          source={{ uri: item.image_base64 }} 
          style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: 8 }} 
          resizeMode="cover"
        />
      )}
      
      <View style={localStyles.itemRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={localStyles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity 
            onPress={() => handleDeleteItem(item)}
            style={localStyles.deleteButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="trash-outline" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>
        <Text style={localStyles.itemMeta}>📅 {new Date(item.timestamp).toLocaleDateString('he-IL')}</Text>
      </View>
      
      {/* שורה נוספת עם מצב + כמות */}
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemMeta}>
          {item.condition === 'new' ? '🆕 חדש' : 
           item.condition === 'like_new' ? '✨ כמו חדש' :
           item.condition === 'used' ? '📦 משומש' : '🔧 לחלפים'}
          {' • '}
          כמות: {item.qty || 1}
        </Text>
      </View>
      
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemMeta} numberOfLines={1}>
          📍 {item.city || 'מיקום לא זמין'}{item.address ? `, ${item.address}` : ''}
        </Text>
        <TouchableOpacity 
          style={localStyles.restoreChip} 
          onPress={() => { 
            setTitle(item.title); 
            setDescription(item.description || '');
            setLocation(item.location || ''); 
            setPrice(String(item.price ?? 0)); 
            setQty(item.qty || 1);
            setCondition(item.condition || '');
            setImageUri(item.images?.[0] || '');
          }}
        >
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
        <ScrollContainer
          style={localStyles.container}
          contentStyle={localStyles.scrollContent}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
        >
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

            {/* Location fields - split into city and address */}
            <View style={localStyles.row}>
              <View style={localStyles.fieldSmall}>
                <Text style={localStyles.label}>עיר</Text>
                <TextInput 
                  style={localStyles.input} 
                  value={city} 
                  onChangeText={setCity} 
                  placeholder="תל אביב" 
                />
              </View>
              <View style={localStyles.fieldSmall}>
                <Text style={localStyles.label}>כתובת</Text>
                <TextInput 
                  style={localStyles.input} 
                  value={address} 
                  onChangeText={setAddress} 
                  placeholder="רחוב 123" 
                />
              </View>
            </View>

            {/* Quantity field */}
            <View style={localStyles.row}>
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

            {/* כפתור העלאת תמונה */}
            <View style={localStyles.imageSection}>
              <Text style={localStyles.labelInline}>תמונה (אופציונלי)</Text>
              <TouchableOpacity 
                style={localStyles.imagePickerButton} 
                onPress={pickImage}
              >
                <Icon name="image-outline" size={24} color={colors.primary} />
                <Text style={localStyles.imagePickerText}>
                  {imageUri ? '✅ תמונה נבחרה' : 'בחר תמונה מהגלריה'}
                </Text>
              </TouchableOpacity>
              
              {/* תצוגה מקדימה של התמונה */}
              {imageUri && (
                <View style={localStyles.imagePreview}>
                  <Image source={{ uri: imageUri }} style={localStyles.previewImage} />
                  <View style={localStyles.imageInfo}>
                    <Text style={localStyles.imageInfoText}>✅ תמונה מוכנה</Text>
                    <Text style={localStyles.imageInfoSubtext}>80×80 פיקסלים</Text>
                  </View>
                  <TouchableOpacity 
                    style={localStyles.removeImageButton}
                    onPress={() => setImageUri('')}
                  >
                    <Icon name="close-circle" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
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
        </ScrollContainer>
      ) : (
        <>
          <View style={[localStyles.container, localStyles.noOuterScrollContainer]}>
            <View style={localStyles.sectionWithScroller}>
              <View style={localStyles.headerRow}>
                <Text style={localStyles.sectionTitle}>{searchQuery || selectedFilters.length > 0 ? 'פריטים זמינים' : 'פריטים מומלצים'}</Text>
                {(searchQuery || selectedFilters.length > 0 || selectedSorts.length > 0) && (
                  <TouchableOpacity style={localStyles.clearButton} onPress={handleClearAll}>
                    <Text style={localStyles.clearButtonText}>נקה הכל</Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView style={localStyles.innerScroll} contentContainerStyle={[localStyles.itemsGridContainer, isLandscape() && { paddingHorizontal: 16 }]} showsVerticalScrollIndicator nestedScrollEnabled>
                {filteredItems.length === 0 ? (
                  <View style={localStyles.emptyState}>
                    <Icon name="search-outline" size={48} color={colors.textSecondary} />
                    <Text style={localStyles.emptyStateTitle}>לא נמצאו פריטים</Text>
                    <Text style={localStyles.emptyStateText}>נסה לשנות את הפילטרים או החיפוש</Text>
                    {(searchQuery || selectedFilters.length > 0 || selectedSorts.length > 0) && (
                      <TouchableOpacity style={localStyles.emptyStateClearButton} onPress={handleClearAll}>
                        <Text style={localStyles.emptyStateClearButtonText}>נקה הכל</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredItems.map((it) => (
                    <View key={it.id} style={localStyles.itemCardWrapper}>{renderItemCard({ item: it })}</View>
                  ))
                )}
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120, flexGrow: 1 },
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
  headerRow: { flexDirection: rowDirection('row-reverse'), justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  clearButton: { backgroundColor: colors.moneyFormBackground, borderWidth: 1, borderColor: colors.moneyFormBorder, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  clearButtonText: { fontSize: FontSizes.small, color: colors.textPrimary, fontWeight: '600' },
  noOuterScrollContainer: { flex: 1 },
  sectionWithScroller: { flex: 1, backgroundColor: colors.moneyFormBackground, borderRadius: 12, borderWidth: 1, borderColor: colors.moneyFormBorder, paddingVertical: 8, paddingHorizontal: 8 },
  innerScroll: { flex: 1 },
  itemsGridContainer: {},
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyStateTitle: { fontSize: FontSizes.body, fontWeight: 'bold', color: colors.textPrimary, marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: FontSizes.small, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  emptyStateClearButton: { backgroundColor: colors.moneyButtonBackground, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  emptyStateClearButtonText: { fontSize: FontSizes.small, color: colors.backgroundPrimary, fontWeight: '600' },
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
  deleteButton: { 
    padding: 6, 
    marginLeft: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  itemImageContainer: {
    padding: 4,
    marginBottom: 4,
  },
  itemImageIndicator: {
    fontSize: FontSizes.small,
    color: colors.primary,
    fontWeight: '600',
  },
  imageSection: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 4,
  },
  imagePickerText: {
    color: colors.primary,
    fontSize: FontSizes.medium,
    fontWeight: '600',
  },
  imagePreview: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    marginLeft: 'auto',
    backgroundColor: colors.errorLight,
    borderRadius: 20,
    padding: 4,
  },
  imageInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  imageInfoText: {
    fontSize: FontSizes.medium,
    color: colors.success,
    fontWeight: '600',
  },
  imageInfoSubtext: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
});


