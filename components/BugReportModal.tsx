import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { scaleSize, responsiveSpacing, biDiTextAlign } from '../globals/responsive';
import { useTranslation } from 'react-i18next';
import apiService, { ApiResponse } from '../utils/apiService';
import { useUser } from '../stores/userStore';

interface BugReportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BugReportModal({ visible, onClose }: BugReportModalProps) {
  const { t } = useTranslation(['settings', 'common']);
  const { selectedUser } = useUser();
  const [bugTitle, setBugTitle] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

  // Track screen size changes for responsive layout
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const getAdminEmails = (): string[] => {
    const adminEmails: string[] = [];
    
    // Add hardcoded super admin email
    const SUPER_ADMIN_EMAIL = 'navesarussi@gmail.com';
    adminEmails.push(SUPER_ADMIN_EMAIL);
    
    // Add emails from environment variable
    const adminEmailsEnv = (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '').trim();
    if (adminEmailsEnv) {
      const emails = adminEmailsEnv
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
      adminEmails.push(...emails);
    }
    
    // Remove duplicates
    return Array.from(new Set(adminEmails.map((e) => e.toLowerCase())));
  };

  const handleSubmit = async () => {
    if (!bugTitle.trim()) {
      if (Platform.OS === 'web') {
        alert(t('settings:bugTitle') + ' ' + t('common:error'));
      } else {
        Alert.alert(t('common:error'), t('settings:bugTitle') + ' - ' + t('common:error'));
      }
      return;
    }

    setSubmitting(true);
    try {
      const adminEmails = getAdminEmails();
      
      // Create task with bug report
      const taskData = {
        title: `[דיווח באג] ${bugTitle.trim()}`,
        description: bugDescription.trim() 
          ? `דיווח באג מהמשתמש: ${selectedUser?.email || 'לא מזוהה'}\n\nתיאור:\n${bugDescription.trim()}`
          : `דיווח באג מהמשתמש: ${selectedUser?.email || 'לא מזוהה'}`,
        status: 'open',
        priority: 'medium',
        category: 'development',
        tags: ['bug', 'user-report', 'bug-report'],
        assigneesEmails: adminEmails,
        created_by: selectedUser?.id || null,
      };

      const response: ApiResponse = await apiService.createTask(taskData);

      if (response.success) {
        if (Platform.OS === 'web') {
          alert(t('settings:bugReportSuccess'));
        } else {
          Alert.alert(t('common:done'), t('settings:bugReportSuccess'));
        }
        // Reset form
        setBugTitle('');
        setBugDescription('');
        onClose();
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
      if (Platform.OS === 'web') {
        alert(t('settings:bugReportError'));
      } else {
        Alert.alert(t('common:error'), t('settings:bugReportError'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setBugTitle('');
      setBugDescription('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[
          styles.modalCard,
          { width: screenDimensions.width < 768 ? '90%' : '70%', maxWidth: 600 }
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{t('settings:bugReportTitle')}</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={submitting}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={24}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.subtitle}>{t('settings:bugReportSubtitle')}</Text>

            {/* Bug Title */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('settings:bugTitle')} *</Text>
              <TextInput
                style={styles.input}
                placeholder={t('settings:bugTitlePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={bugTitle}
                onChangeText={setBugTitle}
                maxLength={100}
                editable={!submitting}
              />
            </View>

            {/* Bug Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('settings:bugDescription')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('settings:bugDescriptionPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={bugDescription}
                onChangeText={setBugDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!submitting}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>{t('common:cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, (!bugTitle.trim() || submitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!bugTitle.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>{t('settings:sendReport')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveSpacing(16, 24, 32),
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: colors.backgroundPrimary,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: responsiveSpacing(16, 20, 24),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: scaleSize(FontSizes.heading3),
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: biDiTextAlign('right'),
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: responsiveSpacing(16, 20, 24),
  },
  subtitle: {
    fontSize: scaleSize(FontSizes.body),
    color: colors.textSecondary,
    marginBottom: responsiveSpacing(16, 20, 24),
    textAlign: biDiTextAlign('right'),
  },
  inputContainer: {
    marginBottom: responsiveSpacing(16, 18, 20),
  },
  label: {
    fontSize: scaleSize(FontSizes.medium),
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: biDiTextAlign('right'),
  },
  input: {
    height: scaleSize(44),
    borderRadius: 10,
    paddingHorizontal: responsiveSpacing(12, 14, 16),
    backgroundColor: colors.backgroundSecondary,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: scaleSize(FontSizes.medium),
    textAlign: biDiTextAlign('right'),
  },
  textArea: {
    height: scaleSize(120),
    paddingTop: responsiveSpacing(12, 14, 16),
    paddingBottom: responsiveSpacing(12, 14, 16),
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: responsiveSpacing(16, 20, 24),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    height: scaleSize(44),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: scaleSize(FontSizes.medium),
    color: colors.textPrimary,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: scaleSize(FontSizes.medium),
    color: '#fff',
    fontWeight: '600',
  },
});

