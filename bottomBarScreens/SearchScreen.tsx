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
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../components/SearchBar';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { texts } from '../globals/texts';
import { 
  donations, 
  communityEvents, 
  users, 
  categories 
} from '../globals/fakeData';
import { useUser } from '../context/UserContext';
import GuestModeNotice from '../components/GuestModeNotice';
import { Pressable, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

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
  const { isGuestMode } = useUser();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
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

  // Popular searches
  const popularSearches = [
    'איסוף מזון', 'תרומת דם', 'עזרה לקשישים', 'ניקוי גינה', 'הוראה לילדים'
  ];

  // Recent searches
  const recentSearches = [
    'מתנדבים', 'אירועים', 'תרומות', 'משימות דחופות'
  ];

  // Filter options
  const filterOptions = [
    { id: 'All', label: 'הכל', icon: 'grid-outline' },
    { id: 'donations', label: 'תרומות', icon: 'heart-outline' },
    { id: 'events', label: 'אירועים', icon: 'calendar-outline' },
    { id: 'users', label: 'משתמשים', icon: 'people-outline' },
  ];

  // Mock search function
  const performSearch = (query: string, category: string = 'All') => {
    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      let results: SearchResult[] = [];
      
      if (category === 'All' || category === 'donations') {
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
      
      if (category === 'All' || category === 'events') {
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
      
      if (category === 'All' || category === 'users') {
        results.push(...users
          .filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase())
          )
          .map(user => ({
            id: user.id,
            type: 'user' as const,
            title: user.name,
            description: user.bio || 'חבר בקהילה',
            image: user.avatar,
            category: 'משתמש',
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
      `${result.description}\n\nקטגוריה: ${result.category}${result.location ? `\nמיקום: ${result.location}` : ''}${result.date ? `\nתאריך: ${new Date(result.date).toLocaleDateString('he-IL')}` : ''}`,
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'פרטים נוספים', onPress: () => Alert.alert('פרטים', 'פתיחת דף פרטים מלא') }
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
      case 'donation': return 'תרומה';
      case 'event': return 'אירוע';
      case 'user': return 'משתמש';
      default: return 'תוצאה';
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Guest Mode Notice */}
        {/* הוסר באנר אורח המקומי – מופיע כעת גלובלית בכל האפליקציה */}
        
        {searchQuery.trim().length === 0 ? (
          // Default content when no search
          <View style={styles.defaultContent}>
            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>חיפושים פופולריים</Text>
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
              <Text style={styles.sectionTitle}>חיפושים אחרונים</Text>
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
              <Text style={styles.sectionTitle}>{texts.quickActions}</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Alert.alert('משימות דחופות', 'מציג משימות דחופות')}
                >
                  <Ionicons name="flash-outline" size={24} color={colors.warning} />
                  <Text style={styles.quickActionText}>{texts.urgentTasks}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Alert.alert('אירועים קרובים', 'מציג אירועים קרובים')}
                >
                  <Ionicons name="calendar-outline" size={24} color={colors.success} />
                  <Text style={styles.quickActionText}>{texts.upcomingEvents}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Alert.alert('תרומות חדשות', 'מציג תרומות חדשות')}
                >
                  <Ionicons name="heart-outline" size={24} color={colors.error} />
                  <Text style={styles.quickActionText}>{texts.newDonations}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Alert.alert('מתנדבים פעילים', 'מציג מתנדבים פעילים')}
                >
                  <Ionicons name="people-outline" size={24} color={colors.pink} />
                  <Text style={styles.quickActionText}>{texts.activeVolunteers}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // Search Results
          <View style={styles.resultsContainer}>
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="search" size={40} color={colors.textSecondary} />
                <Text style={styles.loadingText}>{texts.searching}</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <Text style={styles.resultsTitle}>
                  נמצאו {searchResults.length} תוצאות עבור "{searchQuery}"
                </Text>
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </>
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={60} color={colors.textSecondary} />
                <Text style={styles.noResultsTitle}>{texts.noResultsFound}</Text>
                <Text style={styles.noResultsText}>
                  {texts.tryChangingSearchTerms}
                </Text>
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
        <Ionicons name="sparkles-outline" size={22} color={colors.white} />
        <Text style={styles.fabText}>AI</Text>
      </Pressable>

      {/* AI Assistant Modal (פשוט/בסיסי) */}
      <Modal animationType="slide" transparent visible={aiVisible} onRequestClose={() => setAiVisible(false)}>
        <View style={styles.aiOverlay}>
          <View style={styles.aiContainer}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiTitle}>עוזר AI</Text>
              <Pressable onPress={() => setAiVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.aiMessages} contentContainerStyle={{ paddingBottom: 10 }}>
              {aiHistory.length === 0 ? (
                <Text style={styles.aiPlaceholder}>שאלו כל דבר: איפה למצוא תרומות, איך לפרסם, או ניווט באפליקציה.</Text>
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
                  const assistantMsg = { role: 'assistant' as const, text: 'קיבלתי! אחזור עם תשובה בהקדם.' };
                  setAiHistory(prev => [...prev, userMsg, assistantMsg]);
                  setAiText('');
                }}
              >
                <Ionicons name="send" size={18} color={colors.white} />
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
  },
  aiTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  aiMessages: {
    maxHeight: 260,
    marginTop: 8,
  },
  aiPlaceholder: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  aiBubble: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 4,
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
    gap: 8,
    marginTop: 8,
  },
  aiInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundSecondary,
  },
  aiSend: {
    backgroundColor: colors.pink,
    padding: 10,
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    left: 20,
    bottom: 50,
    backgroundColor: colors.pink,
    borderRadius: 22,
    height: "auto",
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 4,
  },
  fabText: {
    marginVertical: 5,
    color: colors.white,
    fontSize: FontSizes.small,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.backgroundPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.backgroundPrimary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    marginRight: 10,
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
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  defaultContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    textAlign: 'left',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
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
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundPrimary,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultImageContainer: {
    marginRight: 15,
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  resultImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
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
    marginBottom: 5,
  },
  resultTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  resultTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultTypeText: {
    fontSize: FontSizes.small,
    fontWeight: '600',
  },
  resultDescription: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCategory: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginRight: 15,
  },
  resultLocation: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginTop: 10,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noResultsTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 15,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

});

export default SearchScreen;
