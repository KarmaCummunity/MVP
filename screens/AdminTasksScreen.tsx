import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal, Image, SafeAreaView, Platform } from 'react-native';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { Ionicons } from '@expo/vector-icons';
import apiService, { ApiResponse } from '../utils/apiService';
import { useUser } from '../stores/userStore';
import { useAdminProtection } from '../hooks/useAdminProtection';
import UserSelector from '../components/UserSelector';

type TaskStatus = 'open' | 'in_progress' | 'done' | 'archived';
type TaskPriority = 'low' | 'medium' | 'high';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

type AdminTask = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string | null;
  due_date?: string | null;
  assignees: string[]; // UUIDs
  assignees_details?: User[]; // Full objects
  creator_details?: User;
  tags: string[];
  checklist?: { id: string; text: string; done: boolean }[];
  created_by?: string | null;
  parent_task_id?: string | null;
  parent_task_details?: { id: string; title: string } | null;
  subtask_count?: number;
  created_at?: string;
  updated_at?: string;
};

export default function AdminTasksScreen() {
  useAdminProtection();
  const { selectedUser } = useUser();
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<boolean>(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'open' as TaskStatus,
    category: 'development',
    due_date: '',
    assignees: [] as User[],
    tagsText: '' as string,
    parent_task_id: '' as string,
  });

  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [filterCategory, setFilterCategory] = useState<string | ''>('');
  const [filterAssignee, setFilterAssignee] = useState<'all' | 'me'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [subtasks, setSubtasks] = useState<Record<string, AdminTask[]>>({});
  const [loadingSubtasks, setLoadingSubtasks] = useState<string | null>(null);

  useEffect(() => {
    console.log('📋 Tasks List Updated in Component:', tasks.map(t => `${t.id.substring(0, 8)}:${t.title}`).join(', '));
  }, [tasks]);

  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => {
      // First sort by ownership if "My Tasks" is NOT active (to bring mine to top implicitly? No, sticking to date/priority)
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
    console.log('🔄 Fetching tasks...', { query, filterStatus, filterPriority, filterCategory, filterAssignee, selectedUserId: selectedUser?.id });
    try {
      const res: ApiResponse<AdminTask[]> = await apiService.getTasks({
        q: query || undefined,
        status: filterStatus || undefined,
        priority: filterPriority || undefined,
        category: filterCategory || undefined,
        assignee: filterAssignee === 'me' ? selectedUser?.id : undefined,
      });
      console.log('✅ Fetch tasks response:', res.success, res.data?.length);
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
  }, [query, filterStatus, filterPriority, filterCategory, filterAssignee, selectedUser]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (query) {
      timeout = setTimeout(() => fetchTasks(), 500);
    } else {
      fetchTasks();
    }
    return () => { if (timeout) clearTimeout(timeout); };
  }, [query, filterStatus, filterPriority, filterCategory, filterAssignee, fetchTasks]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'open',
      category: 'development',
      due_date: '',
      assignees: [],
      tagsText: '',
      parent_task_id: '',
    });
    setEditingId(null);
  };

  const toggleSubtasks = async (taskId: string) => {
    if (expandedTasks.has(taskId)) {
      // Collapse
      const newExpanded = new Set(expandedTasks);
      newExpanded.delete(taskId);
      setExpandedTasks(newExpanded);
    } else {
      // Expand and load subtasks
      setLoadingSubtasks(taskId);
      try {
        const res = await apiService.getSubtasks(taskId);
        if (res.success && res.data) {
          setSubtasks(prev => ({ ...prev, [taskId]: res.data }));
        }
        const newExpanded = new Set(expandedTasks);
        newExpanded.add(taskId);
        setExpandedTasks(newExpanded);
      } catch (err) {
        console.error('Failed to load subtasks:', err);
      } finally {
        setLoadingSubtasks(null);
      }
    }
  };

  const createSubtask = (parentTask: AdminTask) => {
    setFormData({
      title: '',
      description: '',
      priority: parentTask.priority,
      status: 'open',
      category: parentTask.category || 'development',
      due_date: '',
      assignees: parentTask.assignees_details || [],
      tagsText: '',
      parent_task_id: parentTask.id,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const createTask = async () => {
    if (!formData.title.trim()) return;
    
    // Validate created_by is available
    if (!selectedUser?.id) {
      setError('שגיאה: לא ניתן לזהות את המשתמש הנוכחי. נסה להתחבר מחדש.');
      return;
    }
    
    setCreating(true);
    setError(null);
    try {
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
        assignees: formData.assignees.map(u => u.id), // UUIDs - server will set defaults if empty
        tags: formData.tagsText.trim()
          ? formData.tagsText.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        created_by: selectedUser.id, // Always required
        parent_task_id: formData.parent_task_id || null,
      };

      console.log('📤 Creating task with payload:', body);

      const res: ApiResponse<AdminTask> = await apiService.createTask(body);
      if (!res.success) {
        // Handle specific permission error
        if (res.error?.includes('הרשאה')) {
          setError('אין לך הרשאה להקצות משימה למשתמשים אלה. ניתן להקצות משימות רק לעובדים שלך.');
        } else {
          setError(res.error || 'שגיאה ביצירת משימה');
        }
      } else if (res.data) {
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
        await fetchTasks();
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

  const renderItem = ({ item, isSubtask = false }: { item: AdminTask; isSubtask?: boolean }) => {
    const isDone = item.status === 'done';
    const hasSubtasks = (item.subtask_count || 0) > 0;
    const isExpanded = expandedTasks.has(item.id);
    const taskSubtasks = subtasks[item.id] || [];

    return (
      <View>
        <View style={[styles.taskItem, isDone && styles.taskItemDone, isSubtask && styles.subtaskItem]}>
          {/* Subtask Indicator */}
          {isSubtask && (
            <View style={styles.subtaskIndicator}>
              <Ionicons name="return-down-forward" size={16} color={colors.textSecondary} />
            </View>
          )}

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
            {/* Parent Task Reference */}
            {item.parent_task_details && (
              <View style={styles.parentBadge}>
                <Ionicons name="git-branch-outline" size={12} color={colors.info} />
                <Text style={styles.parentText}>תת-משימה של: {item.parent_task_details.title}</Text>
              </View>
            )}

            <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            ) : null}

            <View style={styles.metaRow}>
              {/* Priority Badge */}
              <View style={[styles.badge, styles[`priority_${item.priority}` as const]]}>
                <Text style={styles.badgeText}>
                  {item.priority === 'high' ? 'גבוהה' : item.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                </Text>
              </View>

              {/* Status Badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.status === 'open' ? 'פתוחה' : item.status === 'in_progress' ? 'בתהליך' : item.status === 'done' ? 'בוצעה' : 'בארכיון'}</Text>
              </View>

              {/* Subtasks Count Badge */}
              {hasSubtasks && (
                <TouchableOpacity 
                  style={[styles.badge, styles.subtaskBadge]}
                  onPress={() => toggleSubtasks(item.id)}
                >
                  {loadingSubtasks === item.id ? (
                    <ActivityIndicator size="small" color={colors.info} />
                  ) : (
                    <>
                      <Ionicons 
                        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                        size={12} 
                        color={colors.info} 
                      />
                      <Text style={styles.subtaskBadgeText}>{item.subtask_count} תת-משימות</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Assignees */}
              <View style={styles.assigneesContainer}>
                {item.assignees_details && item.assignees_details.length > 0 ? (
                  <View style={styles.assigneesContent}>
                    <Text style={styles.assigneeText} numberOfLines={1}>
                      משוייך ל: {item.assignees_details.map(u => u.name).join(', ')}
                    </Text>
                    <View style={styles.avatarsRow}>
                      {item.assignees_details.slice(0, 3).map((u, i) => (
                        <Image
                          key={u.id}
                          source={{ uri: u.avatar_url || `https://ui-avatars.com/api/?name=${u.name}` }}
                          style={[styles.avatarSmall, { marginRight: i > 0 ? -10 : 0, zIndex: 3 - i }]}
                        />
                      ))}
                      {item.assignees_details.length > 3 && (
                        <View style={[styles.avatarSmall, styles.moreAvatar]}>
                          <Text style={styles.moreAvatarText}>+{item.assignees_details.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.unassignedText}>⚠️ המשימה לא שוייכה לאף אחד</Text>
                )}
              </View>
            </View>

            {item.creator_details && (
              <Text style={styles.creatorText}>נוצר ע"י {item.creator_details.name}</Text>
            )}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(item)}>
              <Ionicons name="create-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.actionText}>ערוך</Text>
            </TouchableOpacity>
            {!isSubtask && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => createSubtask(item)}>
                <Ionicons name="add-circle-outline" size={18} color={colors.info} />
                <Text style={[styles.actionText, { color: colors.info }]}>תת-משימה</Text>
              </TouchableOpacity>
            )}
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

      {/* Subtasks List */}
      {isExpanded && taskSubtasks.length > 0 && (
        <View style={styles.subtasksList}>
          {taskSubtasks.map((subtask) => (
            <View key={subtask.id}>
              {renderItem({ item: subtask, isSubtask: true })}
            </View>
          ))}
        </View>
      )}
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
      assignees: task.assignees_details || [],
      tagsText: (task.tags || []).join(', '),
      parent_task_id: task.parent_task_id || '',
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setUpdating(editingId);
    setError(null);
    try {
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
        assignees: formData.assignees.map(u => u.id),
      };

      const res = await apiService.updateTask(editingId, body);
      if (res.success && res.data) {
        await fetchTasks();
        setShowForm(false);
        resetForm();
        setEditingId(null);
      } else {
        // Handle specific permission error
        if (res.error?.includes('הרשאה')) {
          setError('אין לך הרשאה להקצות משימה למשתמשים אלה. ניתן להקצות משימות רק לעובדים שלך.');
        } else {
          setError(res.error || 'שגיאה בעדכון משימה');
        }
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

  const renderHeader = () => (
    <>
      <Text style={styles.header}>ניהול משימות וצוות</Text>

      <View style={styles.filtersRow}>
        <TextInput
          style={styles.input}
          placeholder="חיפוש משימות..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchTasks}>
          <Ionicons name="search-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={{ color: colors.error, textAlign: 'right', marginBottom: 8, fontWeight: 'bold' }}>{error}</Text>
      )}


      <View style={styles.chipsRow}>
        <FilterChip label="למי מוקצה" value={filterAssignee} setValue={setFilterAssignee} options={[
          { value: 'all', label: 'כולם' },
          { value: 'me', label: 'רק שלי' },
        ]} />
        <FilterChip label="סטטוס" value={filterStatus} setValue={setFilterStatus} options={[
          { value: '', label: 'הכל' },
          { value: 'open', label: 'פתוחה' },
          { value: 'in_progress', label: 'בתהליך' },
          { value: 'done', label: 'בוצעה' },
        ]} />
        <FilterChip label="עדיפות" value={filterPriority} setValue={setFilterPriority} options={[
          { value: '', label: 'הכל' },
          { value: 'high', label: 'גבוהה' },
          { value: 'medium', label: 'בינונית' },
        ]} />
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          Platform.OS === 'web' && { paddingBottom: 120 }
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={<Text style={styles.emptyText}>אין משימות כרגע</Text>}
        scrollEnabled={true}
        nestedScrollEnabled={Platform.OS === 'web' ? true : undefined}
        style={styles.flatList}
      />

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? 'עריכת משימה' : 'משימה חדשה'}</Text>

            <TextInput style={styles.modalInput} placeholder="כותרת" value={formData.title} onChangeText={(v) => setFormData({ ...formData, title: v })} />
            <TextInput style={[styles.modalInput, { height: 60 }]} placeholder="תיאור" multiline value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} />

            <View style={styles.row2}>
              <PickerField
                label="עדיפות"
                value={formData.priority}
                onChange={(v: string) => setFormData({ ...formData, priority: v as TaskPriority })}
                options={[
                  { value: 'high', label: 'גבוהה' },
                  { value: 'medium', label: 'בינונית' },
                  { value: 'low', label: 'נמוכה' },
                ]}
              />
              <PickerField
                label="סטטוס"
                value={formData.status}
                onChange={(v: string) => setFormData({ ...formData, status: v as TaskStatus })}
                options={[
                  { value: 'open', label: 'פתוחה' },
                  { value: 'done', label: 'בוצעה' },
                ]}
              />
            </View>

            {/* User Selector for Assignees */}
            <UserSelector
              selectedUsers={formData.assignees}
              onSelect={(u) => setFormData({ ...formData, assignees: [...formData.assignees, u] })}
              onRemove={(id) => setFormData({ ...formData, assignees: formData.assignees.filter(u => u.id !== id) })}
            />

            <TextInput style={styles.modalInput} placeholder="תגיות (מופרדות אות)" value={formData.tagsText} onChangeText={(v) => setFormData({ ...formData, tagsText: v })} />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => { setShowForm(false); resetForm(); }}>
                <Text style={styles.modalBtnText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={editingId ? saveEdit : createTask}>
                <Text style={styles.modalBtnText}>{editingId ? 'שמור' : 'צור'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setShowForm(true); }}>
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Sub-components
function PickerField({ label, value, onChange, options }: any) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <View style={styles.pickerOptions}>
        {options.map((opt: any) => (
          <TouchableOpacity key={opt.value} onPress={() => onChange(opt.value)} style={[styles.chip, value === opt.value && styles.chipActive]}>
            <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function FilterChip({ label, value, setValue, options }: any) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ color: colors.textSecondary }}>{label}:</Text>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {options.map((opt: any) => (
          <TouchableOpacity key={`${label}-${opt.value}`} onPress={() => setValue(opt.value)} style={[styles.chip, value === opt.value && styles.chipActive]}>
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
    ...(Platform.OS === 'web' && {
      position: 'relative' as any,
    }),
  },
  header: {
    fontSize: FontSizes.heading2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    textAlign: 'right',
  },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  input: { flex: 1, height: 44, backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 10, textAlign: 'right', color: colors.textPrimary },
  refreshBtn: { width: 44, height: 44, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  listContent: { paddingBottom: 100, gap: 12 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },

  taskItem: { flexDirection: 'row', padding: 12, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  taskItemDone: { opacity: 0.6 },
  checkbox: { marginRight: 12, paddingTop: 4 },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'right' },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textSecondary },
  description: { fontSize: 14, color: colors.textSecondary, textAlign: 'right', marginBottom: 6 },

  metaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border },
  badgeText: { fontSize: 12, color: colors.textSecondary },
  priority_high: { backgroundColor: colors.pinkLight, borderColor: colors.pinkLight },
  priority_medium: { backgroundColor: colors.warningLight, borderColor: colors.warningLight },
  priority_low: { backgroundColor: colors.successLight, borderColor: colors.successLight },

  avatarsRow: { flexDirection: 'row-reverse', alignItems: 'center' },
  avatarSmall: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: colors.white },
  moreAvatar: { backgroundColor: colors.textSecondary, alignItems: 'center', justifyContent: 'center' },
  moreAvatarText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },

  creatorText: { fontSize: 11, color: colors.textSecondary, textAlign: 'right', marginTop: 4 },

  actionsRow: { flexDirection: 'row-reverse', gap: 16, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, color: colors.textPrimary },

  assigneesContainer: { marginTop: 4 },
  assigneesContent: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  assigneeText: { fontSize: 12, color: colors.textSecondary },
  unassignedText: { fontSize: 12, color: colors.error, fontWeight: 'bold' },

  // Subtask styles
  subtaskItem: { 
    marginLeft: 24, 
    borderLeftWidth: 2, 
    borderLeftColor: colors.info,
    backgroundColor: colors.backgroundSecondary,
  },
  subtaskIndicator: { 
    paddingRight: 8, 
    justifyContent: 'center',
  },
  subtasksList: { 
    marginTop: 8, 
    gap: 8,
  },
  subtaskBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: colors.infoLight,
    borderColor: colors.info,
  },
  subtaskBadgeText: { 
    fontSize: 11, 
    color: colors.info, 
    fontWeight: '600',
  },
  parentBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    marginBottom: 4,
    backgroundColor: colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  parentText: { 
    fontSize: 10, 
    color: colors.info,
  },

  flatList: {
    flex: 1,
  },
  addButton: { 
    ...(Platform.OS === 'web' ? { position: 'fixed' as any } : { position: 'absolute' }),
    left: 20, 
    bottom: 20, 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: colors.success, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    zIndex: 1000
  },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: colors.background, borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'right', marginBottom: 16, color: colors.textPrimary },
  modalInput: { height: 44, backgroundColor: colors.backgroundSecondary, borderRadius: 8, paddingHorizontal: 12, textAlign: 'right', marginBottom: 12, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  row2: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  pickerLabel: { textAlign: 'right', marginBottom: 4, color: colors.textSecondary },
  pickerOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  chipActive: { backgroundColor: colors.infoLight, borderColor: colors.info },
  chipText: { fontSize: 12, color: colors.textSecondary },
  chipTextActive: { color: colors.textPrimary, fontWeight: 'bold' },

  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalBtn: { flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modalCancel: { backgroundColor: colors.backgroundSecondary, borderWidth: 1, borderColor: colors.border },
  modalSave: { backgroundColor: colors.primary },
  modalBtnText: { color: colors.white, fontWeight: 'bold' },
});
