import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Platform,
    FlatList,
    Modal,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { AdminStackParamList } from '../globals/types';
import { useUser } from '../stores/userStore';
import { logger } from '../utils/loggerService';
import { apiService } from '../utils/apiService';
import { useAdminProtection } from '../hooks/useAdminProtection';
import UserSelector from '../components/UserSelector';

interface AdminAdminsScreenProps {
    navigation: NavigationProp<AdminStackParamList>;
}

const LOG_SOURCE = 'AdminAdminsScreen';

export default function AdminAdminsScreen({ navigation }: AdminAdminsScreenProps) {
    useAdminProtection();
    const { selectedUser } = useUser();
    const [usersList, setUsersList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'admins' | 'users'>('admins');

    // Manager Assignment State
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [selectedForManager, setSelectedForManager] = useState<any>(null);
    const [newManager, setNewManager] = useState<any>(null);

    useEffect(() => {
        loadUsers();
    }, [searchQuery]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const filters: any = { limit: 100 };
            if (searchQuery.trim()) {
                filters.search = searchQuery.trim();
            }

            const response = await apiService.getUsers(filters);
            if (response.success && Array.isArray(response.data)) {
                // Keep only other users
                const otherUsers = response.data.filter((u: any) => u.email !== selectedUser?.email);
                setUsersList(otherUsers);
            } else {
                setUsersList([]);
            }
        } catch (error) {
            Alert.alert('שגיאה', 'לא ניתן היה לטעון את המשתמשים');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAdmin = async (user: any) => {
        const currentRoles = Array.isArray(user.roles) ? user.roles : [];
        const isAdmin = currentRoles.includes('admin');
        const isSuperAdmin = user.email === 'navesarussi@gmail.com';

        if (isSuperAdmin) {
            Alert.alert('שגיאה', 'לא ניתן לשנות הרשאות למנהל הראשי');
            return;
        }

        const newRoles = isAdmin
            ? currentRoles.filter((r: string) => r !== 'admin')
            : [...currentRoles, 'admin'];

        const title = isAdmin ? 'הסרת הרשאות מנהל' : 'הוספת הרשאות מנהל';
        const message = `האם אתה בטוח שברצונך ${isAdmin ? 'להסיר' : 'לתת'} הרשאות מנהל ל-${user.name || user.email}?`;

        Alert.alert(title, message, [
            { text: 'ביטול', style: 'cancel' },
            {
                text: 'אישור',
                style: isAdmin ? 'destructive' : 'default',
                onPress: async () => {
                    const res = await apiService.updateUser(user.id, { roles: newRoles });
                    if (res.success) {
                        loadUsers();
                    } else {
                        Alert.alert('שגיאה', res.error || 'נכשל בעדכון');
                    }
                }
            }
        ]);
    };

    const openManagerModal = (user: any) => {
        setSelectedForManager(user);
        setNewManager(null); // Reset selection
        setShowManagerModal(true);
    };

    const saveManager = async () => {
        if (!selectedForManager) return;

        try {
            const managerId = newManager ? newManager.id : null;
            const res = await apiService.setManager(selectedForManager.id, managerId);
            if (res.success) {
                Alert.alert('הצלחה', 'מנהל עודכן בהצלחה');
                setShowManagerModal(false);
                loadUsers();
            } else {
                Alert.alert('שגיאה', res.error || 'נכשל בעדכון מנהל');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('שגיאה', 'אירעה שגיאה');
        }
    };

    const getFilteredUsers = () => {
        return usersList.filter(user => {
            const currentRoles = Array.isArray(user.roles) ? user.roles : [];
            const isAdmin = currentRoles.includes('admin') || currentRoles.includes('super_admin');
            return activeTab === 'admins' ? isAdmin : !isAdmin;
        });
    };

    const filteredUsers = getFilteredUsers();

    const renderHeader = () => (
        <>
            <View style={styles.header}>
                <Text style={styles.title}>ניהול מנהלים</Text>
            </View>
            <View style={styles.tabsContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'admins' && styles.activeTab]} onPress={() => setActiveTab('admins')}>
                    <Text style={[styles.tabText, activeTab === 'admins' && styles.activeTabText]}>מנהלים</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'users' && styles.activeTab]} onPress={() => setActiveTab('users')}>
                    <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>משתמשים</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="חפש משתמש..."
                    placeholderTextColor={colors.textTertiary}
                />
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadUsers} />}
                ListHeaderComponent={renderHeader}
                renderItem={({ item: user }) => {
                    const isAdmin = (user.roles || []).includes('admin');
                    const isSuperAdmin = user.email === 'navesarussi@gmail.com';

                    return (
                        <View style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name || 'ללא שם'}</Text>
                                <Text style={styles.userEmail}>{user.email}</Text>
                                {user.parent_manager_id && (
                                    <View style={styles.managerBadge}>
                                        <Ionicons name="people-outline" size={12} color={colors.primary} />
                                        <Text style={styles.managerText}>מדווח ל- {user.parent_manager_id}</Text>
                                        {/* Ideally we would load the manager name, but UUID is fine for MVP or requires join on getUsers */}
                                    </View>
                                )}
                            </View>

                            <View style={styles.actionsColumn}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.managerBtn]}
                                    onPress={() => openManagerModal(user)}
                                >
                                    <Text style={styles.actionBtnText}>שיוך מנהל</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, isAdmin ? styles.removeButton : styles.addButton, isSuperAdmin && styles.lockedButton]}
                                    onPress={() => handleToggleAdmin(user)}
                                    disabled={isSuperAdmin}
                                >
                                    <Text style={styles.actionBtnText}>
                                        {isSuperAdmin ? 'ראשי' : (isAdmin ? 'הסר ניהול' : 'מנהל')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />

            <Modal visible={showManagerModal} animationType="fade" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>הגדרת מנהל עבור {selectedForManager?.name}</Text>
                        <Text style={styles.modalSubtitle}>בחר את המנהל הישיר:</Text>

                        <View style={{ maxHeight: 200 }}>
                            <UserSelector
                                selectedUsers={newManager ? [newManager] : []}
                                onSelect={(u) => setNewManager(u)}
                                onRemove={() => setNewManager(null)}
                                singleSelection
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setShowManagerModal(false)}>
                                <Text style={styles.modalBtnText}>ביטול</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalSave]} onPress={saveManager}>
                                <Text style={styles.modalBtnText}>שמור</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundSecondary },
    header: { padding: LAYOUT_CONSTANTS.SPACING.LG, backgroundColor: colors.background, alignItems: 'center' },
    title: { fontSize: FontSizes.heading1, fontWeight: 'bold', color: colors.textPrimary },
    tabsContainer: { flexDirection: 'row', padding: 8, margin: 16, backgroundColor: colors.background, borderRadius: 8 },
    tab: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 4 },
    activeTab: { backgroundColor: colors.primary + '20' },
    tabText: { color: colors.textSecondary },
    activeTabText: { color: colors.primary, fontWeight: 'bold' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, marginHorizontal: 16, padding: 12, borderRadius: 8 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, textAlign: 'right', fontSize: 16 },
    listContentContainer: { paddingBottom: 100 },

    userCard: { backgroundColor: colors.background, marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    userInfo: { flex: 1 },
    userName: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'left' },
    userEmail: { fontSize: 14, color: colors.textSecondary, marginBottom: 4, textAlign: 'left' },
    managerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    managerText: { fontSize: 12, color: colors.primary },

    actionsColumn: { gap: 8 },
    actionButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignItems: 'center', minWidth: 80 },
    managerBtn: { backgroundColor: colors.info },
    addButton: { backgroundColor: colors.primary },
    removeButton: { backgroundColor: colors.error },
    lockedButton: { backgroundColor: colors.textTertiary },
    actionBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: colors.background, borderRadius: 16, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 12, textAlign: 'right' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalCancel: { backgroundColor: colors.backgroundSecondary },
    modalSave: { backgroundColor: colors.primary },
    modalBtnText: { color: 'white', fontWeight: 'bold' },
});
