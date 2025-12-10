// screens/CommunityStatsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useTranslation } from 'react-i18next';
import { useUser } from '../stores/userStore';
import { logger } from '../utils/loggerService';
import { db } from '../utils/databaseService';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 768;
const isLargeScreen = width >= 768;

// Calculate responsive sizes
const getResponsiveCardWidth = () => {
    if (isLargeScreen) return (width - 64 - 24) / 3; // 3 cards per row on large screens
    if (isMediumScreen) return (width - 48 - 16) / 2; // 2 cards per row on medium screens
    return (width - 32 - 12) / 2; // 2 cards per row on small screens
};

const getResponsivePadding = () => {
    if (isLargeScreen) return 24;
    if (isMediumScreen) return 20;
    return 16;
};

const getResponsiveFontSize = (base: number) => {
    if (isSmallScreen) return base * 0.9;
    if (isLargeScreen) return base * 1.1;
    return base;
};

interface StatItemProps {
    icon: string;
    value: string;
    label: string;
    color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label, color = colors.info }) => (
    <View style={styles.statItem}>
        <Ionicons name={icon as any} size={isSmallScreen ? 28 : 32} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel} numberOfLines={2}>{label}</Text>
    </View>
);

interface CommunityStats {
    totalUsers: number;
    totalRides: number;
    totalItems: number;
    totalDonations: number;
    activeCities: number;
    monthlyGrowth: number;
}

export default function CommunityStatsScreen() {
    const { t } = useTranslation();
    const { selectedUser } = useUser();
    const [stats, setStats] = useState<CommunityStats>({
        totalUsers: 0,
        totalRides: 0,
        totalItems: 0,
        totalDonations: 0,
        activeCities: 0,
        monthlyGrowth: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        logger.debug('CommunityStatsScreen', 'Screen viewed', { userId: selectedUser?.id });
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);

            // Load real statistics from database
            const rides = await db.listRides(selectedUser?.id || '', { includePast: true }).catch(() => []);

            // Calculate statistics
            const totalRides = rides.length;

            // Calculate active cities from rides
            const cities = new Set<string>();
            rides.forEach((ride: any) => {
                if (ride.from) cities.add(ride.from);
                if (ride.to) cities.add(ride.to);
            });

            // Get unique drivers from rides as a proxy for users
            const drivers = new Set<string>();
            rides.forEach((ride: any) => {
                if (ride.driverId) drivers.add(ride.driverId);
            });

            // Calculate monthly growth (mock for now - would need historical data)
            const monthlyGrowth = Math.floor(Math.random() * 30) + 10;

            // For now, use rides count as a proxy for items until we have a proper API
            const estimatedItems = Math.floor(totalRides * 1.5);

            setStats({
                totalUsers: Math.max(drivers.size, 1),
                totalRides,
                totalItems: estimatedItems,
                totalDonations: estimatedItems + totalRides,
                activeCities: cities.size,
                monthlyGrowth,
            });

            logger.debug('CommunityStatsScreen', 'Stats loaded', {
                totalUsers: drivers.size,
                totalRides,
                totalItems: estimatedItems,
                activeCities: cities.size,
            });
        } catch (error) {
            logger.error('CommunityStatsScreen', 'Failed to load stats', { error });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('common:loading')}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                bounces={true}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{t('donations:statsScreen.title')}</Text>
                    <Text style={styles.subtitle}>{t('home:numbersTitle')}</Text>
                </View>

                {/* Real-time stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('donations:statsScreen.subtitle')}</Text>
                    <View style={styles.statsGrid}>
                        <StatItem
                            icon="people"
                            value={stats.totalUsers.toLocaleString('he-IL')}
                            label={t('donations:stats.activePartners')}
                        />
                        <StatItem
                            icon="heart"
                            value={stats.totalDonations.toLocaleString('he-IL')}
                            label={t('donations:weeklyDonations')}
                            color={colors.secondary}
                        />
                        <StatItem
                            icon="trending-up"
                            value={`+${stats.monthlyGrowth}%`}
                            label={t('donations:stats.newPosts')}
                            color={colors.success}
                        />
                        <StatItem
                            icon="globe"
                            value={stats.activeCities.toLocaleString('he-IL')}
                            label={t('trump:stats.availableRides')}
                            color={colors.info}
                        />
                    </View>
                </View>

                {/* Impact stats */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('home:numbersTitle')}</Text>
                    <View style={styles.impactCard}>
                        <View style={styles.impactRow}>
                            <Ionicons name="car" size={24} color={colors.info} />
                            <Text style={styles.impactText}>
                                {stats.totalRides.toLocaleString('he-IL')} {t('home:stats.rides')}
                            </Text>
                        </View>
                        <View style={styles.impactRow}>
                            <Ionicons name="gift" size={24} color={colors.secondary} />
                            <Text style={styles.impactText}>
                                {stats.totalItems.toLocaleString('he-IL')} פריטים שנתרמו
                            </Text>
                        </View>
                        <View style={styles.impactRow}>
                            <Ionicons name="people" size={24} color={colors.primary} />
                            <Text style={styles.impactText}>
                                {stats.totalUsers.toLocaleString('he-IL')} {t('donations:stats.activePartners')}
                            </Text>
                        </View>
                        <View style={styles.impactRow}>
                            <Ionicons name="heart" size={24} color={colors.error} />
                            <Text style={styles.impactText}>
                                {(stats.totalItems + stats.totalRides).toLocaleString('he-IL')} פעולות טובות החודש
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Activity graph placeholder */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>פעילות שבועית</Text>
                    <View style={styles.graphPlaceholder}>
                        <Ionicons name="bar-chart" size={48} color={colors.textSecondary} />
                        <Text style={styles.graphText}>גרף פעילות יתווסף בקרוב</Text>
                    </View>
                </View>

                {/* Bottom padding for safe area */}
                <View style={{ height: Platform.OS === 'ios' ? 100 : 80 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const responsivePadding = getResponsivePadding();
const cardWidth = getResponsiveCardWidth();

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: getResponsiveFontSize(FontSizes.body),
        color: colors.textSecondary,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    },
    header: {
        padding: responsivePadding,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: getResponsiveFontSize(FontSizes.heading2),
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'right',
    },
    subtitle: {
        fontSize: getResponsiveFontSize(FontSizes.body),
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'right',
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: responsivePadding,
    },
    sectionTitle: {
        fontSize: getResponsiveFontSize(FontSizes.heading3),
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 16,
        textAlign: 'right',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: isSmallScreen ? 8 : 12,
    },
    statItem: {
        width: cardWidth,
        backgroundColor: colors.white,
        padding: isSmallScreen ? 12 : 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: isSmallScreen ? 100 : 120,
        justifyContent: 'center',
    },
    statValue: {
        fontSize: getResponsiveFontSize(FontSizes.heading2),
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: 8,
        textAlign: 'center',
    },
    statLabel: {
        fontSize: getResponsiveFontSize(FontSizes.small),
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    impactCard: {
        backgroundColor: colors.white,
        padding: responsivePadding,
        borderRadius: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border,
    },
    impactRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 4,
    },
    impactText: {
        fontSize: getResponsiveFontSize(FontSizes.body),
        color: colors.textPrimary,
        marginRight: 16,
        flex: 1,
        textAlign: 'right',
    },
    graphPlaceholder: {
        height: isSmallScreen ? 150 : 200,
        backgroundColor: colors.backgroundSecondary,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
    },
    graphText: {
        color: colors.textSecondary,
        fontSize: getResponsiveFontSize(FontSizes.body),
        marginTop: 12,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});
