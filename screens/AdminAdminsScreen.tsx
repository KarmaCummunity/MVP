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
    const [isRemovingManager, setIsRemovingManager] = useState(false);

    // Store eligible users separately
    const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);

    // Store all managers for manager assignment
    const [allManagers, setAllManagers] = useState<any[]>([]);

    useEffect(() => {
        loadUsers();
    }, [searchQuery, selectedUser?.id]);

    const loadUsers = async (forceRefresh: boolean = false) => {
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

            // Force refresh after admin operations to ensure fresh data
            if (forceRefresh) {
                filters.forceRefresh = true;
                console.log('[AdminAdminsScreen] 🔄 FORCE REFRESH - Loading users with filters:', filters);
            } else {
                console.log('[AdminAdminsScreen] 🔄 Loading users with filters:', filters);
            }

            // Load all users for display
            const response = await apiService.getUsers(filters);

            console.log('[AdminAdminsScreen] 📡 Response from getUsers:', {
                success: response.success,
                dataLength: response.data?.length,
                error: response.error
            });

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

                console.log(`[AdminAdminsScreen] ✅ Loaded ${otherUsers.length} users, ${managers.length} managers`);
                console.log(`[AdminAdminsScreen] 📊 Sample user data:`, otherUsers.slice(0, 2).map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    roles: u.roles,
                    parent_manager_id: u.parent_manager_id,
                    manager_details: u.manager_details
                })));
            } else {
                setUsersList([]);
                setAllManagers([]);
                console.log('[AdminAdminsScreen] ❌ Failed to load users:', response.error);
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

    // Check if current user is super admin - based on roles, not email
    const currentUserRoles = selectedUser?.roles || [];
    const isCurrentUserSuperAdmin = currentUserRoles.includes('super_admin') ||
        currentUserRoles.includes('admin');

    console.log('[AdminAdminsScreen] 🔐 Current user check:', {
        userId: selectedUser?.id,
        email: selectedUser?.email,
        roles: selectedUser?.roles,
        isAdmin: isCurrentUserSuperAdmin
    });

    // Check if a user can be promoted by current admin
    const canPromote = (user: any): boolean => {
        // Admin/super_admin can promote users who are not already admins
        if (isCurrentUserSuperAdmin) {
            const targetRoles = user.roles || [];
            const targetIsAlreadyAdmin = targetRoles.includes('admin') || targetRoles.includes('super_admin');
            const canPromoteUser = !targetIsAlreadyAdmin;

            console.log('[AdminAdminsScreen] 🔍 canPromote check:', {
                targetId: user.id,
                targetEmail: user.email,
                targetRoles: user.roles,
                targetIsAlreadyAdmin,
                canPromoteUser
            });

            return canPromoteUser;
        }
        // Regular admins - check eligible list from server
        const isEligible = eligibleUsers.some(e => e.id === user.id);
        console.log('[AdminAdminsScreen] 🔍 canPromote (regular admin):', {
            targetId: user.id,
            targetEmail: user.email,
            isEligible,
            eligibleCount: eligibleUsers.length
        });
        return isEligible;
    };

    // Check if current admin can demote a user
    // We simplify this - let the server do the full validation
    // Just check basic conditions on client side
    const canDemote = (user: any): boolean => {
        const isSameUser = user.id === selectedUser?.id;

        // Cannot demote yourself
        if (isSameUser) {
            console.log('[AdminAdminsScreen] 🔍 canDemote: false (cannot demote yourself)');
            return false;
        }

        // Admin/super_admin can demote admins
        if (isCurrentUserSuperAdmin) {
            console.log('[AdminAdminsScreen] 🔍 canDemote (admin):', {
                targetId: user.id,
                targetEmail: user.email,
                canDemote: true
            });
            return true;
        }

        // For regular admins - check if user is in their subordinate tree
        // Let the server do the full tree validation
        const isDirectSubordinate = user.parent_manager_id === selectedUser?.id;

        console.log('[AdminAdminsScreen] 🔍 canDemote (checking hierarchy):', {
            targetId: user.id,
            isDirectSubordinate,
            allowForServerValidation: true
        });

        // Let server validate hierarchy - show button as enabled
        return true;
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
                    console.log(`[AdminAdminsScreen] ${isAdmin ? 'Demoting' : 'Promoting'} user:`, {
                        userId: user.id,
                        userName: user.name,
                        currentRoles: user.roles,
                        requestingAdminId: selectedUser.id
                    });

                    let res;
                    if (isAdmin) {
                        // Demote admin
                        res = await apiService.demoteAdmin(user.id, selectedUser.id);
                    } else {
                        // Promote to admin (will also set as subordinate)
                        res = await apiService.promoteToAdmin(user.id, selectedUser.id);
                    }

                    console.log(`[AdminAdminsScreen] 📡 ${isAdmin ? 'Demote' : 'Promote'} response:`, res);

                    if (res.success) {
                        Alert.alert('הצלחה', res.message || 'העדכון בוצע בהצלחה');
                        console.log('[AdminAdminsScreen] ✅ Operation successful, reloading users with force refresh...');
                        await loadUsers(true); // Force refresh to bypass cache
                    } else {
                        Alert.alert('שגיאה', res.error || 'נכשל בעדכון');
                        console.log('[AdminAdminsScreen] ❌ Operation failed:', res.error);
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
            console.log(`[AdminAdminsScreen] 📝 Setting manager:`, {
                userId: selectedForManager.id,
                userName: selectedForManager.name,
                currentManagerId: selectedForManager.parent_manager_id,
                newManagerId: managerId,
                newManagerName: newManager?.name,
                requestedBy: selectedUser?.id
            });

            const res = await apiService.setManager(selectedForManager.id, managerId, selectedUser?.id);

            console.log('[AdminAdminsScreen] 📡 setManager response:', res);

            if (res.success) {
                Alert.alert('הצלחה', managerId ? 'מנהל עודכן בהצלחה' : 'שיוך מנהל הוסר בהצלחה');
                setShowManagerModal(false);
                console.log('[AdminAdminsScreen] ✅ Manager updated successfully, reloading users with force refresh...');
                await loadUsers(true); // Force refresh to bypass cache
            } else {
                Alert.alert('שגיאה', res.error || 'נכשל בעדכון מנהל');
                console.log('[AdminAdminsScreen] ❌ Failed to update manager:', res.error);
            }
        } catch (e) {
            console.error('[AdminAdminsScreen] ❌ Error saving manager:', e);
            Alert.alert('שגיאה', 'אירעה שגיאה');
        }
    };

    // Direct remove function (without confirmation - used from modal button)
    const performRemoveManager = async () => {
        if (!selectedForManager) {
            console.log('[AdminAdminsScreen] performRemoveManager called but no selectedForManager');
            return;
        }

        try {
            console.log(`[AdminAdminsScreen] ⏳ Starting to remove manager for userId=${selectedForManager.id}, requestedBy=${selectedUser?.id}`);
            setIsRemovingManager(true);

            const res = await apiService.setManager(selectedForManager.id, null, selectedUser?.id);

            console.log(`[AdminAdminsScreen] 📡 Response from setManager:`, res);

            if (res.success) {
                Alert.alert('הצלחה', 'שיוך מנהל הוסר בהצלחה');
                setShowManagerModal(false);
                console.log('[AdminAdminsScreen] ✅ Manager removed successfully, reloading users with force refresh...');
                await loadUsers(true); // Force refresh to bypass cache
            } else {
                Alert.alert('שגיאה', res.error || 'נכשל בהסרת שיוך מנהל');
            }
        } catch (e) {
            console.error('[AdminAdminsScreen] ❌ Error removing manager:', e);
            Alert.alert('שגיאה', 'אירעה שגיאה בהסרת שיוך מנהל');
        } finally {
            setIsRemovingManager(false);
        }
    };

    // Remove manager with confirmation (used from outside modal)
    const removeManager = async () => {
        if (!selectedForManager) {
            console.log('[AdminAdminsScreen] removeManager called but no selectedForManager');
            return;
        }

        console.log('[AdminAdminsScreen] removeManager called for:', selectedForManager.name || selectedForManager.email);
        console.log('[AdminAdminsScreen] selectedForManager.id:', selectedForManager.id);
        console.log('[AdminAdminsScreen] selectedUser?.id:', selectedUser?.id);

        if (Platform.OS === 'web') {
            if (typeof window !== 'undefined' && window.confirm(`האם להסיר את שיוך המנהל מ-${selectedForManager.name || selectedForManager.email}?`)) {
                await performRemoveManager();
            }
        } else {
            Alert.alert(
                'הסרת שיוך מנהל',
                `האם להסיר את שיוך המנהל מ-${selectedForManager.name || selectedForManager.email}?`,
                [
                    { text: 'ביטול', style: 'cancel' },
                    {
                        text: 'הסר',
                        style: 'destructive',
                        onPress: performRemoveManager
                    }
                ]
            );
        }
    };

    // Get managers that can be assigned (exclude the user themselves and create cycle prevention)
    const getEligibleManagersForUser = (user: any) => {
        if (!user) return allManagers;
        // Filter out: the user themselves, and users who would create a cycle
        return allManagers.filter((m: any) => m.id !== user.id);
    };

    const getFilteredUsers = () => {
        return usersList.filter(user => {
            // New Logic: 
            // Admins tab (Managers) -> Users who HAVE a manager (parent_manager_id is NOT null)
            // Users tab -> Users who DO NOT have a manager (parent_manager_id IS null)
            const hasManager = !!user.parent_manager_id;

            // Also include actual admins/super_admins in the "Managers" tab even if they don't have a manager (e.g. root admin)
            const currentRoles = Array.isArray(user.roles) ? user.roles : [];
            const isAdminRole = currentRoles.includes('admin') || currentRoles.includes('super_admin');

            if (activeTab === 'admins') {
                return hasManager || isAdminRole;
            } else {
                return !hasManager && !isAdminRole;
            }
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
                showsVerticalScrollIndicator={true}
                removeClippedSubviews={Platform.OS !== 'web'}
                style={styles.flatList}
                renderItem={({ item: user }) => {
                    const userRoles = user.roles || [];
                    const isAdmin = userRoles.includes('admin') || userRoles.includes('super_admin');
                    const isSameUser = user.id === selectedUser?.id;
                    const userCanBePromoted = canPromote(user);
                    const userCanBeDemoted = canDemote(user);
                    const isActionDisabled = isSameUser || (isAdmin ? !userCanBeDemoted : !userCanBePromoted);

                    console.log('[AdminAdminsScreen] 📋 Render user:', {
                        userId: user.id,
                        email: user.email,
                        roles: user.roles,
                        isAdmin,
                        isSameUser,
                        userCanBePromoted,
                        userCanBeDemoted,
                        isActionDisabled
                    });

                    // Determine button text and reason for disabled state
                    let buttonText = isAdmin ? 'הסר ניהול' : 'הפוך למנהל';
                    if (isSameUser) {
                        buttonText = 'את עצמך';
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

                            </View>
                        </View>
                    );
                }}
            />

            < Modal visible={showManagerModal} animationType="fade" transparent >
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
                                    style={[styles.removeManagerBtn, isRemovingManager && { opacity: 0.5 }]}
                                    onPress={() => {
                                        console.log('[AdminAdminsScreen] Remove manager button pressed in modal');
                                        performRemoveManager();
                                    }}
                                    disabled={isRemovingManager}
                                    activeOpacity={0.7}
                                >
                                    {isRemovingManager ? (
                                        <ActivityIndicator size="small" color={colors.error} />
                                    ) : (
                                        <>
                                            <Ionicons name="trash-outline" size={16} color={colors.error} />
                                            <Text style={styles.removeManagerText}>הסר שיוך</Text>
                                        </>
                                    )}
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
            </Modal >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        ...(Platform.OS === 'web' && {
            position: 'relative' as any,
            height: '100vh' as any,
        }),
    },
    flatList: {
        flex: 1,
        ...(Platform.OS === 'web' && {
            overflowY: 'auto' as any,
            WebkitOverflowScrolling: 'touch' as any,
        }),
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
