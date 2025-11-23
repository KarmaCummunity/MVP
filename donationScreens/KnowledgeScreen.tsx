import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { NavigationProp, ParamListBase, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DonationStatsFooter from '../components/DonationStatsFooter';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useUser } from '../stores/userStore';
import HeaderComp from '../components/HeaderComp';
import { donationResources } from '../utils/donationResources';

// Mock data for educational content
const educationalLinks = [
  {
    id: '1',
    title: 'קורס מתמטיקה בסיסי',
    description: 'לימוד מתמטיקה בסיסית לכיתות א-ו',
    url: 'https://www.khanacademy.org/math',
    icon: 'calculator-outline',
    color: colors.success,
    category: 'מתמטיקה',
  },
  {
    id: '2',
    title: 'לימוד אנגלית',
    description: 'קורס אנגלית למתחילים ומתקדמים',
    url: 'https://www.duolingo.com',
    icon: 'language-outline',
    color: colors.info,
    category: 'שפות',
  },
  {
    id: '3',
    title: 'תכנות בסיסי',
    description: 'לימוד תכנות עם Python ו-JavaScript',
    url: 'https://www.codecademy.com',
    icon: 'code-outline',
    color: colors.donationItems,
    category: 'תכנות',
  },
  {
    id: '4',
    title: 'מדעים וטבע',
    description: 'סרטונים חינוכיים על מדע וטבע',
    url: 'https://www.youtube.com/c/Kurzgesagt',
    icon: 'flask-outline',
    color: colors.warning,
    category: 'מדעים',
  },
  {
    id: '5',
    title: 'היסטוריה יהודית',
    description: 'קורס היסטוריה יהודית וישראלית',
    url: 'https://www.youtube.com/c/JewishHistory',
    icon: 'library-outline',
    color: colors.textPrimary,
    category: 'היסטוריה',
  },
  {
    id: '6',
    title: 'אמנות ויצירה',
    description: 'שיעורי אמנות ויצירה לכל הגילאים',
    url: 'https://www.youtube.com/c/ArtForKidsHub',
    icon: 'brush-outline',
    color: colors.pinkDark,
    category: 'אמנות',
  },
];

const communityContent = [
  {
    id: '1',
    title: 'שיעור פרטי במתמטיקה',
    teacher: 'שרה כהן',
    subject: 'מתמטיקה - כיתה י"א',
    description: 'שיעור פרטי במתמטיקה לכיתה י"א, כולל הכנה לבגרות',
    rating: 4.8,
    students: 15,
    price: '₪80 לשעה',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
  },
  {
    id: '2',
    title: 'קורס אנגלית למבוגרים',
    teacher: 'דוד לוי',
    subject: 'אנגלית - מתחילים',
    description: 'קורס אנגלית למבוגרים מתחילים, שיעורים קבוצתיים',
    rating: 4.9,
    students: 8,
    price: '₪120 לשיעור',
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400',
  },
  {
    id: '3',
    title: 'שיעור מוזיקה - פסנתר',
    teacher: 'מיכל רוזן',
    subject: 'מוזיקה - פסנתר',
    description: 'שיעורי פסנתר למתחילים ומתקדמים, כולל תיאוריה',
    rating: 4.7,
    students: 12,
    price: '₪100 לשעה',
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400',
  },
  {
    id: '4',
    title: 'קורס תכנות לילדים',
    teacher: 'יוסי גולדברג',
    subject: 'תכנות - Scratch',
    description: 'קורס תכנות לילדים עם Scratch, לימוד משחק',
    rating: 4.6,
    students: 20,
    price: '₪90 לשיעור',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
  },
];

export default function KnowledgeScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  const { selectedUser, isRealAuth } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [filteredEducationalLinks, setFilteredEducationalLinks] = useState(educationalLinks);
  const [filteredCommunityContent, setFilteredCommunityContent] = useState(communityContent);
  const [selectedMentorship, setSelectedMentorship] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // console removed
      // Reset form when returning to screen
      setSelectedMentorship(null);
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // Filter and sort options for knowledge screen
  const knowledgeFilterOptions = [
    "מתמטיקה",
    "שפות",
    "תכנות",
    "מדעים",
    "היסטוריה",
    "אמנות",
    "מוזיקה",
    "ספורט",
    "בישול",
    "טכנולוגיה",
    "פסיכולוגיה",
    "כלכלה"
  ];

  const knowledgeSortOptions = [
    "אלפביתי",
    "לפי קטגוריה",
    "לפי דירוג",
    "לפי מספר תלמידים",
    "לפי רלוונטיות",
  ];
  const handleLinkPress = async (url: string, title: string) => {
    // console removed
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('שגיאה', 'שגיאה בפתיחת הקישור');
    }
  };

  const handleCommunityContentPress = (content: any) => {
    // console removed
    Alert.alert(
      'הצטרפות לקורס',
      `האם תרצה להצטרף לקורס "${content.title}" עם ${content.teacher}?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'הצטרף', onPress: () => Alert.alert('הצלחה', 'הצטרפת לקורס בהצלחה!') }
      ]
    );
  };

  // Function to handle search results from HeaderComp
  const handleSearch = (query: string, filters?: string[], sorts?: string[], results?: any[]) => {
    // console removed
    
    // Update state with search results
    setSearchQuery(query);
    setSelectedFilter(filters?.[0] || "");
    setSelectedSort(sorts?.[0] || "");
    
    // If results are provided from SearchBar, use them
    if (results && results.length > 0) {
      // Split results between educational links and community content
      const educationalResults = results.filter(item => item.url);
      const communityResults = results.filter(item => item.teacher);
      
      setFilteredEducationalLinks(educationalResults);
      setFilteredCommunityContent(communityResults);
    } else {
      // Otherwise, perform local filtering
      let filteredEducational = [...educationalLinks];
      let filteredCommunity = [...communityContent];
      
      // Filter by search query
      if (query.trim() !== "") {
        filteredEducational = filteredEducational.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
        );
        
        filteredCommunity = filteredCommunity.filter(item => 
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subject.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.teacher.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      setFilteredEducationalLinks(filteredEducational);
      setFilteredCommunityContent(filteredCommunity);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
      
      <HeaderComp
        mode={true}
        menuOptions={[]}
        onToggleMode={() => {}}
        onSelectMenuItem={() => {}}
        title=""
        placeholder="חפש קורסים ושיעורים..."
        filterOptions={knowledgeFilterOptions}
        sortOptions={knowledgeSortOptions}
        searchData={isRealAuth ? [] : [...educationalLinks, ...communityContent]}
        onSearch={handleSearch}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Educational Links Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>קישורים חינוכיים</Text>
          <Text style={styles.sectionDescription}>
            קישורים לאתרי לימוד מומלצים בחינם
          </Text>
          
          <View style={styles.linksGrid}>
            {(isRealAuth ? [] : filteredEducationalLinks).map((link) => (
              <TouchableOpacity
                key={link.id}
                style={styles.linkCard}
                onPress={() => handleLinkPress(link.url, link.title)}
              >
                <View style={styles.linkHeader}>
                  <View style={[styles.linkIcon, { backgroundColor: link.color }]}>
                    <Ionicons name={link.icon as any} size={20} color="white" />
                  </View>
                  <Text style={styles.linkTitle}>{link.title}</Text>
                  <Ionicons name="open-outline" size={16} color={colors.textSecondary} />
                </View>
                <View style={styles.linkContent}>
                  <Text style={styles.linkCategory}>{link.category}</Text>
                  <Text style={styles.linkDescription}>{link.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommended Organizations Section */}
        {!!donationResources.knowledge && donationResources.knowledge.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{'עמותות מומלצות'}</Text>
            <Text style={styles.sectionDescription}>
              ארגונים מובילים בישראל לחונכות, לימוד ותמיכה חינוכית
            </Text>
            <View style={styles.linksGrid}>
              {donationResources.knowledge.map((org) => (
                <TouchableOpacity
                  key={`knowledge-${org.url}`}
                  style={styles.linkCard}
                  onPress={() => handleLinkPress(org.url, org.name)}
                >
                  <View style={styles.linkHeader}>
                    <View style={[styles.linkIcon, { backgroundColor: colors.info }]}>
                      <Ionicons name={'school-outline' as any} size={20} color="white" />
                    </View>
                    <Text style={styles.linkTitle}>{org.name}</Text>
                    <View style={{ borderWidth: 1, borderColor: colors.info, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ color: colors.info, fontSize: FontSizes.caption }}>בקר באתר</Text>
                    </View>
                  </View>
                  <View style={styles.linkContent}>
                    {!!org.description && (
                      <Text style={styles.linkDescription}>{org.description}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Community Content Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>תוכן קהילתי</Text>
          <Text style={styles.sectionDescription}>
            שיעורים פרטיים וקורסים מהקהילה
          </Text>
          
          <View style={styles.communityGrid}>
            {(isRealAuth ? [] : filteredCommunityContent).map((content) => (
              <TouchableOpacity
                key={content.id}
                style={styles.communityCard}
                onPress={() => handleCommunityContentPress(content)}
              >
                <Image source={{ uri: content.image }} style={styles.communityImage} />
                <View style={styles.communityContent}>
                  <View style={styles.communityHeader}>
                    <Text style={styles.communityTitle}>{content.title}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color={colors.warning} />
                      <Text style={styles.ratingText}>{content.rating}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.communitySubject}>{content.subject}</Text>
                  <Text style={styles.communityDescription}>{content.description}</Text>
                  
                  <View style={styles.communityFooter}>
                    <View style={styles.communityStats}>
                      <Ionicons name="people" size={16} color={colors.textSecondary} />
                      <Text style={styles.communityStatsText}>{content.students} תלמידים</Text>
                    </View>
                    <Text style={styles.communityPrice}>{content.price}</Text>
                  </View>
                  
                  <View style={styles.communityTeacher}>
                    <Ionicons name="person" size={16} color={colors.pink} />
                    <Text style={styles.communityTeacherText}>{content.teacher}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Section */}
          {(() => {
            const activeCourses = filteredEducationalLinks.length;
            const totalStudents = filteredCommunityContent.reduce((s, c) => s + (c.students || 0), 0);
            const avgRating = filteredCommunityContent.length > 0
              ? (filteredCommunityContent.reduce((s, c) => s + (c.rating || 0), 0) / filteredCommunityContent.length).toFixed(1)
              : '0.0';
            return (
              <DonationStatsFooter
                stats={[
                  { label: 'קורסים פעילים', value: activeCourses, icon: 'school-outline' },
                  { label: 'תלמידים', value: totalStudents, icon: 'people-outline' },
                  { label: 'דירוג ממוצע', value: avgRating, icon: 'star-outline' },
                ]}
              />
            );
          })()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },

  header: {
    backgroundColor: colors.backgroundPrimary,
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: FontSizes.medium,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  linksGrid: {
    gap: 15,
  },
  linkCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkCategory: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  linkTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  linkDescription: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  communityGrid: {
    gap: 15,
  },
  communityCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityImage: {
    width: '100%',
    height: 150,
  },
  communityContent: {
    padding: 15,
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  communityTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FontSizes.small,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  communitySubject: {
    fontSize: FontSizes.small,
    color: colors.pink,
    marginBottom: 6,
  },
  communityDescription: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  communityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityStatsText: {
    fontSize: FontSizes.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  communityPrice: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: colors.pink,
  },
  communityTeacher: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityTeacherText: {
    fontSize: FontSizes.small,
    color: colors.pink,
    marginLeft: 4,
  },
  statsSection: {
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    color: colors.pink,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 