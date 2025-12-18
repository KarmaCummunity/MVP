import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../stores/userStore';

export function useAdminProtection() {
    const { isAdmin, isLoading, selectedUser, refreshUserRoles } = useUser();
    const navigation = useNavigation<any>();
    const isVerifyingRef = useRef(false);
    const lastCheckRef = useRef<number>(0);

    const handleUnauthorized = useCallback(() => {
        Alert.alert('שגיאה', 'אין לך הרשאות לצפות בדף זה');
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home');
        }
    }, [navigation]);

    const verifyAdminStatus = useCallback(async () => {
        // Prevent multiple simultaneous checks
        if (!selectedUser?.id || isVerifyingRef.current) return;

        // Throttle checks - don't check more than once every 5 seconds
        const now = Date.now();
        if (now - lastCheckRef.current < 5000) {
            return;
        }

        try {
            isVerifyingRef.current = true;
            lastCheckRef.current = now;

            console.log('🔐 Admin protection: Verifying admin status for user:', selectedUser.email);

            // Refresh user roles from database
            // This will update the store if roles changed
            await refreshUserRoles();

            // The isAdmin flag will be updated automatically by the store
            // If it becomes false, the next render will catch it in the local check below

        } catch (err) {
            console.warn('🔐 Admin verification failed (network error or other)', err);
        } finally {
            isVerifyingRef.current = false;
        }
    }, [selectedUser?.id, selectedUser?.email, refreshUserRoles]);

    useFocusEffect(
        useCallback(() => {
            // 1. Immediate local check
            if (!isLoading && !isAdmin) {
                console.log('🔐 Admin protection: User not admin (local check), redirecting');
                handleUnauthorized();
                return;
            }

            // 2. Server check if locally admin
            // This runs every time the screen comes into focus
            if (!isLoading && isAdmin && selectedUser) {
                verifyAdminStatus();
            }
        }, [isAdmin, isLoading, selectedUser, verifyAdminStatus, handleUnauthorized])
    );

    return { isAuthorized: isAdmin };
}
