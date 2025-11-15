// LandingSiteScreen.tsx
// Web-only marketing landing page for KarmaCommunity
import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, Image, TouchableOpacity, Linking, Dimensions, ActivityIndicator } from 'react-native';
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

const Section: React.FC<{ title: string; subtitle?: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
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
  
  useEffect(() => {
    logger.info('LandingSite', 'Landing page mounted');
    
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

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollContainer
        style={styles.scrollContainer}
        contentStyle={styles.content}
        onContentSizeChange={(w, h) => logger.info('LandingSite', 'Content size changed', { width: w, height: h })}
      >
      <View style={styles.hero}>
        <View style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <Text style={styles.welcomeTitle}>ברוכים הבאים לקהילת קארמה</Text>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
              <View style={styles.logoGlow} />
            </View>
            <Text style={styles.title}>KarmaCommunity</Text>
            <Text style={styles.subtitle}>קהילה שעוזרת אחת לשני111יה — תרומות, תמיכה, משאבים וחיבורים אנושיים.</Text>
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
          </View>
        </View>
      </View>

      {/* Statistics Section - At the top of the page */}
      <Section title="במספרים" subtitle="השפעה אמיתית מהקהילה">
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
              <Text style={styles.statLabel}>תורמים פעילים</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash-outline" size={32} color={colors.success} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.totalMoneyDonated.toLocaleString('he-IL')} ₪</Text>
              <Text style={styles.statLabel}>שקלים שנתרמו</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="heart-outline" size={32} color={colors.pink} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString('he-IL')}</Text>
              <Text style={styles.statLabel}>חברים בקהילה</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cube-outline" size={32} color={colors.orange} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.itemDonations.toLocaleString('he-IL')}</Text>
              <Text style={styles.statLabel}>חפצים שנמסרו</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="car-outline" size={32} color={colors.accent} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.completedRides.toLocaleString('he-IL')}</Text>
              <Text style={styles.statLabel}>טרמפים שבוצעו</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="business-outline" size={32} color={colors.info} style={styles.statIcon} />
              <Text style={styles.statNumber}>{stats.totalOrganizations.toLocaleString('he-IL')}</Text>
              <Text style={styles.statLabel}>עמותות שהצטרפו</Text>
            </View>
          </View>
        )}
      </Section>

      <Section title="מה יש בתוך האפליקציה?" subtitle="כלים קהילתיים חזקים ופשוטים">
        <View style={styles.featuresGrid}>
          <Feature emoji="🤝" title="עזרה הדדית" text="פוסטים של בקשות/הצעות עזרה בכל תחום: אוכל, ריהוט, זמן, ידע ועוד." />
          <Feature emoji="💬" title="שיחות וקהילה" text="צ׳אט פרטי וקבוצתי, דיונים סביב נושאים, התראות על מה שחשוב לכם." />
          <Feature emoji="📍" title="קרבה וגילוי" text="חיפוש לפי מיקום ותחומי עניין, המלצות מותאמות, מעקב אחרי ארגונים ואנשים." />
          <Feature emoji="🏢" title="ארגונים קהילתיים" text="לארגונים יש דשבורד, ניהול מתנדבים ומשאבים, ותהליכי אישור מסודרים." />
        </View>
      </Section>

      <Section title="מי אני" subtitle="מייסד הפלטפורמה, נוה סרוסי">
        <Text style={styles.paragraph}>
          אני מפתח מוצר שמאמין בכוח של קהילה. KarmaCommunity נולדה כדי להפוך טוב ליותר נגיש —
          לחבר בין מי שצריך לבין מי שיכול, בשקיפות ובפשטות. אם תרצו לשמוע עוד, אשמח לשיחה.
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

      <Section title="אודות הפרויקט" subtitle="חזון, אתגרים ופתרונות">
        <Text style={styles.paragraph}>
          קהילת קארמה (KC) מציגה רשת חברתית ללא מטרות רווח, המשלבת יעילות קפיטליסטית עם אנושיות ושיתופיות.
          היא מרחב דיגיטלי שמאפשר לכל אחד לתת ולקבל — זמן, כסף, חפצים וידע — כשהפיד כולו עשייה קהילתית.
          המוטו שלנו: לתת זה גם לקבל.
        </Text>
        <Text style={styles.sectionSubTitle}>האתגרים של היום</Text>
        <Text style={styles.paragraph}>
          כפילויות בין ארגונים, חוסר אמינות, ופיזור מאמצים גורמים לאיבוד משאבים וחולשה קהילתית. KC מאחדת גופים
          וקהילות תחת פלטפורמה אחת, שקופה ונגישה.
        </Text>
        <View style={styles.iconBullets}>
          <View style={styles.iconBulletRow}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
            <Text style={styles.iconBulletText}>כפילויות — בזבוז משאבים ותחרות מיותרת</Text>
          </View>
          <View style={styles.iconBulletRow}>
            <Ionicons name="shield-outline" size={18} color={colors.accent} />
            <Text style={styles.iconBulletText}>אמינות — סטנדרטיזציה ושקיפות לתרומות ומיזמים</Text>
          </View>
          <View style={styles.iconBulletRow}>
            <Ionicons name="people-outline" size={18} color={colors.info} />
            <Text style={styles.iconBulletText}>קהילה — בניית רשת רכה וחזקה במקביל</Text>
          </View>
        </View>
        <Text style={styles.sectionSubTitle}>הפתרון</Text>
        <Text style={styles.paragraph}>
          אפליקציה אחודה, קלה לשימוש ושקופה — שמציפה הזדמנויות נתינה וקבלה סביבכם, מחברת בין אנשים וארגונים,
          ומאפשרת אמון, שיתוף פעולה והגדלת ההשפעה.
        </Text>
      </Section>

      <Section title="איך זה עובד" subtitle="3 צעדים פשוטים">
        <View style={styles.stepsRow}>
          <View style={styles.stepCard}>
            <Ionicons name="download-outline" size={28} color={colors.info} />
            <Text style={styles.stepTitle}>מצטרפים</Text>
            <Text style={styles.stepText}>נרשמים במהירות, בוחרים שפה ותחומי עניין.</Text>
          </View>
          <View style={styles.stepCard}>
            <Ionicons name="search-outline" size={28} color={colors.accent} />
            <Text style={styles.stepTitle}>מגלים</Text>
            <Text style={styles.stepText}>מוצאים בקשות/הצעות לפי מיקום, נושא וקהילה.</Text>
          </View>
          <View style={styles.stepCard}>
            <Ionicons name="heart-outline" size={28} color={colors.pink} />
            <Text style={styles.stepTitle}>פועלים</Text>
            <Text style={styles.stepText}>מתקשרים, מסייעים, חולקים — והקהילה גדלה.</Text>
          </View>
        </View>
      </Section>

      <Section title="למי זה מתאים?" subtitle="אנשים פרטיים וארגונים">
        <View style={styles.splitRow}>
          <View style={styles.splitColumn}>
            <Text style={styles.splitTitle}>ליחידים</Text>
            <Text style={styles.paragraph}>שיתוף חפצים, תרומות מזון, עזרה בלימודים, תיקונים קטנים, טרמפים, תמיכה רגשית, שיח קהילתי ועוד.</Text>
            <View style={styles.iconBullets}>
              <View style={styles.iconBulletRow}><Ionicons name="gift-outline" size={18} color={colors.pink} /><Text style={styles.iconBulletText}>תרומות וחלוקה</Text></View>
              <View style={styles.iconBulletRow}><Ionicons name="time-outline" size={18} color={colors.orange} /><Text style={styles.iconBulletText}>זמן והתנדבות</Text></View>
              <View style={styles.iconBulletRow}><Ionicons name="school-outline" size={18} color={colors.info} /><Text style={styles.iconBulletText}>ידע ולמידה</Text></View>
            </View>
          </View>
          <View style={styles.splitColumn}>
            <Text style={styles.splitTitle}>לארגונים</Text>
            <Text style={styles.paragraph}>ניהול פניות, מתנדבים ומשאבים בדשבורד אחוד, שקיפות ואמון, ותהליכי אישור מסודרים.</Text>
            <View style={styles.iconBullets}>
              <View style={styles.iconBulletRow}><Ionicons name="speedometer-outline" size={18} color={colors.accent} /><Text style={styles.iconBulletText}>דשבורד יעיל</Text></View>
              <View style={styles.iconBulletRow}><Ionicons name="people-circle-outline" size={18} color={colors.info} /><Text style={styles.iconBulletText}>קהילה סביב הארגון</Text></View>
              <View style={styles.iconBulletRow}><Ionicons name="shield-checkmark-outline" size={18} color={colors.success} /><Text style={styles.iconBulletText}>אמון ושקיפות</Text></View>
            </View>
          </View>
        </View>
      </Section>

      <Section title="ערכים שלנו" subtitle="ללא פרסומות, ללא תוכן פוגעני, עם קהילה חזקה">
        <View style={styles.valuesRow}>
          <View style={styles.valuePill}><Text style={styles.valuePillText}>קהילתיות</Text></View>
          <View style={styles.valuePill}><Text style={styles.valuePillText}>שקיפות</Text></View>
          <View style={styles.valuePill}><Text style={styles.valuePillText}>אחריות חברתית</Text></View>
          <View style={styles.valuePill}><Text style={styles.valuePillText}>שוויון וגיוון</Text></View>
          <View style={styles.valuePill}><Text style={styles.valuePillText}>חופש ובחירה</Text></View>
        </View>
      </Section>

      <Section title="מפת דרכים" subtitle="לאן אנחנו הולכים">
        <View style={styles.roadmap}>
          <View style={styles.roadItem}><Text style={styles.roadTime}>Q3</Text><Text style={styles.roadLabel}>פתיחת קהילה פיילוט</Text></View>
          <View style={styles.roadItem}><Text style={styles.roadTime}>Q4</Text><Text style={styles.roadLabel}>ארגונים ראשונים ודשבורד</Text></View>
          <View style={styles.roadItem}><Text style={styles.roadTime}>Q1</Text><Text style={styles.roadLabel}>סקייל ארצי ושיתופי פעולה</Text></View>
        </View>
      </Section>

      <View style={styles.brandStrip}>
        <Image source={require('../assets/images/android-chrome-192x192.png')} style={styles.brandIcon} />
        <Image source={require('../assets/images/android-chrome-512x512.png')} style={styles.brandIcon} />
        <Image source={require('../assets/images/apple-touch-icon.png')} style={styles.brandIcon} />
        <Image source={require('../assets/images/favicon-32x32.png')} style={styles.brandIcon} />
        <Image source={require('../assets/images/favicon-16x16.png')} style={styles.brandIcon} />
      </View>

      <Section title="יצירת קשר" subtitle="נשמח לשיחה, שיתוף פעולה או הצטרפות לקהילה">
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

      <Section title="שאלות נפוצות">
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>האם השימוש חינם?</Text>
          <Text style={styles.faqA}>כן. המיזם קהילתי ושואף להישאר נגיש לכל אחד.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>איך אפשר לתרום/להתנדב?</Text>
          <Text style={styles.faqA}>אפשר להצטרף כמשתמש, להצטרף לקבוצות, או לפנות לשיתופי פעולה.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>האם האפליקציה זמינה לאנדרואיד/iOS?</Text>
          <Text style={styles.faqA}>בוודאי. יש גרסאות ל-Android ול-iOS, וגם גרסת ווב נוחה.</Text>
        </View>
      </Section>


      {/* Use-cases Section */}
      <Section title="שימושים נפוצים" subtitle="איך קהילה עוזרת לקהילה">
        <View style={styles.useCases}>
          <View style={styles.useCaseRow}><Ionicons name="fast-food-outline" size={18} color={colors.orange} /><Text style={styles.useCaseText}>חלוקת מזון למשפחות</Text></View>
          <View style={styles.useCaseRow}><Ionicons name="construct-outline" size={18} color={colors.info} /><Text style={styles.useCaseText}>תיקונים קטנים בבית</Text></View>
          <View style={styles.useCaseRow}><Ionicons name="book-outline" size={18} color={colors.pink} /><Text style={styles.useCaseText}>שיעורי עזר וידע</Text></View>
          <View style={styles.useCaseRow}><Ionicons name="car-outline" size={18} color={colors.accent} /><Text style={styles.useCaseText}>נסיעות וטרמפים</Text></View>
          <View style={styles.useCaseRow}><Ionicons name="chatbubbles-outline" size={18} color={colors.success} /><Text style={styles.useCaseText}>תמיכה רגשית ושיח</Text></View>
          <View style={styles.useCaseRow}><Ionicons name="home-outline" size={18} color={colors.textSecondary} /><Text style={styles.useCaseText}>ציוד לבית וריהוט</Text></View>
        </View>
      </Section>

      {/* Testimonials Section */}
      <Section title="סיפורי קהילה" subtitle="מה אומרים המשתמשים שלנו">
        <View style={styles.testimonials}>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>מצאתי מתנדב שתיקן לי את הדלת תוך יום! מדהים שיש קהילה שעוזרת כל כך מהר.</Text>
            <Text style={styles.testimonialUser}>— דנה, תל אביב</Text>
          </View>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>תרמנו רהיטים דרך האפליקציה למשפחה מהעיר שלנו. הכל היה פשוט ושקוף.</Text>
            <Text style={styles.testimonialUser}>— עידו, חיפה</Text>
          </View>
          <View style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>מצאתי שיעורי עזר במתמטיקה בחינם לשכנה המבוגרת. יצא קשר מדהים בינינו.</Text>
            <Text style={styles.testimonialUser}>— רותם, ירושלים</Text>
          </View>
        </View>
      </Section>

      {/* Gallery Section */}
      <Section title="גלריה" subtitle="רגעים קטנים של טוב">
        <View style={styles.galleryGrid}>
          <Image source={require('../assets/images/android-chrome-192x192.png')} style={styles.galleryImage} />
          <Image source={require('../assets/images/android-chrome-512x512.png')} style={styles.galleryImage} />
          <Image source={require('../assets/images/apple-touch-icon.png')} style={styles.galleryImage} />
          <Image source={require('../assets/images/favicon-32x32.png')} style={styles.galleryImage} />
          <Image source={require('../assets/images/favicon-16x16.png')} style={styles.galleryImage} />
          <Image source={require('../assets/images/favicon.png')} style={styles.galleryImage} />
        </View>
      </Section>

      {/* Partners Section */}
      <Section title="שותפים וקהילות" subtitle="בדרך, בעשייה, ולצדנו">
        <View style={styles.partnersRow}>
          <Image source={require('../assets/images/Jgive_Logo.png')} style={styles.partnerLogo} />
          <Image source={require('../assets/images/favicon-32x32.png')} style={styles.partnerLogoSmall} />
          <Image source={require('../assets/images/favicon-16x16.png')} style={styles.partnerLogoSmall} />
        </View>
      </Section>

      {/* Trust & Safety */}
      <Section title="אמון ושקיפות" subtitle="קהילה בריאה מתחילה מאמון">
        <View style={styles.trustList}>
          <View style={styles.trustRow}><Ionicons name="checkmark-circle-outline" size={18} color={colors.success} /><Text style={styles.trustText}>ללא פרסומות, ללא תוכן פוגעני</Text></View>
          <View style={styles.trustRow}><Ionicons name="shield-checkmark-outline" size={18} color={colors.info} /><Text style={styles.trustText}>מנגנוני דיווח ואישור לארגונים</Text></View>
          <View style={styles.trustRow}><Ionicons name="lock-closed-outline" size={18} color={colors.accent} /><Text style={styles.trustText}>פרטיות וכבוד לכל משתמש</Text></View>
        </View>
      </Section>

      {/* Final CTA */}
      <Section title="הצטרפו לקהילה" subtitle="כל אחד יכול להשפיע">
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.primaryCta} onPress={() => { logger.info('LandingSite', 'CTA click - final instagram'); Linking.openURL('https://www.instagram.com/karma_community_/'); }}>
            <Text style={styles.primaryCtaText}>עקבו באינסטגרם</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryCta} onPress={() => { logger.info('LandingSite', 'CTA click - final whatsapp'); Linking.openURL('https://wa.me/972528616878'); }}>
            <Text style={styles.secondaryCtaText}>שלחו ווטסאפ</Text>
          </TouchableOpacity>
        </View>
      </Section>


      {/* Category Grid */}
      <Section title="קטגוריות נתינה מרכזיות" subtitle="מה חשוב לכם?">
        <View style={styles.categoryGrid}>
          <View style={styles.categoryCard}><Ionicons name="basket-outline" size={22} color={colors.orange} /><Text style={styles.categoryText}>מזון</Text></View>
          <View style={styles.categoryCard}><Ionicons name="bed-outline" size={22} color={colors.info} /><Text style={styles.categoryText}>ריהוט</Text></View>
          <View style={styles.categoryCard}><Ionicons name="shirt-outline" size={22} color={colors.pink} /><Text style={styles.categoryText}>ביגוד</Text></View>
          <View style={styles.categoryCard}><Ionicons name="school-outline" size={22} color={colors.success} /><Text style={styles.categoryText}>ידע</Text></View>
          <View style={styles.categoryCard}><Ionicons name="time-outline" size={22} color={colors.textSecondary} /><Text style={styles.categoryText}>זמן</Text></View>
          <View style={styles.categoryCard}><Ionicons name="medical-outline" size={22} color={colors.error} /><Text style={styles.categoryText}>רפואה</Text></View>
          <View style={styles.categoryCard}><Ionicons name="leaf-outline" size={22} color={colors.accent} /><Text style={styles.categoryText}>סביבה</Text></View>
          <View style={styles.categoryCard}><Ionicons name="musical-notes-outline" size={22} color={colors.info} /><Text style={styles.categoryText}>תרבות</Text></View>
        </View>
      </Section>

      {/* Org Onboarding Steps */}
      <Section title="לארגונים: איך מצטרפים?" subtitle="תהליך קצר ושקוף">
        <View style={styles.stepsRow}>
          <View style={styles.stepCard}><Ionicons name="create-outline" size={26} color={colors.info} /><Text style={styles.stepTitle}>ממלאים טופס</Text><Text style={styles.stepText}>פרטים בסיסיים, מטרות הארגון וצרכים.</Text></View>
          <View style={styles.stepCard}><Ionicons name="shield-checkmark-outline" size={26} color={colors.success} /><Text style={styles.stepTitle}>אימות קצר</Text><Text style={styles.stepText}>בדיקת שקיפות, מסמכים ופרטי קשר.</Text></View>
          <View style={styles.stepCard}><Ionicons name="rocket-outline" size={26} color={colors.pink} /><Text style={styles.stepTitle}>יוצאים לדרך</Text><Text style={styles.stepText}>דשבורד, פוסטים, מתנדבים ומשאבים.</Text></View>
        </View>
      </Section>

      {/* Manifesto */}
      <Section title="המניפסט" subtitle="למה ולשם מה">
        <Text style={styles.paragraph}>בעידן של רעש, פרסומות ואינטרסים – אנחנו בוחרים בקהילה. קהילה שמקדשת עשייה, סולידריות ורוח טובה.</Text>
        <Text style={styles.paragraph}>אנחנו מאמינים שיחד אפשר לבנות מערכת שמחברת בין צרכים ליכולות, בין לבבות לידיים. כי טוב הוא תשתית, לא מוצר.</Text>
        <Text style={styles.paragraph}>אנחנו מתחייבים לשקיפות, לכבוד האדם, ולמרחב דיגיטלי בטוח. יחד נבנה תשתית שנותנת כוח לקהילה לפעול – בכל מקום.</Text>
      </Section>

      {/* More Testimonials */}
      <Section title="עוד סיפורים מהשטח">
        <View style={styles.testimonials}>
          <View style={styles.testimonialCard}><Text style={styles.testimonialText}>הכרתי שכנים דרך KC, ופתאום יש קהילה בבניין. דברים קטנים שעושים שינוי.</Text><Text style={styles.testimonialUser}>— אילן, פתח תקווה</Text></View>
          <View style={styles.testimonialCard}><Text style={styles.testimonialText}>כארגון קטן, קיבלנו חשיפה אדירה למתנדבים איכותיים. הדשבורד חסך לנו שעות.</Text><Text style={styles.testimonialUser}>— עמותת יד ללב</Text></View>
          <View style={styles.testimonialCard}><Text style={styles.testimonialText}>נתתי כמה שעות בשבוע, קיבלתי תחושת משמעות ענקית וחברים חדשים.</Text><Text style={styles.testimonialUser}>— סיון, רמת גן</Text></View>
        </View>
      </Section>

      {/* Extended FAQ */}
      <Section title="עוד שאלות">
        <View style={styles.faqItem}><Text style={styles.faqQ}>איך נשמרת פרטיות?</Text><Text style={styles.faqA}>אנחנו שומרים על מינימום איסוף נתונים, ונותנים שליטה למשתמשים בנראות וחשיפה.</Text></View>
        <View style={styles.faqItem}><Text style={styles.faqQ}>האם יש פרסומות?</Text><Text style={styles.faqA}>לא. הפלטפורמה נקייה מפרסומות ומקדשת תוכן קהילתי בלבד.</Text></View>
        <View style={styles.faqItem}><Text style={styles.faqQ}>איך מדווחים על בעיה?</Text><Text style={styles.faqA}>יש מנגנון דיווח מובנה בכל פוסט/שיחה. אפשר גם ליצור קשר ישירות בוואטסאפ.</Text></View>
      </Section>

      <View style={styles.footer}> 
        <Text style={styles.footerText}>© {new Date().getFullYear()} KarmaCommunity — נבנה באהבה.</Text>
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
    shadowOpacity: 0.3,
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
    marginBottom: isWeb ? 12 : 16,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 8 },
  galleryImage: { width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#EDF1FF' },
  partnersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 8 },
  partnerLogo: { width: 120, height: 40, resizeMode: 'contain' },
  partnerLogoSmall: { width: 40, height: 40, resizeMode: 'contain', opacity: 0.8 },
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
});

export default LandingSiteScreen;


