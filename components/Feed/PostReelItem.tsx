import React, { useCallback, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../globals/colors';
import { FeedItem } from '../../types/feed';
import { usePostInteractions } from '../../hooks/usePostInteractions';
import { useProfileNavigation } from '../../hooks/useProfileNavigation';
import { FontSizes } from '../../globals/constants';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface PostReelItemProps {
    item: FeedItem;
    cardWidth?: number;
    numColumns?: number;
    onPress?: (item: FeedItem) => void;
    onCommentPress?: (item: FeedItem) => void;
}

const PostReelItem: React.FC<PostReelItemProps> = ({
    item,
    cardWidth = width,
    numColumns = 1,
    onPress,
    onCommentPress
}) => {
    const { t } = useTranslation();
    const {
        isLiked,
        likesCount,
        commentsCount,
        isBookmarked,
        handleLike,
        handleBookmark,
        handleShare
    } = usePostInteractions(item);

    const { navigateToProfile } = useProfileNavigation();

    // Determine layout mode
    const isGrid = numColumns > 1;
    const isTask = item.type === 'task_post';
    const isCompletion = item.subtype === 'task_completion';

    // Format timestamp
    const formattedTime = useMemo(() => {
        try {
            const date = new Date(item.timestamp);
            const now = new Date();
            const diff = now.getTime() - date.getTime();

            // Less than 24 hours
            if (diff < 24 * 60 * 60 * 1000) {
                if (diff < 60 * 60 * 1000) {
                    const minutes = Math.floor(diff / (60 * 1000));
                    return t('common.time.minutesAgo', { count: minutes });
                }
                const hours = Math.floor(diff / (60 * 60 * 1000));
                return t('common.time.hoursAgo', { count: hours });
            }

            return date.toLocaleDateString('he-IL'); // Plain date for older
        } catch (e) {
            return '';
        }
    }, [item.timestamp, t]);

    const handleProfilePressInternal = useCallback(() => {
        if (item.user && item.user.id) {
            navigateToProfile(item.user.id, item.user.name || 'User');
        }
    }, [item.user, navigateToProfile]);

    const handleItemPress = useCallback(() => {
        if (onPress) onPress(item);
    }, [onPress, item]);

    // --- Render Task Post ---
    if (isTask) {
        return (
            <TouchableOpacity
                style={[styles.itemContainer, styles.taskPostContainer, isGrid && styles.itemContainerGrid, { width: cardWidth }]}
                onPress={handleItemPress}
                activeOpacity={0.9}
            >
                <View style={styles.taskIconContainer}>
                    <Ionicons
                        name={isCompletion ? "checkmark-circle" : "clipboard"}
                        size={32}
                        color={isCompletion ? colors.success : colors.primary}
                    />
                </View>
                <View style={styles.taskPostContent}>
                    <Text style={styles.taskPostType}>
                        {isCompletion ? t('common.done') : t('tasks.status.new')}
                    </Text>
                    <Text style={styles.taskTitle} numberOfLines={2}>
                        {item.taskData?.title || item.title}
                    </Text>

                    <TouchableOpacity style={styles.userInfoSmall} onPress={handleProfilePressInternal}>
                        <Text style={styles.userNameSmall}>{item.user.name}</Text>
                        {item.user.avatar ? (
                            <Image source={{ uri: item.user.avatar }} style={styles.userAvatarSmall} />
                        ) : (
                            <View style={[styles.userAvatarSmall, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={12} color={colors.white} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Actions (Like/Comment) for task */}
                <View style={styles.taskActions}>
                    <TouchableOpacity onPress={handleLike} style={styles.actionButtonSmall}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={20} color={isLiked ? colors.error : colors.textSecondary} />
                        {likesCount > 0 && <Text style={styles.actionTextSmall}>{likesCount}</Text>}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }

    const displayTitle = item.title === 'post.noTitle' ? t('post.noTitle') :
        item.title === 'donations.categories.items.title' ? t('donations.categories.items.title') :
            item.title;

    const displayName = item.user.name === 'common.unknownUser' ? t('common.unknownUser') : item.user.name;

    // --- Render Regular Post/Reel ---
    return (
        <View style={[
            styles.itemContainer,
            isGrid && styles.itemContainerGrid,
            { width: cardWidth },
            // item.type === 'reel' && styles.reelItem // Optional logic for reels
        ]}>
            {/* Header */}
            <View style={styles.header}>
                {/* Removed headerMoreBtn (bookmark) from here */}
                <View style={styles.headerSpacer} />
                <TouchableOpacity style={styles.userInfo} onPress={handleProfilePressInternal}>
                    <View>
                        <Text style={styles.userName}>{displayName}</Text>
                        <Text style={styles.timestamp}>{formattedTime}</Text>
                    </View>
                    {item.user.avatar ? (
                        <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
                    ) : (
                        <View style={[styles.userAvatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={20} color={colors.white} />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Content (Image) */}
            {item.thumbnail ? (
                <TouchableOpacity onPress={handleItemPress} activeOpacity={0.9}>
                    <Image
                        source={{ uri: item.thumbnail }}
                        style={[styles.thumbnail, isGrid && { height: 150 }]}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            ) : (
                // Text only post fallback or placeholder
                <TouchableOpacity onPress={handleItemPress} style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                    <Text style={styles.placeholderText} numberOfLines={3}>{item.description}</Text>
                </TouchableOpacity>
            )}

            {/* Text Content */}
            {!isGrid && (
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{displayTitle}</Text>
                    {item.description ? (
                        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
                <View style={{ flexDirection: 'row-reverse' }}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Ionicons name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? colors.error : colors.textSecondary} />
                        <Text style={[styles.actionText, isLiked && styles.likedText]}>{likesCount > 0 ? likesCount : ''}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => onCommentPress && onCommentPress(item)}>
                        <Ionicons name="chatbubble-outline" size={22} color={colors.textSecondary} />
                        <Text style={styles.actionText}>{commentsCount > 0 ? commentsCount : ''}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
                        <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={22} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                        <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginVertical: 8,
        marginHorizontal: 16,
        ...Platform.select({
            ios: {
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }
        }),
        overflow: 'hidden',
    },
    itemContainerGrid: {
        marginHorizontal: 8,
        marginBottom: 16,
    },
    taskPostContainer: {
        padding: 16,
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundTertiary,
    },
    headerSpacer: {
        flex: 1,
    },
    headerMoreBtn: {
        padding: 4,
    },
    userInfo: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: 8,
        backgroundColor: colors.backgroundTertiary,
    },
    avatarPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.primary,
    },
    userName: {
        fontSize: FontSizes.body,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'right',
    },
    timestamp: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
        textAlign: 'right',
    },
    thumbnail: {
        width: '100%',
        height: 250,
        backgroundColor: colors.backgroundTertiary,
    },
    thumbnailPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        color: colors.textSecondary,
        textAlign: 'center',
    },
    textContainer: {
        padding: 12,
    },
    title: {
        fontSize: FontSizes.medium,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
        textAlign: 'right',
    },
    description: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        textAlign: 'right',
    },
    actionsContainer: {
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: colors.backgroundTertiary,
        flexDirection: 'row',
        justifyContent: 'flex-start', // Icons on left
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        marginLeft: 6,
    },
    likedText: {
        color: colors.error,
    },
    // Task specific
    taskIconContainer: {
        marginLeft: 16,
    },
    taskPostContent: {
        flex: 1,
        alignItems: 'flex-end',
    },
    taskPostType: {
        fontSize: 10,
        color: colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    taskTitle: {
        fontSize: FontSizes.medium,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'right',
        marginBottom: 8,
    },
    userInfoSmall: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    userNameSmall: {
        fontSize: 12,
        color: colors.textSecondary,
        marginLeft: 6,
    },
    userAvatarSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    taskActions: {
        justifyContent: 'center',
        paddingLeft: 8
    },
    actionButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionTextSmall: {
        fontSize: 12,
        marginLeft: 4,
        color: colors.textSecondary
    }

});

export default React.memo(PostReelItem);
