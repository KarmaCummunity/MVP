
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Alert,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Platform,
    FlatList,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { AdminStackParamList } from '../globals/types';
import { useUser } from '../stores/userStore';
import { logger } from '../utils/loggerService';
import { apiService } from '../utils/apiService';

interface AdminAdminsScreenProps {
    navigation: NavigationProp<AdminStackParamList>;
}

const LOG_SOURCE = 'AdminAdminsScreen';

import { useAdminProtection } from '../hooks/useAdminProtection';

export default function AdminAdminsScreen({ navigation }: AdminAdminsScreenProps) {
    useAdminProtection();
    const { selectedUser } = useUser();
    const [usersList, setUsersList] = useState<any[]>([]); // simplified type
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMutating, setIsMutating] = useState(false);
    const [activeTab, setActiveTab] = useState<'admins' | 'users'>('admins');

    useEffect(() => {
        logger.info(LOG_SOURCE, 'Initializing admin admins screen');
        loadUsers();
    }, [searchQuery]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const filters: any = { limit: 100 }; // Increased limit
            if (searchQuery.trim()) {
                filters.search = searchQuery.trim();
            }

            const response = await apiService.getUsers(filters);
            if (response.success && Array.isArray(response.data)) {
                // DEBUG: Inspect roles
                if (response.data.length > 0) {
                    logger.info(LOG_SOURCE, 'Loaded users sample', {
                        firstUser: response.data[0].email,
                        roles: response.data[0].roles,
                        rolesType: typeof response.data[0].roles,
                        isArray: Array.isArray(response.data[0].roles)
                    });
                }

                // Filter out current user so they can't edit themselves
                const otherUsers = response.data.filter((u: any) => u.email !== selectedUser?.email);
                setUsersList(otherUsers);
            } else {
                setUsersList([]);
            }
        } catch (error) {
            logger.error(LOG_SOURCE, 'Error loading users', { error });
            Alert.alert('שגיאה', 'לא ניתן היה לטעון את המשתמשים');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAdmin = async (user: any) => {
        logger.info(LOG_SOURCE, 'Button pressed for user', { userId: user?.id, email: user?.email });

        if (!user || !user.id) {
            logger.error(LOG_SOURCE, 'Invalid user object', user);
            return;
        }

        const currentRoles = Array.isArray(user.roles) ? user.roles : [];
        const isAdmin = currentRoles.includes('admin') || currentRoles.includes('super_admin');

        // Prevent removing own admin
        if (user.email === selectedUser?.email) {
            Alert.alert('פעולה לא חוקית', 'לא ניתן להסיר הרשאות לעצמך');
            return;
        }

        // STATIC PROTECTION: Prevent modifying navesarussi@gmail.com
        if (user.email === 'navesarussi@gmail.com') {
            Alert.alert('שגיאה', 'לא ניתן לשנות הרשאות למנהל הראשי (navesarussi@gmail.com)');
            return;
        }

        const newRoles = isAdmin
            ? currentRoles.filter((r: string) => r !== 'admin')
            : [...currentRoles, 'admin'];

        const title = isAdmin ? 'הסרת הרשאות מנהל' : 'הוספת הרשאות מנהל';
        const message = `האם אתה בטוח שברצונך ${isAdmin ? 'להסיר' : 'לתת'} הרשאות מנהל ל-${user.name || user.email}?`;

        if (Platform.OS === 'web') {
            const confirmed = window.confirm(`${title}\n${message}`);
            if (confirmed) {
                await executeRoleUpdate(user.id, newRoles);
            }
        } else {
            Alert.alert(
                title,
                message,
                [
                    { text: 'ביטול', style: 'cancel' },
                    {
                        text: 'אישור',
                        style: isAdmin ? 'destructive' : 'default',
                        onPress: () => executeRoleUpdate(user.id, newRoles)
                    }
                ]
            );
        }
    };

    const executeRoleUpdate = async (userId: string, newRoles: string[]) => {
        try {
            console.log('Executing role update...', { userId, newRoles });
            setIsMutating(true);

            // Optimistic Update: Update UI immediately
            setUsersList(prevList => prevList.map(u => {
                if (u.id === userId) {
                    return { ...u, roles: newRoles };
                }
                return u;
            }));

            const response = await apiService.updateUser(userId, { roles: newRoles });

            if (response.success) {
                Alert.alert('בוצע', 'הרשאות עודכנו בהצלחה');
                // Allow a slight delay for backend propagation before strict reload
                setTimeout(() => loadUsers(), 500);
            } else {
                throw new Error(response.error || 'Failed to update roles');
            }
        } catch (error) {
            logger.error(LOG_SOURCE, 'Error updating roles', { error });
            Alert.alert('שגיאה', 'לא ניתן היה לעדכן את ההרשאות - השינוי בוטל');
            loadUsers(); // Revert/Reload on error
        } finally {
            setIsMutating(false);
        }
    };

    const getFilteredUsers = () => {
        return usersList.filter(user => {
            const currentRoles = Array.isArray(user.roles) ? user.roles : [];
            const isAdmin = currentRoles.includes('admin') || currentRoles.includes('super_admin');

            if (activeTab === 'admins') {
                return isAdmin;
            } else {
                return !isAdmin;
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
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'admins' && styles.activeTab]}
                    onPress={() => setActiveTab('admins')}
                >
                    <Text style={[styles.tabText, activeTab === 'admins' && styles.activeTabText]}>מנהלים</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                    onPress={() => setActiveTab('users')}
                >
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

    if (isLoading) {
        return (
            <View style={styles.container}>
                {renderHeader()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[styles.listContentContainer, { minHeight: '150%' }]}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadUsers} />}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {activeTab === 'admins' ? 'אין מנהלים להצגה' : 'אין משתמשים להצגה'}
                        </Text>
                    </View>
                }
                showsVerticalScrollIndicator={true}
                renderItem={({ item: user }) => {
                    const currentRoles = Array.isArray(user.roles) ? user.roles : [];
                    const isAdmin = currentRoles.includes('admin') || currentRoles.includes('super_admin');
                    const isSuperAdminLocked = user.email === 'navesarussi@gmail.com';

                    return (
                        <View style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name || 'ללא שם'}</Text>
                                <Text style={styles.userEmail}>{user.email}</Text>
                                <Text style={styles.userRoles}>
                                    {isSuperAdminLocked ? 'מנהל ראשי (קבוע)' : (isAdmin ? 'מנהל מערכת' : 'משתמש רגיל')}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.roleButton,
                                    isSuperAdminLocked ? styles.lockedButton : (isAdmin ? styles.removeButton : styles.addButton)
                                ]}
                                onPress={() => isSuperAdminLocked ? Alert.alert('שגיאה', 'לא ניתן לשנות הרשאות למנהל הראשי') : handleToggleAdmin(user)}
                                disabled={isMutating || isSuperAdminLocked}
                            >
                                <Text style={styles.roleButtonText}>
                                    {isSuperAdminLocked ? 'מנהל ראשי' : (isAdmin ? 'הסר ניהול' : 'הפוך למנהל')}
                                </Text>
                                {isSuperAdminLocked && <Ionicons name="lock-closed" size={12} color="white" style={{ marginLeft: 4 }} />}
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
    },
    header: {
        padding: LAYOUT_CONSTANTS.SPACING.LG,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
    },
    title: {
        fontSize: FontSizes.heading1,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        padding: LAYOUT_CONSTANTS.SPACING.SM,
        margin: LAYOUT_CONSTANTS.SPACING.MD,
        borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
        alignItems: 'center',
        borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    },
    activeTab: {
        backgroundColor: colors.primary + '20', // 20% opacity
    },
    tabText: {
        fontSize: FontSizes.medium,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        marginHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
        marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
        borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
        paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
        borderWidth: 1,
        borderColor: colors.border,
    },
    searchIcon: {
        marginRight: LAYOUT_CONSTANTS.SPACING.SM,
    },
    searchInput: {
        flex: 1,
        paddingVertical: LAYOUT_CONSTANTS.SPACING.MD,
        fontSize: FontSizes.medium,
        color: colors.textPrimary,
        textAlign: 'right'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: LAYOUT_CONSTANTS.SPACING.XL,
    },
    emptyText: {
        fontSize: FontSizes.medium,
        color: colors.textSecondary,
    },
    listContentContainer: {
        paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
        paddingBottom: LAYOUT_CONSTANTS.SPACING.XL * 2,
    },
    userCard: {
        backgroundColor: colors.background,
        borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.MEDIUM,
        padding: LAYOUT_CONSTANTS.SPACING.MD,
        marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: FontSizes.heading3,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    userEmail: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    userRoles: {
        fontSize: FontSizes.small,
        color: colors.textTertiary,
    },
    roleButton: {
        paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
        paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
        borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
        marginLeft: LAYOUT_CONSTANTS.SPACING.MD,
    },
    addButton: {
        backgroundColor: colors.primary,
    },
    removeButton: {
        backgroundColor: colors.error,
    },
    roleButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: FontSizes.small,
    },
    lockedButton: {
        backgroundColor: colors.textTertiary,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

