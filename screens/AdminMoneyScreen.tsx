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
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { AdminStackParamList } from '../navigations/AdminStack';
import { donations } from '../globals/fakeData';
import { Donation } from '../globals/fakeData';
import { enhancedDB } from '../utils/enhancedDatabaseService';
import { USE_BACKEND } from '../utils/dbConfig';

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

export default function AdminMoneyScreen({ navigation }: AdminMoneyScreenProps) {
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

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setIsLoading(true);
      if (USE_BACKEND) {
        const donationsData = await enhancedDB.getDonations({});
        setDonationsList(donationsData as Donation[]);
      } else {
        // Use fake data for now
        setDonationsList(donations);
      }
    } catch (error) {
      console.error('Error loading donations:', error);
      // Fallback to fake data
      setDonationsList(donations);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDonation = () => {
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

    try {
      setIsLoading(true);
      const newDonation: Donation = {
        id: Date.now().toString(),
        title: `תרומה מ-${formData.donorName}`,
        description: formData.notes || '',
        amount: Number(formData.amount),
        currency: 'ILS',
        type: 'money',
        status: 'approved',
        category: formData.category,
        createdBy: 'admin',
        createdAt: formData.date || new Date().toISOString(),
      };

      if (USE_BACKEND) {
        await enhancedDB.createDonation({
          type: 'money',
          title: newDonation.title,
          description: newDonation.description,
          amount: newDonation.amount,
          category: newDonation.category,
        });
      }

      // Add to local list
      setDonationsList((prev) => [newDonation, ...prev]);

      // Reset form
      setFormData({
        donorName: '',
        amount: '',
        category: 'כסף',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });

      setIsModalVisible(false);
      Alert.alert('הצלחה', 'התרומה נוספה בהצלחה');
    } catch (error) {
      console.error('Error saving donation:', error);
      Alert.alert('שגיאה', 'לא ניתן היה לשמור את התרומה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDonation = (donationId: string) => {
    Alert.alert(
      'מחיקת תרומה',
      'האם אתה בטוח שברצונך למחוק תרומה זו?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => {
            setDonationsList((prev) => prev.filter((d) => d.id !== donationId));
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL');
    } catch {
      return dateString;
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
        <TouchableOpacity
          onPress={() => handleDeleteDonation(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.donationDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatAmount(item.amount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.description && (
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
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddDonation}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.addButtonText}>הוסף תרומה</Text>
          </TouchableOpacity>
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
              <Text style={styles.modalTitle}>הוסף תרומה חדשה</Text>
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
                <Text style={styles.label}>תאריך</Text>
                <TextInput
                  style={styles.input}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textPlaceholder}
                />
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
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'שומר...' : 'שמור'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
});

