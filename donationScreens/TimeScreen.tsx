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
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { useUser } from '../context/UserContext';
import HeaderComp from '../components/HeaderComp';

// Mock data for volunteer opportunities
const volunteerOpportunities = [
  {
    id: '1',
    title: 'התנדבות בבית אבות',
    organization: 'בית אבות "בית חם"',
    description: 'עזרה לקשישים, שיחה, ליווי לטיולים ופעילויות',
    location: 'תל אביב',
    duration: '2-4 שעות',
    frequency: 'פעם בשבוע',
    volunteers: 8,
    needed: 12,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
    category: 'קשישים',
  },
  {
    id: '2',
    title: 'עזרה בשיעורי בית',
    organization: 'מרכז למידה קהילתי',
    description: 'עזרה לילדים בשיעורי בית במתמטיקה ואנגלית',
    location: 'ירושלים',
    duration: '1-2 שעות',
    frequency: 'פעמיים בשבוע',
    volunteers: 15,
    needed: 20,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    category: 'חינוך',
  },
  {
    id: '3',
    title: 'איסוף מזון לנזקקים',
    organization: 'לקט ישראל',
    description: 'איסוף מזון עודף מחנויות וחלוקה לנזקקים',
    location: 'חיפה',
    duration: '3-5 שעות',
    frequency: 'פעם בשבוע',
    volunteers: 25,
    needed: 30,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
    category: 'רווחה',
  },
  {
    id: '4',
    title: 'טיפול בחיות מחמד',
    organization: 'מקלט חיות "לב זהב"',
    description: 'טיפול בחיות מחמד, טיולים, האכלה וניקיון',
    location: 'באר שבע',
    duration: '2-3 שעות',
    frequency: 'פעם בשבוע',
    volunteers: 12,
    needed: 18,
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400',
    category: 'חיות',
  },
  {
    id: '5',
    title: 'עזרה בפרויקטים קהילתיים',
    organization: 'קהילה ירוקה',
    description: 'עזרה בפרויקטים ירוקים, נטיעות וניקיון',
    location: 'אריאל',
    duration: '4-6 שעות',
    frequency: 'פעם בחודש',
    volunteers: 40,
    needed: 50,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
    category: 'סביבה',
  },
  {
    id: '6',
    title: 'ליווי חולים',
    organization: 'בית חולים "שערי צדק"',
    description: 'ליווי חולים לבדיקות, שיחה ועזרה כללית',
    location: 'ירושלים',
    duration: '3-4 שעות',
    frequency: 'פעמיים בשבוע',
    volunteers: 20,
    needed: 25,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    category: 'בריאות',
  },
];

export default function TimeScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  const { selectedUser } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('כל הקטגוריות');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  const [filteredOpportunities, setFilteredOpportunities] = useState(volunteerOpportunities);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('⏰ TimeScreen - Screen focused, refreshing data...');
      // Reset form when returning to screen
      setSelectedTask(null);
      // Force re-render by updating refresh key
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  const categories = ['כל הקטגוריות', 'קשישים', 'חינוך', 'רווחה', 'חיות', 'סביבה', 'בריאות'];
  
  // Filter and sort options for time screen
  const timeFilterOptions = [
    "קשישים",
    "חינוך", 
    "רווחה",
    "חיות",
    "סביבה",
    "בריאות",
    "נוער",
    "קהילה",
    "ספורט",
    "תרבות",
    "מזון",
    "ביגוד"
  ];

  const timeSortOptions = [
    "אלפביתי",
    "לפי מיקום",
    "לפי תחום",
    "לפי משך זמן",
    "לפי תדירות",
    "לפי מספר מתנדבים נדרש",
    "לפי רלוונטיות",
  ];

  const handleVolunteerPress = (opportunity: any) => {
    console.log('Volunteer opportunity pressed:', opportunity.title);
    Alert.alert(
      'הצטרפות להתנדבות',
      `האם תרצה להצטרף להתנדבות "${opportunity.title}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'הצטרף', 
          onPress: () => {
            Alert.alert(
              'הצלחה!',
              'הצטרפת להתנדבות בהצלחה. נציג הארגון יצור איתך קשר בקרוב.',
              [{ text: 'אישור', style: 'default' }]
            );
          }
        }
      ]
    );
  };

  const handleEmergencyLink = async () => {
    console.log('Emergency volunteer link pressed');
    const url = 'https://www.volunteer.gov.il';
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

  // Function to handle search results from HeaderComp
  const handleSearch = (query: string, filters?: string[], sorts?: string[], results?: any[]) => {
    console.log('⏰ TimeScreen - Search received:', { 
      query, 
      filters: filters || [], 
      sorts: sorts || [], 
      resultsCount: results?.length || 0 
    });
    
    // Update state with search results
    setSearchQuery(query);
    setSelectedFilter(filters?.[0] || "");
    setSelectedSort(sorts?.[0] || "");
    
    // If results are provided from SearchBar, use them
    if (results && results.length > 0) {
      setFilteredOpportunities(results);
    } else {
      // Otherwise, perform local filtering
      let filtered = [...volunteerOpportunities];
      
      // Filter by search query
      if (query.trim() !== "") {
        filtered = filtered.filter(opp => 
          opp.title.toLowerCase().includes(query.toLowerCase()) ||
          opp.organization.toLowerCase().includes(query.toLowerCase()) ||
          opp.description.toLowerCase().includes(query.toLowerCase()) ||
          opp.location.toLowerCase().includes(query.toLowerCase()) ||
          opp.category.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      // Filter by category
      if (selectedCategory !== 'כל הקטגוריות') {
        filtered = filtered.filter(opp => opp.category === selectedCategory);
      }
      
      setFilteredOpportunities(filtered);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundPrimary} />
      
      <HeaderComp
        mode={false}
        menuOptions={['הגדרות', 'עזרה', 'צור קשר']}
        onToggleMode={() => console.log('Mode toggled')}
        onSelectMenuItem={(option: string) => console.log('Menu selected:', option)}
        title=""
        placeholder="חפש הזדמנויות התנדבות..."
        filterOptions={timeFilterOptions}
        sortOptions={timeSortOptions}
        searchData={volunteerOpportunities}
        onSearch={handleSearch}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Volunteer Link */}
        <View style={styles.emergencySection}>
          <TouchableOpacity
            style={styles.emergencyCard}
            onPress={handleEmergencyLink}
          >
            <View style={styles.emergencyContent}>
              <Ionicons name="flash" size={32} color={colors.orange} />
              <View style={styles.emergencyText}>
                <Text style={styles.emergencyTitle}>התנדבות דחופה</Text>
                <Text style={styles.emergencyDescription}>
                  מצא הזדמנויות התנדבות דחופות באזור שלך
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color={colors.orange} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories Filter */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>קטגוריות</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.categoryButtonTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Volunteer Opportunities */}
        <View style={styles.opportunitiesSection}>
          <Text style={styles.sectionTitle}>הזדמנויות התנדבות</Text>
          <Text style={styles.sectionDescription}>
            מצא הזדמנויות התנדבות מתאימות לך
          </Text>
          
          <View style={styles.opportunitiesGrid}>
            {filteredOpportunities.map((opportunity) => (
              <TouchableOpacity
                key={opportunity.id}
                style={styles.opportunityCard}
                onPress={() => handleVolunteerPress(opportunity)}
              >
                <Image source={{ uri: opportunity.image }} style={styles.opportunityImage} />
                <View style={styles.opportunityContent}>
                  <View style={styles.opportunityHeader}>
                    <Text style={styles.opportunityTitle}>{opportunity.title}</Text>
                    <View style={styles.opportunityCategory}>
                      <Text style={styles.opportunityCategoryText}>{opportunity.category}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.opportunityOrganization}>{opportunity.organization}</Text>
                  <Text style={styles.opportunityDescription}>{opportunity.description}</Text>
                  
                  <View style={styles.opportunityDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="location" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{opportunity.location}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{opportunity.duration}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                      <Text style={styles.detailText}>{opportunity.frequency}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.volunteersInfo}>
                    <View style={styles.volunteersProgress}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${(opportunity.volunteers / opportunity.needed) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.volunteersText}>
                        {opportunity.volunteers}/{opportunity.needed} מתנדבים
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.joinButton}>
                      <Text style={styles.joinButtonText}>הצטרף</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>סטטיסטיקות התנדבות</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={colors.orange} />
              <Text style={styles.statNumber}>2,847</Text>
              <Text style={styles.statLabel}>מתנדבים פעילים</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={colors.orange} />
              <Text style={styles.statNumber}>15,234</Text>
              <Text style={styles.statLabel}>שעות התנדבות</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="heart" size={24} color={colors.orange} />
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>ארגונים פעילים</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emergencySection: {
    marginTop: 20,
    marginBottom: 20,
  },
  emergencyCard: {
    backgroundColor: colors.warningLight,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.orange,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyText: {
    flex: 1,
    marginLeft: 15,
  },
  emergencyTitle: {
    fontSize: FontSizes.medium,
    fontWeight: 'bold',
    color: colors.orange,
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: FontSizes.heading3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  categoryButtonText: {
    fontSize: FontSizes.body,
    color: colors.textPrimary,
  },
  categoryButtonTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  opportunitiesSection: {
    marginBottom: 30,
  },
  sectionDescription: {
    fontSize: FontSizes.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  opportunitiesGrid: {
    gap: 15,
  },
  opportunityCard: {
    backgroundColor: colors.backgroundPrimary,
    borderRadius: 15,
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  opportunityImage: {
    width: '100%',
    height: 150,
  },
  opportunityContent: {
    padding: 15,
  },
  opportunityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  opportunityTitle: {
    fontSize: FontSizes.body,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  opportunityCategory: {
    backgroundColor: colors.pinkLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  opportunityCategoryText: {
    color: colors.pinkDark,
    fontSize: FontSizes.small,
    fontWeight: '600',
  },
  opportunityOrganization: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  opportunityDescription: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  opportunityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: FontSizes.small,
    color: colors.textTertiary,
    marginLeft: 4,
  },
  volunteersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  volunteersProgress: {
    flex: 1,
    marginRight: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.orange,
    borderRadius: 3,
  },
  volunteersText: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
  },
  joinButton: {
    backgroundColor: colors.orange,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: colors.white,
    fontSize: FontSizes.body,
    fontWeight: '600',
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
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  statNumber: {
    fontSize: FontSizes.heading1,
    fontWeight: 'bold',
    color: colors.orange,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
}); 