import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { FontSizes } from '../globals/constants';
import { charityNames } from '../globals/fakeData';
import { texts } from '../globals/texts';
import colors from '../globals/colors';
import { Ionicons as Icon } from '@expo/vector-icons';
import HeaderComp from '../components/HeaderComp';

export default function MoneyScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  // Debug log for MoneyScreen
  console.log('💰 MoneyScreen - Component rendered');
  console.log('💰 MoneyScreen - Navigation object:', navigation);
  console.log('💰 MoneyScreen - Navigation state:', JSON.stringify(navigation.getState(), null, 2));
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('50');
  const [mode, setMode] = useState(false); // false = seeker (needs help), true = offerer (wants to donate)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedSort, setSelectedSort] = useState("");
  // Mock data for charities
  const dummyCharities = [
    {
      id: 1,
      name: "לב זהב - עמותה לתמיכה בקשישים",
      category: "רווחה",
      location: "תל אביב",
      rating: 4.8,
      donors: 1250,
      description: "תמיכה בקשישים בודדים וסיוע יומיומי",
      image: "👴",
      minDonation: 20,
    },
    {
      id: 2,
      name: "אור לילדים - עמותה לקידום חינוך",
      category: "חינוך",
      location: "ירושלים",
      rating: 4.9,
      donors: 2100,
      description: "קידום חינוך לילדים ממשפחות מעוטות יכולת",
      image: "📚",
      minDonation: 30,
    },
    {
      id: 3,
      name: "חמלה לבעלי חיים - עמותה להצלת חיות",
      category: "בעלי חיים",
      location: "חיפה",
      rating: 4.7,
      donors: 890,
      description: "הצלה וטיפול בבעלי חיים נטושים",
      image: "🐕",
      minDonation: 25,
    },
    {
      id: 4,
      name: "בריאות לכולם - קידום רפואה נגישה",
      category: "בריאות",
      location: "באר שבע",
      rating: 4.6,
      donors: 1560,
      description: "קידום רפואה נגישה לכל האוכלוסיות",
      image: "🏥",
      minDonation: 40,
    },
    {
      id: 5,
      name: "ירוק בעיניים - שמירה על איכות הסביבה",
      category: "סביבה",
      location: "אילת",
      rating: 4.5,
      donors: 720,
      description: "שמירה על איכות הסביבה והטבע",
      image: "🌱",
      minDonation: 15,
    },
    {
      id: 6,
      name: "פעמוני תקווה - תמיכה בנוער בסיכון",
      category: "נוער בסיכון",
      location: "אשדוד",
      rating: 4.8,
      donors: 980,
      description: "תמיכה וטיפול בנוער בסיכון",
      image: "🎭",
      minDonation: 35,
    },
    {
      id: 7,
      name: "שביל האור - ליווי אנשים עם מוגבלויות",
      category: "נכים",
      location: "רמת גן",
      rating: 4.9,
      donors: 1340,
      description: "ליווי ושילוב אנשים עם מוגבלויות",
      image: "♿",
      minDonation: 50,
    },
    {
      id: 8,
      name: "קול התקווה - תמיכה בחולי סרטן",
      category: "חולים",
      location: "פתח תקווה",
      rating: 4.7,
      donors: 2100,
      description: "תמיכה נפשית ופיזית בחולי סרטן",
      image: "💪",
      minDonation: 60,
    },
  ];

  const [filteredCharities, setFilteredCharities] = useState(dummyCharities); // Search results

  // Mock data for recent donations
  const dummyRecentDonations = [
    {
      id: 1,
      charityName: "לב זהב",
      amount: 180,
      date: "15.12.2023",
      status: "הושלמה",
      category: "רווחה",
    },
    {
      id: 2,
      charityName: "אור לילדים",
      amount: 250,
      date: "12.12.2023",
      status: "הושלמה",
      category: "חינוך",
    },
    {
      id: 3,
      charityName: "חמלה לבעלי חיים",
      amount: 120,
      date: "10.12.2023",
      status: "הושלמה",
      category: "בעלי חיים",
    },
    {
      id: 4,
      charityName: "בריאות לכולם",
      amount: 300,
      date: "08.12.2023",
      status: "הושלמה",
      category: "בריאות",
    },
    {
      id: 5,
      charityName: "ירוק בעיניים",
      amount: 80,
      date: "05.12.2023",
      status: "הושלמה",
      category: "סביבה",
    },
  ];

  // Function to filter charities by search and filter
  const getFilteredCharities = () => {
    let filtered = [...dummyCharities];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(charity =>
        charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charity.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedFilter) {
      filtered = filtered.filter(charity => charity.category === selectedFilter);
    }

    // Sorting
    switch (selectedSort) {
      case "אלפביתי":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "לפי מיקום":
        filtered.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case "לפי תחום":
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case "לפי מספר תורמים":
        filtered.sort((a, b) => b.donors - a.donors);
        break;
      case "לפי דירוג":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "לפי רלוונטיות":
        // Default - by rating
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  };

  // Function to filter recent donations
  const getFilteredRecentDonations = () => {
    let filtered = [...dummyRecentDonations];

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(donation =>
        donation.charityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donation.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedFilter) {
      filtered = filtered.filter(donation => donation.category === selectedFilter);
    }

    return filtered;
  };

  // Function to show charity details in search mode
  const showCharityDetailsModal = (charity: any) => {
    Alert.alert(
      charity.name,
      `${charity.description}\n\n📞 צור קשר: 03-1234567\n📧 אימייל: info@${charity.name.replace(/\s+/g, '').toLowerCase()}.org.il\n\nהאם תרצה לתרום לעמותה זו?`,
      [
        {
          text: 'לא עכשיו',
          style: 'cancel',
        },
        {
          text: 'תרום עכשיו',
          onPress: () => showDonationAmountModal(charity),
        },
      ]
    );
  };

  // Function to select donation amount
  const showDonationAmountModal = (charity: any) => {
    Alert.prompt(
      'בחר סכום לתרומה',
      `לתרומה ל: ${charity.name}\n\nהכנס סכום:`,
      [
        {
          text: 'ביטול',
          style: 'cancel',
        },
        {
          text: 'תרום',
          onPress: (amount) => {
            if (amount && !isNaN(Number(amount))) {
              Alert.alert(
                'תרומה בוצעה',
                `תודה על תרומתך בסך ₪${amount} ל-${charity.name}!`
              );
            } else {
              Alert.alert('שגיאה', 'אנא הכנס סכום תקין');
            }
          },
        },
      ],
      'plain-text',
      '50'
    );
  };

 
  const menuOptions = [
    'היסטוריית תרומות',
    'הגדרות תשלום',
    'עזרה',
    'צור קשר'
  ];

  // Specific filter and sort options for money screen
  const moneyFilterOptions = [
    "חינוך",
    "בריאות",
    "רווחה",
    "סביבה",
    "בעלי חיים",
    "נוער בסיכון",
    "קשישים",
    "נכים",
    "חולים",
    "משפחות במצוקה",
    "עולים חדשים",
    "קהילה",
  ];

  const moneySortOptions = [
    "אלפביתי",
    "לפי מיקום",
    "לפי תחום",
    "לפי תאריך הקמה",
    "לפי מספר תורמים",
    "לפי דירוג",
    "לפי רלוונטיות",
  ];

  // Function to handle search results from HeaderComp
  const handleSearch = (query: string, filters?: string[], sorts?: string[], results?: any[]) => {
    console.log('💰 MoneyScreen - Search received:', { 
      query, 
      filters: filters || [], 
      sorts: sorts || [], 
      resultsCount: results?.length || 0 
    });
    
    // Update state with search results
    setSearchQuery(query);
    setSelectedFilter(filters?.[0] || ""); // Only first filter
    setSelectedSort(sorts?.[0] || ""); // Only first sort
    setFilteredCharities(results || dummyCharities);
  };

  const handleDonate = () => {
    if (!selectedRecipient || !amount) {
      Alert.alert('שגיאה', 'אנא בחר נמען וסכום לפני התרומה.');
    } else {
      Alert.alert(
        'תרומה בוצעה',
        `תודה על תרומתך בסך ₪${amount} ל-${selectedRecipient}!`
      );
    }
  };

  const handleToggleMode = useCallback(() => {
    setMode(!mode);
    console.log('Mode toggled:', !mode ? 'נזקק' : 'תורם');
  }, [mode]);

  const handleSelectMenuItem = useCallback((option: string) => {
    console.log('Menu option selected:', option);
    Alert.alert('תפריט', `נבחר: ${option}`);
  }, []);

  const renderCharityCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={localStyles.charityCard}
      onPress={() => {
        if (mode) {
          // Donor mode - select charity for donation
          setSelectedRecipient(item.name);
          Alert.alert('עמותה נבחרה', `נבחרה: ${item.name}`);
        } else {
          // Beneficiary mode - show charity details with donation option
          showCharityDetailsModal(item);
        }
      }}
    >
      <View style={localStyles.charityCardHeader}>
        <Text style={localStyles.charityEmoji}>{item.image}</Text>
        <View style={localStyles.charityRating}>
          <Text style={localStyles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>
      <Text style={localStyles.charityName}>{item.name}</Text>
      <Text style={localStyles.charityDescription}>{item.description}</Text>
      <View style={localStyles.charityDetails}>
        <Text style={localStyles.charityLocation}>📍 {item.location}</Text>
        <Text style={localStyles.charityCategory}>🏷️ {item.category}</Text>
      </View>
      <View style={localStyles.charityStats}>
        <Text style={localStyles.charityDonors}>👥 {item.donors} תורמים</Text>
        <Text style={localStyles.charityMinDonation}>💰 מ-₪{item.minDonation}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentDonationCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={localStyles.recentDonationCard}>
      <View style={localStyles.recentDonationHeader}>
        <Text style={localStyles.recentDonationCharity}>{item.charityName}</Text>
        <Text style={localStyles.recentDonationAmount}>₪{item.amount}</Text>
      </View>
      <View style={localStyles.recentDonationDetails}>
        <Text style={localStyles.recentDonationDate}>📅 {item.date}</Text>
        <Text style={localStyles.recentDonationCategory}>🏷️ {item.category}</Text>
      </View>
      <View style={localStyles.recentDonationStatus}>
        <Text style={localStyles.recentDonationStatusText}>✅ {item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  const FormHeader = () => (
    <View>
      {/* Mode toggle is now handled by HeaderComp */}

      {mode ? (
        <></>
      ) : (
        <View style={localStyles.formContainer}>
          {/* Beneficiary mode - help search message */}
          <View style={localStyles.searchHelpContainer}>
            <Text style={localStyles.searchHelpTitle}>מחפש עזרה כספית?</Text>
            <Text style={localStyles.searchHelpText}>
              השתמש בסרגל החיפוש למעלה כדי למצוא עמותות שיכולות לעזור לך מבחינה כספית
            </Text>
            <View style={localStyles.searchHelpTipsContainer}>
              <Text style={localStyles.searchHelpTipsTitle}>איך למצוא עזרה:</Text>
              <Text style={localStyles.searchHelpTip}>• חפש לפי תחום: חינוך, בריאות, רווחה</Text>
              <Text style={localStyles.searchHelpTip}>• חפש לפי מיקום: עיר, אזור</Text>
              <Text style={localStyles.searchHelpTip}>• חפש לפי סוג עזרה: מזון, ביגוד, טיפול רפואי</Text>
              <Text style={localStyles.searchHelpTip}>• פנה ישירות לעמותה דרך פרטי הקשר</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={localStyles.safeArea}>
      <HeaderComp
        mode={mode}
        menuOptions={menuOptions}
        onToggleMode={handleToggleMode}
        onSelectMenuItem={handleSelectMenuItem}
        title=""
        placeholder={mode ? texts.searchCharitiesForDonation : texts.searchCharitiesForHelp}
        filterOptions={moneyFilterOptions}
        sortOptions={moneySortOptions}
        searchData={dummyCharities}
        onSearch={handleSearch}
      />

      <ScrollView 
        style={localStyles.container} 
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FormHeader />

        {mode ? (
          // Donor mode - show charities for donation and donation history
          <>
            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>
                {searchQuery || selectedFilter ? 'תוצאות חיפוש' : 'עמותות מומלצות לתרומה'}
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={localStyles.charitiesScrollContainer}
              >
                {filteredCharities.map((charity) => (
                  <View key={charity.id} style={localStyles.charityCardWrapper}>
                    {renderCharityCard({ item: charity })}
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={localStyles.section}>
              <Text style={localStyles.sectionTitle}>היסטוריית תרומות שלך</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={localStyles.recentDonationsScrollContainer}
              >
                {getFilteredRecentDonations().map((donation) => (
                  <View key={donation.id} style={localStyles.recentDonationCardWrapper}>
                    {renderRecentDonationCard({ item: donation })}
                  </View>
                ))}
              </ScrollView>
            </View>
          </>
        ) : (
          // Beneficiary mode - show charities that can help
          <View style={localStyles.section}>
            <Text style={localStyles.sectionTitle}>
              {searchQuery || selectedFilter ? 'עמותות שיכולות לעזור' : 'עמותות מומלצות לעזרה'}
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={localStyles.charitiesScrollContainer}
            >
              {getFilteredCharities().map((charity) => (
                <View key={charity.id} style={localStyles.charityCardWrapper}>
                  {renderCharityCard({ item: charity })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.backgroundPrimary,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    scrollContent: {
        paddingBottom: 100, // Bottom margin for screen
    },
    formContainer: {
      backgroundColor: colors.moneyFormBackground,
      padding: 16,
      borderRadius: 15,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.moneyFormBorder,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: FontSizes.medium,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'right',
    },
    input: {
        backgroundColor: colors.moneyInputBackground,
        borderRadius: 10,
        padding: 15,
        fontSize: FontSizes.body,
        textAlign: 'right',
        color: colors.textPrimary,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
    },
    amountContainer: {
        marginBottom: 25,
    },
    suggestedAmountsContainer: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    amountButton: {
        backgroundColor: colors.moneyInputBackground,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
    },
    selectedAmount: {
        backgroundColor: colors.moneyButtonSelected,
        borderColor: colors.moneyButtonSelected,
    },
    amountButtonText: {
        fontSize: FontSizes.body,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    selectedAmountText: {
        color: colors.backgroundPrimary,
    },
    customAmountInput: {
        textAlign: 'center',
    },
    donateButton: {
        backgroundColor: colors.moneyButtonBackground,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    donateButtonText: {
        color: colors.backgroundPrimary,
        fontSize: FontSizes.medium,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: FontSizes.heading2,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'right',
    },
    recommendationCard: {
        backgroundColor: colors.moneyCardBackground,
        borderRadius: 15,
        padding: 15,
        marginRight: 15,
        width: 150,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
    },
    cardImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    cardDescription: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    historyCard: {
        backgroundColor: colors.moneyCardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyContent: {
        flex: 1,
    },
    historyTitle: {
        fontSize: FontSizes.body,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    historyAmount: {
        fontSize: FontSizes.medium,
        fontWeight: 'bold',
        color: colors.moneyHistoryAmount,
        marginBottom: 2,
    },
    historyDate: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    historyStatus: {
        backgroundColor: colors.moneyStatusBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    historyStatusText: {
        fontSize: FontSizes.small,
        color: colors.moneyStatusText,
        fontWeight: '600',
    },
    searchContainer: {
        marginBottom: 20,
    },
    searchInput: {
        marginBottom: 15,
    },
    searchButton: {
        backgroundColor: colors.moneyButtonBackground,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    searchButtonText: {
        color: colors.backgroundPrimary,
        fontSize: FontSizes.medium,
        fontWeight: 'bold',
    },
    recommendationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    historyContainer: {
        paddingVertical: 5,
    },
    searchInfoContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    searchInfoTitle: {
        fontSize: FontSizes.heading3,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'center',
    },
    searchInfoText: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    searchTipsContainer: {
        backgroundColor: colors.moneyInputBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
    },
    searchTipsTitle: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'right',
    },
    searchTip: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        marginBottom: 4,
        textAlign: 'right',
    },
    // Charity Cards Styles
    charitiesScrollContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    charityCardWrapper: {
        marginRight: 12,
        width: 280,
    },
    charityCard: {
        backgroundColor: colors.moneyCardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        minHeight: 200,
    },
    charityCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    charityEmoji: {
        fontSize: FontSizes.displayLarge,
    },
    charityRating: {
        backgroundColor: colors.moneyStatusBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: FontSizes.small,
        color: colors.moneyStatusText,
        fontWeight: 'bold',
    },
    charityName: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 6,
        textAlign: 'right',
    },
    charityDescription: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        marginBottom: 8,
        textAlign: 'right',
        lineHeight: 18,
    },
    charityDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    charityLocation: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    charityCategory: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    charityStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    charityDonors: {
        fontSize: FontSizes.small,
        color: colors.moneyHistoryAmount,
        fontWeight: '600',
    },
    charityMinDonation: {
        fontSize: FontSizes.small,
        color: colors.moneyHistoryAmount,
        fontWeight: '600',
    },
    // Recent Donations Styles
    recentDonationsScrollContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    recentDonationCardWrapper: {
        marginRight: 12,
        width: 200,
    },
    recentDonationCard: {
        backgroundColor: colors.moneyCardBackground,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        minHeight: 120,
    },
    recentDonationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    recentDonationCharity: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'right',
        flex: 1,
    },
    recentDonationAmount: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.moneyHistoryAmount,
    },
    recentDonationDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    recentDonationDate: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    recentDonationCategory: {
        fontSize: FontSizes.small,
        color: colors.textSecondary,
    },
    recentDonationStatus: {
        alignItems: 'flex-end',
    },
    recentDonationStatusText: {
        fontSize: FontSizes.small,
        color: colors.moneyStatusText,
        fontWeight: '600',
    },
    // Search Help Styles
    searchHelpContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    searchHelpTitle: {
        fontSize: FontSizes.heading2,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    searchHelpText: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    searchHelpTipsContainer: {
        backgroundColor: colors.moneyInputBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.moneyFormBorder,
        width: '100%',
    },
    searchHelpTipsTitle: {
        fontSize: FontSizes.body,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 10,
        textAlign: 'right',
    },
    searchHelpTip: {
        fontSize: FontSizes.body,
        color: colors.textSecondary,
        marginBottom: 6,
        textAlign: 'right',
        lineHeight: 20,
    },
});
