import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { CURRENT_ENVIRONMENT, IS_DEVELOPMENT } from '../utils/config.constants';

/**
 * DevEnvironmentBanner
 * 
 * A visual indicator shown only in development environments to help
 * developers and testers distinguish between Dev and Production builds.
 */
const DevEnvironmentBanner = () => {
    // Only show in development environment
    if (!IS_DEVELOPMENT) {
        return null;
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.banner}>
                    <View style={styles.badge}>
                        <Text style={styles.dot}>🟢</Text>
                        <Text style={styles.text}>DEV ENVIRONMENT</Text>
                    </View>
                    <Text style={styles.subtext}>
                        Data is isolated from Production
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E8F5E9', // Very light green
        borderBottomWidth: 1,
        borderBottomColor: '#A5D6A7',
        zIndex: 9999,
    },
    safeArea: {
        // On iOS, SafeAreaView handles the notch
        // On Android, we might need manual padding if not using a library
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    banner: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C8E6C9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    dot: {
        fontSize: 10,
        marginRight: 4,
    },
    text: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#2E7D32',
        letterSpacing: 0.5,
    },
    subtext: {
        fontSize: 9,
        fontStyle: 'italic',
        color: '#666',
    },
});

export default DevEnvironmentBanner;
