import { useState, useCallback, useEffect } from 'react';
import { postsService } from '../utils/postsService';
import databaseService from '../utils/databaseService';
import { logger } from '../utils/loggerService';
import { FeedItem } from '../types/feed';
import { useUser } from '../stores/userStore';

const NUM_ITEMS = 50; // Per page/batch

export const useFeedData = (feedMode: 'friends' | 'discovery') => {
    const { selectedUser: currentUser } = useUser();
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Helper to map API post to FeedItem
    const mapPostToItem = (post: any): FeedItem => {
        return {
            id: post.id,
            type: post.post_type || 'post',
            subtype: post.post_type, // e.g. 'task_assignment'
            title: post.title || 'post.noTitle', // Use key or default in UI
            description: post.description || '',
            thumbnail: post.images && post.images.length > 0 ? post.images[0] : null,
            user: {
                id: post.author?.id || post.author_id,
                name: post.author?.name || 'common.unknownUser', // Use key
                avatar: post.author?.avatar_url || undefined,
            },
            likes: parseInt(post.likes || '0'),
            comments: parseInt(post.comments || '0'),
            isLiked: post.is_liked || false,
            timestamp: post.created_at,
            taskData: post.task ? {
                id: post.task.id,
                title: post.task.title,
                status: post.task.status
            } : undefined
        };
    };

    // Helper to map Ride to FeedItem
    // Note: Assuming rides come from local DB or generic list for now
    const mapRideToItem = (ride: any): FeedItem => {
        return {
            id: ride.id,
            type: 'post', // Rendering rides as posts for now in the feed, or could use 'ride' if we added it to types
            subtype: 'ride',
            title: `טרמפ: ${ride.from_location} ← ${ride.to_location}`,
            description: ride.notes || '',
            thumbnail: null,
            user: {
                id: ride.driver_id || 'unknown',
                name: ride.driver_name || null,
                // Ensure avatar is string or undefined, converting null to undefined
                avatar: ride.driver_avatar ? (ride.driver_avatar as string) : undefined
            },
            likes: 0,
            comments: 0,
            isLiked: false,
            timestamp: ride.date_time || ride.created_at,
            // Ride specific fields
            from: ride.from_location,
            to: ride.to_location,
            seats: ride.seats,
            price: ride.price
        };
    };

    // Helper to map Donation/Item to FeedItem
    const mapItemToItem = (item: any): FeedItem => {
        return {
            id: item.id,
            type: 'post',
            subtype: item.type === 'donation' ? 'donation' : 'item',
            title: item.title || 'donations.categories.items.title',
            description: item.description || '',
            thumbnail: item.images && item.images.length > 0 ? item.images[0] : (item.image || null),
            user: {
                id: item.userId || item.ownerId, // Adjust based on DB schema
                name: 'common.unknownUser', // Ideally fetch name
                avatar: undefined
            },
            likes: 0,
            comments: 0,
            isLiked: false,
            timestamp: item.timestamp || item.created_at || new Date().toISOString()
        };
    };

    const loadFeed = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            logger.debug('useFeedData', 'Loading feed', { feedMode, userId: currentUser?.id });

            // 1. Fetch Posts from Backend (Includes Tasks)
            const postsResponse = await postsService.getPosts(NUM_ITEMS, 0, feedMode === 'friends' ? currentUser?.id : undefined);
            const rawPosts = postsResponse.success ? (postsResponse.data || []) : [];
            const mappedPosts = rawPosts.map(mapPostToItem);

            let mappedRides: FeedItem[] = [];
            let mappedItems: FeedItem[] = [];

            if (feedMode === 'discovery') {
                // 2. Fetch Rides
                try {
                    const dbService = databaseService as any;
                    const rides = await dbService.listRides(currentUser?.id || '');
                    mappedRides = rides.slice(0, 10).map(mapRideToItem);
                } catch (e) {
                    logger.warn('useFeedData', 'Failed to load rides', { error: e });
                }

                // 3. Fetch Items/Donations
                try {
                    const dbService = databaseService as any;
                    // Assuming listItems exists and returns mixed content or separate calls needed
                    // Checking outline, listItems exists
                    const items = await dbService.listItems(currentUser?.id || '');
                    mappedItems = items.slice(0, 10).map(mapItemToItem);
                } catch (e) {
                    logger.warn('useFeedData', 'Failed to load items', { error: e });
                }
            }

            // Merge and Sort
            // Note: Tasks are part of mappedPosts if they come from backend posts table
            const merged = [...mappedPosts, ...mappedRides, ...mappedItems].sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

            setFeed(merged);

        } catch (error) {
            logger.error('useFeedData', 'Error loading feed', { error });
            // Don't clear feed on error, maybe show toast
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [feedMode, currentUser?.id]);

    useEffect(() => {
        loadFeed();
    }, [loadFeed]);

    return {
        feed,
        loading,
        refreshing,
        refresh: () => loadFeed(true),
        loadMore: () => { } // Implement pagination later
    };
};
