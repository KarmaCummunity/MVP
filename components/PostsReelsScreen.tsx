import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
  Text,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import colors from '../globals/colors';
import { FeedItem } from '../types/feed';
import { useFeedData } from '../hooks/useFeedData';
import PostReelItem from './Feed/PostReelItem';
import FeedHeader from './Feed/FeedHeader';
import CommentsModal from './CommentsModal'; // Assuming this exists in the same dir
import VerticalGridSlider from './VerticalGridSlider';
import { logger } from '../utils/loggerService';

const { width } = Dimensions.get('window');

// Props
interface PostsReelsScreenProps {
  onScroll?: (hide: boolean) => void;
  hideTopBar?: boolean;
  showTopBar?: boolean;
}

const PostsReelsScreen: React.FC<PostsReelsScreenProps> = ({
  onScroll,
  hideTopBar = false,
  showTopBar = false
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  // State
  const [feedMode, setFeedMode] = useState<'friends' | 'discovery'>('friends');
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedItemForComments, setSelectedItemForComments] = useState<FeedItem | null>(null);
  const [numColumns, setNumColumns] = useState(1); // Default to list view
  const [sliderValue, setSliderValue] = useState(0); // 0 = 1 col, 1 = 2 cols, 2 = 3 cols

  // Custom Hook for Data
  const { feed, loading, refreshing, refresh } = useFeedData(feedMode);

  // Scroll Handling
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const isScrollingDown = currentScrollY > lastScrollY.current;

    if (onScroll) {
      // Simple logic: hide if scrolling down more than 50px, show if scrolling up
      if (currentScrollY > 50 && isScrollingDown) {
        onScroll(true);
      } else if (currentScrollY < lastScrollY.current - 20) {
        onScroll(false);
      }
    }
    lastScrollY.current = currentScrollY;
  }, [onScroll]);

  // Handlers
  const handleStatsPress = useCallback(() => {
    logger.debug('PostsReelsScreen', 'Navigating to CommunityStatsScreen');
    navigation.navigate('CommunityStatsScreen');
  }, [navigation]);

  const handlePostPress = useCallback((item: FeedItem) => {
    // Navigate to detailed view?
    logger.debug('PostsReelsScreen', 'Post pressed', { itemId: item.id });
    // TODO: Implement navigation to individual post screen if exists
  }, []);

  const handleCommentPress = useCallback((item: FeedItem) => {
    setSelectedItemForComments(item);
    setCommentsModalVisible(true);
  }, []);

  const handleSliderChange = useCallback((value: number) => {
    // Round to nearest integer standardizing step behavior
    const step = Math.round(value);
    setSliderValue(step);

    // Map slider value (0-2) to columns (1-3)
    // 0 -> 1 column (List)
    // 1 -> 2 columns (Grid)
    // 2 -> 3 columns (Dense Grid)
    setNumColumns(step + 1);
  }, []);

  const renderItem = useCallback(({ item }: { item: FeedItem }) => {
    // Calculate width based on columns
    // Screen width - 32 (padding) / numColumns
    const itemWidth = (width - 32) / numColumns;

    return (
      <PostReelItem
        item={item}
        cardWidth={numColumns > 1 ? itemWidth : width} // Full width if list
        numColumns={numColumns}
        onPress={handlePostPress}
        onCommentPress={handleCommentPress}
      />
    );
  }, [handlePostPress, handleCommentPress, numColumns]);

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {!loading && (
        <>
          <Text style={styles.emptyText}>{t('feed.empty_title') || 'אין פוסטים עדיין'}</Text>
          <Text style={styles.emptySubtext}>
            {feedMode === 'friends'
              ? (t('feed.empty_friends') || 'הוסף חברים כדי לראות פוסטים!')
              : (t('feed.empty_discovery') || 'היה הראשון לפרסם!')
            }
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header */}
        {!hideTopBar && (
          <FeedHeader
            feedMode={feedMode}
            setFeedMode={setFeedMode}
            onStatsPress={handleStatsPress}
            t={t}
          />
        )}

        {/* Floating Slider Control - Rendered independently to respect its absolute positioning */}
        {!loading && feed.length > 0 && !hideTopBar && (
          <VerticalGridSlider
            numColumns={numColumns}
            onNumColumnsChange={(cols) => {
              setSliderValue(cols - 1);
              setNumColumns(cols);
            }}
          />
        )}

        {/* Feed List */}
        <FlatList
          data={feed}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          key={numColumns} // Force re-render on column change
          numColumns={numColumns}
          contentContainerStyle={[
            styles.listContent,
            // Add padding top to account for floating header
            !hideTopBar && { paddingTop: 70 }
          ]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={renderEmptyComponent}
          // Optimization props
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
        />

        {/* Modals */}
        <CommentsModal
          visible={commentsModalVisible}
          onClose={() => setCommentsModalVisible(false)}
          postId={selectedItemForComments?.id || ''}
          postUser={selectedItemForComments?.user ? {
            id: selectedItemForComments.user.id,
            name: selectedItemForComments.user.name || null,
            avatar: selectedItemForComments.user.avatar || ''
          } : { id: '', name: '', avatar: '' }}
          postTitle={selectedItemForComments?.title || ''}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  listContent: {
    paddingBottom: 80, // Space for bottom bar
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
  }
});

export default React.memo(PostsReelsScreen);
