import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../../../globals/colors';
import { FontSizes } from '../../../globals/constants';
import { BaseCardProps } from './types';

const TaskAssignmentCard: React.FC<BaseCardProps> = ({
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
    const displayName = item.user.name === 'common.unknownUser' ? t('common.unknownUser') : item.user.name;

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
                    <View style={styles.taskBadge}>
                        <Ionicons name="clipboard" size={16} color={colors.white} />
                        <Text style={styles.taskBadgeText}>{t('tasks.status.new')}</Text>
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
                    <View style={styles.iconContainer}>
                        <Ionicons name="construct-outline" size={32} color={colors.primary} />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { textAlign: 'center' }]}>
                            {t('tasks.status.new_for_you')}
                        </Text>

                        <Text style={[styles.description, { textAlign: 'center', fontWeight: 'bold', marginTop: 4 }]} numberOfLines={2}>
                            {item.taskData?.title || item.title || t('post.noTitle')}
                        </Text>

                        {(item.description || item.taskData?.description) && (
                            <Text style={[styles.description, { textAlign: 'center' }]} numberOfLines={3}>
                                {item.taskData?.description || item.description}
                            </Text>
                        )}
                    </View>

                    {/* Action Button CTA */}
                    {/* Task Details Section */}
                    <View style={styles.detailsSection}>
                        {/* Creator */}
                        <View style={styles.detailRow}>
                            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.detailText}>
                                {t('task.opened_by', 'נוצר ע"י')}: {item.user.name}
                            </Text>
                        </View>

                        {/* Assignee */}
                        <View style={styles.detailRow}>
                            <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
                            <Text style={styles.detailText}>
                                {t('task.performer', 'מבצע')}: {
                                    item.taskData?.assignees && item.taskData.assignees.length > 0
                                        ? item.taskData.assignees.map((a: any) => a.name).join(', ')
                                        : t('task.unassigned', 'טרם שובץ')
                                }
                            </Text>
                        </View>

                        {/* Duration */}
                        {item.taskData?.estimated_hours ? (
                            <View style={styles.detailRow}>
                                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                                <Text style={styles.detailText}>
                                    {t('task.duration', 'משך זמן')}: {item.taskData.estimated_hours} {t('common.hours', 'שעות')}
                                </Text>
                            </View>
                        ) : null}
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
        minHeight: 380, // Enforce uniform minimum height
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
    taskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    taskBadgeText: {
        fontSize: FontSizes.small,
        fontWeight: '600',
        color: colors.white,
    },
    cardContent: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    contentContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
        gap: 16,
        flex: 1, // Take full height
    },
    contentContainerGrid: {
        padding: 16,
    },
    iconContainer: {
        width: 80, // Slightly larger
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E6E8EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        gap: 8,
        alignItems: 'center',
    },
    title: {
        fontSize: 22, // Slightly larger
        fontWeight: '700',
        color: colors.textPrimary,
    },
    description: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
        marginTop: 16,
    },
    ctaText: {
        fontSize: FontSizes.body,
        fontWeight: '600',
        color: colors.white,
    },
    actionsBar: {
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.backgroundSecondary,
        backgroundColor: colors.white,
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
    detailsSection: {
        width: '100%',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
    }
});

export default React.memo(TaskAssignmentCard);
