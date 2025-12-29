import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../../../globals/colors';
import { FontSizes } from '../../../globals/constants';
import { BaseCardProps } from './types';

const RideOfferedCard: React.FC<BaseCardProps> = ({
    item,
    cardWidth,
    isGrid,
    onPress,
    onProfilePress,
    onLike,
    onComment,
    onBookmark,
    onShare,
    onMorePress,
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,
    formattedTime
}) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'he';

    const displayTitle = item.title === 'post.noTitle' ? t('post.noTitle') : item.title;
    const displayName = item.user.name === 'common.unknownUser' ? t('common.unknownUser') : item.user.name;

    // Use locations from item or fallback
    const locations = {
        from: item.from || '',
        to: item.to || ''
    };

    return (
        <View style={[
            styles.container,
            isGrid && styles.gridContainer,
            { width: cardWidth }
        ]}>
            {/* Header */}
            <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity
                    style={[styles.userInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                    onPress={onProfilePress}
                >
                    {item.user.avatar ? (
                        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={20} color={colors.white} />
                        </View>
                    )}
                    <View style={[styles.userTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                        <Text style={[styles.userName, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {displayName}
                        </Text>
                        <Text style={[styles.timestamp, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {formattedTime}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={[styles.headerRight, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={styles.rideBadge}>
                        <Ionicons name="car-sport" size={16} color={colors.white} />
                        <Text style={styles.rideBadgeText}>{t('rides.offered')}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={(e) => onMorePress && onMorePress({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })}
                        style={styles.moreButton}
                    >
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <TouchableOpacity onPress={onPress} activeOpacity={0.95} style={styles.cardContent}>
                <View style={[styles.contentContainer, isGrid && styles.contentContainerGrid]}>
                    {/* Route Visualization */}
                    <View style={styles.routeContainer}>
                        <View style={styles.locationPoint}>
                            <View style={styles.startDot} />
                            <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={styles.locationLabel}>{t('rides.from')}</Text>
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {locations.from || t('rides.origin')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.routeLine}>
                            <View style={styles.dashedLine} />
                            <Ionicons name="arrow-down" size={20} color={colors.primary} />
                        </View>

                        <View style={styles.locationPoint}>
                            <View style={styles.endDot} />
                            <View style={[styles.locationTextContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                                <Text style={styles.locationLabel}>{t('rides.to')}</Text>
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {locations.to || t('rides.destination')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Ride Details - Always visible, responsive layout */}
                    <View style={[
                        styles.detailsContainer,
                        isGrid && styles.detailsContainerGrid,
                        { flexDirection: isRTL ? 'row-reverse' : 'row' }
                    ]}>
                        {item.seats && (
                            <View style={[styles.detailCard, isGrid && styles.detailCardGrid]}>
                                <Ionicons name="people" size={isGrid ? 16 : 20} color={colors.primary} />
                                <Text style={[styles.detailValue, isGrid && styles.detailValueGrid]}>{item.seats}</Text>
                                {!isGrid && <Text style={styles.detailLabel}>{t('rides.seats')}</Text>}
                            </View>
                        )}

                        <View style={[styles.detailCard, isGrid && styles.detailCardGrid]}>
                            <Ionicons
                                name={item.price && item.price > 0 ? "cash-outline" : "gift-outline"}
                                size={isGrid ? 16 : 24}
                                color={item.price && item.price > 0 ? colors.textPrimary : colors.success}
                            />
                            <Text style={[
                                styles.detailValue,
                                isGrid && styles.detailValueGrid,
                                item.price && item.price > 0 ? { color: colors.textPrimary } : { color: colors.success }
                            ]}>
                                {item.price && item.price > 0 ? `₪${item.price}` : t('rides.free')}
                            </Text>
                            {!isGrid && (
                                <Text style={styles.detailLabel}>
                                    {item.price && item.price > 0 ? t('rides.fuelShare') : t('rides.noCharge')}
                                </Text>
                            )}
                        </View>

                        {(item.time || item.date) && (
                            <View style={[styles.detailCard, isGrid && styles.detailCardGrid]}>
                                <Ionicons name="time" size={isGrid ? 16 : 20} color={colors.info} />
                                <Text style={[styles.detailValue, isGrid && styles.detailValueGrid]}>
                                    {item.time} {item.date && `• ${item.date}`}
                                </Text>
                                {!isGrid && <Text style={styles.detailLabel}>{t('rides.departure')}</Text>}
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {/* Actions Bar */}
            <View style={[styles.actionsBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.actionsLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                        style={[styles.actionButton, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                        onPress={onLike}
                    >
                        <Ionicons
                            name={isLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={isLiked ? colors.error : colors.textSecondary}
                        />
                        {likesCount > 0 && (
                            <Text style={[styles.actionCount, isLiked && styles.likedCount]}>
                                {likesCount}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }]}
                        onPress={onComment}
                    >
                        <Ionicons name="chatbubble-outline" size={24} color={colors.textSecondary} />
                        {commentsCount > 0 && (
                            <Text style={styles.actionCount}>{commentsCount}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={onShare}>
                        <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={onBookmark}>
                    <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={isBookmarked ? colors.primary : colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        overflow: 'hidden',
        minHeight: 380, // minHeight
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }
        }),
    },
    gridContainer: {
        marginHorizontal: 8,
        minHeight: 250,
    },
    header: {
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
    },
    headerRight: {
        alignItems: 'center',
        gap: 8,
    },
    moreButton: {
        padding: 4,
    },
    userInfo: {
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.backgroundTertiary,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
    },
    userTextContainer: {
        gap: 2,
        flex: 1,
    },
    userName: {
        fontSize: FontSizes.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    timestamp: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    rideBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.info,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    rideBadgeText: {
        fontSize: FontSizes.small,
        fontWeight: '600',
        color: colors.white,
    },
    cardContent: {
        flex: 1,
        backgroundColor: '#E3F2FD',
    },
    contentContainer: {
        padding: 24, // More padding
        flex: 1,
        justifyContent: 'center',
        gap: 24,
    },
    contentContainerGrid: {
        padding: 16,
    },
    routeContainer: {
        gap: 8,
    },
    locationPoint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    startDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.success,
        borderWidth: 3,
        borderColor: colors.white,
    },
    endDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: colors.error,
        borderWidth: 3,
        borderColor: colors.white,
    },
    locationTextContainer: {
        flex: 1,
        gap: 2,
    },
    locationLabel: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    locationText: {
        fontSize: FontSizes.medium,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    routeLine: {
        alignItems: 'center',
        paddingVertical: 4,
        marginLeft: 7,
    },
    dashedLine: {
        width: 2,
        height: 32, // Increase line height for more visual space
        backgroundColor: colors.primary,
        opacity: 0.3,
    },
    detailsContainer: {
        gap: 12,
        justifyContent: 'space-around',
    },
    detailsContainerGrid: {
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    detailCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        gap: 6,
        minWidth: 90,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }
        }),
    },
    detailCardGrid: {
        padding: 8,
        minWidth: 60,
        gap: 4,
        flex: 0, // Don't force flex 1 in grid
    },
    detailValue: {
        fontSize: FontSizes.medium,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    detailValueGrid: {
        fontSize: FontSizes.small,
    },
    detailLabel: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    actionsBar: {
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.backgroundSecondary,
    },
    actionsLeft: {
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionCount: {
        fontSize: FontSizes.body,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    likedCount: {
        color: colors.error,
    },
});

export default React.memo(RideOfferedCard);
