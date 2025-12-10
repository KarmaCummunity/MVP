import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { Ionicons } from '@expo/vector-icons';
import apiService, { ApiResponse } from '../utils/apiService';
import { useUser } from '../stores/userStore';

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
  const [creating, setCreating] = useState<boolean>(false);
  const [updating, setUpdating] = useState<string | null>(null); // Track which task is being updated
  const [deleting, setDeleting] = useState<string | null>(null); // Track which task is being deleted
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
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('שגיאה בטעינת משימות - נסה שוב');
    } finally {
      setLoading(false);
    }
  }, [query, filterStatus, filterPriority, filterCategory]);

  // Debounce search query - fetch immediately for filters, debounce for text search
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (query) {
      // Debounce text search
      timeout = setTimeout(() => {
        fetchTasks();
      }, 500);
    } else {
      // Immediate fetch for filters
      fetchTasks();
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [query, filterStatus, filterPriority, filterCategory, fetchTasks]);

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
    setEditingId(null);
  };

  const createTask = async () => {
    if (!formData.title.trim()) return;
    setCreating(true);
    setError(null);
    try {
      // Validate date if provided
      let parsedDueDate = null;
      if (formData.due_date.trim()) {
        const date = new Date(formData.due_date);
        if (isNaN(date.getTime())) {
          setError('תאריך לא תקין - אנא השתמש בפורמט YYYY-MM-DD');
          setCreating(false);
          return;
        }
        parsedDueDate = date.toISOString();
      }

      const body = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        status: formData.status,
        category: formData.category || null,
        due_date: parsedDueDate,
        assigneesEmails: formData.assigneesEmails.trim()
          ? formData.assigneesEmails.split(',').map((e) => e.trim()).filter(Boolean)
          : [],
        tags: formData.tagsText.trim()
          ? formData.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        created_by: selectedUser?.id || null,
      };
      const res: ApiResponse<AdminTask> = await apiService.createTask(body);
      if (!res.success) {
        setError(res.error || 'שגיאה ביצירת משימה');
      } else if (res.data) {
        // Refresh tasks from server to ensure consistency
        await fetchTasks();
        resetForm();
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('שגיאה ביצירת משימה - נסה שוב');
    } finally {
      setCreating(false);
    }
  };

  const toggleDone = async (task: AdminTask) => {
    setUpdating(task.id);
    setError(null);
    try {
      const nextStatus: TaskStatus = task.status === 'done' ? 'open' : 'done';
      const res: ApiResponse<AdminTask> = await apiService.updateTask(task.id, { status: nextStatus });
      if (res.success && res.data) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? (res.data as AdminTask) : t)));
      } else {
        setError(res.error || 'שגיאה בעדכון סטטוס המשימה');
      }
    } catch (err) {
      console.error('Error toggling task status:', err);
      setError('שגיאה בעדכון סטטוס המשימה - נסה שוב');
    } finally {
      setUpdating(null);
    }
  };

  const renderItem = ({ item }: { item: AdminTask }) => {
    const isDone = item.status === 'done';
    return (
      <View style={[styles.taskItem, isDone && styles.taskItemDone]}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => toggleDone(item)}
          disabled={updating === item.id}
        >
          {updating === item.id ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Ionicons name={isDone ? 'checkbox' : 'square-outline'} size={24} color={isDone ? colors.success : colors.textSecondary} />
          )}
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
            {Array.isArray(item.assignees) && item.assignees.length > 0 && (
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
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => deleteTask(item.id)}
              disabled={deleting === item.id}
            >
              {deleting === item.id ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <Text style={[styles.actionText, { color: colors.error }]}>מחק</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const openEdit = (task: AdminTask) => {
    // Note: assigneesEmails will be empty when editing - user needs to re-enter emails
    // This is a limitation - we'd need an API to get user emails by UUIDs
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      category: task.category || 'development',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 10) : '',
      assigneesEmails: '', // Empty - user needs to re-enter if they want to change assignees
      tagsText: (task.tags || []).join(', '),
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setUpdating(editingId);
    setError(null);
    try {
      // Validate date if provided
      let parsedDueDate = null;
      if (formData.due_date.trim()) {
        const date = new Date(formData.due_date);
        if (isNaN(date.getTime())) {
          setError('תאריך לא תקין - אנא השתמש בפורמט YYYY-MM-DD');
          setUpdating(null);
          return;
        }
        parsedDueDate = date.toISOString();
      }

      const body: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        status: formData.status,
        category: formData.category || null,
        due_date: parsedDueDate,
        tags: formData.tagsText ? formData.tagsText.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (formData.assigneesEmails.trim()) {
        body.assigneesEmails = formData.assigneesEmails.split(',').map((e) => e.trim()).filter(Boolean);
      }
      const res = await apiService.updateTask(editingId, body);
      if (res.success && res.data) {
        // Refresh tasks from server to ensure consistency
        await fetchTasks();
        setShowForm(false);
        resetForm();
        setEditingId(null);
      } else {
        setError(res.error || 'שגיאה בעדכון משימה');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('שגיאה בעדכון משימה - נסה שוב');
    } finally {
      setUpdating(null);
    }
  };

  const deleteTask = async (taskId: string) => {
    setDeleting(taskId);
    setError(null);
    try {
      const res = await apiService.deleteTask(taskId);
      if (res.success) {
        // Refresh tasks from server to ensure consistency
        await fetchTasks();
      } else {
        setError(res.error || 'שגיאה במחיקת משימה');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('שגיאה במחיקת משימה - נסה שוב');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ניהול משימות</Text>

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
          <Ionicons name="search-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.chipsRow}>
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
      </View>

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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'עריכת משימה' : 'משימה חדשה'}</Text>
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
              {editingId ? (
                <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={saveEdit} disabled={updating === editingId}>
                  {updating === editingId ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalBtnText}>שמירה</Text>}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={createTask} disabled={creating || !formData.title.trim()}>
                  {creating ? <ActivityIndicator color={colors.white} /> : <Text style={styles.modalBtnText}>יצירה</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setShowForm(true); }}>
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ color: colors.textSecondary }}>{label}:</Text>
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
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    position: 'relative',
  },
  header: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
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
    height: 48,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  refreshBtn: {
    height: 48,
    width: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    flexWrap: 'wrap',
  },
  addButton: {
    position: 'absolute',
    right: LAYOUT_CONSTANTS.SPACING.LG,
    bottom: 100,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  listContent: {
    paddingBottom: LAYOUT_CONSTANTS.SPACING.XL,
    gap: LAYOUT_CONSTANTS.SPACING.SM,
    flexGrow: 1,
    minHeight: '150%', // Ensure content is always scrollable
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.LARGE,
    backgroundColor: colors.background,
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
    fontSize: FontSizes.large,
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
  },
  actionsRow: {
    marginTop: 8,
    flexDirection: 'row-reverse',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  priority_high: {
    backgroundColor: colors.pinkLight,
    borderColor: colors.pinkLight,
  },
  priority_medium: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warningLight,
  },
  priority_low: {
    backgroundColor: colors.successLight,
    borderColor: colors.successLight,
  },
  errorBox: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: FontSizes.medium,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.error,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: FontSizes.medium,
    marginTop: LAYOUT_CONSTANTS.SPACING.LG,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.infoLight,
    borderColor: colors.info,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: FontSizes.small,
  },
  chipTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: colors.background,
    padding: 16,
  },
  modalTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'right',
  },
  modalInput: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundSecondary,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    textAlign: 'right',
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
  },
  pickerBox: {
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  pickerValue: {
    color: colors.textPrimary,
    textAlign: 'right',
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
    height: 44,
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
    backgroundColor: colors.success,
  },
  modalBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
});


