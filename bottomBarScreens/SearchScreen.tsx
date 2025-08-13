// File overview:
// - Purpose: Unified search across donations, events, and users with filters, quick actions, and AI helper modal.
// - Reached from: `SearchTabStack` initial route 'SearchScreen' via `BottomNavigator`.
// - Provides: Local search over real data (donations from DB) + demo data (when not real auth), category filter tabs, popular/recent tags, result cards.
// - Reads from context/services: `useUser()` (auth mode, selectedUser), `db.listDonations`, i18n strings for popular/recent.
// - Route params: None; result taps currently show details via Alert, not deep-linking.
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Alert,
  SafeAreaView
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { useTranslation } from 'react-i18next';
import { 
  donations, 
  communityEvents, 
  users, 
  categories 
} from '../globals/fakeData';
import { useUser } from '../context/UserContext';
import { db } from '../utils/databaseService';
import GuestModeNotice from '../components/GuestModeNotice';
import { Pressable, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { scaleSize } from '../globals/responsive';
import { createShadowStyle } from '../globals/styles';

interface SearchResult {
  id: string;
  type: 'task' | 'donation' | 'event' | 'user';
  title: string;
  description: string;
  image?: string;
  category: string;
  location?: string;
  date?: string;
}

const SearchScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const { isGuestMode, isRealAuth, selectedUser } = useUser();
  const { t } = useTranslation(['search','common']);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [realDonations, setRealDonations] = useState<any[]>([]);
  // Load real data (donations) for the current user
  useEffect(() => {
    const loadReal = async () => {
      try {
        if (!selectedUser) { setRealDonations([]); return; }
        const items = await db.listDonations(selectedUser.id);
        setRealDonations(Array.isArray(items) ? items : []);
      } catch (e) {
        setRealDonations([]);
      }
    };
    loadReal();
  }, [selectedUser]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSearching, setIsSearching] = useState(false);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiHistory, setAiHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 SearchScreen - Screen focused, refreshing data...');
      // Clear search results when returning to screen
      setSearchResults([]);
      setSearchQuery('');
    }, [])
  );

  // Popular searches (from i18n)
  const popularSearches: string[] = t('search:popularSearches', { returnObjects: true }) as unknown as string[];

  // Recent searches (from i18n)
  const recentSearches: string[] = t('search:recentSearches', { returnObjects: true }) as unknown as string[];

  // Filter tabs (from i18n)
  const filterOptions = [
    { id: 'All', label: t('search:tabs.all'), icon: 'grid-outline' },
    { id: 'donations', label: t('search:tabs.donations'), icon: 'heart-outline' },
    { id: 'events', label: t('search:tabs.events'), icon: 'calendar-outline' },
    { id: 'users', label: t('search:tabs.users'), icon: 'people-outline' },
  ];

  // Search over real data and fake data depending on auth mode
  const performSearch = (query: string, category: string = 'All') => {
    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      let results: SearchResult[] = [];
      
      // Real: donations from backend
      if (category === 'All' || category === 'donations') {
        const real = realDonations
          .filter((d: any) => {
            const t = String(d?.title || d?.name || '').toLowerCase();
            const desc = String(d?.description || '').toLowerCase();
            return t.includes(query.toLowerCase()) || desc.includes(query.toLowerCase());
          })
          .map((d: any) => ({
            id: String(d.id || d.itemId || d._id || Math.random()),
            type: 'donation' as const,
            title: String(d.title || d.name || 'תרומה'),
            description: String(d.description || ''),
            image: d.image,
            category: String(d.category || t('search:typeLabels.donation')),
            location: d.location?.city || d.location || undefined,
          }));
        results.push(...real);
      }
      // Fake donations only for guest/demo
      if (!isRealAuth && (category === 'All' || category === 'donations')) {
        results.push(...donations
          .filter(donation => 
            donation.title.toLowerCase().includes(query.toLowerCase()) ||
            donation.description.toLowerCase().includes(query.toLowerCase())
          )
          .map(donation => ({
            id: donation.id,
            type: 'donation' as const,
            title: donation.title,
            description: donation.description,
            image: donation.image,
            category: donation.category,
            location: donation.location,
          }))
        );
      }
      
      if (!isRealAuth && (category === 'All' || category === 'events')) {
        results.push(...communityEvents
          .filter(event => 
            event.title.toLowerCase().includes(query.toLowerCase()) ||
            event.description.toLowerCase().includes(query.toLowerCase())
          )
          .map(event => ({
            id: event.id,
            type: 'event' as const,
            title: event.title,
            description: event.description,
            image: event.image,
            category: event.category,
            date: event.date,
          }))
        );
      }
      
      if (!isRealAuth && (category === 'All' || category === 'users')) {
        results.push(...users
          .filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase())
          )
          .map(user => ({
            id: user.id,
            type: 'user' as const,
            title: user.name,
            description: user.bio || t('search:userDefaultBio'),
            image: user.avatar,
            category: t('search:typeLabels.user'),
          }))
        );
      }
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  const handleSearch = (query: string, filters?: string[], sorts?: string[], results?: any[]) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      performSearch(query, selectedCategory);
    } else {
      setSearchResults([]);
    }
    // For now, SearchScreen handles its own filtering logic, so we ignore the other parameters
    // In the future, this could be enhanced to use the provided filters and sorts
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery, category);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    Alert.alert(
      result.title,
      `${result.description}\n\n${t('search:labels.category')}: ${result.category}${result.location ? `\n${t('search:labels.location')}: ${result.location}` : ''}${result.date ? `\n${t('search:labels.date')}: ${new Date(result.date).toLocaleDateString()}` : ''}`,
      [
        { text: t('common:cancel'), style: 'cancel' },
        { text: t('search:moreDetails'), onPress: () => Alert.alert(t('search:details'), t('search:openFullDetails')) }
      ]
    );
  };

  const handlePopularSearch = (search: string) => {
    setSearchQuery(search);
    performSearch(search);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.resultImage} />
        ) : (
          <View style={[styles.resultImagePlaceholder, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <Ionicons name={getTypeIcon(item.type)} size={24} color={getTypeColor(item.type)} />
          </View>
        )}
      </View>
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>{item.title}</Text>
          <View style={[styles.resultTypeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
            <Text style={[styles.resultTypeText, { color: getTypeColor(item.type) }]}>
              {getTypeLabel(item.type)}
            </Text>
          </View>
        </View>
        <Text style={styles.resultDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultCategory}>{item.category}</Text>
          {item.location && (
            <Text style={styles.resultLocation}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              {' '}{item.location}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'donation': return 'heart-outline';
      case 'event': return 'calendar-outline';
      case 'user': return 'person-outline';
      default: return 'search-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'donation': return colors.error;
      case 'event': return colors.success;
      case 'user': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'donation': return t('search:typeLabels.donation');
      case 'event': return t('search:typeLabels.event');
      case 'user': return t('search:typeLabels.user');
      default: return t('search:typeLabels.result');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar onSearch={handleSearch} />
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterButton,
                selectedCategory === option.id && styles.filterButtonActive
              ]}
              onPress={() => handleCategoryFilter(option.id)}
            >
              <Ionicons 
                name={option.icon as any} 
                size={16} 
                color={selectedCategory === option.id ? colors.white : colors.textSecondary} 
              />
              <Text style={[
                styles.filterButtonText,
                selectedCategory === option.id && styles.filterButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: tabBarHeight + LAYOUT_CONSTANTS.SPACING.XL }}
      >
        {/* Guest Mode Notice */}
        
        {searchQuery.trim().length === 0 ? (
          // Default content when no search
          <View style={styles.defaultContent}>
            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('search:popularTitle')}</Text>
              <View style={styles.tagsContainer}>
                {popularSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => handlePopularSearch(search)}
                  >
                    <Text style={styles.tagText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Recent Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('search:recentTitle')}</Text>
              <View style={styles.tagsContainer}>
                {recentSearches.map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => handlePopularSearch(search)}
                  >
                    <Text style={styles.tagText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('search:quickActions.title')}</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Alert.alert(t('search:quickActions.urgentTasks'), t('search:quickActions.showUrgentTasks'))}
                >
                  <Ionicons name="flash-outline" size={24} color={colors.warning} />
                  <Text style={styles.quickActionText}>{t('search:quickActions.urgentTasks')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Alert.alert(t('search:quickActions.upcomingEvents'), t('search:quickActions.showUpcomingEvents'))}
                >
                  <Ionicons name="calendar-outline" size={24} color={colors.success} />
                  <Text style={styles.quickActionText}>{t('search:quickActions.upcomingEvents')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Alert.alert(t('search:quickActions.newDonations'), t('search:quickActions.showNewDonations'))}
                >
                  <Ionicons name="heart-outline" size={24} color={colors.error} />
                  <Text style={styles.quickActionText}>{t('search:quickActions.newDonations')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Alert.alert(t('search:quickActions.activeVolunteers'), t('search:quickActions.showActiveVolunteers'))}
                >
                  <Ionicons name="people-outline" size={24} color={colors.pink} />
                  <Text style={styles.quickActionText}>{t('search:quickActions.activeVolunteers')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // Search Results
          <View style={styles.resultsContainer}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="search" size={scaleSize(40)} color={colors.textSecondary} />
                <Text style={styles.loadingText}>{t('search:searching')}</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <Text style={styles.resultsTitle}>{t('search:resultsCount', { count: searchResults.length, query: searchQuery })}</Text>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </>
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={scaleSize(60)} color={colors.textSecondary} />
                <Text style={styles.noResultsTitle}>{t('search:noResultsFound')}</Text>
                <Text style={styles.noResultsText}>{t('search:tryChangingSearchTerms')}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating AI Assistant Button */}
      <Pressable
        onPress={() => setAiVisible(true)}
        style={styles.fab}
      >
        <Ionicons name="sparkles-outline" size={scaleSize(22)} color={colors.white} />
        <Text style={styles.fabText}>{t('search:ai.fabLabel')}</Text>
      </Pressable>

      {/* AI Assistant Modal*/}
      <Modal animationType="slide" transparent visible={aiVisible} onRequestClose={() => setAiVisible(false)}>
        <View style={styles.aiOverlay}>
          <View style={styles.aiContainer}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiTitle}>{t('search:ai.title')}</Text>
              <Pressable onPress={() => setAiVisible(false)}>
                <Ionicons name="close" size={scaleSize(22)} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.aiMessages} contentContainerStyle={{ paddingBottom: 10 }}>
              {aiHistory.length === 0 ? (
                <Text style={styles.aiPlaceholder}>{t('search:ai.placeholder')}</Text>
              ) : (
                aiHistory.map((m, idx) => (
                  <View key={idx} style={[styles.aiBubble, m.role === 'user' ? styles.aiUser : styles.aiAssistant]}>
                    <Text style={styles.aiBubbleText}>{m.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.aiInputRow}>
              <TextInput
                style={styles.aiInput}
                value={aiText}
                onChangeText={setAiText}
                placeholder="איך אפשר לעזור?"
                placeholderTextColor={colors.textSecondary}
              />
              <Pressable
                style={styles.aiSend}
                onPress={() => {
                  if (!aiText.trim()) return;
                  const userMsg = { role: 'user' as const, text: aiText.trim() };
                  const assistantMsg = { role: 'assistant' as const, text: t('search:ai.assistantReply') };
                  setAiHistory(prev => [...prev, userMsg, assistantMsg]);
                  setAiText('');
                }}
              >
                <Ionicons name="send" size={scaleSize(18)} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  aiOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  aiContainer: {
    backgroundColor: colors.backgroundPrimary,
    borderTopLeftRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    borderTopRightRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    paddingTop: LAYOUT_CONSTANTS.SPACING.SM,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    paddingBottom: LAYOUT_CONSTANTS.SPACING.SM,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: LAYOUT_CONSTANTS.SPACING.SM,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  aiTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  aiMessages: {
    maxHeight: scaleSize(260),
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  aiPlaceholder: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: LAYOUT_CONSTANTS.SPACING.LG,
  },
  aiBubble: {
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.SM + LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    marginVertical: LAYOUT_CONSTANTS.SPACING.XS,
    maxWidth: '85%',
  },
  aiUser: {
    backgroundColor: colors.pinkLight,
    alignSelf: 'flex-end',
  },
  aiAssistant: {
    backgroundColor: colors.backgroundSecondary,
    alignSelf: 'flex-start',
  },
  aiBubbleText: {
    color: colors.textPrimary,
    fontSize: FontSizes.body,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT_CONSTANTS.SPACING.SM,
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  aiInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecondary,
  },
  aiSend: {
    backgroundColor: colors.pink,
    padding: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
  },
  fab: {
    position: 'absolute',
    left: LAYOUT_CONSTANTS.SPACING.LG,
    bottom: scaleSize(50),
    backgroundColor: colors.pink,
    borderRadius: scaleSize(22),
    height: "auto",
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: LAYOUT_CONSTANTS.SPACING.XS,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 2 }, 0.15, 4),
  },
  fabText: {
    marginVertical: LAYOUT_CONSTANTS.SPACING.XS,
    color: colors.white,
    fontSize: FontSizes.small,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.MD,
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContainer: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    backgroundColor: colors.backgroundPrimary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    backgroundColor: colors.backgroundSecondary,
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  filterButtonText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginLeft: LAYOUT_CONSTANTS.SPACING.XS + 2,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  defaultContent: {
    padding: LAYOUT_CONSTANTS.SPACING.LG,
  },
  section: {
    marginBottom: LAYOUT_CONSTANTS.SPACING.XL,
  },
  sectionTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    textAlign: 'left',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.MD,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.SM,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: colors.backgroundSecondary,
    padding: LAYOUT_CONSTANTS.SPACING.LG,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    alignItems: 'center',
    marginBottom: LAYOUT_CONSTANTS.SPACING.MD,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
    textAlign: 'center',
  },
  resultsContainer: {
    padding: LAYOUT_CONSTANTS.SPACING.LG,
  },
  resultsTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.LG,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundPrimary,
    padding: LAYOUT_CONSTANTS.SPACING.MD,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    ...createShadowStyle(colors.shadowLight, { width: 0, height: 1 }, 0.1, 2),
  },
  resultImageContainer: {
    marginRight: LAYOUT_CONSTANTS.SPACING.MD,
  },
  resultImage: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
  },
  resultImagePlaceholder: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  resultTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: LAYOUT_CONSTANTS.SPACING.SM,
  },
  resultTypeBadge: {
    paddingHorizontal: LAYOUT_CONSTANTS.SPACING.SM,
    paddingVertical: LAYOUT_CONSTANTS.SPACING.XS,
    borderRadius: LAYOUT_CONSTANTS.BORDER_RADIUS.SMALL,
  },
  resultTypeText: {
    fontSize: FontSizes.small,
    fontWeight: '600',
  },
  resultDescription: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: LAYOUT_CONSTANTS.SPACING.SM,
    lineHeight: Math.round(FontSizes.body * 1.3),
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCategory: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginRight: LAYOUT_CONSTANTS.SPACING.MD,
  },
  resultLocation: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: scaleSize(50),
  },
  loadingText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginTop: LAYOUT_CONSTANTS.SPACING.SM,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: scaleSize(50),
  },
  noResultsTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: LAYOUT_CONSTANTS.SPACING.MD,
    marginBottom: LAYOUT_CONSTANTS.SPACING.XS,
  },
  noResultsText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: Math.round(FontSizes.body * 1.4),
  },

});

export default SearchScreen;
