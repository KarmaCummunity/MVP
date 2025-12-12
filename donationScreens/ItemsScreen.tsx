import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, Image, Modal, FlatList } from 'react-native';
import { NavigationProp, ParamListBase, useFocusEffect, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import HeaderComp from '../components/HeaderComp';
import DonationStatsFooter from '../components/DonationStatsFooter';
import ScrollContainer from '../components/ScrollContainer';
import ItemDetailsModal from '../components/ItemDetailsModal';
import AddLinkComponent from '../components/AddLinkComponent';
import { Ionicons as Icon } from '@expo/vector-icons';
import { db } from '../utils/databaseService';
import { useUser } from '../stores/userStore';
import { biDiTextAlign, rowDirection, isLandscape, marginStartEnd } from '../globals/responsive';
import { getCategoryLabel } from '../utils/itemCategoryUtils';

type ItemType = 'furniture' | 'clothes' | 'general' | 'books' | 'dry_food' | 'games' | 'electronics' | 'toys' | 'sports' | 'art' | 'kitchen' | 'bathroom' | 'garden' | 'tools' | 'baby' | 'pet' | 'other';

// רשימת קטגוריות לפרסום פריטים
const ITEM_CATEGORIES = [
  { id: 'clothes', label: 'בגדים', icon: 'shirt-outline' },
  { id: 'books', label: 'ספרים', icon: 'library-outline' },
  { id: 'furniture', label: 'רהיטים', icon: 'bed-outline' },
  { id: 'dry_food', label: 'אוכל יבש', icon: 'restaurant-outline' },
  { id: 'games', label: 'משחקים', icon: 'game-controller-outline' },
  { id: 'electronics', label: 'חשמל ואלקטרוניקה', icon: 'phone-portrait-outline' },
  { id: 'toys', label: 'צעצועים', icon: 'happy-outline' },
  { id: 'sports', label: 'ספורט', icon: 'football-outline' },
  { id: 'art', label: 'אמנות', icon: 'color-palette-outline' },
  { id: 'kitchen', label: 'מטבח', icon: 'cafe-outline' },
  { id: 'bathroom', label: 'אמבטיה', icon: 'water-outline' },
  { id: 'garden', label: 'גינה', icon: 'leaf-outline' },
  { id: 'tools', label: 'כלים', icon: 'construct-outline' },
  { id: 'baby', label: 'תינוקות', icon: 'baby-outline' },
  { id: 'pet', label: 'חיות מחמד', icon: 'paw-outline' },
  { id: 'other', label: 'אחר', icon: 'cube-outline' },
] as const;

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
  const routeParams = route?.params as { mode?: string } | undefined;
  
  // Get initial mode from URL (deep link) or default to search mode (מחפש)
  // mode: false = מציע, true = מחפש
  // URL mode: 'offer' = false, 'search' = true
  // Default is search mode (true)
  const initialMode = routeParams?.mode === 'offer' ? false : true;
  const [mode, setMode] = useState(initialMode);

  // Update mode when route params change (e.g., from deep link)
  useEffect(() => {
    if (routeParams?.mode && routeParams.mode !== 'undefined' && routeParams.mode !== 'null') {
      const newMode = routeParams.mode === 'search';
      if (newMode !== mode) {
        setMode(newMode);
      }
    }
  }, [routeParams?.mode]);

  // Update URL when mode changes (toggle button pressed) or when screen loads without mode
  useEffect(() => {
    const newMode = mode ? 'search' : 'offer';
    const currentMode = routeParams?.mode;
    
    // If no mode in URL, set it to search (default)
    if (!currentMode || currentMode === 'undefined' || currentMode === 'null') {
      // Set initial mode to search in URL
      (navigation as any).setParams({ mode: 'search' });
      return;
    }
    
    // Only update URL if mode actually changed
    if (newMode !== currentMode) {
      (navigation as any).setParams({ mode: newMode });
    }
  }, [mode, navigation, routeParams?.mode]);
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
  const [selectedCategory, setSelectedCategory] = useState<ItemType>('general');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { selectedUser } = useUser();
  const [selectedItem, setSelectedItem] = useState<DonationItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

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
      setSelectedCategory('general');
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:217',message:'loadItems entry',data:{mode,itemType,currentUserId:selectedUser?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.log('📥 טוען פריטים מהשרת...', { mode, itemType });
      const uid = selectedUser?.id || 'guest';
      
      let serverItems: any[] = [];
      
      if (mode) {
        // מצב "מחפש" - טוען את כל הפריטים הזמינים מכל המשתמשים (ללא סינון קטגוריה)
        console.log('🔍 מצב מחפש - טוען את כל הפריטים הזמינים');
        const { USE_BACKEND, API_BASE_URL } = await import('../utils/dbConfig');
        if (USE_BACKEND && API_BASE_URL) {
          const axios = (await import('axios')).default;
          // במצב "מחפש", לא נסנן לפי קטגוריה - נטען את כל הפריטים הזמינים
          // הסינון לפי קטגוריה ייעשה רק ב-UI אחרי הטעינה
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:236',message:'Before API call',data:{apiUrl:`${API_BASE_URL}/api/items-delivery/search`,params:{status:'available',limit:100}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          const response = await axios.get(`${API_BASE_URL}/api/items-delivery/search`, {
            params: {
              status: 'available',
              // לא נשלח category במצב "מחפש" כדי לקבל את כל הפריטים
              limit: 100, // Limit to 100 items for performance
            }
          });
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:248',message:'API response received',data:{success:response.data?.success,dataLength:response.data?.data?.length,firstItemOwnerId:response.data?.data?.[0]?.owner_id,firstItemOwnerIdAlt:response.data?.data?.[0]?.ownerId,allOwnerIds:response.data?.data?.map((i:any)=>i.owner_id||i.ownerId).slice(0,5),uniqueOwnerIdsCount:new Set(response.data?.data?.map((i:any)=>i.owner_id||i.ownerId)).size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          console.log('🔍 API Response:', {
            success: response.data?.success,
            dataLength: response.data?.data?.length,
            data: response.data?.data?.slice(0, 3), // First 3 items for debugging
          });
          if (response.data?.success && Array.isArray(response.data.data)) {
            serverItems = response.data.data;
            console.log('✅ טעינת פריטים מה-API הצליחה:', serverItems.length, 'פריטים');
            // לוג של ownerIds כדי לראות אם יש פריטים ממשתמשים שונים
            const ownerIds = [...new Set(serverItems.map((item: any) => item.owner_id || item.ownerId))];
            console.log('👥 משתמשים שונים בפריטים:', ownerIds.length, ownerIds);
          } else {
            console.warn('⚠️ API response לא תקין:', response.data);
          }
        } else {
          // Fallback: אם אין backend, נטען רק את הפריטים של המשתמש
          console.warn('⚠️ אין backend - טוען רק פריטים של המשתמש');
          serverItems = await db.getDedicatedItemsByOwner(uid);
        }
      } else {
        // מצב "מציע" - טוען רק את הפריטים של המשתמש הנוכחי
        console.log('🔵 מצב מציע - טוען פריטים של המשתמש:', uid);
        serverItems = await db.getDedicatedItemsByOwner(uid);
      }
      
      console.log('✅ התקבלו פריטים מהשרת:', serverItems.length || 0);
      console.log('📋 דוגמה לפריטים מהשרת:', serverItems.slice(0, 2).map((item: any) => ({
        id: item.id,
        title: item.title,
        owner_id: item.owner_id || item.ownerId,
        category: item.category,
      })));
      
      // המרה לפורמט התצוגה + סינון פריטים שנמחקו
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:272',message:'Before data transformation',data:{serverItemsCount:serverItems.length,sampleItem:serverItems[0]?{id:serverItems[0].id,owner_id:serverItems[0].owner_id,ownerId:serverItems[0].ownerId,title:serverItems[0].title}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const displayItems: DonationItem[] = (serverItems || [])
        .filter((item: any) => {
          // נסנן פריטים שנמחקו
          const isDeleted = item.is_deleted || item.isDeleted;
          if (isDeleted) {
            console.log('🗑️ פריט נמחק, מסונן:', item.id, item.title);
            return false;
          }
          return true;
        })
        .map((item: any) => ({
          id: item.id,
          ownerId: item.owner_id || item.ownerId,
          title: item.title,
          description: item.description,
          category: item.category,
          condition: item.condition,
          city: item.city || (item.location && typeof item.location === 'object' ? item.location.city : null),
          address: item.address || (item.location && typeof item.location === 'object' ? item.location.address : null),
          coordinates: item.coordinates || (item.location && typeof item.location === 'object' ? item.location.coordinates : null),
          price: item.price,
          image_base64: item.image_base64,
          rating: item.rating,
          timestamp: item.created_at || item.timestamp,
          tags: item.tags,
          qty: item.quantity || item.qty,
          delivery_method: item.delivery_method,
          status: item.status,
          isDeleted: item.is_deleted || item.isDeleted,
          deletedAt: item.deleted_at || item.deletedAt,
        }));
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:303',message:'After data transformation',data:{displayItemsCount:displayItems.length,ownerIdsInDisplay:displayItems.map(i=>i.ownerId).slice(0,5),uniqueOwnerIds:Array.from(new Set(displayItems.map(i=>i.ownerId))).length,currentUserId:uid,itemsFromOtherUsers:displayItems.filter(i=>i.ownerId!==uid).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // סינון לפי קטגוריה
      // במצב "מחפש", נציג את כל הפריטים ללא סינון קטגוריה
      // במצב "מציע", נסנן לפי קטגוריה רק אם itemType לא 'general'
      const forType = !mode 
        ? displayItems.filter(i => itemType === 'general' ? true : i.category === itemType)
        : displayItems; // במצב "מחפש", נציג את כל הפריטים
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:308',message:'After category filter',data:{mode,displayItemsCount:displayItems.length,forTypeCount:forType.length,ownerIds:Array.from(new Set(forType.map(i=>i.ownerId))),currentUserId:uid,itemsFromOtherUsers:forType.filter(i=>i.ownerId!==uid).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      console.log('📊 אחרי סינון:', {
        mode,
        displayItemsCount: displayItems.length,
        forTypeCount: forType.length,
        ownerIds: [...new Set(forType.map(i => i.ownerId))],
        currentUserId: uid,
        itemsFromOtherUsers: forType.filter(i => i.ownerId !== uid).length,
      });
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:320',message:'Before setState',data:{forTypeCount:forType.length,forTypeOwnerIds:Array.from(new Set(forType.map(i=>i.ownerId))),itemsFromOtherUsers:forType.filter(i=>i.ownerId!==uid).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setAllItems(forType);
      setFilteredItems(forType);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:323',message:'After setState',data:{forTypeCount:forType.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // recentMine - רק במצב "מציע" נשמור את הפריטים של המשתמש
      if (!mode) {
        setRecentMine(forType);
      } else {
        // במצב "מחפש", recentMine יהיה רק הפריטים של המשתמש הנוכחי
        const myItems = forType.filter(i => i.ownerId === uid);
        setRecentMine(myItems);
      }
      
      console.log('✅ פריטים טעונים בהצלחה:', forType.length, { mode, myItems: !mode ? forType.length : forType.filter(i => i.ownerId === uid).length });
      
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
  }, [selectedUser, itemType, mode]);

  const getFilteredItems = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:372',message:'getFilteredItems entry',data:{allItemsCount:allItems.length,searchQuery,selectedFiltersCount:selectedFilters.length,selectedSortsCount:selectedSorts.length,ownerIds:Array.from(new Set(allItems.map(i=>i.ownerId))),currentUserId:selectedUser?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:383',message:'After search filter',data:{filteredCount:filtered.length,ownerIds:Array.from(new Set(filtered.map(i=>i.ownerId))),itemsFromOtherUsers:filtered.filter(i=>i.ownerId!==selectedUser?.id).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }

    if (selectedFilters.length > 0) {
      selectedFilters.forEach(f => {
        if (f === 'בחינם') filtered = filtered.filter(i => (i.price ?? 0) === 0);
        if (f === 'כמו חדש') filtered = filtered.filter(i => i.condition === 'like_new' || i.condition === 'new');
        if (f === 'משומש') filtered = filtered.filter(i => i.condition === 'used');
        if (f === 'לחלפים') filtered = filtered.filter(i => i.condition === 'for_parts');
        // type specific
        if (['ספות','ארונות','מיטות','גברים','נשים','ילדים','מטבח','חשמל','צעצועים'].includes(f)) {
          filtered = filtered.filter(item => {
            const tagsArray = typeof item.tags === 'string' ? item.tags.split(',') : (item.tags || []);
            return tagsArray.includes(f);
          });
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:406',message:'Updating filteredItems state',data:{filteredCount:filtered.length,ownerIds:Array.from(new Set(filtered.map(i=>i.ownerId))),itemsFromOtherUsers:filtered.filter(i=>i.ownerId!==selectedUser?.id).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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
        category: selectedCategory || itemType,
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
      setSelectedCategory('general');
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

  const handleItemPress = (item: DonationItem) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleCloseModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
  };

  const renderItemCard = ({ item }: { item: DonationItem }) => (
    <TouchableOpacity style={localStyles.itemCard} onPress={() => handleItemPress(item)}>
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
            {getCategoryLabel(item.category)}
          </Text>
        </View>
      </View>
      
      {/* מיקום מפוצל */}
      <View style={localStyles.itemRow}>
        <Text style={localStyles.itemMeta} numberOfLines={1}>
          📍 {item.city || 'מיקום לא זמין'}{item.address ? `, ${item.address}` : ''}
        </Text>
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
            <Icon name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
        <Text style={localStyles.itemMeta}>📅 {new Date(item.timestamp).toLocaleDateString('he-IL')} {new Date(item.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</Text>
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
          <View style={localStyles.itemBadge}>
            <Text style={localStyles.itemBadgeText}>
              {getCategoryLabel(item.category)}
            </Text>
          </View>
          <TouchableOpacity
          style={localStyles.restoreChip} 
          onPress={() => { 
            setTitle(item.title); 
            setDescription(item.description || '');
            setCity(item.city || '');
            setAddress(item.address || '');
            setPrice(String(item.price ?? 0)); 
            setQty(item.qty || 1);
            setCondition(item.condition || '');
            if (item.image_base64) {
              setImageUri(item.image_base64);
            }
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
        placeholder={mode ? 'חפש פריטים זמינים' : 'שם הפריט'}
        filterOptions={filterOptions}
        sortOptions={itemsSortOptions}
        searchData={allItems}
        onSearch={handleSearch}
      />

      {mode ? (
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
                {(() => {
                  // #region agent log
                  fetch('http://127.0.0.1:7242/ingest/d972b032-7acf-44cf-988d-02bf836f69e8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ItemsScreen.tsx:744',message:'Rendering items list',data:{filteredItemsCount:filteredItems.length,mode,ownerIds:Array.from(new Set(filteredItems.map(i=>i.ownerId))),itemsFromOtherUsers:filteredItems.filter(i=>i.ownerId!==selectedUser?.id).length,currentUserId:selectedUser?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
                  // #endregion
                  return null;
                })()}
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
                { label: 'מיקומים ייחודיים', value: new Set(getFilteredItems().map(i => i.city || 'לא צויין')).size, icon: 'pin-outline' },
              ]}
            />
          </View>

          {/* Add Links Section */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>קישורים שימושיים</Text>
            <AddLinkComponent category="items" />
          </View>
        </>
      ) : (
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

            {/* בחירת קטגוריה - דרופדאון */}
            <View style={localStyles.row}>
              <View style={localStyles.field}>
                <Text style={localStyles.label}>קטגוריה</Text>
                <TouchableOpacity
                  style={localStyles.dropdownButton}
                  onPress={() => setShowCategoryDropdown(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    localStyles.dropdownButtonText,
                    !selectedCategory && localStyles.dropdownPlaceholder
                  ]}>
                    {ITEM_CATEGORIES.find(c => c.id === selectedCategory)?.label || 'בחר קטגוריה'}
                  </Text>
                  <Icon 
                    name={showCategoryDropdown ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal לבחירת קטגוריה */}
            <Modal
              visible={showCategoryDropdown}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCategoryDropdown(false)}
            >
              <TouchableOpacity
                style={localStyles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowCategoryDropdown(false)}
              >
                <View style={localStyles.modalContent} onStartShouldSetResponder={() => true}>
                  <View style={localStyles.modalHeader}>
                    <Text style={localStyles.modalTitle}>בחר קטגוריה</Text>
                    <TouchableOpacity
                      onPress={() => setShowCategoryDropdown(false)}
                      style={localStyles.modalCloseButton}
                    >
                      <Icon name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={ITEM_CATEGORIES}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          localStyles.dropdownItem,
                          selectedCategory === item.id && localStyles.dropdownItemSelected
                        ]}
                        onPress={() => {
                          setSelectedCategory(item.id as ItemType);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <Icon 
                          name={item.icon as any} 
                          size={20} 
                          color={selectedCategory === item.id ? colors.primary : colors.textSecondary} 
                          style={localStyles.dropdownItemIcon}
                        />
                        <Text style={[
                          localStyles.dropdownItemText,
                          selectedCategory === item.id && localStyles.dropdownItemTextSelected
                        ]}>
                          {item.label}
                        </Text>
                        {selectedCategory === item.id && (
                          <Icon name="checkmark" size={20} color={colors.success} />
                        )}
                      </TouchableOpacity>
                    )}
                    style={localStyles.dropdownList}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

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

          {/* Add Links Section */}
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>קישורים שימושיים</Text>
            <AddLinkComponent category="items" />
          </View>
        </ScrollContainer>
      )}

      {/* Item Details Modal */}
      <ItemDetailsModal
        visible={showItemModal}
        onClose={handleCloseModal}
        item={selectedItem}
        type="item"
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundTertiary },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 120, flexGrow: 1 },
  formContainer: { padding: 5, alignItems: 'center', borderRadius: 15, marginBottom: 15 },
  row: { flexDirection: rowDirection('row-reverse'), gap: 10, width: '100%', paddingHorizontal: 8 },
  field: { flex: 1 },
  fieldSmall: { flex: 0.5 },
  label: { fontSize: FontSizes.medium, fontWeight: '600', color: colors.textPrimary, marginBottom: 10, textAlign: 'center' },
  labelInline: { marginTop: 3, flex: 1, fontSize: FontSizes.medium, fontWeight: '600', color: colors.textPrimary, ...marginStartEnd(6, 0) },
  input: { backgroundColor: colors.white, borderRadius: 10, padding: 12, fontSize: FontSizes.body, textAlign: biDiTextAlign('right'), color: colors.textPrimary, borderWidth: 1, borderColor: colors.secondary },
  inputWrapper: { position: 'relative', justifyContent: 'center' },
  inputWithAdornment: { paddingRight: 30 },
  inputAdornment: { position: 'absolute', right: 10, color: colors.textSecondary, fontSize: FontSizes.body },
  counterRow: { flexDirection: rowDirection('row'), alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: 10, borderWidth: 1, borderColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 6 },
  counterBtn: { backgroundColor: colors.pinkLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  counterText: { fontSize: FontSizes.medium, fontWeight: 'bold', color: colors.textPrimary },
  counterValue: { fontSize: FontSizes.medium, fontWeight: 'bold', color: colors.textPrimary, minWidth: 30, textAlign: 'center' },
  tagsRow: {marginTop: 10, alignItems: 'stretch', flexDirection: rowDirection('row-reverse'), flexWrap: 'wrap', gap: 3 },
  tag: { backgroundColor: colors.pinkLight, borderWidth: 1, borderColor: colors.secondary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  tagSmall: { paddingHorizontal: 8, marginHorizontal: "4%", paddingVertical: 4 },
  tagSelected: { backgroundColor: colors.backgroundSecondary, borderColor: colors.success },
  tagText: { fontSize: FontSizes.small, color: colors.textPrimary },
  tagTextSm: { fontSize: FontSizes.caption },
  tagTextSelected: { color: colors.success, fontWeight: '600' },
  offerButton: { backgroundColor: colors.accent, padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  offerButtonText: { color: colors.background, fontSize: FontSizes.medium, fontWeight: 'bold' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: FontSizes.body, fontWeight: 'bold', alignSelf: 'center', color: colors.textPrimary, textAlign: 'center' },
  headerRow: { flexDirection: rowDirection('row-reverse'), justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
  clearButton: { backgroundColor: colors.pinkLight, borderWidth: 1, borderColor: colors.secondary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  clearButtonText: { fontSize: FontSizes.small, color: colors.textPrimary, fontWeight: '600' },
  noOuterScrollContainer: { flex: 1 },
  sectionWithScroller: { flex: 1, backgroundColor: colors.pinkLight, borderRadius: 12, borderWidth: 1, borderColor: colors.secondary, paddingVertical: 8, paddingHorizontal: 8 },
  innerScroll: { flex: 1 },
  itemsGridContainer: {},
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyStateTitle: { fontSize: FontSizes.body, fontWeight: 'bold', color: colors.textPrimary, marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: FontSizes.small, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  emptyStateClearButton: { backgroundColor: colors.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  emptyStateClearButtonText: { fontSize: FontSizes.small, color: colors.background, fontWeight: '600' },
  itemCardWrapper: { marginBottom: 8, width: '100%' },
  itemCard: { backgroundColor: colors.pinkLight, borderRadius: 10, padding: 8, borderWidth: 1, borderColor: colors.secondary },
  itemRow: { flexDirection: rowDirection('row-reverse'), justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: FontSizes.small, fontWeight: 'bold', color: colors.textPrimary, textAlign: biDiTextAlign('right'), flex: 1, marginLeft: 6 },
  itemMeta: { fontSize: FontSizes.small, color: colors.textSecondary },
  itemBadge: { backgroundColor: colors.backgroundSecondary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 },
  itemBadgeText: { fontSize: FontSizes.small, color: colors.success, fontWeight: 'bold' },
  recentContainer: { paddingHorizontal: 8, paddingVertical: 8 },
  recentItemWrapper: { marginBottom: 8, width: '100%' },
  restoreChip: { backgroundColor: colors.pinkLight, borderWidth: 1, borderColor: colors.secondary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  restoreChipText: { fontSize: FontSizes.small, color: colors.textPrimary, fontWeight: '600' },
  deleteButton: { 
    padding: 6, 
    marginLeft: 12,
    backgroundColor: colors.pinkLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.pinkLight,
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
    backgroundColor: colors.backgroundSecondary,
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
  // Dropdown styles
  dropdownButton: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
    flexDirection: rowDirection('row-reverse'),
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  dropdownButtonText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    textAlign: biDiTextAlign('right'),
    flex: 1,
  },
  dropdownPlaceholder: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: rowDirection('row-reverse'),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: rowDirection('row-reverse'),
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.pinkLight,
  },
  dropdownItemIcon: {
    marginLeft: 12,
  },
  dropdownItemText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    flex: 1,
    textAlign: biDiTextAlign('right'),
  },
  dropdownItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});


