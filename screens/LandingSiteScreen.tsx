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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isTablet = SCREEN_WIDTH > 768;
const showFloatingMenu = isWeb && SCREEN_WIDTH > 1200; // Show only on large screens

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
      <View style={styles.menuHeader}>
        <Text style={[styles.menuTitle, { fontSize: menuSizes.titleSize }]}>תפריט ניווט</Text>
        <TouchableOpacity 
          onPress={() => setIsMinimized(true)}
          style={styles.menuMinimizeButton}
        >
          <Ionicons name="chevron-forward-outline" size={menuSizes.iconSize * 0.9} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
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
            <Text style={styles.title}>KarmaCommunity</Text>
            <Text style={styles.subtitle}>רשת חברתית ישראלית שמחברת בין אנשים שצריכים עזרה, לאנשים שרוצים לעזור. פשוט, שקוף ומהלב.</Text>
            <View style={styles.ctaRow}>
              <TouchableOpacity 
                style={styles.primaryCta} 
                onPress={() => { logger.info('LandingSite', 'CTA click - download'); Linking.openURL('https://expo.dev'); }}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={22} color="#fff" style={styles.ctaIcon} />
                <Text style={styles.primaryCtaText}>הורדת האפליקציה</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondaryCta} 
                onPress={() => { logger.info('LandingSite', 'CTA click - contact email'); Linking.openURL('mailto:navesarussi1@gmail.com'); }}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={22} color={colors.info} style={styles.ctaIcon} />
                <Text style={styles.secondaryCtaText}>דברו איתי</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
  );
}

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
            <Ionicons name="people-outline" size={32} color={colors.info} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.uniqueDonors.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>אנשים טובים בקהילה</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={32} color={colors.success} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.totalMoneyDonated.toLocaleString('he-IL')} ₪</Text>
            <Text style={styles.statLabel}>ש"ח שנתרמו ישירות</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="heart-outline" size={32} color={colors.pink} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>חברי קהילה רשומים</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={32} color={colors.orange} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.itemDonations.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>פריטים שמצאו בית חדש</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="car-outline" size={32} color={colors.accent} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.completedRides.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>נסיעות קהילתיות</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="business-outline" size={32} color={colors.info} style={styles.statIcon} />
            <Text style={styles.statNumber}>{stats.totalOrganizations.toLocaleString('he-IL')}</Text>
            <Text style={styles.statLabel}>עמותות וארגונים שותפים</Text>
          </View>
        </View>
      )}
    </Section>
);

const FeaturesSection = () => (
    <Section id="section-features" title="כל מה שצריך כדי לעשות טוב" subtitle="יצרנו כלים פשוטים שהופכים עזרה הדדית לחלק מהיום-יום" style={styles.sectionAltBackground}>
      <View style={styles.featuresGrid}>
        <Feature emoji="🤝" title="צריכים עזרה? רוצים לעזור?" text="פרסמו בקלות בקשה או הצעה, וקבלו מענה מהקהילה סביבכם. משיעורי עזר ועד תיקונים קטנים בבית." />
        <Feature emoji="💬" title="התחברו לאנשים כמוכם" text="מצאו קבוצות עניין, הצטרפו לדיונים, וצרו קשרים חדשים עם אנשים שאכפת להם." />
        <Feature emoji="📍" title="גלו הזדמנויות סביבכם" text="המפה החכמה שלנו תראה לכם איפה צריכים אתכם, ממש ליד הבית." />
        <Feature emoji="🏢" title="כלים ייעודיים לארגונים" text="דשבורד חכם לניהול מתנדבים, תרומות ופניות. שקיפות מלאה, אפס בירוקרטיה." />
      </View>
    </Section>
);

const HowItWorksSection = () => (
    <Section id="section-how" title="פשוט כמו 1, 2, 3" subtitle="להצטרף לקהילה ולהתחיל לעשות טוב">
      <View style={styles.stepsRow}>
        <View style={styles.stepCard}>
          <Ionicons name="download-outline" size={28} color={colors.info} />
          <Text style={styles.stepTitle}>1. הורידו והצטרפו</Text>
          <Text style={styles.stepText}>הירשמו בכמה שניות וספרו לנו מה מעניין אתכם.</Text>
        </View>
        <View style={styles.stepCard}>
          <Ionicons name="search-outline" size={28} color={colors.accent} />
          <Text style={styles.stepTitle}>2. גלו הזדמנויות</Text>
          <Text style={styles.stepText}>דפדפו בפיד וראו איפה צריכים אתכם, ממש ליד הבית.</Text>
        </View>
        <View style={styles.stepCard}>
          <Ionicons name="heart-outline" size={28} color={colors.pink} />
          <Text style={styles.stepTitle}>3. צרו קשר ועשו טוב</Text>
          <Text style={styles.stepText}>שלחו הודעה, תאמו פרטים, והרגישו את כוחה של קהילה בפעולה.</Text>
        </View>
      </View>
    </Section>
);

const WhoIsItForSection = () => (
    <Section id="section-who" title="לכולם. באמת." subtitle="בין אם אתם אדם פרטי או ארגון, יש לכם מקום בקהילה" style={styles.sectionAltBackground}>
      <View style={styles.splitRow}>
        <View style={styles.splitColumn}>
          <Text style={styles.splitTitle}>לאנשים פרטיים</Text>
          <Text style={styles.paragraph}>שכנים, חברים, וכל מי שרוצה לתת מהזמן, הידע או החפצים שלו כדי לעזור לאחרים.</Text>
          <View style={styles.iconBullets}>
            <View style={styles.iconBulletRow}><Ionicons name="gift-outline" size={18} color={colors.pink} /><Text style={styles.iconBulletText}>שיתוף חפצים, מזון וציוד</Text></View>
            <View style={styles.iconBulletRow}><Ionicons name="time-outline" size={18} color={colors.orange} /><Text style={styles.iconBulletText}>התנדבות וסיוע נקודתי</Text></View>
            <View style={styles.iconBulletRow}><Ionicons name="school-outline" size={18} color={colors.info} /><Text style={styles.iconBulletText}>שיתוף ידע ושיעורי עזר</Text></View>
          </View>
        </View>
        <View style={styles.splitColumn}>
          <Text style={styles.splitTitle}>לעמותות וארגונים</Text>
          <Text style={styles.paragraph}>ניהול מתנדבים, תרומות ופניות בדשבורד חכם, והגברת החשיפה וההשפעה שלכם.</Text>
          <View style={styles.iconBullets}>
            <View style={styles.iconBulletRow}><Ionicons name="speedometer-outline" size={18} color={colors.accent} /><Text style={styles.iconBulletText}>ניהול יעיל וחכם</Text></View>
            <View style={styles.iconBulletRow}><Ionicons name="people-circle-outline" size={18} color={colors.info} /><Text style={styles.iconBulletText}>בניית קהילה סביב הארגון</Text></View>
            <View style={styles.iconBulletRow}><Ionicons name="shield-checkmark-outline" size={18} color={colors.success} /><Text style={styles.iconBulletText}>שקיפות ובניית אמון</Text></View>
          </View>
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
    <Section id="section-values" title="הערכים שמנחים אותנו" subtitle="מה הופך את KarmaCommunity לקהילה בטוחה ואמינה" style={styles.sectionAltBackground}>
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
            <Ionicons name={item.icon as any} size={18} color={item.color} />
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
        <Ionicons name="rocket-outline" size={24} color={colors.info} />
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
        "אני מאמין בכוח של קהילה לשנות מציאות. KarmaCommunity היא הדרך שלי להפוך את הטוב לנגיש יותר. אשמח לשמוע מכם."
      </Text>
      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => { logger.info('LandingSite', 'Click - email link'); Linking.openURL('mailto:navesarussi1@gmail.com'); }}>
          <Text style={styles.link}>אימייל</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { logger.info('LandingSite', 'Click - linkedin'); Linking.openURL('https://www.linkedin.com/in/navesarussi'); }}>
          <Text style={styles.link}>לינקדאין</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { logger.info('LandingSite', 'Click - github'); Linking.openURL('https://github.com/navesarussi'); }}>
          <Text style={styles.link}>גיטהאב</Text>
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
          <Ionicons name="logo-whatsapp" color="#fff" size={18} /><Text style={styles.contactButtonText}>שלחו ווטסאפ ישיר</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#E4405F' }]} onPress={() => { logger.info('LandingSite', 'Click - instagram'); Linking.openURL('https://www.instagram.com/karma_community_/'); }}>
          <Ionicons name="logo-instagram" color="#fff" size={18} /><Text style={styles.contactButtonText}>עקבו באינסטגרם</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.contactButton, { backgroundColor: '#128C7E' }]} onPress={() => { logger.info('LandingSite', 'Click - whatsapp group'); Linking.openURL('https://chat.whatsapp.com/Hi2TpFcO5huKVKarvecz00'); }}>
          <Ionicons name="chatbubbles-outline" color="#fff" size={18} /><Text style={styles.contactButtonText}>הצטרפו לקבוצת ווטסאפ</Text>
        </TouchableOpacity>
      </View>
    </Section>
);

const FinalCTASection = () => (
    <Section title="הצטרפו לקהילה שעושה טוב" subtitle="כל אחד יכול להשפיע. הורידו את האפליקציה והתחילו עכשיו." style={styles.sectionAltBackground}>
      <View style={styles.ctaRow}>
        <TouchableOpacity 
          style={styles.primaryCta} 
          onPress={() => { logger.info('LandingSite', 'CTA click - download'); Linking.openURL('https://expo.dev'); }}
          activeOpacity={0.8}
        >
          <Ionicons name="download-outline" size={22} color="#fff" style={styles.ctaIcon} />
          <Text style={styles.primaryCtaText}>הורדת האפליקציה</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.secondaryCta} 
          onPress={() => { logger.info('LandingSite', 'CTA click - contact email'); Linking.openURL('mailto:navesarussi1@gmail.com'); }}
          activeOpacity={0.8}
        >
          <Ionicons name="mail-outline" size={22} color={colors.info} style={styles.ctaIcon} />
          <Text style={styles.secondaryCtaText}>צרו קשר</Text>
        </TouchableOpacity>
      </View>
    </Section>
);

interface LandingStats {
  uniqueDonors: number;
  totalMoneyDonated: number;
  totalUsers: number;
  itemDonations: number;
  completedRides: number;
  totalOrganizations: number;
}

const LandingSiteScreen: React.FC = () => {
  console.log('LandingSiteScreen');
  
  const [stats, setStats] = useState<LandingStats>({
    uniqueDonors: 0,
    totalMoneyDonated: 0,
    totalUsers: 0,
    itemDonations: 0,
    completedRides: 0,
    totalOrganizations: 0,
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
    logger.info('LandingSite', 'Landing page mounted');
    
    // Entrance Animation
    // Animated.timing(heroAnimation, {
    //   toValue: 1,
    //   duration: 800,
    //   delay: 200,
    //   useNativeDriver: !isWeb,
    // }).start();

    // Load community statistics
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const communityStats = await EnhancedStatsService.getCommunityStats();
        
        // Extract values - handle both direct values and nested value objects
        const getValue = (stat: any): number => {
          if (typeof stat === 'number') return stat;
          if (stat && typeof stat === 'object' && 'value' in stat) return stat.value || 0;
          return 0;
        };
        
        setStats({
          uniqueDonors: getValue(communityStats.uniqueDonors) || 0,
          totalMoneyDonated: getValue(communityStats.totalMoneyDonated) || 0,
          totalUsers: getValue(communityStats.totalUsers) || 0,
          itemDonations: getValue(communityStats.itemDonations) || 0,
          completedRides: getValue(communityStats.completedRides) || 0,
          totalOrganizations: getValue(communityStats.totalOrganizations) || 0,
        });
      } catch (error) {
        logger.error('LandingSite', 'Failed to load stats', { error });
        // Keep default values (0) on error
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    loadStats();
    
    return () => logger.info('LandingSite', 'Landing page unmounted');
  }, []);

  // Scroll Spy - Track which section is currently in view
  useEffect(() => {
    if (!isWeb || !showFloatingMenu) return;

    const sectionIds = ['stats', 'features', 'about', 'how', 'who', 'values', 'roadmap', 'contact', 'faq'];
    
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
        <Text style={styles.footerText}>© {new Date().getFullYear()} KarmaCommunity — נבנה באהבה ובתמיכת הקהילה.</Text>
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
    paddingBottom: 120,
    backgroundColor: '#FFFFFF',
  },
  hero: { 
    width: '100%',
    overflow: 'hidden',
  },
  heroGradient: {
    backgroundColor: '#F2F7FF',
    paddingTop: isWeb ? 60 : 80, 
    paddingBottom: isWeb ? 50 : 70, 
    paddingHorizontal: isWeb ? 20 : 40,
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  welcomeTitle: {
    fontSize: isWeb ? (isTablet ? 56 : 42) : 64,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: isWeb ? 24 : 32,
    letterSpacing: -1,
    lineHeight: isWeb ? (isTablet ? 64 : 50) : 72,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: isWeb ? 20 : 28,
    alignItems: 'center',
    justifyContent: 'center',
    width: isWeb ? (isTablet ? 180 : 160) : 200,
    height: isWeb ? (isTablet ? 180 : 160) : 200,
  },
  logo: { 
    width: isWeb ? (isTablet ? 140 : 120) : 160, 
    height: isWeb ? (isTablet ? 140 : 120) : 160,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: isWeb ? (isTablet ? 180 : 160) : 200,
    height: isWeb ? (isTablet ? 180 : 160) : 200,
    borderRadius: isWeb ? (isTablet ? 90 : 80) : 100,
    backgroundColor: 'rgba(65, 105, 225, 0.15)',
    zIndex: 1,
  },
  title: { 
    fontSize: isWeb ? (isTablet ? 48 : 36) : 56, 
    fontWeight: '900', 
    color: colors.textPrimary, 
    textAlign: 'center', 
    marginBottom: isWeb ? 16 : 20,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: isWeb ? (isTablet ? 20 : 18) : 24, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    marginTop: isWeb ? 8 : 12, 
    maxWidth: isTablet ? '70%' : '90%', 
    lineHeight: isWeb ? 28 : 32,
    fontWeight: '500',
  },
  ctaRow: { 
    flexDirection: 'row', 
    gap: 16, 
    marginTop: 40, 
    justifyContent: 'center', 
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  ctaIcon: {
    marginRight: 8,
  },
  primaryCta: { 
    backgroundColor: colors.info, 
    paddingHorizontal: 32, 
    paddingVertical: 18, 
    borderRadius: 16, 
    minWidth: 200,
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
    fontSize: isWeb ? 18 : 20, 
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  secondaryCta: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: colors.info, 
    paddingHorizontal: 32, 
    paddingVertical: 18, 
    borderRadius: 16, 
    minWidth: 200,
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
    fontSize: isWeb ? 18 : 20, 
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  section: { 
    paddingHorizontal: isWeb ? (isTablet ? 40 : 24) : 40, 
    paddingVertical: isWeb ? (isTablet ? 60 : 40) : 50, 
    width: '100%', 
    alignSelf: 'center',
    maxWidth: isTablet ? 1200 : '100%',
  },
  sectionTitle: { 
    fontSize: isWeb ? (isTablet ? 36 : 28) : 42, 
    fontWeight: '900', 
    color: colors.textPrimary, 
    textAlign: 'center', 
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: { 
    fontSize: isWeb ? (isTablet ? 18 : 16) : 22, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    marginBottom: isWeb ? 20 : 24, 
    lineHeight: isWeb ? 26 : 30,
    fontWeight: '500',
  },
  sectionSubTitle: { 
    fontSize: isWeb ? 18 : 24, 
    fontWeight: '700', 
    color: colors.textPrimary, 
    textAlign: 'center', 
    marginTop: isWeb ? 15 : 20, 
    marginBottom: isWeb ? 8 : 12 
  },
  featuresGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-around', 
    gap: 24, 
    width: '100%',
    marginTop: 20,
  },
  feature: { 
    flex: 1, 
    minWidth: 280, 
    maxWidth: 350, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#EDF1FF', 
    borderRadius: 20, 
    padding: 28, 
    alignItems: 'center', 
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  featureEmoji: { 
    fontSize: 48, 
    marginBottom: 16,
  },
  featureTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: colors.textPrimary, 
    textAlign: 'center', 
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  featureText: { 
    fontSize: 18, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    lineHeight: 28,
    fontWeight: '400',
  },
  paragraph: { 
    fontSize: isWeb ? 18 : 20, 
    color: colors.textPrimary, 
    lineHeight: isWeb ? 28 : 30, 
    textAlign: 'center', 
    marginTop: 12, 
    maxWidth: isTablet ? '80%' : '90%', 
    alignSelf: 'center',
    fontWeight: '400',
  },
  linksRow: { flexDirection: 'row', gap: 24, marginTop: 16, alignSelf: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  link: { color: '#2563EB', fontWeight: '700', fontSize: 20, padding: 8 },
  faqItem: { marginTop: 20, paddingHorizontal: 20, maxWidth: '90%', alignSelf: 'center' },
  faqQ: { fontWeight: '800', color: colors.textPrimary, fontSize: 20, marginBottom: 8 },
  faqA: { color: colors.textSecondary, fontSize: 18, lineHeight: 26 },
  iconBullets: { marginTop: 16, gap: 16, width: '100%', maxWidth: '90%', alignSelf: 'center' },
  iconBulletRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16, justifyContent: 'center', paddingVertical: 4 },
  iconBulletText: { color: colors.textPrimary, fontSize: 18, textAlign: 'center', flex: 1 },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, justifyContent: 'space-around', marginTop: 20, width: '100%' },
  stepCard: { 
    flex: 1, 
    minWidth: 280, 
    maxWidth: 350, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E6EEF9', 
    backgroundColor: '#FFFFFF', 
    padding: 28, 
    alignItems: 'center', 
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  stepTitle: { 
    marginTop: 16, 
    fontWeight: '800', 
    color: colors.textPrimary, 
    fontSize: 24,
    letterSpacing: -0.3,
  },
  stepText: { 
    marginTop: 12, 
    textAlign: 'center', 
    color: colors.textSecondary, 
    fontSize: 18, 
    lineHeight: 28,
    fontWeight: '400',
  },
  splitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 30, justifyContent: 'space-around', width: '100%' },
  splitColumn: { flex: 1, minWidth: 320, maxWidth: 500, padding: 20 },
  splitTitle: { textAlign: 'center', fontSize: 24, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  valuesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 6 },
  valuePill: { 
    paddingHorizontal: 24, 
    paddingVertical: 14, 
    borderRadius: 999, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: colors.info, 
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  valuePillText: { 
    color: colors.info, 
    fontWeight: '700', 
    fontSize: 18,
  },
  roadmap: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' },
  roadItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E6EEF9', backgroundColor: '#FBFDFF' },
  roadTime: { fontWeight: '800', color: colors.info, textAlign: 'center' },
  roadLabel: { color: colors.textPrimary, textAlign: 'center' },
  brandStrip: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 16 },
  brandIcon: { width: 40, height: 40, opacity: 0.9 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center', marginTop: 24, width: '100%' },
  contactButton: { 
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center', 
    paddingHorizontal: 28, 
    paddingVertical: 18, 
    borderRadius: 16, 
    minWidth: 200, 
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
    fontSize: 18,
    letterSpacing: 0.3,
  },
  footer: { 
    paddingHorizontal: 20, 
    paddingVertical: 32, 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9', 
    alignItems: 'center', 
    marginTop: 40,
    backgroundColor: '#FAFBFF',
  },
  footerText: { 
    color: colors.textSecondary, 
    fontSize: 14,
    fontWeight: '500',
  },
  // Statistics styles
  statsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-around', 
    gap: 24, 
    marginTop: 20, 
    width: '100%' 
  },
  statCard: { 
    flex: 1, 
    minWidth: 250, 
    maxWidth: 300, 
    paddingVertical: 32, 
    paddingHorizontal: 20,
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E6EEF9', 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  statIcon: {
    marginBottom: 12,
  },
  statNumber: { 
    fontSize: isWeb ? 36 : 40, 
    fontWeight: '900', 
    color: colors.textPrimary, 
    marginBottom: 8,
    letterSpacing: -1,
    textAlign: 'center',
  },
  statLabel: { 
    fontSize: 18, 
    color: colors.textSecondary, 
    textAlign: 'center', 
    lineHeight: 26,
    fontWeight: '500',
  },
  statsLoadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsLoadingText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  useCases: { gap: 16, marginTop: 16, alignSelf: 'center', width: '100%', maxWidth: '90%' },
  useCaseRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16, alignSelf: 'center', paddingVertical: 8 },
  useCaseText: { color: colors.textPrimary, fontSize: 18, textAlign: 'center', flex: 1 },
  testimonials: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: 24, marginTop: 20, width: '100%' },
  testimonialCard: { 
    flex: 1, 
    minWidth: 320, 
    maxWidth: 400, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E6EEF9', 
    backgroundColor: '#FFFFFF', 
    padding: 28, 
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  testimonialText: { 
    color: colors.textPrimary, 
    fontSize: 18, 
    lineHeight: 30, 
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '400',
  },
  testimonialUser: { 
    color: colors.textSecondary, 
    marginTop: 16, 
    textAlign: 'center', 
    fontWeight: '700', 
    fontSize: 16,
  },
  galleryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 16, 
    marginTop: 20 
  },
  galleryImage: { 
    width: 280, 
    height: 280, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E6EEF9',
    backgroundColor: '#FAFBFF'
  },
  partnersRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 40,
    marginTop: 20,
    flexWrap: 'wrap'
  },
  partnerLogo: { 
    height: 60, 
    width: 150,
    resizeMode: 'contain', 
    opacity: 0.8 
  },
  trustList: { gap: 10, marginTop: 8, alignItems: 'center' },
  trustRow: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  trustText: { color: colors.textPrimary, fontSize: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  categoryCard: { 
    width: 150, 
    height: 90, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#E6EEF9', 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryText: { 
    fontWeight: '700', 
    color: colors.textPrimary,
    fontSize: 16,
  },
  // Floating Menu Styles
  floatingMenu: {
    position: 'absolute',
    right: 20,
    top: 100,
    width: '10%',
    maxHeight: isWeb ? '80vh' as any : 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
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
    right: 20,
    top: 100,
    width: SCREEN_WIDTH * 0.03, // 3% of screen width
    height: SCREEN_WIDTH * 0.03, // 3% of screen width
    backgroundColor: '#FFFFFF',
    borderRadius: SCREEN_WIDTH * 0.015, // Half of width for perfect circle
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
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(65, 105, 225, 0.05)',
    top: -100,
    left: -150,
  },
  decoCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 192, 203, 0.08)',
    bottom: -50,
    right: -100,
  },
  titleDecorator: {
    width: 60,
    height: 4,
    backgroundColor: colors.info,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sectionAltBackground: {
    backgroundColor: '#F0F4F8',
  },
});

export default LandingSiteScreen;



