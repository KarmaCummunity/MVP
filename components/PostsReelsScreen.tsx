import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// Fake data generator
const NUM_ITEMS = 100;

type Item = {
  id: string;
  type: 'post' | 'reel';
  title: string;
  thumbnail: string;
};

const generateFakeData = (): Item[] => {
  const data: Item[] = [];
  for (let i = 1; i <= NUM_ITEMS; i++) {
    const type = Math.random() < 0.5 ? 'post' : 'reel';
    data.push({
      id: `${type}-${i}`,
      type,
      title: `${type === 'post' ? 'Post' : 'Reel'} #${i}`,
      // Use placeholder images for thumbnails
      thumbnail: `https://picsum.photos/seed/${type}-${i}/300/200`,
    });
  }
  return data;
};

const data = generateFakeData();

const PostReelItem = ({ item }: { item: Item }) => {
  return (
    <View style={[styles.itemContainer, item.type === 'reel' && styles.reelItem]}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.textContainer}>
        <Text style={styles.typeLabel}>{item.type.toUpperCase()}</Text>
        <Text style={styles.title}>{item.title}</Text>
      </View>
    </View>
  );
};

export default function PostsReelsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostReelItem item={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  itemContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  reelItem: {
    backgroundColor: '#e0f7fa',
  },
  thumbnail: {
    width: width - 32,
    height: 180,
  },
  textContainer: {
    padding: 12,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
