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
            timestamp: (post.created_at && !isNaN(new Date(post.created_at).getTime()))
                ? new Date(post.created_at).toISOString()
                : new Date().toISOString(),
            taskData: post.task ? {
                id: post.task.id,
                title: post.task.title,
                status: post.task.status
            } : undefined
        };
    };

    // Helper to map Ride to FeedItem
    const mapRideToItem = (ride: any): FeedItem => {
        // Parse locations - handle both object and string formats
        let fromLocation = '';
        let toLocation = '';

        if (typeof ride.from_location === 'object' && ride.from_location) {
            fromLocation = ride.from_location.name || ride.from_location.city || ride.from_location.address || '';
        } else if (typeof ride.from_location === 'string') {
            fromLocation = ride.from_location;
        } else if (ride.from) {
            fromLocation = ride.from;
        }

        if (typeof ride.to_location === 'object' && ride.to_location) {
            toLocation = ride.to_location.name || ride.to_location.city || ride.to_location.address || '';
        } else if (typeof ride.to_location === 'string') {
            toLocation = ride.to_location;
        } else if (ride.to) {
            toLocation = ride.to;
        }

        return {
            id: ride.id,
            type: 'post',
            subtype: 'ride',
            title: `טרמפ: ${fromLocation} ← ${toLocation}`,
            description: ride.description || ride.notes || `נסיעה מ${fromLocation} ל${toLocation}`,
            thumbnail: ride.image || null,
            user: {
                id: ride.driver_id || ride.createdBy || ride.created_by || 'unknown',
                name: ride.driver_name || 'common.unknownUser',
                avatar: ride.driver_avatar || undefined
            },
            likes: 0,
            comments: 0,
            isLiked: false,
            // Use created_at for feed sorting (when ride was posted, not departure time)
            timestamp: (ride.created_at && !isNaN(new Date(ride.created_at).getTime()))
                ? new Date(ride.created_at).toISOString()
                : new Date().toISOString(),
            // Ride specific fields
            from: fromLocation,
            to: toLocation,
            seats: ride.available_seats || ride.seats || 0,
            price: ride.price_per_seat || ride.price || 0
        };
    };

    // Helper to map Donation/Item to FeedItem
    const mapItemToItem = (item: any): FeedItem => {
        let thumbnail = item.image || null;
        if (item.images && item.images.length > 0) {
            thumbnail = typeof item.images[0] === 'string' ? item.images[0] : item.images[0].uri || null;
        } else if (item.image_base64) {
            const imageData = item.image_base64;
            if (imageData.startsWith('data:image') || imageData.startsWith('http')) {
                thumbnail = imageData;
            } else if (imageData.length > 100) {
                thumbnail = `data:image/jpeg;base64,${imageData}`;
            }
        }

        // Backend query (items-delivery.service.ts) returns owner_name/owner_avatar in listItems
        const userName = item.owner_name || item.user_name || item.name || 'common.unknownUser';
        const userAvatar = item.owner_avatar || item.user_avatar || item.avatar || undefined;
        const userId = item.owner_id || item.userId || item.ownerId || 'unknown';

        return {
            id: item.id,
            type: 'post',
            subtype: item.type === 'donation' ? 'donation' : 'item',
            title: item.title || 'donations.categories.items.title',
            description: item.description || '',
            thumbnail: thumbnail,
            user: {
                id: userId,
                name: userName,
                avatar: userAvatar
            },
            likes: 0,
            comments: 0,
            isLiked: false,
            timestamp: (item.created_at && !isNaN(new Date(item.created_at).getTime()))
                ? new Date(item.created_at).toISOString()
                : (item.timestamp || new Date().toISOString()),
            taskData: undefined
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

            // 1. Fetch Posts from Backend
            const postsResponse = await postsService.getPosts(NUM_ITEMS, 0, feedMode === 'friends' ? currentUser?.id : undefined);
            const rawPosts = postsResponse.success ? (postsResponse.data || []) : [];
            const mappedPosts = rawPosts.map(mapPostToItem);

            const allContent: FeedItem[] = [...mappedPosts];
            const existingIds = new Set(allContent.map(item => item.id));

            // Track IDs of tasks that already have a post to avoid duplicates
            const postedTaskIds = new Set(
                rawPosts
                    .filter((p: any) => p.task_id || p.task?.id)
                    .map((p: any) => p.task_id || p.task?.id)
            );

            // 2. Fetch Rides (Match ProfileScreen logic but sorted for feed)
            try {
                const { enhancedDB } = require('../utils/enhancedDatabaseService');
                const allRides = await enhancedDB.getRides({
                    include_past: 'true',
                    sort_by: 'created_at',
                    sort_order: 'desc',
                    limit: 50
                }); // Fetch all rides sorted by creation
                logger.debug('useFeedData', 'Fetched rides', { count: allRides.length });

                const mappedRides = allRides.map((ride: any) => mapRideToItem(ride));
                logger.debug('useFeedData', 'Mapped rides sample', {
                    sample: mappedRides[0] ? {
                        id: mappedRides[0].id,
                        title: mappedRides[0].title,
                        user: mappedRides[0].user,
                        timestamp: mappedRides[0].timestamp
                    } : 'none'
                });

                mappedRides.forEach((item: FeedItem) => {
                    if (!existingIds.has(item.id)) {
                        allContent.push(item);
                        existingIds.add(item.id);
                    }
                });
                logger.info('useFeedData', 'Added rides to feed', { added: mappedRides.length });
            } catch (e) {
                logger.warn('useFeedData', 'Failed to load rides', { error: e });
            }

            // 3. Fetch Items (Match ProfileScreen logic)
            try {
                const { API_BASE_URL, USE_BACKEND } = require('../utils/dbConfig');
                let rawItems: any[] = [];

                if (USE_BACKEND && API_BASE_URL) {
                    const axios = require('axios').default;
                    // Load available and reserved items
                    const [availRes, reservedRes] = await Promise.all([
                        axios.get(`${API_BASE_URL}/api/items-delivery/search`, { params: { status: 'available', limit: 50 } }),
                        axios.get(`${API_BASE_URL}/api/items-delivery/search`, { params: { status: 'reserved', limit: 50 } })
                    ]);

                    if (availRes.data?.success) rawItems.push(...(availRes.data.data || []));
                    if (reservedRes.data?.success) rawItems.push(...(reservedRes.data.data || []));
                } else {
                    const dbService = databaseService as any;
                    const items = await dbService.listItems(currentUser?.id || '');
                    rawItems = items;
                }
                logger.debug('useFeedData', 'Fetched items', { count: rawItems.length });

                const mappedItems = rawItems.map(mapItemToItem);
                mappedItems.forEach((item: FeedItem) => {
                    if (!existingIds.has(item.id)) {
                        allContent.push(item);
                        existingIds.add(item.id);
                    }
                });
                logger.info('useFeedData', 'Added items to feed', { added: mappedItems.length });
            } catch (e) {
                logger.warn('useFeedData', 'Failed to load items', { error: e });
            }

            // 4. Fetch Tasks (Match ProfileScreen logic - independent tasks)
            try {
                const { apiService } = require('../utils/apiService');
                const [openTasksRes, progressTasksRes] = await Promise.all([
                    apiService.getTasks({ status: 'open', limit: 20 }),
                    apiService.getTasks({ status: 'in_progress', limit: 20 })
                ]);

                const rawTasks = [
                    ...(openTasksRes.success ? (openTasksRes.data || []) : []),
                    ...(progressTasksRes.success ? (progressTasksRes.data || []) : [])
                ];

                // Map tasks to FeedItems
                rawTasks.forEach((task: any) => {
                    // Check if this task is already in a post
                    if (postedTaskIds.has(task.id)) {
                        return;
                    }

                    // Use actual task ID (UUID) without prefix
                    if (!existingIds.has(task.id)) {
                        const creator = task.creator_details || {};

                        const taskItem: FeedItem = {
                            id: task.id, // Use actual task ID
                            type: 'post', // Show as post
                            subtype: 'task_assignment',
                            title: `יצר/ה משימה חדשה: ${task.title}`,
                            description: task.description || '',
                            thumbnail: null,
                            user: {
                                id: creator.id || task.created_by || 'unknown',
                                name: creator.name || 'Unknown User',
                                avatar: creator.avatar_url || undefined
                            },
                            likes: 0,
                            comments: 0,
                            isLiked: false,
                            timestamp: task.created_at || new Date().toISOString(),
                            taskData: {
                                id: task.id,
                                title: task.title,
                                status: task.status
                            }
                        };
                        allContent.push(taskItem);
                        existingIds.add(task.id);
                    }
                });
            } catch (e) {
                logger.warn('useFeedData', 'Failed to load tasks', { error: e });
            }

            // Sort by timestamp
            allContent.sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

            setFeed(allContent);

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
