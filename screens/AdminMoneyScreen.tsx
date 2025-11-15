import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { AdminStackParamList } from '../navigations/AdminStack';
import { enhancedDB, wipeAllDataAdmin, DonationData } from '../utils/enhancedDatabaseService';
import { USE_BACKEND } from '../utils/dbConfig';
import { useUser } from '../context/UserContext';
import { logger } from '../utils/loggerService';

interface Donation {
  id: string;
  type: 'money' | 'time' | 'items' | 'rides';
  title: string;
  description?: string;
  amount?: number;
  category?: string;
  createdBy: string;
  createdAt: string;
  status?: string;
  metadata?: Record<string, unknown> | null;
}

interface AdminMoneyScreenProps {
  navigation: NavigationProp<AdminStackParamList>;
}

interface DonationFormData {
  donorName: string;
  amount: string;
  category: string;
  date: string;
  notes: string;
}

const DONATION_CATEGORIES = [
  'כסף',
  'אוכל',
  'בגדים',
  'ספרים',
  'רהיטים',
  'רפואי',
  'בעלי חיים',
  'דיור',
  'תמיכה',
  'חינוך',
  'סביבה',
  'טכנולוגיה',
  'מוזיקה',
  'משחקים',
  'אמנות',
  'ספורט',
  'כללי',
];

const LOG_SOURCE = 'AdminMoneyScreen';

export default function AdminMoneyScreen({ navigation }: AdminMoneyScreenProps) {
  const { isAdmin } = useUser();
  const [donationsList, setDonationsList] = useState<Donation[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState<DonationFormData>({
    donorName: '',
    amount: '',
    category: 'כסף',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [pollingId, setPollingId] = useState<ReturnType<typeof setInterval> | null>(null);
  const [isWipeVisible, setIsWipeVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDonationId, setEditingDonationId] = useState<string | null>(null);

  useEffect(() => {
    logger.info(LOG_SOURCE, 'Initializing admin donations screen');
    loadDonations();
    // Lightweight polling to approximate real-time updates
    const id = setInterval(() => {
      logger.debug(LOG_SOURCE, 'Polling donations tick');
      loadDonations();
    }, 5000);
    setPollingId(id);
    setIsMounted(true);
    return () => {
      if (id) {
        clearInterval(id);
        logger.info(LOG_SOURCE, 'Stopped donations polling interval');
      }
    };
  }, []);

  const loadDonations = async (forceRefresh = false) => {
    logger.info(LOG_SOURCE, 'Loading donations list', { useBackend: USE_BACKEND, forceRefresh });
    try {
      setIsLoading(true);
      if (USE_BACKEND) {
        const donationsData = await enhancedDB.getDonations({}, forceRefresh);
        setDonationsList(donationsData as unknown as Donation[]);
        logger.info(LOG_SOURCE, 'Donations loaded from backend', {
          count: Array.isArray(donationsData) ? donationsData.length : 0,
          forceRefresh,
        });
      } else {
        // No backend - show empty state
        setDonationsList([]);
        logger.warn(LOG_SOURCE, 'Backend disabled - showing empty donations list');
      }
    } catch (error) {
      logger.error(LOG_SOURCE, 'Error loading donations', { error });
      // Show empty state on error
      setDonationsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWipeAll = async () => {
    logger.warn(LOG_SOURCE, 'Attempting to wipe all donations and data');
    try {
      if (!isAdmin) {
        logger.warn(LOG_SOURCE, 'Wipe all blocked - missing admin permissions');
        Alert.alert('שגיאה', 'פעולה זו דורשת הרשאת מנהל');
        return;
      }
      if (confirmText.trim().toUpperCase() !== 'CONFIRM') {
        logger.warn(LOG_SOURCE, 'Wipe all blocked - confirmation text invalid');
        Alert.alert('אימות נדרש', 'נא להקליד CONFIRM באנגלית כדי לאשר מחיקה כוללת');
        return;
      }
      setIsMutating(true);
      logger.info(LOG_SOURCE, 'Sending wipe all request to backend');
      const res = await wipeAllDataAdmin();
      if (!res.success) {
        throw new Error(res.error || 'wipe failed');
      }
      setIsWipeVisible(false);
      setConfirmText('');
      await loadDonations();
      logger.info(LOG_SOURCE, 'Wipe all completed successfully');
      Alert.alert('בוצע', 'כל הנתונים נמחקו בהצלחה');
    } catch (e) {
      logger.error(LOG_SOURCE, 'Admin wipe error', { error: e });
      Alert.alert('שגיאה', 'לא ניתן היה למחוק את כל הנתונים');
    } finally {
      setIsMutating(false);
      logger.debug(LOG_SOURCE, 'Wipe all mutation finished');
    }
  };

  const handleAddDonation = () => {
    logger.info(LOG_SOURCE, 'Opening add donation modal');
    setIsEditMode(false);
    setEditingDonationId(null);
    setFormData({
      donorName: '',
      amount: '',
      category: 'כסף',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalVisible(true);
  };

  const handleEditDonation = (donation: Donation) => {
    logger.info(LOG_SOURCE, 'Opening edit donation modal', { donationId: donation.id });
    setIsEditMode(true);
    setEditingDonationId(donation.id);
    // ניסיון פשוט לחלץ שם תורם מהכותרת "תרומה מ-<שם>"
    const donorFromTitle =
      donation.title?.startsWith('תרומה מ-') ? donation.title.replace('תרומה מ-', '') : donation.title || '';
    // נרמול תאריך בטוח: נסה לקחת מתאריך שנבחר על ידי המשתמש (metadata), אחרת מ-createdAt
    let normalizedDate = '';
    let dateToUse: string | null = null;
    
    // Try to get date from metadata first (user-selected date)
    if (donation.metadata && typeof donation.metadata === 'object' && donation.metadata !== null) {
      const metadata = donation.metadata as Record<string, unknown>;
      if (metadata.selectedDate && typeof metadata.selectedDate === 'string') {
        dateToUse = metadata.selectedDate;
      }
    }
    
    // Fallback to createdAt if metadata not available
    if (!dateToUse) {
      dateToUse = donation.createdAt;
    }
    
    try {
      const parsed = new Date(dateToUse);
      normalizedDate = isNaN(parsed.getTime())
        ? new Date().toISOString().split('T')[0]
        : parsed.toISOString().split('T')[0];
    } catch {
      normalizedDate = new Date().toISOString().split('T')[0];
    }
    setFormData({
      donorName: donorFromTitle,
      amount: donation.amount ? String(donation.amount) : '',
      category: donation.category || 'כללי',
      date: normalizedDate,
      notes: donation.description || '',
    });
    setIsModalVisible(true);
  };

  const handleSaveDonation = async () => {
    // Validation
    if (!formData.donorName.trim()) {
      Alert.alert('שגיאה', 'אנא הזן שם תורם');
      return;
    }
    if (!formData.amount.trim() || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      Alert.alert('שגיאה', 'אנא הזן סכום תקין');
      return;
    }
    
    // Validate date - must be in YYYY-MM-DD format and valid date
    if (!formData.date || !formData.date.trim()) {
      Alert.alert('שגיאה', 'אנא הזן תאריך');
      return;
    }
    
    // Check if date is in correct format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date.trim())) {
      Alert.alert('שגיאה', 'אנא הזן תאריך בפורמט YYYY-MM-DD (למשל: 2024-01-15)');
      return;
    }
    
    // Check if date is valid
    const dateParts = formData.date.trim().split('-');
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    const testDate = new Date(year, month - 1, day);
    
    if (
      testDate.getFullYear() !== year ||
      testDate.getMonth() !== month - 1 ||
      testDate.getDate() !== day
    ) {
      Alert.alert('שגיאה', 'התאריך שהוזן לא תקין. אנא הזן תאריך חוקי');
      return;
    }

    try {
      setIsMutating(true);
      
      // Convert date from YYYY-MM-DD to ISO string format
      let createdAtISO: string;
      try {
        const dateParts = formData.date.trim().split('-');
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const day = parseInt(dateParts[2], 10);
        const donationDate = new Date(year, month - 1, day);
        // Set time to midnight UTC to ensure consistent date
        createdAtISO = donationDate.toISOString();
      } catch (error) {
        logger.warn(LOG_SOURCE, 'Error parsing date, using current date', { error, date: formData.date });
        createdAtISO = new Date().toISOString();
      }
      
      const basePayload = {
        title: `תרומה מ-${formData.donorName}`,
        description: formData.notes || '',
        amount: Number(formData.amount),
        category: formData.category,
        // Store the selected date in metadata so we can use it later
        metadata: {
          selectedDate: createdAtISO,
        },
      };

      if (isEditMode && editingDonationId) {
        logger.info(LOG_SOURCE, 'Updating donation', { editingDonationId, selectedDate: createdAtISO });
        const res = await enhancedDB.updateDonation(editingDonationId, basePayload as Partial<DonationData>);
        if (!res.success) {
          throw new Error(res.error || 'update failed');
        }
        // נקה קאש כדי למנוע נתונים מיושנים
        await enhancedDB.clearAllCache();
      } else {
        logger.info(LOG_SOURCE, 'Creating donation', {
          donorName: formData.donorName.trim(),
          amount: Number(formData.amount),
          category: formData.category,
          selectedDate: createdAtISO,
        });
        const res = await enhancedDB.createDonation({
          type: 'money' as const,
          ...basePayload,
        });
        if (!res.success) {
          throw new Error(res.error || 'create failed');
        }
        await enhancedDB.clearAllCache();
      }
      // Always refetch from server to ensure canonical data and IDs
      await loadDonations(true);
      logger.info(LOG_SOURCE, 'Donation saved successfully');

      // Reset form
      setFormData({
        donorName: '',
        amount: '',
        category: 'כסף',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });

      setIsModalVisible(false);
      setIsEditMode(false);
      setEditingDonationId(null);
      Alert.alert('הצלחה', isEditMode ? 'התרומה עודכנה בהצלחה' : 'התרומה נוספה בהצלחה');
    } catch (error) {
      logger.error(LOG_SOURCE, 'Error saving donation', { error });
      Alert.alert('שגיאה', isEditMode ? 'לא ניתן היה לעדכן את התרומה' : 'לא ניתן היה לשמור את התרומה');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteDonation = async (donationId: string) => {
    logger.info(LOG_SOURCE, 'Prompting delete donation', { donationId });
    
    // Use confirm for web compatibility
    const confirmed = Platform.OS === 'web' 
      ? (typeof window !== 'undefined' && window.confirm('האם אתה בטוח שברצונך למחוק תרומה זו?'))
      : await new Promise<boolean>((resolve) => {
          Alert.alert(
            'מחיקת תרומה',
            'האם אתה בטוח שברצונך למחוק תרומה זו?',
            [
              { 
                text: 'ביטול', 
                style: 'cancel',
                onPress: () => resolve(false)
              },
              {
                text: 'מחק',
                style: 'destructive',
                onPress: () => resolve(true)
              },
            ]
          );
        });

    if (!confirmed) {
      logger.info(LOG_SOURCE, 'Delete cancelled by user', { donationId });
      return;
    }

    logger.info(LOG_SOURCE, 'Delete confirmed, starting deletion', { donationId });
    // Optimistic UI with rollback
    const prev = donationsList;
    setDonationsList((p) => p.filter((d) => d.id !== donationId));
    
    try {
      setIsMutating(true);
      logger.info(LOG_SOURCE, 'Calling deleteDonation API', { donationId });
      const res = await enhancedDB.deleteDonation(donationId);
      
      logger.info(LOG_SOURCE, 'deleteDonation API response', { donationId, success: res.success, error: res.error });
      
      if (!res.success) {
        throw new Error(res.error || 'delete failed');
      }
      
      // נקה קאש כדי למנוע נתונים מיושנים
      logger.info(LOG_SOURCE, 'Clearing cache after deletion', { donationId });
      await enhancedDB.clearAllCache();
      
      // Force refresh from server, ignoring cache
      logger.info(LOG_SOURCE, 'Loading donations with force refresh', { donationId });
      await loadDonations(true);
      
      logger.info(LOG_SOURCE, 'Donation deleted successfully', { donationId });
      Alert.alert('הצלחה', 'התרומה נמחקה בהצלחה');
    } catch (e) {
      logger.error(LOG_SOURCE, 'Error deleting donation', { donationId, error: e, errorMessage: e instanceof Error ? e.message : String(e) });
      setDonationsList(prev); // rollback
      Alert.alert('שגיאה', `לא ניתן היה למחוק את התרומה: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsMutating(false);
      logger.debug(LOG_SOURCE, 'Delete donation mutation finished', { donationId });
    }
  };

  const formatDate = (donation: Donation) => {
    try {
      // Try to get date from metadata first (user-selected date)
      let dateString: string | null | undefined = null;
      if (donation.metadata && typeof donation.metadata === 'object' && donation.metadata !== null) {
        const metadata = donation.metadata as Record<string, unknown>;
        if (metadata.selectedDate && typeof metadata.selectedDate === 'string') {
          dateString = metadata.selectedDate;
        }
      }
      
      // Fallback to createdAt if metadata not available
      if (!dateString) {
        dateString = donation.createdAt;
      }
      
      if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
        return 'תאריך לא זמין';
      }
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'תאריך לא זמין';
      }
      return date.toLocaleDateString('he-IL');
    } catch {
      return 'תאריך לא זמין';
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'לא צוין';
    return `₪${amount.toLocaleString('he-IL')}`;
  };

  const renderDonationItem = ({ item }: { item: Donation }) => (
    <View style={styles.donationCard}>
      <View style={styles.donationHeader}>
        <View style={styles.donationInfo}>
          <Text style={styles.donationTitle}>{item.title}</Text>
          <Text style={styles.donationCategory}>{item.category}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: LAYOUT_CONSTANTS.SPACING.XS }}>
          <TouchableOpacity
            onPress={() => handleEditDonation(item)}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteDonation(item.id)}
            style={styles.deleteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.donationDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{isMounted ? formatAmount(item.amount) : ''}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{isMounted ? formatDate(item) : ''}</Text>
        </View>
        {Boolean(item.description?.trim()) && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ניהול תרומות</Text>
          
        </View>

        {isLoading && donationsList.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>טוען תרומות...</Text>
          </View>
        ) : donationsList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>אין תרומות עדיין</Text>
            <Text style={styles.emptySubtext}>הוסף תרומה חדשה כדי להתחיל</Text>
          </View>
        ) : (
          <FlatList
            data={donationsList}
            renderItem={renderDonationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={isLoading || isMutating}
            onRefresh={loadDonations}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add Donation Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditMode ? 'ערוך תרומה' : 'הוסף תרומה חדשה'}</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>שם התורם *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.donorName}
                  onChangeText={(text) => setFormData({ ...formData, donorName: text })}
                  placeholder="הזן שם תורם"
                  placeholderTextColor={colors.textPlaceholder}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>סכום (₪) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.amount}
                  onChangeText={(text) => setFormData({ ...formData, amount: text })}
                  placeholder="הזן סכום"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textPlaceholder}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>קטגוריה</Text>
                <View style={styles.categoryContainer}>
                  {DONATION_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        formData.category === category && styles.categoryChipSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, category })}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          formData.category === category && styles.categoryChipTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>תאריך *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => {
                    // Allow only digits and hyphens, enforce YYYY-MM-DD format
                    let cleaned = text.replace(/[^\d-]/g, '');
                    // Auto-format: YYYY-MM-DD
                    if (cleaned.length > 4 && cleaned[4] !== '-') {
                      cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                    }
                    if (cleaned.length > 7 && cleaned[7] !== '-') {
                      cleaned = cleaned.slice(0, 7) + '-' + cleaned.slice(7);
                    }
                    // Limit to YYYY-MM-DD format (10 characters)
                    if (cleaned.length <= 10) {
                      setFormData({ ...formData, date: cleaned });
                    }
                  }}
                  placeholder="YYYY-MM-DD (למשל: 2024-01-15)"
                  placeholderTextColor={colors.textPlaceholder}
                  maxLength={10}
                />
                {formData.date && formData.date.length > 0 && (
                  <Text style={[styles.label, { fontSize: FontSizes.caption, color: colors.textSecondary, marginTop: 4 }]}>
                    {(() => {
                      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                      if (!dateRegex.test(formData.date)) {
                        return '⚠️ אנא הזן תאריך בפורמט YYYY-MM-DD';
                      }
                      const dateParts = formData.date.split('-');
                      const year = parseInt(dateParts[0], 10);
                      const month = parseInt(dateParts[1], 10);
                      const day = parseInt(dateParts[2], 10);
                      const testDate = new Date(year, month - 1, day);
                      if (
                        testDate.getFullYear() !== year ||
                        testDate.getMonth() !== month - 1 ||
                        testDate.getDate() !== day
                      ) {
                        return '⚠️ התאריך שהוזן לא תקין';
                      }
                      return `✓ ${testDate.toLocaleDateString('he-IL')}`;
                    })()}
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>הערות</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.notes}
                  onChangeText={(text) => setFormData({ ...formData, notes: text })}
                  placeholder="הערות נוספות (אופציונלי)"
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={colors.textPlaceholder}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveDonation}
                disabled={isMutating}
              >
                <Text style={styles.saveButtonText}>{isMutating ? (isEditMode ? 'מעדכן...' : 'שומר...') : (isEditMode ? 'עדכן' : 'שמור')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Wipe All Confirmation Modal */}
      <Modal
        visible={isWipeVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsWipeVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>אישור מחיקת כל הנתונים</Text>
              <TouchableOpacity
                onPress={() => setIsWipeVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={{ color: colors.textPrimary, marginBottom: LAYOUT_CONSTANTS.SPACING.SM }}>
                פעולה מסוכנת! מחיקת כל הנתונים תבוצע באופן סופי בצד השרת. כדי לאשר, הקלד/י CONFIRM:
              </Text>
              <TextInput
                style={styles.input}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="CONFIRM"
                autoCapitalize="characters"
                placeholderTextColor={colors.textPlaceholder}
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsWipeVisible(false)}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.error }]}
                onPress={handleWipeAll}
                disabled={isMutating}
              >
                <Text style={styles.saveButtonText}>{isMutating ? 'מוחק...' : 'מחק הכל'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Floating Add Donation Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={handleAddDonation}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
        <Text style={styles.fabButtonText}>הוסף תרומה</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flex: 1,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  title: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pink,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    gap: LAYOUT_CONSTANTS.SPACING.XS,
  },
  addButtonText: {
    color: 'white',
    fontSize: FontSizes.medium,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: colors.error,
    marginLeft: LAYOUT_CONSTANTS.SPACING.SM,
  },
  listContent: {
    paddingBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },
  donationCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  donationInfo: {
    flex: 1,
  },
  donationTitle: {
    fontSize: FontSizes.large,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  donationCategory: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: LAYOUT_CONSTANTS.SPACING.XS,
  },
  iconButton: {
    padding: LAYOUT_CONSTANTS.SPACING.XS,
  },
  donationDetails: {
    gap: LAYOUT_CONSTANTS.SPACING.XS,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT_CONSTANTS.SPACING.XS,
  },
  detailText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: LAYOUT_CONSTANTS.SPACING.XL,
  },
  emptyText: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  emptySubtext: {
    fontSize: FontSizes.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    borderTopRightRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },
  modalTitle: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: LAYOUT_CONSTANTS.SPACING.XS,
  },
  modalBody: {
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  label: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  categoryChip: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  categoryChipSelected: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  categoryChipText: {
    fontSize: FontSizes.small,
    color: colors.textPrimary,
  },
  categoryChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: LAYOUT_CONSTANTS.SPACING.MD,
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    borderTopWidth: 1,
    borderTopColor: colors.borderSecondary,
  },
  modalButton: {
    flex: 1,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: FontSizes.medium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.pink,
  },
  saveButtonText: {
    fontSize: FontSizes.medium,
    color: 'white',
    fontWeight: '600',
  },
  fabButton: {
    position: 'absolute',
    right: LAYOUT_CONSTANTS.SPACING.LG,
    bottom: LAYOUT_CONSTANTS.SPACING.XL,
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT_CONSTANTS.SPACING.XS,
    backgroundColor: colors.pink,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  fabButtonText: {
    color: 'white',
    fontSize: FontSizes.medium,
    fontWeight: '600',
  },
});

