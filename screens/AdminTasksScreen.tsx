import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, Dimensions, ScrollView } from 'react-native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { Ionicons } from '@expo/vector-icons';
import apiService, { ApiResponse } from '../utils/apiService';
import { useUser } from '../stores/userStore';
import { scaleSize, responsiveSpacing, getResponsiveModalStyles, getScreenInfo } from '../globals/responsive';

type TaskStatus = 'open' | 'in_progress' | 'done' | 'archived';
type TaskPriority = 'low' | 'medium' | 'high';

type AdminTask = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string | null;
  due_date?: string | null;
  assignees: string[];
  tags: string[];
  checklist?: { id: string; text: string; done: boolean }[];
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function AdminTasksScreen() {
  const { selectedUser } = useUser();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'open' as TaskStatus,
    category: 'development',
    due_date: '',
    assigneesEmails: '' as string, // comma separated emails
    tagsText: '' as string, // comma separated tags
  });
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [filterCategory, setFilterCategory] = useState<string | ''>('');
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

  // Track screen size changes for responsive layout
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => {
      if (a.status === b.status) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      const statusRank: Record<TaskStatus, number> = { open: 0, in_progress: 1, done: 2, archived: 3 };
      return statusRank[a.status] - statusRank[b.status];
    });
  }, [tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    const res: ApiResponse<AdminTask[]> = await apiService.getTasks({
      q: query || undefined,
      status: filterStatus || undefined,
      priority: filterPriority || undefined,
      category: filterCategory || undefined,
    });
    if (!res.success) {
      setError(res.error || 'שגיאה בטעינת משימות');
    } else {
      setTasks(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      category: 'development',
      due_date: '',
      assigneesEmails: '',
      tagsText: '',
    });
  };

  const createTask = async () => {
    if (!formData.title.trim()) return;
    setCreating(true);
    const body = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      status: formData.status,
      category: formData.category,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
      assigneesEmails: formData.assigneesEmails
        ? formData.assigneesEmails.split(',').map((e) => e.trim()).filter(Boolean)
        : [],
      tags: formData.tagsText
        ? formData.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      created_by: selectedUser?.id || null,
    };
    const res: ApiResponse<AdminTask> = await apiService.createTask(body);
    if (!res.success) {
      setError(res.error || 'שגיאה ביצירת משימה');
    } else if (res.data) {
      setTasks((prev) => [res.data as AdminTask, ...prev]);
      resetForm();
      setShowForm(false);
    }
    setCreating(false);
  };

  const toggleDone = async (task: AdminTask) => {
    const nextStatus: TaskStatus = task.status === 'done' ? 'open' : 'done';
    const res: ApiResponse<AdminTask> = await apiService.updateTask(task.id, { status: nextStatus });
    if (res.success && res.data) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? (res.data as AdminTask) : t)));
    }
  };

  const renderItem = ({ item }: { item: AdminTask }) => {
    const isDone = item.status === 'done';
    return (
      <View style={[styles.taskItem, isDone && styles.taskItemDone]}>
        <TouchableOpacity style={styles.checkbox} onPress={() => toggleDone(item)}>
          <Ionicons name={isDone ? 'checkbox' : 'square-outline'} size={24} color={isDone ? colors.green : colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.badge, styles[`priority_${item.priority}` as const]]}>
              <Text style={styles.badgeText}>
                {item.priority === 'high' ? 'גבוהה' : item.priority === 'medium' ? 'בינונית' : 'נמוכה'}
              </Text>
            </View>
            {!!item.category && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.status === 'open' ? 'פתוחה' : item.status === 'in_progress' ? 'בתהליך' : item.status === 'done' ? 'בוצעה' : 'בארכיון'}</Text>
            </View>
            {!!item.assignees?.length && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.assignees.length} מוקצים</Text>
              </View>
            )}
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
              <Ionicons name="create-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.actionText}>ערוך</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => deleteTask(item.id)}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>מחק</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const openEdit = (task: AdminTask) => {
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      category: task.category || 'development',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '',
      assigneesEmails: '',
      tagsText: (task.tags || []).join(', '),
    });
    (formData as any)._editingId = task.id;
    setShowForm(true);
  };

  const saveEdit = async () => {
    const editingId = (formData as any)._editingId;
    if (!editingId) return;
    const body: any = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: formData.status,
      category: formData.category,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      tags: formData.tagsText ? formData.tagsText.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    if (formData.assigneesEmails) {
      body.assigneesEmails = formData.assigneesEmails.split(',').map((e) => e.trim()).filter(Boolean);
    }
    const res = await apiService.updateTask(editingId, body);
    if (res.success && res.data) {
      setTasks((prev) => prev.map((t) => (t.id === editingId ? (res.data as AdminTask) : t)));
      setShowForm(false);
      resetForm();
      delete (formData as any)._editingId;
    } else {
      setError(res.error || 'שגיאה בעדכון משימה');
    }
  };

  const deleteTask = async (taskId: string) => {
    const res = await apiService.deleteTask(taskId);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      setError(res.error || 'שגיאה במחיקת משימה');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ניהול משימות</Text>

      {/* כרטיס אתגרים */}
      <TouchableOpacity 
        style={styles.challengeCard}
        onPress={() => {
          // נניווט למסך האתגרים
          Alert.alert('אתגרים', 'מסך אתגרים בקרוב!');
        }}
      >
        <View style={styles.challengeIconContainer}>
          <Ionicons name="trophy" size={scaleSize(28)} color="#FFA726" />
        </View>
        <View style={styles.challengeContent}>
          <Text style={styles.challengeTitle}>האתגרים שלי</Text>
          <Text style={styles.challengeSubtitle}>עקוב אחר ההתקדמות האישית שלך</Text>
        </View>
        <Ionicons name="chevron-forward" size={scaleSize(20)} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.filtersRow}>
        <TextInput
          style={styles.input}
          placeholder="חיפוש לפי כותרת/תיאור..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={fetchTasks}
        />
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchTasks}>
          <Ionicons name="search-outline" size={scaleSize(20)} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setShowForm(true); }}>
          <Ionicons name="add" size={scaleSize(22)} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filters - Now wrapped with ScrollView for mobile */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScrollContent}
        style={styles.chipsRow}
      >
        <FilterChip label="סטטוס" value={filterStatus} setValue={setFilterStatus} options={[
          { value: '', label: 'הכל' },
          { value: 'open', label: 'פתוחה' },
          { value: 'in_progress', label: 'בתהליך' },
          { value: 'done', label: 'בוצעה' },
          { value: 'archived', label: 'בארכיון' },
        ]} />
        <FilterChip label="עדיפות" value={filterPriority} setValue={setFilterPriority} options={[
          { value: '', label: 'הכל' },
          { value: 'high', label: 'גבוהה' },
          { value: 'medium', label: 'בינונית' },
          { value: 'low', label: 'נמוכה' },
        ]} />
        <FilterChip label="קטגוריה" value={filterCategory} setValue={setFilterCategory} options={[
          { value: '', label: 'הכל' },
          { value: 'development', label: 'פיתוח' },
          { value: 'marketing', label: 'שיווק' },
          { value: 'operations', label: 'תפעול' },
          { value: 'design', label: 'עיצוב' },
        ]} />
      </ScrollView>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.info} />
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchTasks} style={styles.retryBtn}>
            <Text style={styles.retryText}>נסה שוב</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>אין משימות כרגע</Text>}
        />
      )}

      <Modal visible={showForm} animationType="slide" transparent onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView 
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.modalCard, { width: screenDimensions.width < 768 ? '90%' : '70%', maxWidth: 600 }]}>
              <Text style={styles.modalTitle}>{(formData as any)._editingId ? 'עריכת משימה' : 'משימה חדשה'}</Text>
              <TextInput style={styles.modalInput} placeholder="כותרת" value={formData.title} onChangeText={(v) => setFormData({ ...formData, title: v })} />
              <TextInput style={[styles.modalInput, { height: 80 }]} placeholder="תיאור" multiline value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} />
              <View style={styles.row2}>
                <PickerField
                  label="עדיפות"
                  value={formData.priority}
                  onChange={(v) => setFormData({ ...formData, priority: v as TaskPriority })}
                  options={[
                    { value: 'high', label: 'גבוהה' },
                    { value: 'medium', label: 'בינונית' },
                    { value: 'low', label: 'נמוכה' },
                  ]}
                />
                <PickerField
                  label="סטטוס"
                  value={formData.status}
                  onChange={(v) => setFormData({ ...formData, status: v as TaskStatus })}
                  options={[
                    { value: 'open', label: 'פתוחה' },
                    { value: 'in_progress', label: 'בתהליך' },
                    { value: 'done', label: 'בוצעה' },
                    { value: 'archived', label: 'בארכיון' },
                  ]}
                />
              </View>
              <View style={styles.row2}>
                <PickerField
                  label="קטגוריה"
                  value={formData.category}
                  onChange={(v) => setFormData({ ...formData, category: v })}
                  options={[
                    { value: 'development', label: 'פיתוח' },
                    { value: 'marketing', label: 'שיווק' },
                    { value: 'operations', label: 'תפעול' },
                    { value: 'design', label: 'עיצוב' },
                  ]}
                />
                <TextInput style={styles.modalInput} placeholder="תאריך יעד (YYYY-MM-DD)" value={formData.due_date} onChangeText={(v) => setFormData({ ...formData, due_date: v })} />
              </View>
              <TextInput style={styles.modalInput} placeholder="מוקצים (אימיילים מופרדים בפסיק)" value={formData.assigneesEmails} onChangeText={(v) => setFormData({ ...formData, assigneesEmails: v })} />
              <TextInput style={styles.modalInput} placeholder="תגיות (מופרדות בפסיק)" value={formData.tagsText} onChangeText={(v) => setFormData({ ...formData, tagsText: v })} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => { setShowForm(false); resetForm(); }}>
                  <Text style={styles.modalBtnText}>ביטול</Text>
                </TouchableOpacity>
                {(formData as any)._editingId ? (
                  <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={saveEdit} disabled={creating}>
                    {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>שמירה</Text>}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={createTask} disabled={creating || !formData.title.trim()}>
                    {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>יצירה</Text>}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

type PickerOption = { value: string; label: string };
function PickerField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: PickerOption[] }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.pickerBox}>
        <Text style={styles.pickerValue}>{options.find((o) => o.value === value)?.label || 'בחר'}</Text>
      </View>
      <View style={styles.pickerOptions}>
        {options.map((opt) => (
          <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)} style={[styles.chip, value === opt.value && styles.chipActive]}>
            <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FilterChip<T extends string>({ label, value, setValue, options }: { label: string; value: T | ''; setValue: (v: T | '') => void; options: { value: T | ''; label: string }[] }) {
  return (
    <View style={{ marginRight: 12, marginBottom: 8 }}>
      <Text style={{ color: colors.textSecondary, marginBottom: 4, fontSize: scaleSize(12) }}>{label}:</Text>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <TouchableOpacity key={`${label}-${String(opt.value)}`} onPress={() => setValue(opt.value)} style={[styles.chip, value === opt.value && styles.chipActive]}>
            <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    padding: responsiveSpacing(12, 16, 20),
  },
  header: {
    fontSize: scaleSize(FontSizes.heading2),
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: responsiveSpacing(12, 14, 16),
    textAlign: 'right',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
  },
  input: {
    flex: 1,
    height: scaleSize(44),
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    paddingHorizontal: responsiveSpacing(12, 14, 16),
    backgroundColor: colors.backgroundPrimary,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: scaleSize(FontSizes.medium),
  },
  refreshBtn: {
    height: scaleSize(44),
    width: scaleSize(44),
    borderRadius: 12,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    height: scaleSize(44),
    width: scaleSize(44),
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  chipsScrollContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  listContent: {
    paddingBottom: LAYOUT_CONSTANTS.SPACING.XL,
    gap: LAYOUT_CONSTANTS.SPACING.SM,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: responsiveSpacing(12, 14, 16),
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskItemDone: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: LAYOUT_CONSTANTS.SPACING.MD,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: scaleSize(FontSizes.large),
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'right',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row-reverse',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: scaleSize(FontSizes.small),
  },
  badge: {
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(4),
    borderRadius: 999,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: scaleSize(FontSizes.small),
    color: colors.textSecondary,
  },
  priority_high: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  priority_medium: {
    backgroundColor: '#fff8e1',
    borderColor: '#ffecb3',
  },
  priority_low: {
    backgroundColor: '#e8f5e9',
    borderColor: '#c8e6c9',
  },
  errorBox: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
    borderWidth: 1,
    padding: responsiveSpacing(10, 12, 14),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: scaleSize(FontSizes.medium),
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.error,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: scaleSize(FontSizes.small),
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: scaleSize(FontSizes.medium),
    marginTop: LAYOUT_CONSTANTS.SPACING.LG,
  },
  chip: {
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(6),
    borderRadius: 999,
    backgroundColor: colors.backgroundPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.infoLight,
    borderColor: colors.info,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: scaleSize(FontSizes.small),
  },
  chipTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: responsiveSpacing(16, 24, 32),
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: colors.backgroundPrimary,
    padding: responsiveSpacing(16, 20, 24),
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: scaleSize(FontSizes.heading3),
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'right',
  },
  modalInput: {
    height: scaleSize(44),
    borderRadius: 10,
    paddingHorizontal: responsiveSpacing(10, 12, 14),
    backgroundColor: colors.backgroundSecondary,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    textAlign: 'right',
    fontSize: scaleSize(FontSizes.medium),
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  pickerLabel: {
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: 'right',
    fontSize: scaleSize(FontSizes.small),
  },
  pickerBox: {
    height: scaleSize(44),
    borderRadius: 10,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: responsiveSpacing(10, 12, 14),
    justifyContent: 'center',
  },
  pickerValue: {
    color: colors.textPrimary,
    textAlign: 'right',
    fontSize: scaleSize(FontSizes.medium),
  },
  pickerOptions: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  modalBtn: {
    flex: 1,
    height: scaleSize(44),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancel: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalSave: {
    backgroundColor: colors.green,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: scaleSize(FontSizes.medium),
  },
  // Challenge card styles
  challengeCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: scaleSize(12),
    padding: responsiveSpacing(14, 16, 18),
    marginBottom: responsiveSpacing(12, 14, 16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveSpacing(10, 12, 14),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFA726',
  },
  challengeIconContainer: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: scaleSize(25),
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeContent: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: scaleSize(FontSizes.large),
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'right',
  },
  challengeSubtitle: {
    fontSize: scaleSize(FontSizes.small),
    color: colors.textSecondary,
    textAlign: 'right',
  },
});


