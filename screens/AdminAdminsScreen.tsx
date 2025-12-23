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
    SafeAreaView,
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

    // Store eligible users separately
    const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
    
    // Store all managers for manager assignment
    const [allManagers, setAllManagers] = useState<any[]>([]);

    useEffect(() => {
        loadUsers();
    }, [searchQuery, selectedUser?.id]);

    const loadUsers = async () => {
        if (!selectedUser?.id) {
            console.log('[AdminAdminsScreen] No selectedUser.id, skipping load');
            return;
        }
        
        try {
            setIsLoading(true);
            const filters: any = { limit: 100 };
            if (searchQuery.trim()) {
                filters.search = searchQuery.trim();
            }

            // Load all users for display
            const response = await apiService.getUsers(filters);
            if (response.success && Array.isArray(response.data)) {
                // Keep only other users (not current user)
                const otherUsers = response.data.filter((u: any) => u.email !== selectedUser?.email);
                setUsersList(otherUsers);
                
                // Extract managers from the list (admins + super admin)
                const managers = response.data.filter((u: any) => {
                    const roles = u.roles || [];
                    return roles.includes('admin') || roles.includes('super_admin') || u.email === 'navesarussi@gmail.com';
                });
                setAllManagers(managers);
                
                console.log(`[AdminAdminsScreen] Loaded ${otherUsers.length} users, ${managers.length} managers`);
            } else {
                setUsersList([]);
                setAllManagers([]);
                console.log('[AdminAdminsScreen] Failed to load users:', response.error);
            }

            // Load eligible users for promotion (to know who can be promoted)
            const eligibleResponse = await apiService.getEligibleForPromotion(selectedUser.id);
            if (eligibleResponse.success && Array.isArray(eligibleResponse.data)) {
                setEligibleUsers(eligibleResponse.data);
                console.log(`[AdminAdminsScreen] Loaded ${eligibleResponse.data.length} eligible users for promotion`);
            } else {
                setEligibleUsers([]);
                console.log('[AdminAdminsScreen] Failed to load eligible users:', eligibleResponse.error);
            }
        } catch (error) {
            console.error('[AdminAdminsScreen] Error loading users:', error);
            Alert.alert('שגיאה', 'לא ניתן היה לטעון את המשתמשים');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if current user is super admin
    const isCurrentUserSuperAdmin = selectedUser?.email === 'navesarussi@gmail.com';

    // Check if a user can be promoted by current admin
    const canPromote = (user: any): boolean => {
        // Super admin can promote anyone
        if (isCurrentUserSuperAdmin) {
            const targetIsAlreadyAdmin = (user.roles || []).includes('admin') || (user.roles || []).includes('super_admin');
            const targetIsSuperAdmin = user.email === 'navesarussi@gmail.com';
            return !targetIsSuperAdmin && !targetIsAlreadyAdmin;
        }
        // Regular admins - check eligible list from server
        return eligibleUsers.some(e => e.id === user.id);
    };

    // Check if current admin can demote a user
    // We simplify this - let the server do the full validation
    // Just check basic conditions on client side
    const canDemote = (user: any): boolean => {
        // Super admin can demote anyone except themselves
        if (isCurrentUserSuperAdmin) return true;
        
        // For regular admins - check if user is in their subordinate tree
        // We use a simple heuristic: if user's parent_manager_id matches current admin
        // OR if the user was originally promoted by this admin (check eligibleUsers as proxy)
        // Let the server do the full tree validation
        const isDirectSubordinate = user.parent_manager_id === selectedUser?.id;
        
        // If user is a direct subordinate, definitely can demote
        if (isDirectSubordinate) return true;
        
        // For indirect subordinates, let the server validate
        // But show button as enabled if user is an admin (server will validate)
        return true; // Let server validate hierarchy
    };

    const handleToggleAdmin = async (user: any) => {
        const currentRoles = Array.isArray(user.roles) ? user.roles : [];
        const isAdmin = currentRoles.includes('admin') || currentRoles.includes('super_admin');
        const isSuperAdmin = user.email === 'navesarussi@gmail.com';

        if (isSuperAdmin) {
            Alert.alert('שגיאה', 'לא ניתן לשנות הרשאות למנהל הראשי');
            return;
        }

        if (!selectedUser?.id) {
            Alert.alert('שגיאה', 'לא ניתן לזהות את המשתמש הנוכחי');
            return;
        }

        const title = isAdmin ? 'הסרת הרשאות מנהל' : 'הפיכה למנהל';
        const message = isAdmin 
            ? `האם אתה בטוח שברצונך להסיר הרשאות מנהל מ-${user.name || user.email}?`
            : `האם אתה בטוח שברצונך להפוך את ${user.name || user.email} למנהל תחתיך?`;

        Alert.alert(title, message, [
            { text: 'ביטול', style: 'cancel' },
            {
                text: 'אישור',
                style: isAdmin ? 'destructive' : 'default',
                onPress: async () => {
                    let res;
                    if (isAdmin) {
                        // Demote admin
                        res = await apiService.demoteAdmin(user.id, selectedUser.id);
                    } else {
                        // Promote to admin (will also set as subordinate)
                        res = await apiService.promoteToAdmin(user.id, selectedUser.id);
                    }
                    
                    if (res.success) {
                        Alert.alert('הצלחה', res.message || 'העדכון בוצע בהצלחה');
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
        // Pre-select current manager if exists
        if (user.manager_details) {
            setNewManager({
                id: user.manager_details.id,
                name: user.manager_details.name,
                email: user.manager_details.email,
                avatar_url: user.manager_details.avatar_url
            });
        } else {
            setNewManager(null);
        }
        setShowManagerModal(true);
    };

    const saveManager = async () => {
        if (!selectedForManager) return;

        try {
            const managerId = newManager ? newManager.id : null;
            console.log(`[AdminAdminsScreen] Setting manager: userId=${selectedForManager.id}, managerId=${managerId}, requestedBy=${selectedUser?.id}`);
            const res = await apiService.setManager(selectedForManager.id, managerId, selectedUser?.id);
            if (res.success) {
                Alert.alert('הצלחה', managerId ? 'מנהל עודכן בהצלחה' : 'שיוך מנהל הוסר בהצלחה');
                setShowManagerModal(false);
                loadUsers();
            } else {
                Alert.alert('שגיאה', res.error || 'נכשל בעדכון מנהל');
            }
        } catch (e) {
            console.error('[AdminAdminsScreen] Error saving manager:', e);
            Alert.alert('שגיאה', 'אירעה שגיאה');
        }
    };
    
    const removeManager = async () => {
        if (!selectedForManager) return;
        
        Alert.alert(
            'הסרת שיוך מנהל',
            `האם להסיר את שיוך המנהל מ-${selectedForManager.name || selectedForManager.email}?`,
            [
                { text: 'ביטול', style: 'cancel' },
                {
                    text: 'הסר',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log(`[AdminAdminsScreen] Removing manager for userId=${selectedForManager.id}, requestedBy=${selectedUser?.id}`);
                            const res = await apiService.setManager(selectedForManager.id, null, selectedUser?.id);
                            if (res.success) {
                                Alert.alert('הצלחה', 'שיוך מנהל הוסר בהצלחה');
                                setShowManagerModal(false);
                                loadUsers();
                            } else {
                                Alert.alert('שגיאה', res.error || 'נכשל בהסרת שיוך מנהל');
                            }
                        } catch (e) {
                            console.error('[AdminAdminsScreen] Error removing manager:', e);
                            Alert.alert('שגיאה', 'אירעה שגיאה');
                        }
                    }
                }
            ]
        );
    };
    
    // Get managers that can be assigned (exclude the user themselves and create cycle prevention)
    const getEligibleManagersForUser = (user: any) => {
        if (!user) return allManagers;
        // Filter out: the user themselves, and users who would create a cycle
        return allManagers.filter((m: any) => m.id !== user.id);
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
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContentContainer,
                    Platform.OS === 'web' && { paddingBottom: 120 }
                ]}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadUsers} />}
                ListHeaderComponent={renderHeader}
                scrollEnabled={true}
                nestedScrollEnabled={Platform.OS === 'web' ? true : undefined}
                style={styles.flatList}
                renderItem={({ item: user }) => {
                    const isAdmin = (user.roles || []).includes('admin') || (user.roles || []).includes('super_admin');
                    const isSuperAdmin = user.email === 'navesarussi@gmail.com';
                    const userCanBePromoted = canPromote(user);
                    const userCanBeDemoted = canDemote(user);
                    const isActionDisabled = isSuperAdmin || (isAdmin ? !userCanBeDemoted : !userCanBePromoted);
                    
                    // Determine button text and reason for disabled state
                    let buttonText = isAdmin ? 'הסר ניהול' : 'הפוך למנהל';
                    if (isSuperAdmin) {
                        buttonText = 'ראשי';
                    } else if (isAdmin && !userCanBeDemoted) {
                        buttonText = 'מנהל (לא שלך)';
                    } else if (!isAdmin && !userCanBePromoted) {
                        buttonText = 'לא זמין';
                    }

                    return (
                        <View style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name || 'ללא שם'}</Text>
                                <Text style={styles.userEmail}>{user.email}</Text>
                                {user.manager_details && (
                                    <View style={styles.managerBadge}>
                                        <Ionicons name="people-outline" size={12} color={colors.primary} />
                                        <Text style={styles.managerText}>מדווח ל- {user.manager_details.name}</Text>
                                    </View>
                                )}
                                {isAdmin && user.parent_manager_id === selectedUser?.id && (
                                    <View style={[styles.managerBadge, { backgroundColor: colors.success + '20' }]}>
                                        <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                                        <Text style={[styles.managerText, { color: colors.success }]}>מנהל תחתיך</Text>
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
                                    style={[
                                        styles.actionButton, 
                                        isAdmin ? styles.removeButton : styles.addButton, 
                                        isActionDisabled && styles.lockedButton
                                    ]}
                                    onPress={() => handleToggleAdmin(user)}
                                    disabled={isActionDisabled}
                                >
                                    <Text style={styles.actionBtnText}>{buttonText}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />

            <Modal visible={showManagerModal} animationType="fade" transparent>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>הגדרת מנהל עבור {selectedForManager?.name || 'משתמש'}</Text>
                            <TouchableOpacity onPress={() => setShowManagerModal(false)}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedForManager?.manager_details && (
                            <View style={styles.currentManagerBox}>
                                <Text style={styles.currentManagerLabel}>מנהל נוכחי:</Text>
                                <Text style={styles.currentManagerName}>{selectedForManager.manager_details.name}</Text>
                                <TouchableOpacity 
                                    style={styles.removeManagerBtn}
                                    onPress={removeManager}
                                >
                                    <Ionicons name="trash-outline" size={16} color={colors.error} />
                                    <Text style={styles.removeManagerText}>הסר שיוך</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        
                        <Text style={styles.modalSubtitle}>
                            {selectedForManager?.manager_details ? 'החלף למנהל אחר:' : 'בחר מנהל:'}
                        </Text>

                        <View style={styles.managersList}>
                            <FlatList
                                data={getEligibleManagersForUser(selectedForManager)}
                                keyExtractor={(item) => item.id}
                                style={{ maxHeight: 200 }}
                                renderItem={({ item: manager }) => {
                                    const isSelected = newManager?.id === manager.id;
                                    const isCurrentManager = selectedForManager?.manager_details?.id === manager.id;
                                    
                                    return (
                                        <TouchableOpacity
                                            style={[
                                                styles.managerItem,
                                                isSelected && styles.managerItemSelected,
                                                isCurrentManager && styles.managerItemCurrent
                                            ]}
                                            onPress={() => setNewManager(manager)}
                                        >
                                            <View style={styles.managerItemInfo}>
                                                <Text style={styles.managerItemName}>{manager.name || 'ללא שם'}</Text>
                                                <Text style={styles.managerItemEmail}>{manager.email}</Text>
                                            </View>
                                            {isSelected && (
                                                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                            )}
                                            {isCurrentManager && !isSelected && (
                                                <Text style={styles.currentBadge}>נוכחי</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={
                                    <Text style={styles.emptyManagersText}>אין מנהלים זמינים</Text>
                                }
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setShowManagerModal(false)}>
                                <Text style={[styles.modalBtnText, { color: colors.textPrimary }]}>ביטול</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[
                                    styles.modalBtn, 
                                    styles.modalSave,
                                    (!newManager || newManager.id === selectedForManager?.manager_details?.id) && styles.modalBtnDisabled
                                ]} 
                                onPress={saveManager}
                                disabled={!newManager || newManager.id === selectedForManager?.manager_details?.id}
                            >
                                <Text style={styles.modalBtnText}>שמור</Text>
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
        ...(Platform.OS === 'web' && {
            position: 'relative' as any,
        }),
    },
    flatList: {
        flex: 1,
    },
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
    modalCard: { backgroundColor: colors.background, borderRadius: 16, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', flex: 1 },
    modalSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 12, textAlign: 'right' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalCancel: { backgroundColor: colors.backgroundSecondary },
    modalSave: { backgroundColor: colors.primary },
    modalBtnDisabled: { backgroundColor: colors.textTertiary },
    modalBtnText: { color: 'white', fontWeight: 'bold' },
    
    // Current manager box
    currentManagerBox: { 
        backgroundColor: colors.backgroundSecondary, 
        padding: 12, 
        borderRadius: 8, 
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    currentManagerLabel: { fontSize: 12, color: colors.textSecondary },
    currentManagerName: { fontSize: 14, fontWeight: 'bold', color: colors.textPrimary, flex: 1, marginLeft: 8 },
    removeManagerBtn: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 4,
        padding: 8,
        borderRadius: 6,
        backgroundColor: colors.error + '15'
    },
    removeManagerText: { fontSize: 12, color: colors.error, fontWeight: '600' },
    
    // Managers list
    managersList: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, overflow: 'hidden' },
    managerItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 12, 
        borderBottomWidth: 1, 
        borderBottomColor: colors.border,
        backgroundColor: colors.background
    },
    managerItemSelected: { backgroundColor: colors.primary + '15' },
    managerItemCurrent: { backgroundColor: colors.info + '10' },
    managerItemInfo: { flex: 1 },
    managerItemName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
    managerItemEmail: { fontSize: 12, color: colors.textSecondary },
    currentBadge: { 
        fontSize: 10, 
        color: colors.info, 
        fontWeight: 'bold',
        backgroundColor: colors.info + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    emptyManagersText: { padding: 20, textAlign: 'center', color: colors.textSecondary },
});
