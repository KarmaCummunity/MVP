// screens/ProfileScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import type { SceneRendererProps, NavigationState } from 'react-native-tab-view';
import colors from '../globals/colors';

// --- Type Definitions ---
type TabRoute = {
  key: string;
  title: string;
};

// --- Tab Components ---
const PostsRoute = () => (
  <ScrollView contentContainerStyle={localStyles.tabContentContainer}>
    <View style={localStyles.postsGrid}>
      {Array.from({ length: 15 }).map((_, i) => (
        <Image
          key={i}
          source={{ uri: `https://randomuser.me/api/portraits/men/${i % 100}.jpg` }}
          style={localStyles.postImage}
        />
      ))}
    </View>
  </ScrollView>
);

const ReelsRoute = () => (
  <View style={localStyles.tabContentPlaceholder}>
    <Text style={localStyles.placeholderText}>אין סרטוני רילס עדיין.</Text>
  </View>
);

const TaggedRoute = () => (
  <View style={localStyles.tabContentPlaceholder}>
    <Text style={localStyles.placeholderText}>אין תיוגים עדיין.</Text>
  </View>
);

// --- Main Component ---
export default function ProfileScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState<TabRoute[]>([
    { key: 'posts', title: 'פוסטים' },
    { key: 'reels', title: 'רילס' },
    { key: 'tagged', title: 'תיוגים' },
  ]);

  const renderScene = SceneMap({
    posts: PostsRoute,
    reels: ReelsRoute,
    tagged: TaggedRoute,
  });

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<TabRoute> }
  ) => (
    <TabBar
      {...props}
      indicatorStyle={localStyles.tabBarIndicator}
      style={localStyles.tabBar}
      activeColor={colors.black}
      inactiveColor="#8e8e8e"
      pressColor="#efefef"
      renderTabBarItem={({ route, key }) => {
        const routeIndex = props.navigationState.routes.findIndex(r => r.key === route.key);
        const isFocused = props.navigationState.index === routeIndex;

        return (
          <TouchableOpacity
            key={key}
            style={localStyles.tabBarItem}
            onPress={() => props.jumpTo(route.key)}
          >
            <Text
              style={{
                color: isFocused ? colors.black : '#8e8e8e',
                fontWeight: isFocused ? 'bold' : 'normal',
                writingDirection: 'rtl',
                textAlign: 'center',
                paddingVertical: 8,
              }}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );

  return (
    <SafeAreaView style={localStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={localStyles.header}>
          <TouchableOpacity style={localStyles.headerIcon}>
            <Ionicons name="menu" size={30} color="black" />
          </TouchableOpacity>
          <Text style={localStyles.username}>shay_perez</Text>
          <TouchableOpacity style={localStyles.headerIcon}>
            <Ionicons name="add-circle-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>

        <View style={localStyles.profileInfo}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/2.jpg' }}
            style={localStyles.profilePicture}
          />
          <View style={localStyles.statsContainer}>
            <View style={localStyles.statItem}>
              <Text style={localStyles.statNumber}>150</Text>
              <Text style={localStyles.statLabel}>פוסטים</Text>
            </View>
            <View style={localStyles.statItem}>
              <Text style={localStyles.statNumber}>5000</Text>
              <Text style={localStyles.statLabel}>עוקבים</Text>
            </View>
            <View style={localStyles.statItem}>
              <Text style={localStyles.statNumber}>300</Text>
              <Text style={localStyles.statLabel}>עוקב/ת</Text>
            </View>
          </View>
        </View>

        <View style={localStyles.bioSection}>
          <Text style={localStyles.fullName}>שיי פרץ</Text>
          <Text style={localStyles.bioText}>
            תיאור ביו קצר ומעניין עליי. {'\n'}
            כאן אפשר לכתוב על תחומי עניין, מקצוע, או כל דבר אחר.
          </Text>
          <View style={localStyles.activityIcons}>
            <TouchableOpacity style={localStyles.activityIconItem}>
              <Ionicons name="star-outline" size={24} color="gray" />
              <Text style={localStyles.activityIconText}>פעילות</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.activityIconItem}>
              <MaterialCommunityIcons name="history" size={24} color="gray" />
              <Text style={localStyles.activityIconText}>היסטוריה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={localStyles.activityIconItem}>
              <Ionicons name="heart-outline" size={24} color="gray" />
              <Text style={localStyles.activityIconText}>מועדפים</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={localStyles.actionButtonsContainer}>
          <TouchableOpacity style={localStyles.discoverPeopleButton}>
            <Ionicons name="person-add-outline" size={18} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionButton}>
            <Text style={localStyles.actionButtonText}>שתף פרופיל</Text>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.actionButton}>
            <Text style={localStyles.actionButtonText}>ערוך פרופיל</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={localStyles.storyHighlightsContentContainer}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={localStyles.storyHighlightItem}>
              <View style={localStyles.storyHighlightCircle}>
                <Ionicons name="add" size={30} color="black" />
              </View>
              <Text style={localStyles.storyHighlightText}>
                {i === 0 ? 'חדש' : `היילייט ${i}`}
              </Text>
            </View>
          ))}
        </ScrollView>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={renderTabBar}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    writingDirection: 'rtl',
    textAlign: 'right',
    flex: 1,
    marginRight: 10,
    marginLeft: 10,
  },
  headerIcon: { padding: 5 },
  profileInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  profilePicture: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#ddd',
    marginLeft: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  statLabel: { fontSize: 14, color: '#666', textAlign: 'center' },
  bioSection: { paddingHorizontal: 15, marginBottom: 10 },
  fullName: {
    fontSize: 16,
    fontWeight: 'bold',
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  bioText: {
    fontSize: 14,
    color: '#333',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginTop: 5,
    lineHeight: 20,
  },
  activityIcons: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginTop: 15,
  },
  activityIconItem: { alignItems: 'center', marginHorizontal: 10 },
  activityIconText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#efefef',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  discoverPeopleButton: {
    backgroundColor: '#efefef',
    borderRadius: 8,
    padding: 10,
    marginRight: 5,
  },
  storyHighlightsContentContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row-reverse',
  },
  storyHighlightItem: { alignItems: 'center', marginHorizontal: 8 },
  storyHighlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  storyHighlightText: {
    fontSize: 12,
    marginTop: 5,
    color: '#555',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    alignItems: 'flex-end',
    borderBottomColor: '#eee',
  },
  tabBarIndicator: {
    backgroundColor: '#000',
    height: 2,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabContentContainer: { minHeight: 300 },
  postsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  postImage: {
    width: Dimensions.get('window').width / 3 - 2,
    height: Dimensions.get('window').width / 3 - 2,
    margin: 1,
  },
  tabContentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
