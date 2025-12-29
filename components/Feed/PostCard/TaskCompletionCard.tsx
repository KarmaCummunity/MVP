import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import colors from '../../../globals/colors';
import { FontSizes } from '../../../globals/constants';
import { BaseCardProps } from './types';

const TaskCompletionCard: React.FC<BaseCardProps> = ({
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
                    <View style={styles.completedTaskBadge}>
                        <Ionicons name="checkmark-done" size={16} color={colors.white} />
                        <Text style={styles.completedTaskBadgeText}>{t('common.done')}</Text>
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
                    <View style={styles.celebrationContainer}>
                        <Ionicons name="trophy" size={56} color={colors.warning} />
                        <View style={styles.starsContainer}>
                            <Ionicons name="star" size={24} color={colors.warning} style={{ position: 'absolute', top: -10, left: -30, transform: [{ rotate: '-20deg' }] }} />
                            <Ionicons name="star" size={32} color={colors.warning} style={{ position: 'absolute', top: -25, right: -25, transform: [{ rotate: '15deg' }] }} />
                        </View>
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { textAlign: 'center' }]}>
                            {t('tasks.task_completed')}
                        </Text>

                        <View style={styles.taskReference}>
                            <Text style={[styles.taskReferenceText, { textAlign: 'center' }]} numberOfLines={2}>
                                {item.taskData?.title || item.title || t('post.noTitle')}
                            </Text>
                        </View>
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
        minHeight: 380, // Uniform Height
        borderWidth: 2,
        borderColor: '#E8F5E9',
        ...Platform.select({
            ios: {
                shadowColor: colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
            web: {
                boxShadow: '0 4px 16px rgba(0, 200, 83, 0.1)'
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
        backgroundColor: '#FAFAFA',
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
    completedTaskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    completedTaskBadgeText: {
        fontSize: FontSizes.small,
        fontWeight: '600',
        color: colors.white,
    },
    cardContent: {
        flex: 1,
        backgroundColor: '#F1F8E9',
    },
    contentContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        flex: 1,
    },
    contentContainerGrid: {
        padding: 16,
    },
    celebrationContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    starsContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        gap: 16,
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.success,
    },
    taskReference: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(0, 200, 83, 0.1)',
    },
    taskReferenceText: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '500',
        lineHeight: 24,
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
});

export default React.memo(TaskCompletionCard);
