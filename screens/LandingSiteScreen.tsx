// LandingSiteScreen.tsx
// Web-only marketing landing page for KarmaCommunity
import React, { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Platform, View, Text, StyleSheet, Image, TouchableOpacity, Linking, Dimensions, ActivityIndicator, ScrollView, Animated } from 'react-native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../utils/loggerService';
import ScrollContainer from '../components/ScrollContainer';
import ScreenWrapper from '../components/ScreenWrapper';
import { EnhancedStatsService } from '../utils/statsService';
import { apiService } from '../utils/apiService';
import { USE_BACKEND } from '../utils/dbConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = SCREEN_WIDTH > 768;
const isMobileWeb = isWeb && SCREEN_WIDTH <= 768;
const showFloatingMenu = isWeb; // Show on all web screens, including mobile

const getSectionElement = (sectionId: string): HTMLElement | null => {
  if (!isWeb || typeof document === 'undefined') {
    return null;
  }
  const domId = sectionId.startsWith('section-') ? sectionId : `section-${sectionId}`;
  return (
    document.getElementById(domId) ??
    (document.querySelector(`[data-nativeid="${domId}"]`) as HTMLElement | null)
  );
};

// Calculate responsive sizes for floating menu based on screen width
const getMenuSizes = () => {
  if (isMobileWeb) {
    // Mobile web - smaller menu
    const menuWidth = SCREEN_WIDTH * 0.12; // 12% of screen width for mobile
    return {
      fontSize: Math.max(9, menuWidth * 0.12), // Smaller font for mobile
      iconSize: Math.max(12, menuWidth * 0.15), // Smaller icons
      titleSize: Math.max(10, menuWidth * 0.13), // Smaller title
      padding: Math.max(6, menuWidth * 0.08), // Smaller padding
    };
  }
  // Desktop/Tablet - original sizes
  const menuWidth = SCREEN_WIDTH * 0.1; // 10% of screen width
  return {
    fontSize: Math.max(10, menuWidth * 0.065), // ~6.5% of menu width, min 10px
    iconSize: Math.max(14, menuWidth * 0.08), // ~8% of menu width, min 14px
    titleSize: Math.max(12, menuWidth * 0.075), // ~7.5% of menu width, min 12px
    padding: Math.max(8, menuWidth * 0.05), // ~5% of menu width, min 8px
  };
};

const Section: React.FC<{ id?: string; title: string; subtitle?: string; children?: React.ReactNode, style?: any }> = ({ id, title, subtitle, children, style }) => (
  <View
    style={[styles.section, style]}
    nativeID={id}
    {...(isWeb && id ? { id } : {})}
  >
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.titleDecorator} />
    {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    {children}
  </View>
);

const Feature: React.FC<{ emoji: string; title: string; text: string }> = ({ emoji, title, text }) => (
  <View style={styles.feature}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

// Floating Navigation Menu Component
const FloatingMenu: React.FC<{ 
  onNavigate: (section: string) => void;
  activeSection: string | null;
}> = ({ onNavigate, activeSection }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const menuSizes = getMenuSizes();

  const menuItems = [
    { id: 'stats', label: 'במספרים', icon: 'stats-chart-outline' },
    { id: 'vision', label: 'החזון', icon: 'bulb-outline' },
    { id: 'problems', label: 'הבעיות', icon: 'alert-circle-outline' },
    { id: 'features', label: 'תכונות', icon: 'apps-outline' },
    { id: 'about', label: 'אודות', icon: 'information-circle-outline' },
    { id: 'how', label: 'איך זה עובד', icon: 'help-circle-outline' },
    { id: 'who', label: 'למי זה מתאים', icon: 'people-outline' },
    { id: 'values', label: 'ערכים', icon: 'heart-outline' },
    { id: 'roadmap', label: 'מפת דרכים', icon: 'map-outline' },
    { id: 'contact', label: 'יצירת קשר', icon: 'mail-outline' },
    { id: 'faq', label: 'שאלות נפוצות', icon: 'chatbubble-ellipses-outline' },
  ];

  if (isMinimized) {
    return (
      <View style={styles.floatingMenuMinimized}>
        <TouchableOpacity 
          onPress={() => setIsMinimized(false)}
          style={styles.menuToggleButton}
        >
          <Ionicons name="menu-outline" size={menuSizes.iconSize * 1.2} color={colors.info} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.floatingMenu}>
      <TouchableOpacity 
        onPress={() => setIsMinimized(true)}
        style={styles.menuHeader}
        activeOpacity={0.7}
      >
        <Text style={[styles.menuTitle, { fontSize: menuSizes.titleSize }]}>תפריט ניווט</Text>
        <Ionicons name="chevron-forward-outline" size={menuSizes.iconSize * 0.9} color={colors.textSecondary} />
      </TouchableOpacity>
      <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              { paddingVertical: menuSizes.padding, paddingHorizontal: menuSizes.padding * 1.5 },
              activeSection === item.id && styles.menuItemActive,
            ]}
            onPress={() => {
              onNavigate(item.id);
              logger.info('FloatingMenu', `Navigate to ${item.id}`);
            }}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={item.icon as any} 
              size={menuSizes.iconSize} 
              color={activeSection === item.id ? colors.info : colors.textSecondary} 
              style={styles.menuItemIcon}
            />
            <Text style={[
              styles.menuItemText,
              { fontSize: menuSizes.fontSize },
              activeSection === item.id && styles.menuItemTextActive,
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

type LazySectionProps = {
  section: React.ComponentType<any>;
  [key: string]: any;
};

const LazySection: React.FC<LazySectionProps> = ({ section: SectionComponent, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '0px 0px 100px 0px', // Start loading when the section is 100px away from the viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <View ref={ref} style={{minHeight: 200}}>
      {isVisible ? (
        <Suspense fallback={<ActivityIndicator size="large" color={colors.info} style={{marginVertical: 50}} />}>
          <SectionComponent {...props} />
        </Suspense>
      ) : <ActivityIndicator size="large" color={colors.info} style={{marginVertical: 50}} />}
    </View>
  );
};


const HeroSection = () => {
  const heroAnimation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(heroAnimation, {
      toValue: 1,
      duration: 800,
      delay: 200,
      useNativeDriver: !isWeb,
    }).start();
  }, [heroAnimation]);

  return (
      <View style={styles.hero}>
        <View style={styles.heroGradient}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <Animated.View style={[
            styles.heroContent,
            {
              opacity: heroAnimation,
              transform: [{
                translateY: heroAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}>
            <Text style={styles.welcomeTitle}>המקום בו טוב קורה</Text>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.title}>Karma Community</Text>
            <Text style={styles.subtitle}>רשת חברתית שמחברת בין אנשים שצריכים עזרה, לאנשים שרוצים לעזור. פשוט, שקוף ומהלב.</Text>
            <View style={styles.ctaRow}>
            <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#25D366' }]} onPress={() => { logger.info('LandingSite', 'Click - whatsapp direct'); Linking.openURL('https://wa.me/972528616878'); }}>
          <Ionicons name="logo-whatsapp" color="#fff" size={isMobileWeb ? 14 : 18} /><Text style={styles.contactButtonText}>שלחו לי ווטסאפ </Text>
        </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
  );
}

const VisionSection = () => (
    <Section id="section-vision" title="החזון שלנו" subtitle="אנחנו בתהליך הקמה" style={styles.sectionAltBackground}>
      <Text style={styles.paragraph}>
        <Text style={styles.emphasis}>כרגע אנחנו בתהליך הקמה.</Text> כל מה שרשום בהמשך הוא חלק מהחזון שאנחנו רוצים לבנות, וכרגע אנחנו מזמינים אתכם לעזור לבנות את זה.
      </Text>
      <Text style={styles.paragraph}>
        אנחנו מזמינים אתכם להצטרף אלינו לשנות את העולם וליצור שינוי חברתי אמיתי. להיות חלק ממשהו גדול, מוסרי ברמה הכי גבוהה, טכנולוגי, חברתי ועוד מלא דברים טובים.
      </Text>
      <View style={styles.mottoContainer}>
        <View style={styles.mottoCard}>
          <Ionicons name="swap-horizontal-outline" size={isMobileWeb ? 24 : 32} color={colors.info} style={styles.mottoIcon} />
          <Text style={styles.mottoText}>"לתת זה גם לקבל"</Text>
        </View>
        <View style={styles.mottoCard}>
          <Ionicons name="gift-outline" size={isMobileWeb ? 24 : 32} color={colors.pink} style={styles.mottoIcon} />
          <Text style={styles.mottoText}>"לכל אחד יש משהו שהוא צריך ומשהו שהוא ישמח לתת"</Text>
        </View>
      </View>
      <Text style={styles.paragraph}>
        KarmaCommunity היא יותר מרשת חברתית - היא תנועה שמחברת בין אנשים שרוצים לעשות טוב, ללא אינטרסים מסחריים, ללא פרסומות, רק אנושיות וקהילתיות אמיתית.
      </Text>
      <View style={styles.visionHighlights}>
        <View style={styles.visionHighlight}>
          <Ionicons name="heart" size={isMobileWeb ? 20 : 28} color={colors.pink} />
          <Text style={styles.visionHighlightText}>מוסרי ברמה הגבוהה ביותר</Text>
        </View>
        <View style={styles.visionHighlight}>
          <Ionicons name="code-working" size={isMobileWeb ? 20 : 28} color={colors.info} />
          <Text style={styles.visionHighlightText}>טכנולוגי וחדשני</Text>
        </View>
        <View style={styles.visionHighlight}>
          <Ionicons name="people" size={isMobileWeb ? 20 : 28} color={colors.accent} />
          <Text style={styles.visionHighlightText}>חברתי ומחבר</Text>
        </View>
        <View style={styles.visionHighlight}>
          <Ionicons name="globe" size={isMobileWeb ? 20 : 28} color={colors.success} />
          <Text style={styles.visionHighlightText}>שינוי עולמי אמיתי</Text>
        </View>
      </View>
    </Section>
);

const StatsSection: React.FC<{ stats: LandingStats; isLoadingStats: boolean }> = ({stats, isLoadingStats}) => (
    <Section id="section-stats" title="הכוח של הקהילה שלנו" subtitle="השפעה אמיתית, במספרים">
      {isLoadingStats ? (
        <View style={styles.statsLoadingContainer}>
          <ActivityIndicator size="large" color={colors.info} />
          <Text style={styles.statsLoadingText}>טוען נתונים...</Text>
        </View>
      ) : (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="eye-outline" size={isMobileWeb ? 24 : 32} color={colors.info} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.siteVisits.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>ביקורים באתר</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={isMobileWeb ? 24 : 32} color={colors.success} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.totalMoneyDonated.toLocaleString('he-IL')} ₪</Text>
            <Text style={styles.statLabel}>ש"ח שנתרמו ישירות</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={isMobileWeb ? 24 : 32} color={colors.pink} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>חברי קהילה רשומים</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={isMobileWeb ? 24 : 32} color={colors.orange} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.itemDonations.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>פריטים שפורסמו</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="car-outline" size={isMobileWeb ? 24 : 32} color={colors.accent} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.completedRides.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>נסיעות קהילתיות</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="repeat-outline" size={isMobileWeb ? 24 : 32} color={colors.success} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.recurringDonationsAmount.toLocaleString('he-IL')} ₪</Text>
            <Text style={styles.statLabel}>תרומות קבועות פעילות</Text>
          </View>
        </View>
      )}
    </Section>
);

const ProblemsSection = () => (
    <Section id="section-problems" title="הבעיות שאנחנו באים לפתור" subtitle="למה צריך בכלל את KC?">
      <View style={styles.problemsContent}>
        <View style={styles.problemCard}>
          <Ionicons name="copy-outline" size={isMobileWeb ? 24 : 32} color={colors.orange} style={styles.problemIcon} />
          <Text style={styles.problemTitle}>כפילות, פיזור וחוסר אמינות</Text>
          <Text style={styles.problemText}>
            היום יש כל כך הרבה פלטפורמות, קבוצות וואטסאפ, ועמותות שמנסות לעזור. כל אחד עובד לבד, יש כפילויות, חוסר תיאום, וקשה לדעת למי אפשר לסמוך. 
            Karma Community מאחדת את כל זה למקום אחד, שקוף ואמין.
          </Text>
        </View>
        
        <View style={styles.problemCard}>
          <Ionicons name="people-circle-outline" size={isMobileWeb ? 24 : 32} color={colors.info} style={styles.problemIcon} />
          <Text style={styles.problemTitle}>הדיסוננס בין קהילה לחופשיות</Text>
          <Text style={styles.problemText}>
            כבר שנים שיש לאדם את הדיסוננס בין הרצון לקהילה והרצון לחופשיות. הרי כל קהילה עם הגבלות ומוסכמות משלה.
            {'\n\n'}
            Karma Community באה להציע פלטפורמה, מין רשת חברתית, אשר מצד אחד שמה דגש על ביחד ומצד שני דגש על חופש וליברליות.
          </Text>
        </View>
        
        <View style={styles.problemCard}>
          <Ionicons name="ban-outline" size={isMobileWeb ? 24 : 32} color={colors.pink} style={styles.problemIcon} />
          <Text style={styles.problemTitle}>רשתות חברתיות מונעות מאינטרסים</Text>
          <Text style={styles.problemText}>
            דווקא בעידן של רשתות חברתיות המונעות מאינטרסים של כסף ופרסומות, אנחנו רואים את הפוטנציאל והצורך האמיתי שיש לנו כבני אדם ב"רשתות" האלה.
            {'\n\n'}
            Karma Community באה להציע רשת חברתית ללא פרסומות וללא תוכן חומרי/פוגעני. פלטפורמה המקדשת קהילתיות ושיתוף.
          </Text>
        </View>
      </View>
    </Section>
);

const FeaturesSection = () => (
    <Section id="section-features" title="כל מה שצריך כדי לעשות טוב" subtitle="כלים פשוטים שהופכים עזרה הדדית לחלק מהיום-יום" style={styles.sectionAltBackground}>
      <View style={styles.featuresGrid}>
        <Feature emoji="🤝" title="צריכים עזרה? רוצים לעזור?" text="פרסמו בקלות בקשה או הצעה, וקבלו מענה מהקהילה סביבכם. משיעורי עזר ועד תיקונים קטנים בבית." />
        <Feature emoji="💬" title="התחברו לאנשים כמוכם" text="מצאו קבוצות עניין, הצטרפו לדיונים, וצרו קשרים חדשים עם אנשים שאכפת להם." />
        <Feature emoji="📍" title="גלו הזדמנויות סביבכם" text="המפה החכמה שלנו תראה לכם איפה צריכים אתכם, ממש ליד הבית." />
        <Feature emoji="🔒" title="פלטפורמה בטוחה ושקופה" text="בלי פרסומות, בלי תוכן פוגעני, רק קהילתיות אמיתית ואמון הדדי." />
      </View>
    </Section>
);

const HowItWorksSection = () => (
    <Section id="section-how" title="איך זה עובד?" subtitle="תהליך פשוט וברור שמחבר בין אנשים">
      <Text style={styles.paragraph}>
        KarmaCommunity בנויה על עקרון פשוט: כל אחד יכול לתת וכל אחד יכול לקבל. התהליך שלנו נועד להיות פשוט, שקוף וידידותי.
      </Text>
      <View style={styles.stepsRow}>
        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Ionicons name="person-add-outline" size={isMobileWeb ? 24 : 32} color={colors.info} style={styles.stepIcon} />
          <Text style={styles.stepTitle}>הצטרפו לקהילה</Text>
          <Text style={styles.stepText}>
            הירשמו בכמה שניות - רק פרטים בסיסיים. ספרו לנו מה מעניין אתכם, איפה אתם, ומה אתם יכולים להציע או מה אתם צריכים. אין צורך במידע מיותר, רק מה שחשוב.
          </Text>
        </View>
        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Ionicons name="create-outline" size={isMobileWeb ? 24 : 32} color={colors.accent} style={styles.stepIcon} />
          <Text style={styles.stepTitle}>פרסמו או חפשו</Text>
          <Text style={styles.stepText}>
            צריכים עזרה? פרסמו בקשה ברורה עם מה אתם צריכים, מתי ואיפה. רוצים לעזור? פרסמו הצעה עם מה אתם יכולים לתת. או פשוט דפדפו בפיד וראו מה קורה סביבכם.
          </Text>
        </View>
        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Ionicons name="search-outline" size={isMobileWeb ? 24 : 32} color={colors.orange} style={styles.stepIcon} />
          <Text style={styles.stepTitle}>גלו הזדמנויות</Text>
          <Text style={styles.stepText}>
            המפה החכמה שלנו תראה לכם איפה צריכים אתכם, ממש ליד הבית. הפיד האישי שלכם יציג לכם בקשות והצעות רלוונטיות לפי המיקום והעניין שלכם.
          </Text>
        </View>
        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumber}>4</Text>
          </View>
          <Ionicons name="chatbubble-ellipses-outline" size={isMobileWeb ? 24 : 32} color={colors.pink} style={styles.stepIcon} />
          <Text style={styles.stepTitle}>צרו קשר</Text>
          <Text style={styles.stepText}>
            ראיתם משהו שמעניין אתכם? שלחו הודעה ישירה, תאמו פרטים, הכירו את האדם שמאחורי הבקשה או ההצעה. הכל שקוף, בטוח ופשוט.
          </Text>
        </View>
        <View style={styles.stepCard}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumber}>5</Text>
          </View>
          <Ionicons name="heart-outline" size={isMobileWeb ? 24 : 32} color={colors.success} style={styles.stepIcon} />
          <Text style={styles.stepTitle}>עשו טוב והרגישו את ההבדל</Text>
          <Text style={styles.stepText}>
            תאמו, פגשו, עזרו או קבלו עזרה. כל פעולה כזו יוצרת קשר אנושי אמיתי ומחזקת את הקהילה. אתם תראו את ההשפעה שלכם, והקהילה תראה את התרומה שלכם.
          </Text>
        </View>
      </View>
      <View style={styles.howItWorksNote}>
        <Ionicons name="information-circle-outline" size={isMobileWeb ? 18 : 24} color={colors.info} />
        <Text style={styles.howItWorksNoteText}>
          הכל בחינם, הכל שקוף, הכל למען הקהילה. אין בירוקרטיה, אין עמלות, רק אנשים שעוזרים לאנשים.
        </Text>
      </View>
    </Section>
);

const WhoIsItForSection = () => (
    <Section id="section-who" title="למי זה מתאים?" subtitle="לכולם. באמת." style={styles.sectionAltBackground}>
      <Text style={styles.paragraph}>
        <Text style={styles.emphasis}>KarmaCommunity מיועדת לכולם.</Text> עשירים ועניים, מרכז ופריפריה, לא משנה דת, גזע, מין, לאום ואפילו לא מיקום פיזי. כל אחד יכול לתת וכל אחד יכול לקבל.
      </Text>
      <View style={styles.whoContent}>
        <View style={styles.whoMainCard}>
          <Ionicons name="people-outline" size={isMobileWeb ? 32 : 48} color={colors.info} style={styles.whoMainIcon} />
          <Text style={styles.splitTitle}>לאנשים פרטיים</Text>
          <Text style={styles.paragraph}>
            בשלבים הראשונים, KarmaCommunity מתמקדת באנשים פרטיים - שכנים, חברים, וכל מי שרוצה לתת מהזמן, הידע או החפצים שלו כדי לעזור לאחרים.
          </Text>
          <View style={styles.iconBullets}>
            <View style={styles.iconBulletRow}><Ionicons name="gift-outline" size={isMobileWeb ? 14 : 18} color={colors.pink} /><Text style={styles.iconBulletText}>שיתוף חפצים, מזון וציוד</Text></View>
            <View style={styles.iconBulletRow}><Ionicons name="time-outline" size={isMobileWeb ? 14 : 18} color={colors.orange} /><Text style={styles.iconBulletText}>התנדבות וסיוע נקודתי</Text></View>
            <View style={styles.iconBulletRow}><Ionicons name="school-outline" size={isMobileWeb ? 14 : 18} color={colors.info} /><Text style={styles.iconBulletText}>שיתוף ידע ושיעורי עזר</Text></View>
            <View style={styles.iconBulletRow}><Ionicons name="heart-outline" size={isMobileWeb ? 14 : 18} color={colors.pink} /><Text style={styles.iconBulletText}>יצירת קשרים אנושיים אמיתיים</Text></View>
          </View>
        </View>
        
        <View style={styles.whoFutureCard}>
          <Ionicons name="business-outline" size={isMobileWeb ? 24 : 32} color={colors.textSecondary} style={styles.whoFutureIcon} />
          <Text style={styles.whoFutureTitle}>עמותות וארגונים - בהמשך</Text>
          <Text style={styles.whoFutureText}>
            בשלבים הבאים נחבר גם עמותות וארגונים עם כלים ייעודיים לניהול מתנדבים, תרומות ופניות. דגש חשוב - זה יקרה רק אחרי שנבסס קהילה חזקה של אנשים פרטיים.
          </Text>
        </View>
      </View>
    </Section>
);

const ValuesSection = () => {
  const valuePills = [
    'שקיפות מלאה',
    'אמון ובטיחות',
    'קהילתיות פעילה',
    'אחריות משותפת',
    'גישה מכל מקום',
    'מדידה ולמידה',
  ];
  const commitments = [
    { icon: 'shield-checkmark-outline', text: 'אימות משתמשים וארגונים לפני עלייה לאוויר', color: colors.success },
    { icon: 'sparkles-outline', text: 'חוויית שימוש נוחה ונקייה מהסחות דעת', color: colors.pink },
    { icon: 'leaf-outline', text: 'התפתחות ברת קיימא – בלי פרסומות ובלי דאטה מיותר', color: colors.accent },
  ];

  return (
    <Section id="section-values" title="הערכים שמנחים אותנו" subtitle="מה הופך את Karma Community לקהילה בטוחה ואמינה" style={styles.sectionAltBackground}>
      <Text style={styles.paragraph}>
        אנו מובילים שינוי באמצעות מערכת שמעמידה את האדם במרכז. כל פיצ׳ר נבחן לפי תרומתו לשקיפות, לחיבורים אנושיים וליכולת למדוד השפעה אמיתית.
      </Text>
      <View style={styles.valuesRow}>
        {valuePills.map((value) => (
          <View key={value} style={styles.valuePill}>
            <Text style={styles.valuePillText}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.trustList}>
        {commitments.map((item) => (
          <View key={item.text} style={styles.trustRow}>
            <Ionicons name={item.icon as any} size={isMobileWeb ? 14 : 18} color={item.color} />
            <Text style={styles.trustText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
};

const RoadmapSection = () => {
  const roadmapSteps = [
    { time: 'Q4 2024', label: 'בטא סגורה לעמותות וארגונים מקומיים' },
    { time: 'Q1 2025', label: 'פתיחת חיבורי קהילה בכל הארץ' },
    { time: 'Q2 2025', label: 'דשבורד מתקדם לניהול מתנדבים ותרומות' },
    { time: 'Q3 2025', label: 'שיתופי פעולה עם עיריות וגורמי רווחה' },
  ];

  return (
    <Section id="section-roadmap" title="מפת הדרכים שלנו" subtitle="התוכנית להרחבת האימפקט של הקהילה">
      <View style={styles.roadmap}>
        {roadmapSteps.map((step) => (
          <View key={step.label} style={styles.roadItem}>
            <Text style={styles.roadTime}>{step.time}</Text>
            <Text style={styles.roadLabel}>{step.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.brandStrip}>
        <Ionicons name="rocket-outline" size={isMobileWeb ? 18 : 24} color={colors.info} />
        <Text style={styles.trustText}>מתקדמים יחד עם הקהילה – כל פידבק משפיע על סדר העדיפויות שלנו.</Text>
      </View>
    </Section>
  );
};

const AboutSection = () => (
    <Section id="section-about" title="קהילה אחת. מטרה אחת." subtitle="הסיפור של קהילת קארמה">
      <Text style={styles.paragraph}>
        בעולם מלא ברעש, אנחנו מאמינים בכוח השקט של עשיית הטוב. קהילת קארמה נולדה מתוך צורך פשוט: לחבר בין אנשים. בין אלה שצריכים עזרה, לבין אלה שיכולים ורוצים להושיט יד. ראינו את הכפילויות, את חוסר האמון ואת המאמצים המפוזרים, והחלטנו ליצור פלטפורמה אחת שמאחדת את כולם.
      </Text>
      <Text style={styles.paragraph}>
        בלי פרסומות, בלי אינטרסים, רק טכנולוגיה בשירות האנושיות. המשימה שלנו היא להפוך את הנתינה לחלק טבעי ופשוט מהיום-יום של כולנו, וליצור חברה ישראלית מחוברת, תומכת ואכפתית יותר.
      </Text>
      <Text style={[styles.sectionSubTitle, {marginTop: 30}]}>מילה מהמייסד, נוה סרוסי</Text>
      <Text style={styles.paragraph}>
        מגיל צעיר הרגשתי פריבילגיה ושהחיים שלי מסודרים. דווקא בצבא, למרות שהגעתי לתפקיד טוב בתור מתכנת מטוסים, לא הרגשתי את המשמעות שחיפשתי. כל הזמן חשבתי איך אני יכול להביא שינוי אמיתי וטוב לעולם. תמיד עניין אותי לעבוד בסקיילים גדולים ולהשפיע לטובה על כמה שיותר אנשים.
      </Text>
      <Text style={styles.paragraph}>
        קהילת קארמה היא הדרך שלי להפוך את הטוב לנגיש יותר, ליצור פלטפורמה שמחברת בין אנשים שרוצים לעזור לאנשים שצריכים עזרה. אני מאמין בכוח של קהילה לשנות מציאות, ואשמח שתצטרפו אליי למסע הזה.
      </Text>
      <View style={styles.githubLinkContainer}>
        <TouchableOpacity 
          style={styles.githubLinkButton}
          onPress={() => { logger.info('LandingSite', 'Click - github org'); Linking.openURL('https://github.com/KarmaCummunity'); }}
        >
          <Ionicons name="logo-github" size={isMobileWeb ? 18 : 24} color={colors.textPrimary} />
          <View style={styles.githubLinkTextContainer}>
            <Text style={styles.githubLinkTitle}>גיטהאב - הקוד הפתוח</Text>
            <Text style={styles.githubLinkDescription}>זה הקוד של האפליקציה. כולם מוזמנים להסתכל ולעזור</Text>
          </View>
          <Ionicons name="arrow-forward-outline" size={isMobileWeb ? 16 : 20} color={colors.info} />
        </TouchableOpacity>
      </View>
    </Section>
);

const TestimonialsSection = () => (
    <Section title="מה הקהילה שלנו מספרת" subtitle="סיפורים אמיתיים מהשטח" style={styles.sectionAltBackground}>
      <View style={styles.testimonials}>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>"מצאתי מתנדב שתיקן לי את הדלת תוך יום! מדהים שיש קהילה שעוזרת כל כך מהר."</Text>
          <Text style={styles.testimonialUser}>— דנה, תל אביב</Text>
        </View>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>"תרמנו רהיטים דרך האפליקציה למשפחה מהעיר שלנו. הכל היה פשוט ושקוף."</Text>
          <Text style={styles.testimonialUser}>— עידו, חיפה</Text>
        </View>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>"כארגון קטן, קיבלנו חשיפה אדירה למתנדבים איכותיים. הדשבורד חסך לנו שעות."</Text>
          <Text style={styles.testimonialUser}>— עמותת יד ללב</Text>
        </View>
      </View>
    </Section>
);

const GallerySection = () => (
    <Section title="רגעים מהקהילה" subtitle="תמונות ששוות אלף מילים (תמונות להמחשה בלבד)">
      <View style={styles.galleryGrid}>
        <Image source={require('../assets/images/android-chrome-512x512.png')} style={styles.galleryImage} />
        <Image source={require('../assets/images/apple-touch-icon.png')} style={styles.galleryImage} />
        <Image source={require('../assets/images/logo.png')} style={styles.galleryImage} />
      </View>
    </Section>
);

const PartnersSection = () => (
    <Section title="ביחד יוצרים שינוי" subtitle="גאים לשתף פעולה עם ארגונים שחולקים את החזון שלנו" style={styles.sectionAltBackground}>
      <View style={styles.partnersRow}>
        <Image source={require('../assets/images/Jgive_Logo.png')} style={styles.partnerLogo} />
        {/* Add more partner logos here */}
      </View>
    </Section>
);

const FAQSection = () => (
    <Section id="section-faq" title="שאלות ותשובות">
      <View style={styles.faqItem}>
        <Text style={styles.faqQ}>האם השימוש באפליקציה עולה כסף?</Text>
        <Text style={styles.faqA}>לא. קהילת קארמה היא מיזם ללא מטרות רווח, והשימוש בה יהיה תמיד בחינם, לכולם.</Text>
      </View>
      <View style={styles.faqItem}>
        <Text style={styles.faqQ}>איך אפשר לתרום או להתנדב?</Text>
        <Text style={styles.faqA}>הדרך הטובה ביותר היא להוריד את האפליקציה, להצטרף לקהילה ולהתחיל להגיב לבקשות שעולות. בנוסף, תמיד אפשר ליצור איתנו קשר ישירות.</Text>
      </View>
      <View style={styles.faqItem}>
        <Text style={styles.faqQ}>האם האפליקציה זמינה גם לאנדרואיד וגם ל-iOS?</Text>
        <Text style={styles.faqA}>בהחלט. האפליקציה זמינה להורדה בחנויות של אפל וגוגל, וקיימת גם גרסת Web מלאה.</Text>
      </View>
       <View style={styles.faqItem}>
        <Text style={styles.faqQ}>האם יש פרסומות?</Text>
        <Text style={styles.faqA}>ממש לא. הפלטפורמה נקייה לחלוטין מפרסומות ומקדשת תוכן קהילתי בלבד.</Text>
      </View>
    </Section>
);

const ContactSection = () => (
    <Section id="section-contact" title="דברו איתנו" subtitle="נשמח לשמוע מכם, לקבל פידבק או לחבר אתכם לקהילה" style={styles.sectionAltBackground}>
      <View style={styles.contactRow}>
        <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#25D366' }]} onPress={() => { logger.info('LandingSite', 'Click - whatsapp direct'); Linking.openURL('https://wa.me/972528616878'); }}>
          <Ionicons name="logo-whatsapp" color="#fff" size={isMobileWeb ? 14 : 18} /><Text style={styles.contactButtonText}>שלחו לי ווטסאפ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.info }]} onPress={() => { logger.info('LandingSite', 'Click - email'); Linking.openURL('mailto:navesarussi@gmail.com'); }}>
          <Ionicons name="mail-outline" color="#fff" size={isMobileWeb ? 14 : 18} /><Text style={styles.contactButtonText}>שלחו לי מייל</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#E4405F' }]} onPress={() => { logger.info('LandingSite', 'Click - instagram'); Linking.openURL('https://www.instagram.com/karma_community_/'); }}>
          <Ionicons name="logo-instagram" color="#fff" size={isMobileWeb ? 14 : 18} /><Text style={styles.contactButtonText}>עקבו באינסטגרם</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#128C7E' }]} onPress={() => { logger.info('LandingSite', 'Click - whatsapp group'); Linking.openURL('https://chat.whatsapp.com/Hi2TpFcO5huKVKarvecz00'); }}>
          <Ionicons name="chatbubbles-outline" color="#fff" size={isMobileWeb ? 14 : 18} /><Text style={styles.contactButtonText}>הצטרפו לקבוצת ווטסאפ</Text>
        </TouchableOpacity>
      </View>
    </Section>
);

const FinalCTASection = () => (
    <Section title="הצטרפו לקהילה שעושה טוב" subtitle="כל אחד יכול להשפיע. בואו נבנה את זה יחד." style={styles.sectionAltBackground}>
      <View style={styles.ctaRow}>
        <TouchableOpacity 
          style={styles.secondaryCta} 
          onPress={() => { logger.info('LandingSite', 'CTA click - contact email'); Linking.openURL('mailto:navesarussi1@gmail.com'); }}
          activeOpacity={0.8}
        >
          <Ionicons name="mail-outline" size={isMobileWeb ? 16 : 22} color={colors.info} style={styles.ctaIcon} />
          <Text style={styles.secondaryCtaText}>צרו קשר</Text>
        </TouchableOpacity>
      </View>
    </Section>
);

interface LandingStats {
  siteVisits: number;
  totalMoneyDonated: number;
  totalUsers: number;
  itemDonations: number;
  completedRides: number;
  recurringDonationsAmount: number;
}

const LandingSiteScreen: React.FC = () => {
  console.log('LandingSiteScreen - Component rendered');
  
  const [stats, setStats] = useState<LandingStats>({
    siteVisits: 0,
    totalMoneyDonated: 0,
    totalUsers: 0,
    itemDonations: 0,
    completedRides: 0,
    recurringDonationsAmount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const scrollSpyObserverRef = useRef<IntersectionObserver | null>(null);
  const observedElementsRef = useRef<Set<HTMLElement>>(new Set());
  
  // Handle navigation from floating menu
  const handleNavigate = (sectionId: string) => {
    logger.info('LandingSiteScreen', `Navigate to section: ${sectionId}`, {
      isWeb,
      hasScrollRef: !!scrollViewRef.current,
      platform: Platform.OS,
    });
    
    // For web, use DOM scrolling
    if (isWeb) {
      try {
        const element = getSectionElement(sectionId);
        logger.info('LandingSiteScreen', `Found element for ${sectionId}:`, {
          found: !!element,
          elementId: element?.id || element?.getAttribute?.('data-nativeid') || null,
        });
        
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
          });
          setActiveSection(sectionId);
          logger.info('LandingSiteScreen', `Scrolled to section: ${sectionId}`);
        } else if (sectionId === 'top') {
          // Scroll to top if no specific section
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setActiveSection(sectionId);
          logger.info('LandingSiteScreen', 'Scrolled to top via window.scrollTo');
        } else {
          logger.warn('LandingSiteScreen', `Section not found: ${sectionId}`);
        }
      } catch (error) {
        logger.error('LandingSiteScreen', 'Error scrolling to section', { error, sectionId });
      }
    } else {
      // For native, use ScrollView ref
      if (sectionId === 'top' && scrollViewRef.current) {
        scrollViewRef.current.scrollTo?.({ y: 0, animated: true });
        logger.info('LandingSiteScreen', 'Scrolled to top via ScrollView ref');
      } else {
        logger.warn('LandingSiteScreen', 'Native scrolling not implemented for sections');
      }
    }
  };
  
  useEffect(() => {
    logger.info('LandingSite', 'useEffect triggered - Landing page mounted', { isWeb, USE_BACKEND });
    
    // Use sessionStorage to prevent double tracking across all instances
    // שימוש ב-sessionStorage למניעת ספירה כפולה בכל ה-instances
    const VISIT_TRACKED_KEY = 'kc_site_visit_tracked';
    
    // Load community statistics from backend
    // שינוי: טעינת סטטיסטיקות מהשרת עם תמיכה בערכים מקוננים (nested value objects)
    // Change: Loading stats from backend with support for nested value objects
    const loadStats = async (forceRefresh = false) => {
      try {
        setIsLoadingStats(true);
        logger.info('LandingSite', 'Loading stats', { forceRefresh });
        const communityStats = await EnhancedStatsService.getCommunityStats({}, forceRefresh);
        
        // Extract values - handle both direct values and nested value objects
        // תמיכה בשני פורמטים: מספר ישיר או אובייקט עם שדה value
        // Support for two formats: direct number or object with value field
        const getValue = (stat: any): number => {
          if (typeof stat === 'number') return stat;
          if (stat && typeof stat === 'object' && 'value' in stat) return stat.value || 0;
          return 0;
        };
        
        const statsData = {
          siteVisits: getValue(communityStats.siteVisits) || 0,
          totalMoneyDonated: getValue(communityStats.totalMoneyDonated) || 0,
          totalUsers: getValue(communityStats.totalUsers) || 0,
          itemDonations: getValue(communityStats.itemDonations) || 0,
          completedRides: getValue(communityStats.completedRides) || 0,
          recurringDonationsAmount: getValue(communityStats.recurringDonationsAmount) || 0,
        };
        
        logger.info('LandingSite', 'Stats loaded', statsData);
        setStats(statsData);
      } catch (error) {
        logger.error('LandingSite', 'Failed to load stats', { error });
        // Keep default values (0) on error
      } finally {
        setIsLoadingStats(false);
      }
    };

    // Track site visit - only on web and if backend is available
    // ספירת ביקור באתר - רק ב-web ואם השרת זמין
    // שינוי: שימוש ב-sessionStorage למניעת כפילות בכל ה-instances
    // Change: Use sessionStorage to prevent double tracking across all instances
    const trackVisitAndLoadStats = async () => {
      // Check if visit already tracked in this session (shared across all component instances)
      // בדיקה אם הביקור כבר נספר ב-session זה (משותף לכל ה-instances של הקומפוננטה)
      const visitTracked = isWeb && typeof window !== 'undefined' 
        ? sessionStorage.getItem(VISIT_TRACKED_KEY) === 'true'
        : false;

      if (visitTracked) {
        logger.info('LandingSite', 'Visit already tracked in this session, skipping');
        await loadStats(false);
        return;
      }

      if (isWeb && USE_BACKEND) {
        try {
          // Mark as tracked immediately in sessionStorage to prevent double calls
          // סימון כנספר מיד ב-sessionStorage כדי למנוע קריאות כפולות
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(VISIT_TRACKED_KEY, 'true');
          }
          
          logger.info('LandingSite', 'Tracking site visit...');
          const response = await apiService.trackSiteVisit();
          if (response.success) {
            logger.info('LandingSite', 'Site visit tracked successfully');
            // Reload stats with forceRefresh to get updated site_visits count
            // טעינה מחדש של סטטיסטיקות עם forceRefresh כדי לקבל את מספר הביקורים המעודכן
            await loadStats(true);
          } else {
            logger.warn('LandingSite', 'Site visit tracking failed', response.error);
            // Reset flag on failure so we can retry
            // איפוס הדגל בכשל כדי שנוכל לנסות שוב
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem(VISIT_TRACKED_KEY);
            }
            // Still load stats even if tracking failed
            await loadStats(false);
          }
        } catch (error) {
          logger.error('LandingSite', 'Failed to track site visit', { error });
          // Reset flag on error so we can retry
          // איפוס הדגל בשגיאה כדי שנוכל לנסות שוב
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem(VISIT_TRACKED_KEY);
          }
          // Still load stats even if tracking failed
          await loadStats(false);
        }
      } else {
        // If not web or backend not available, just load stats
        logger.info('LandingSite', 'Skipping site visit tracking', { isWeb, USE_BACKEND });
        await loadStats(false);
      }
    };
    
    trackVisitAndLoadStats();
    
    return () => {
      logger.info('LandingSite', 'Landing page unmounted');
    };
  }, []);

  // Scroll Spy - Track which section is currently in view
  useEffect(() => {
    if (!isWeb) return; // Works on all web screens including mobile

    const sectionIds = ['stats', 'vision', 'problems', 'features', 'about', 'how', 'who', 'values', 'roadmap', 'contact', 'faq'];
    
    // Create Intersection Observer
    const observerOptions = {
      root: null, // viewport
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in middle third of viewport
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const targetElement = entry.target as HTMLElement;
          const identifier = targetElement.id || targetElement.getAttribute('data-nativeid') || '';
          const sectionId = identifier.replace('section-', '');
          if (!sectionId) {
            return;
          }
          logger.info('ScrollSpy', `Section ${sectionId} is now in view`);
          setActiveSection(sectionId);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const observedElements = observedElementsRef.current;
    observedElements.clear();
    scrollSpyObserverRef.current = observer;

    const observeSection = (id: string) => {
      const element = getSectionElement(id);
      if (element) {
        if (!observedElements.has(element)) {
          observer.observe(element);
          observedElements.add(element);
          logger.info('ScrollSpy', `Observing section: ${id}`);
        }
        return true;
      }
      return false;
    };

    // Observe all sections initially
    sectionIds.forEach((id) => {
      if (!observeSection(id)) {
        logger.warn('ScrollSpy', `Section not found: ${id}, will retry on DOM updates`);
      }
    });

    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => {
        sectionIds.forEach(observeSection);
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Cleanup
    return () => {
      logger.info('ScrollSpy', 'Cleaning up observers');
      observer.disconnect();
      observedElements.clear();
      scrollSpyObserverRef.current = null;
      mutationObserver?.disconnect();
    };
  }, [isWeb, showFloatingMenu]);

  return (
    <ScreenWrapper style={styles.container}>
      {/* Floating Navigation Menu */}
      {showFloatingMenu && <FloatingMenu onNavigate={handleNavigate} activeSection={activeSection} />}
      
      <ScrollContainer
        scrollRef={scrollViewRef}
        style={styles.scrollContainer}
        contentStyle={styles.content}
        onContentSizeChange={(w, h) => logger.info('LandingSite', 'Content size changed', { width: w, height: h })}
      >
        <HeroSection />
        <StatsSection stats={stats} isLoadingStats={isLoadingStats} />
        <LazySection section={VisionSection} />
        <LazySection section={ProblemsSection} />
        <LazySection section={FeaturesSection} />
        <LazySection section={AboutSection} />
        <LazySection section={HowItWorksSection} />
        <LazySection section={WhoIsItForSection} />
        <LazySection section={ValuesSection} />
        <LazySection section={RoadmapSection} />
        <LazySection section={ContactSection} />
        <LazySection section={FAQSection} />
        <LazySection section={TestimonialsSection} />
        <LazySection section={GallerySection} />
        <LazySection section={PartnersSection} />
        <LazySection section={FinalCTASection} />

      <View style={styles.footer}> 
        <Text style={styles.footerText}>© {new Date().getFullYear()} Karma Community — נבנה באהבה ובתמיכת הקהילה.</Text>
      </View>
      </ScrollContainer>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: { 
    paddingBottom: isMobileWeb ? 80 : 120,
    backgroundColor: '#FFFFFF',
  },
  hero: { 
    width: '100%',
    overflow: 'hidden',
  },
  heroGradient: {
    backgroundColor: '#F2F7FF',
    paddingTop: isMobileWeb ? 40 : (isWeb ? 60 : 80), 
    paddingBottom: isMobileWeb ? 30 : (isWeb ? 50 : 70), 
    paddingHorizontal: isMobileWeb ? 16 : (isWeb ? 20 : 40),
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  welcomeTitle: {
    fontSize: isMobileWeb ? 28 : (isWeb ? (isTablet ? 56 : 42) : 64),
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: isMobileWeb ? 16 : (isWeb ? 24 : 32),
    letterSpacing: -1,
    lineHeight: isMobileWeb ? 34 : (isWeb ? (isTablet ? 64 : 50) : 72),
  },
  logoContainer: {
    position: 'relative',
    marginBottom: isMobileWeb ? 12 : (isWeb ? 20 : 28),
    alignItems: 'center',
    justifyContent: 'center',
    width: isMobileWeb ? 100 : (isWeb ? (isTablet ? 180 : 160) : 200),
    height: isMobileWeb ? 100 : (isWeb ? (isTablet ? 180 : 160) : 200),
  },
  logo: { 
    width: isMobileWeb ? 80 : (isWeb ? (isTablet ? 140 : 120) : 160), 
    height: isMobileWeb ? 80 : (isWeb ? (isTablet ? 140 : 120) : 160),
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: isMobileWeb ? 100 : (isWeb ? (isTablet ? 180 : 160) : 200),
    height: isMobileWeb ? 100 : (isWeb ? (isTablet ? 180 : 160) : 200),
    borderRadius: isMobileWeb ? 50 : (isWeb ? (isTablet ? 90 : 80) : 100),
    backgroundColor: 'rgba(65, 105, 225, 0.15)',
    zIndex: 1,
  },
  title: { 
    fontSize: isMobileWeb ? 24 : (isWeb ? (isTablet ? 48 : 36) : 56), 
    fontWeight: '900', 
    color: colors.textPrimary, 
    textAlign: 'center', 
    marginBottom: isMobileWeb ? 12 : (isWeb ? 16 : 20),
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: isMobileWeb ? 14 : (isWeb ? (isTablet ? 20 : 18) : 24), 
    color: colors.textSecondary, 
    textAlign: 'center', 
    marginTop: isMobileWeb ? 6 : (isWeb ? 8 : 12), 
    maxWidth: isMobileWeb ? '95%' : (isTablet ? '70%' : '90%'), 
    lineHeight: isMobileWeb ? 20 : (isWeb ? 28 : 32),
    fontWeight: '500',
  },
  ctaRow: { 
    flexDirection: 'row', 
    gap: isMobileWeb ? 10 : 16, 
    marginTop: isMobileWeb ? 24 : 40, 
    justifyContent: 'center', 
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ctaIcon: {
    marginRight: isMobileWeb ? 6 : 8,
  },
  primaryCta: { 
    backgroundColor: colors.info, 
    paddingHorizontal: isMobileWeb ? 20 : 32, 
    paddingVertical: isMobileWeb ? 12 : 18, 
    borderRadius: isMobileWeb ? 12 : 16, 
    minWidth: isMobileWeb ? 140 : 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.info,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  primaryCtaText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: isMobileWeb ? 14 : (isWeb ? 18 : 20), 
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  secondaryCta: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: colors.info, 
    paddingHorizontal: isMobileWeb ? 20 : 32, 
    paddingVertical: isMobileWeb ? 12 : 18, 
    borderRadius: isMobileWeb ? 12 : 16, 
    minWidth: isMobileWeb ? 140 : 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryCtaText: { 
    color: colors.info, 
    fontWeight: '800', 
    fontSize: isMobileWeb ? 14 : (isWeb ? 18 : 20), 
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  section: { 
    paddingHorizontal: isMobileWeb ? 16 : (isWeb ? (isTablet ? 40 : 24) : 40), 
    paddingVertical: isMobileWeb ? 24 : (isWeb ? (isTablet ? 60 : 40) : 50), 
    width: '100%', 
    alignSelf: 'center',
    maxWidth: isTablet ? 1200 : '100%',
  },
  sectionTitle: { 
    fontSize: isMobileWeb ? 20 : (isWeb ? (isTablet ? 36 : 28) : 42), 
    fontWeight: '900', 
    color: colors.textPrimary, 
    textAlign: 'center', 
    marginBottom: isMobileWeb ? 6 : 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: { 
    fontSize: isMobileWeb ? 13 : (isWeb ? (isTablet ? 18 : 16) : 22), 
    color: colors.textSecondary, 
    textAlign: 'center', 
    marginBottom: isMobileWeb ? 12 : (isWeb ? 20 : 24), 
    lineHeight: isMobileWeb ? 18 : (isWeb ? 26 : 30),
    fontWeight: '500',
  },
  sectionSubTitle: { 
    fontSize: isMobileWeb ? 14 : (isWeb ? 18 : 24), 
    fontWeight: '700', 
    color: colors.textPrimary, 
    textAlign: 'center', 
    marginTop: isMobileWeb ? 10 : (isWeb ? 15 : 20), 
    marginBottom: isMobileWeb ? 6 : (isWeb ? 8 : 12) 
  },
  featuresGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-around', 
    gap: isMobileWeb ? 12 : 24, 
    width: '100%',
    marginTop: isMobileWeb ? 12 : 20,
  },
  feature: { 
    flex: 1, 
    minWidth: isMobileWeb ? 140 : 280, 
    maxWidth: isMobileWeb ? '100%' : 350, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#EDF1FF', 
    borderRadius: isMobileWeb ? 12 : 20, 
    padding: isMobileWeb ? 16 : 28, 
    alignItems: 'center', 
    margin: isMobileWeb ? 4 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  featureEmoji: { 
    fontSize: isMobileWeb ? 32 : 48, 
    marginBottom: isMobileWeb ? 10 : 16,
  },
  featureTitle: { 
    fontSize: isMobileWeb ? 16 : 24, 
    fontWeight: '800', 
    color: colors.textPrimary, 
    textAlign: 'center', 
    marginBottom: isMobileWeb ? 8 : 12,
    letterSpacing: -0.3,
  },
  featureText: { 
    fontSize: isMobileWeb ? 13 : 18, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    lineHeight: isMobileWeb ? 18 : 28,
    fontWeight: '400',
  },
  paragraph: { 
    fontSize: isMobileWeb ? 14 : (isWeb ? 18 : 20), 
    color: colors.textPrimary, 
    lineHeight: isMobileWeb ? 20 : (isWeb ? 28 : 30), 
    textAlign: 'center', 
    marginTop: isMobileWeb ? 8 : 12, 
    maxWidth: isMobileWeb ? '95%' : (isTablet ? '80%' : '90%'), 
    alignSelf: 'center',
    fontWeight: '400',
  },
  linksRow: { flexDirection: 'row', gap: isMobileWeb ? 12 : 24, marginTop: isMobileWeb ? 10 : 16, alignSelf: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  link: { color: '#2563EB', fontWeight: '700', fontSize: isMobileWeb ? 14 : 20, padding: isMobileWeb ? 6 : 8 },
  faqItem: { marginTop: isMobileWeb ? 12 : 20, paddingHorizontal: isMobileWeb ? 12 : 20, maxWidth: isMobileWeb ? '95%' : '90%', alignSelf: 'center' },
  faqQ: { fontWeight: '800', color: colors.textPrimary, fontSize: isMobileWeb ? 15 : 20, marginBottom: isMobileWeb ? 6 : 8 },
  faqA: { color: colors.textSecondary, fontSize: isMobileWeb ? 13 : 18, lineHeight: isMobileWeb ? 18 : 26 },
  iconBullets: { marginTop: isMobileWeb ? 10 : 16, gap: isMobileWeb ? 10 : 16, width: '100%', maxWidth: isMobileWeb ? '95%' : '90%', alignSelf: 'center' },
  iconBulletRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: isMobileWeb ? 10 : 16, justifyContent: 'center', paddingVertical: isMobileWeb ? 2 : 4 },
  iconBulletText: { color: colors.textPrimary, fontSize: isMobileWeb ? 13 : 18, textAlign: 'center', flex: 1 },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: isMobileWeb ? 12 : 24, justifyContent: 'space-around', marginTop: isMobileWeb ? 12 : 20, width: '100%' },
  stepCard: { 
    flex: 1, 
    minWidth: isMobileWeb ? 140 : 280, 
    maxWidth: isMobileWeb ? '100%' : 350, 
    borderRadius: isMobileWeb ? 12 : 20, 
    borderWidth: 1, 
    borderColor: '#E6EEF9', 
    backgroundColor: '#FFFFFF', 
    padding: isMobileWeb ? 16 : 28, 
    alignItems: 'center', 
    margin: isMobileWeb ? 4 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  stepTitle: { 
    marginTop: isMobileWeb ? 10 : 16, 
    fontWeight: '800', 
    color: colors.textPrimary, 
    fontSize: isMobileWeb ? 16 : 24,
    letterSpacing: -0.3,
  },
  stepText: { 
    marginTop: isMobileWeb ? 8 : 12, 
    textAlign: 'center', 
    color: colors.textSecondary, 
    fontSize: isMobileWeb ? 13 : 18, 
    lineHeight: isMobileWeb ? 18 : 28,
    fontWeight: '400',
  },
  splitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: isMobileWeb ? 16 : 30, justifyContent: 'space-around', width: '100%' },
  splitColumn: { flex: 1, minWidth: isMobileWeb ? 140 : 320, maxWidth: isMobileWeb ? '100%' : 500, padding: isMobileWeb ? 12 : 20 },
  splitTitle: { textAlign: 'center', fontSize: isMobileWeb ? 18 : 24, fontWeight: '800', color: colors.textPrimary, marginBottom: isMobileWeb ? 8 : 12 },
  valuesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: isMobileWeb ? 6 : 10, justifyContent: 'center', marginTop: isMobileWeb ? 4 : 6 },
  valuePill: { 
    paddingHorizontal: isMobileWeb ? 14 : 24, 
    paddingVertical: isMobileWeb ? 8 : 14, 
    borderRadius: 999, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: colors.info, 
    margin: isMobileWeb ? 3 : 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  valuePillText: { 
    color: colors.info, 
    fontWeight: '700', 
    fontSize: isMobileWeb ? 12 : 18,
  },
  roadmap: { flexDirection: 'row', gap: isMobileWeb ? 8 : 16, justifyContent: 'center', marginTop: isMobileWeb ? 6 : 8, flexWrap: 'wrap' },
  roadItem: { paddingHorizontal: isMobileWeb ? 12 : 16, paddingVertical: isMobileWeb ? 8 : 10, borderRadius: isMobileWeb ? 8 : 10, borderWidth: 1, borderColor: '#E6EEF9', backgroundColor: '#FBFDFF' },
  roadTime: { fontWeight: '800', color: colors.info, textAlign: 'center', fontSize: isMobileWeb ? 12 : 16 },
  roadLabel: { color: colors.textPrimary, textAlign: 'center', fontSize: isMobileWeb ? 12 : 16 },
  brandStrip: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: isMobileWeb ? 8 : 10, paddingVertical: isMobileWeb ? 12 : 16 },
  brandIcon: { width: isMobileWeb ? 30 : 40, height: isMobileWeb ? 30 : 40, opacity: 0.9 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: isMobileWeb ? 10 : 20, justifyContent: 'center', marginTop: isMobileWeb ? 16 : 24, width: '100%' },
  contactButton: { 
    flexDirection: 'row', 
    gap: isMobileWeb ? 8 : 12, 
    alignItems: 'center', 
    paddingHorizontal: isMobileWeb ? 16 : 28, 
    paddingVertical: isMobileWeb ? 12 : 18, 
    borderRadius: isMobileWeb ? 12 : 16, 
    minWidth: isMobileWeb ? 140 : 200, 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  contactButtonText: { 
    color: '#fff', 
    fontWeight: '800', 
    fontSize: isMobileWeb ? 13 : 18,
    letterSpacing: 0.3,
  },
  footer: { 
    paddingHorizontal: isMobileWeb ? 16 : 20, 
    paddingVertical: isMobileWeb ? 20 : 32, 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9', 
    alignItems: 'center', 
    marginTop: isMobileWeb ? 24 : 40,
    backgroundColor: '#FAFBFF',
  },
  footerText: { 
    color: colors.textSecondary, 
    fontSize: isMobileWeb ? 12 : 14,
    fontWeight: '500',
  },
  // Statistics styles
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-around', 
    gap: isMobileWeb ? 12 : 24, 
    marginTop: isMobileWeb ? 12 : 20, 
    width: '100%' 
  },
  statCard: { 
    flex: 1, 
    minWidth: isMobileWeb ? 140 : 250, 
    maxWidth: isMobileWeb ? '48%' : 300, 
    paddingVertical: isMobileWeb ? 16 : 32, 
    paddingHorizontal: isMobileWeb ? 12 : 20,
    borderRadius: isMobileWeb ? 12 : 20, 
    borderWidth: 1, 
    borderColor: '#E6EEF9', 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    margin: isMobileWeb ? 4 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  statIcon: {
    marginBottom: isMobileWeb ? 8 : 12,
  },
  statNumber: { 
    fontSize: isMobileWeb ? 22 : (isWeb ? 36 : 40), 
    fontWeight: '900', 
    color: colors.textPrimary, 
    marginBottom: isMobileWeb ? 6 : 8,
    letterSpacing: -1,
    textAlign: 'center',
  },
  statLabel: { 
    fontSize: isMobileWeb ? 12 : 18, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    lineHeight: isMobileWeb ? 16 : 26,
    fontWeight: '500',
  },
  statsLoadingContainer: {
    paddingVertical: isMobileWeb ? 40 : 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsLoadingText: {
    marginTop: isMobileWeb ? 12 : 16,
    fontSize: isMobileWeb ? 14 : 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  useCases: { gap: isMobileWeb ? 10 : 16, marginTop: isMobileWeb ? 10 : 16, alignSelf: 'center', width: '100%', maxWidth: isMobileWeb ? '95%' : '90%' },
  useCaseRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: isMobileWeb ? 10 : 16, alignSelf: 'center', paddingVertical: isMobileWeb ? 4 : 8 },
  useCaseText: { color: colors.textPrimary, fontSize: isMobileWeb ? 13 : 18, textAlign: 'center', flex: 1 },
  testimonials: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: isMobileWeb ? 12 : 24, marginTop: isMobileWeb ? 12 : 20, width: '100%' },
  testimonialCard: { 
    flex: 1, 
    minWidth: isMobileWeb ? 140 : 320, 
    maxWidth: isMobileWeb ? '100%' : 400, 
    borderRadius: isMobileWeb ? 12 : 20, 
    borderWidth: 1, 
    borderColor: '#E6EEF9', 
    backgroundColor: '#FFFFFF', 
    padding: isMobileWeb ? 16 : 28, 
    margin: isMobileWeb ? 4 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  testimonialText: { 
    color: colors.textPrimary, 
    fontSize: isMobileWeb ? 13 : 18, 
    lineHeight: isMobileWeb ? 18 : 30, 
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  testimonialUser: { 
    color: colors.textSecondary, 
    marginTop: isMobileWeb ? 10 : 16, 
    textAlign: 'center', 
    fontWeight: '700', 
    fontSize: isMobileWeb ? 12 : 16,
  },
  galleryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: isMobileWeb ? 8 : 16, 
    marginTop: isMobileWeb ? 12 : 20 
  },
  galleryImage: { 
    width: isMobileWeb ? 140 : 280, 
    height: isMobileWeb ? 140 : 280, 
    borderRadius: isMobileWeb ? 12 : 20, 
    borderWidth: 1, 
    borderColor: '#E6EEF9',
    backgroundColor: '#FAFBFF'
  },
  partnersRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: isMobileWeb ? 20 : 40,
    marginTop: isMobileWeb ? 12 : 20,
    flexWrap: 'wrap'
  },
  partnerLogo: { 
    height: isMobileWeb ? 40 : 60, 
    width: isMobileWeb ? 100 : 150,
    resizeMode: 'contain', 
    opacity: 0.8 
  },
  trustList: { gap: isMobileWeb ? 6 : 10, marginTop: isMobileWeb ? 6 : 8, alignItems: 'center' },
  trustRow: { flexDirection: 'row-reverse', gap: isMobileWeb ? 6 : 8, alignItems: 'center' },
  trustText: { color: colors.textPrimary, fontSize: isMobileWeb ? 11 : 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: isMobileWeb ? 8 : 12, marginTop: isMobileWeb ? 6 : 8 },
  categoryCard: { 
    width: isMobileWeb ? 100 : 150, 
    height: isMobileWeb ? 60 : 90, 
    borderRadius: isMobileWeb ? 12 : 16, 
    borderWidth: 1, 
    borderColor: '#E6EEF9', 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: isMobileWeb ? 4 : 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryText: { 
    fontWeight: '700', 
    color: colors.textPrimary,
    fontSize: isMobileWeb ? 12 : 16,
  },
  // Floating Menu Styles
  floatingMenu: {
    position: 'absolute',
    right: isMobileWeb ? 8 : 20,
    top: isMobileWeb ? 60 : 100,
    width: isMobileWeb ? '14%' : '10%',
    maxHeight: isMobileWeb ? '70vh' as any : (isWeb ? '80vh' as any : 600),
    backgroundColor: '#FFFFFF',
    borderRadius: isMobileWeb ? 12 : 20,
    borderWidth: 1,
    borderColor: '#E6EEF9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 1000,
    overflow: 'hidden',
  },
  floatingMenuMinimized: {
    position: 'absolute',
    right: isMobileWeb ? 8 : 20,
    top: isMobileWeb ? 60 : 100,
    width: isMobileWeb ? SCREEN_WIDTH * 0.05 : SCREEN_WIDTH * 0.03, // 5% for mobile, 3% for desktop
    height: isMobileWeb ? SCREEN_WIDTH * 0.05 : SCREEN_WIDTH * 0.03,
    backgroundColor: '#FFFFFF',
    borderRadius: isMobileWeb ? SCREEN_WIDTH * 0.025 : SCREEN_WIDTH * 0.015,
    borderWidth: 1,
    borderColor: '#E6EEF9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuToggleButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.01, // 1% of screen width
    paddingVertical: SCREEN_WIDTH * 0.008, // 0.8% of screen width
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFBFF',
  },
  menuTitle: {
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  menuMinimizeButton: {
    padding: SCREEN_WIDTH * 0.002, // 0.2% of screen width
  },
  menuItems: {
    flex: 1,
    paddingVertical: SCREEN_WIDTH * 0.006, // 0.6% of screen width
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: SCREEN_WIDTH * 0.006, // 0.6% of screen width
    borderRightWidth: 3,
    borderRightColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#F2F7FF',
    borderRightColor: colors.info,
  },
  menuItemIcon: {
    marginLeft: SCREEN_WIDTH * 0.002, // 0.2% of screen width
  },
  menuItemText: {
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  menuItemTextActive: {
    color: colors.info,
    fontWeight: '700',
  },
  // New Styles
  decoCircle1: {
    position: 'absolute',
    width: isMobileWeb ? 200 : 400,
    height: isMobileWeb ? 200 : 400,
    borderRadius: isMobileWeb ? 100 : 200,
    backgroundColor: 'rgba(65, 105, 225, 0.05)',
    top: isMobileWeb ? -50 : -100,
    left: isMobileWeb ? -75 : -150,
  },
  decoCircle2: {
    position: 'absolute',
    width: isMobileWeb ? 150 : 300,
    height: isMobileWeb ? 150 : 300,
    borderRadius: isMobileWeb ? 75 : 150,
    backgroundColor: 'rgba(255, 192, 203, 0.08)',
    bottom: isMobileWeb ? -25 : -50,
    right: isMobileWeb ? -50 : -100,
  },
  titleDecorator: {
    width: isMobileWeb ? 40 : 60,
    height: isMobileWeb ? 3 : 4,
    backgroundColor: colors.info,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: isMobileWeb ? 16 : 24,
  },
  sectionAltBackground: {
    backgroundColor: '#F0F4F8',
  },
  emphasis: {
    fontWeight: '800',
    color: colors.info,
  },
  visionHighlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isMobileWeb ? 16 : 24,
    marginTop: isMobileWeb ? 20 : 32,
    width: '100%',
  },
  visionHighlight: {
    flex: 1,
    minWidth: isMobileWeb ? 140 : 200,
    maxWidth: isMobileWeb ? '100%' : 250,
    alignItems: 'center',
    padding: isMobileWeb ? 16 : 24,
    gap: isMobileWeb ? 8 : 12,
  },
  visionHighlightText: {
    fontSize: isMobileWeb ? 13 : 16,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  problemsContent: {
    gap: isMobileWeb ? 20 : 32,
    marginTop: isMobileWeb ? 16 : 24,
    width: '100%',
  },
  problemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isMobileWeb ? 16 : 24,
    padding: isMobileWeb ? 20 : 32,
    borderWidth: 1,
    borderColor: '#E6EEF9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: isMobileWeb ? 12 : 16,
  },
  problemIcon: {
    marginBottom: isMobileWeb ? 12 : 16,
    alignSelf: 'center',
  },
  problemTitle: {
    fontSize: isMobileWeb ? 18 : 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: isMobileWeb ? 12 : 16,
    letterSpacing: -0.3,
  },
  problemText: {
    fontSize: isMobileWeb ? 14 : 18,
    color: colors.textSecondary,
    lineHeight: isMobileWeb ? 20 : 28,
    textAlign: 'right',
    fontWeight: '400',
  },
  whoContent: {
    width: '100%',
    maxWidth: isTablet ? 900 : '100%',
    alignSelf: 'center',
  },
  whoMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isMobileWeb ? 16 : 24,
    padding: isMobileWeb ? 24 : 40,
    borderWidth: 2,
    borderColor: colors.info,
    shadowColor: colors.info,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
    marginBottom: isMobileWeb ? 20 : 32,
  },
  whoMainIcon: {
    marginBottom: isMobileWeb ? 16 : 24,
  },
  whoFutureCard: {
    backgroundColor: '#FAFBFF',
    borderRadius: isMobileWeb ? 12 : 20,
    padding: isMobileWeb ? 20 : 28,
    borderWidth: 1,
    borderColor: '#E6EEF9',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  whoFutureIcon: {
    marginBottom: isMobileWeb ? 12 : 16,
    opacity: 0.6,
  },
  whoFutureTitle: {
    fontSize: isMobileWeb ? 16 : 20,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: isMobileWeb ? 8 : 12,
  },
  whoFutureText: {
    fontSize: isMobileWeb ? 13 : 16,
    color: colors.textSecondary,
    lineHeight: isMobileWeb ? 18 : 24,
    textAlign: 'center',
    fontWeight: '400',
  },
  githubLinkContainer: {
    marginTop: isMobileWeb ? 24 : 32,
    width: '100%',
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
  },
  githubLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: isMobileWeb ? 16 : 20,
    padding: isMobileWeb ? 20 : 28,
    borderWidth: 2,
    borderColor: colors.info,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: isMobileWeb ? 12 : 16,
  },
  githubLinkTextContainer: {
    flex: 1,
    gap: isMobileWeb ? 4 : 6,
  },
  githubLinkTitle: {
    fontSize: isMobileWeb ? 16 : 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: isMobileWeb ? 4 : 6,
  },
  githubLinkDescription: {
    fontSize: isMobileWeb ? 13 : 16,
    color: colors.textSecondary,
    lineHeight: isMobileWeb ? 18 : 24,
    fontWeight: '400',
  },
  mottoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: isMobileWeb ? 16 : 24,
    marginTop: isMobileWeb ? 20 : 32,
    marginBottom: isMobileWeb ? 20 : 32,
    width: '100%',
  },
  mottoCard: {
    flex: 1,
    minWidth: isMobileWeb ? 140 : 280,
    maxWidth: isMobileWeb ? '100%' : 400,
    backgroundColor: '#FFFFFF',
    borderRadius: isMobileWeb ? 16 : 24,
    padding: isMobileWeb ? 20 : 32,
    borderWidth: 2,
    borderColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobileWeb ? 12 : 16,
    shadowColor: colors.info,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  mottoIcon: {
    marginBottom: isMobileWeb ? 4 : 8,
  },
  mottoText: {
    fontSize: isMobileWeb ? 16 : 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: isMobileWeb ? 22 : 30,
  },
  stepNumberBadge: {
    position: 'absolute',
    top: isMobileWeb ? -12 : -16,
    right: isMobileWeb ? 16 : 24,
    width: isMobileWeb ? 32 : 40,
    height: isMobileWeb ? 32 : 40,
    borderRadius: isMobileWeb ? 16 : 20,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stepNumber: {
    fontSize: isMobileWeb ? 16 : 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  stepIcon: {
    marginTop: isMobileWeb ? 12 : 16,
    marginBottom: isMobileWeb ? 12 : 16,
  },
  howItWorksNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isMobileWeb ? 10 : 14,
    backgroundColor: '#F2F7FF',
    borderRadius: isMobileWeb ? 12 : 16,
    padding: isMobileWeb ? 16 : 24,
    marginTop: isMobileWeb ? 24 : 32,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    width: '100%',
    maxWidth: isTablet ? 800 : '100%',
    alignSelf: 'center',
  },
  howItWorksNoteText: {
    flex: 1,
    fontSize: isMobileWeb ? 14 : 18,
    color: colors.textPrimary,
    lineHeight: isMobileWeb ? 20 : 26,
    fontWeight: '500',
  },
});

export default LandingSiteScreen;



