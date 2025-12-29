import React, { useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { FeedItem } from '../../types/feed';
import { usePostInteractions } from '../../hooks/usePostInteractions';
import { useProfileNavigation } from '../../hooks/useProfileNavigation';
import DonationItemCard from './PostCard/DonationItemCard';
import RegularItemCard from './PostCard/RegularItemCard';
import RideOfferedCard from './PostCard/RideOfferedCard';
import RideCompletedCard from './PostCard/RideCompletedCard';
import TaskAssignmentCard from './PostCard/TaskAssignmentCard';
import TaskCompletionCard from './PostCard/TaskCompletionCard';

const { width } = Dimensions.get('window');

interface PostReelItemProps {
    item: FeedItem;
    cardWidth?: number;
    numColumns?: number;
    onPress?: (item: FeedItem) => void;
    onCommentPress?: (item: FeedItem) => void;
    onMorePress?: (item: FeedItem, measurements?: { x: number, y: number }) => void; // Added prop
}

const PostReelItem: React.FC<PostReelItemProps> = ({
    item,
    cardWidth = width,
    numColumns = 1,
    onPress,
    onCommentPress,
    onMorePress
}) => {
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

    // Common Handlers
    const handleProfilePressInternal = useCallback(() => {
        if (item.user && item.user.id) {
            navigateToProfile(item.user.id, item.user.name || 'User');
        }
    }, [item.user, navigateToProfile]);

    const handleItemPress = useCallback(() => {
        if (onPress) onPress(item);
    }, [onPress, item]);

    const handleCommentPressInternal = useCallback(() => {
        if (onCommentPress) onCommentPress(item);
    }, [onCommentPress, item]);

    const handleMorePressInternal = useCallback((itemOrMeasure?: any, measure?: any) => {
        // Handle both (item) and (item, measure) signatures if cards call differently
        // But since we control call sites, we expect cards to call onMorePress(item, measure)?
        // Wait, BaseCardProps says onMorePress: (measure) => void.
        // So cards call onMorePress({x,y}).
        // So this function receives measurements as first arg?
        // No, PostReelItem renders cards. The cards receive `onMorePress` as a prop.
        // `commonProps` passes user of `onMorePress: handleMorePressInternal`.
        // So `handleMorePressInternal` is what the card calls.
        // The card calls it like: `onMorePress(measurements)`.
        const measurements = itemOrMeasure;
        if (onMorePress) onMorePress(item, measurements);
    }, [onMorePress, item]);


    // Format timestamp logic (reused)
    const formattedTime = useMemo(() => {
        try {
            if (!item.timestamp) return 'עכשיו';
            const date = new Date(item.timestamp);
            if (isNaN(date.getTime())) return 'עכשיו';
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            if (diff < 60 * 1000) return 'עכשיו';
            if (diff < 60 * 60 * 1000) return `לפני ${Math.floor(diff / (60 * 1000))} דקות`;
            if (diff < 24 * 60 * 60 * 1000) return `לפני ${Math.floor(diff / (60 * 60 * 1000))} שעות`;
            return date.toLocaleDateString('he-IL');
        } catch (e) {
            return 'עכשיו';
        }
    }, [item.timestamp]);

    // Props for child components
    const commonProps = {
        item,
        cardWidth,
        isGrid,
        onPress: handleItemPress,
        onProfilePress: handleProfilePressInternal,
        onLike: handleLike,
        onComment: handleCommentPressInternal,
        onBookmark: handleBookmark,
        onShare: handleShare,
        onMorePress: handleMorePressInternal, // Pass down
        isLiked,
        isBookmarked,
        likesCount,
        commentsCount,
        formattedTime
    };

    // --- Dispatcher Logic ---

    // 1. Task Completion
    if (item.type === 'task_post' && item.subtype === 'task_completion') {
        return <TaskCompletionCard {...commonProps} />;
    }

    // 2. Task Assignment (New Task)
    if (item.type === 'task_post' || item.subtype === 'task_assignment') {
        return <TaskAssignmentCard {...commonProps} />;
    }

    // 3. Donation
    if (item.subtype === 'donation') {
        return <DonationItemCard {...commonProps} />;
    }

    // 4. Ride
    if (item.subtype === 'ride') {
        // Distinguish completed vs offered
        if (item.status === 'completed') {
            return <RideCompletedCard {...commonProps} />;
        }
        return <RideOfferedCard {...commonProps} />;
    }

    // 5. Item (Regular) - Fallback for 'item' or if nothing else matches but has thumbnail/price
    if (item.subtype === 'item' || item.price) {
        return <RegularItemCard {...commonProps} />;
    }

    // 6. Generic/Unknown Post Type
    return <RegularItemCard {...commonProps} />;
};

const styles = StyleSheet.create({});

export default React.memo(PostReelItem);
