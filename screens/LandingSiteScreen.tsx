// LandingSiteScreen.tsx
// Web-only marketing landing page for KarmaCommunity
import React, { useEffect } from 'react';
import { Platform, ScrollView, View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import colors from '../globals/colors';
import { FontSizes } from '../globals/constants';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '../utils/loggerService';

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

const LandingSiteScreen: React.FC = () => {
  if (Platform.OS !== 'web') return null as any;
  useEffect(() => {
    logger.info('LandingSite', 'Landing page mounted');
    return () => logger.info('LandingSite', 'Landing page unmounted');
  }, []);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      scrollEnabled={true}
      scrollEventThrottle={16}
      onContentSizeChange={(w, h) => logger.info('LandingSite', 'Content size changed', { width: w, height: h })}
    >
      <View style={styles.hero}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>KarmaCommunity</Text>
        <Text style={styles.subtitle}>קהילה שעוזרת אחת לשנייה — תרומות, תמיכה, משאבים וחיבורים אנושיים.</Text>
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.primaryCta} onPress={() => { logger.info('LandingSite', 'CTA click - download'); Linking.openURL('https://expo.dev'); }}>
            <Text style={styles.primaryCtaText}>הורדת האפליקציה</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryCta} onPress={() => { logger.info('LandingSite', 'CTA click - contact email'); Linking.openURL('mailto:navesarussi1@gmail.com'); }}>
            <Text style={styles.secondaryCtaText}>דברו איתי</Text>
          </TouchableOpacity>
        </View>
      </View>

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

      {/* Stats Section */}
      <Section title="במספרים" subtitle="השפעה שגדלה מיום ליום">
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>10,000+</Text>
            <Text style={styles.statLabel}>תרומות ומשאבים</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3,500+</Text>
            <Text style={styles.statLabel}>התנדבויות וזמן</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>120+</Text>
            <Text style={styles.statLabel}>ארגונים שותפים</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>חיבורים בין אנשים</Text>
          </View>
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

      {/* Expanded Stats */}
      <Section title="עוד נתונים" subtitle="למה זה עובד">
        <View style={styles.statsGrid}>
          <View style={styles.statCard}><Text style={styles.statNumber}>92%</Text><Text style={styles.statLabel}>מדווחים על חווית נתינה טובה</Text></View>
          <View style={styles.statCard}><Text style={styles.statNumber}>78%</Text><Text style={styles.statLabel}>שיפור בתחושת שייכות</Text></View>
          <View style={styles.statCard}><Text style={styles.statNumber}>5X</Text><Text style={styles.statLabel}>יותר חיבורים חוזרים</Text></View>
          <View style={styles.statCard}><Text style={styles.statNumber}>24/7</Text><Text style={styles.statLabel}>קהילה פעילה כל הזמן</Text></View>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 120 },
  hero: { paddingTop: 100, paddingBottom: 50, alignItems: 'center', paddingHorizontal: 20, backgroundColor: '#F2F7FF' },
  logo: { width: 120, height: 120, marginBottom: 12 },
  title: { fontSize: 40, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 18, color: colors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: 780 },
  ctaRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  primaryCta: { backgroundColor: colors.info, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10 },
  primaryCtaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondaryCta: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.headerBorder, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10 },
  secondaryCtaText: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  section: { paddingHorizontal: 20, paddingVertical: 32, maxWidth: 1100, alignSelf: 'center' },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 8 },
  sectionSubtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 14 },
  sectionSubTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginTop: 12, marginBottom: 8 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  feature: { width: 220, backgroundColor: '#FAFBFF', borderWidth: 1, borderColor: '#EDF1FF', borderRadius: 12, padding: 14, alignItems: 'center' },
  featureEmoji: { fontSize: 28, marginBottom: 6 },
  featureTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  featureText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  paragraph: { fontSize: 15, color: colors.textPrimary, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  linksRow: { flexDirection: 'row', gap: 16, marginTop: 10, alignSelf: 'center' },
  link: { color: '#2563EB', fontWeight: '700' },
  faqItem: { marginTop: 8 },
  faqQ: { fontWeight: '800', color: colors.textPrimary, fontSize: 15 },
  faqA: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  iconBullets: { marginTop: 8, gap: 8 },
  iconBulletRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, justifyContent: 'center' },
  iconBulletText: { color: colors.textPrimary, fontSize: 14 },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 8 },
  stepCard: { width: 240, borderRadius: 14, borderWidth: 1, borderColor: '#E6EEF9', backgroundColor: '#FBFDFF', padding: 16, alignItems: 'center' },
  stepTitle: { marginTop: 8, fontWeight: '800', color: colors.textPrimary, fontSize: 16 },
  stepText: { marginTop: 6, textAlign: 'center', color: colors.textSecondary, fontSize: 13 },
  splitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' },
  splitColumn: { flexGrow: 1, minWidth: 280, maxWidth: 500 },
  splitTitle: { textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  valuesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 6 },
  valuePill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#F5F7FB', borderWidth: 1, borderColor: '#E6EEF9' },
  valuePillText: { color: colors.textPrimary, fontWeight: '700' },
  roadmap: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' },
  roadItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E6EEF9', backgroundColor: '#FBFDFF' },
  roadTime: { fontWeight: '800', color: colors.info, textAlign: 'center' },
  roadLabel: { color: colors.textPrimary, textAlign: 'center' },
  brandStrip: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 16 },
  brandIcon: { width: 40, height: 40, opacity: 0.9 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 10 },
  contactButton: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  contactButtonText: { color: '#fff', fontWeight: '800' },
  footer: { paddingHorizontal: 20, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', alignItems: 'center', marginTop: 20 },
  footerText: { color: colors.textSecondary, fontSize: 12 },
  // New styles
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 8 },
  statCard: { width: 220, paddingVertical: 18, borderRadius: 12, borderWidth: 1, borderColor: '#E6EEF9', backgroundColor: '#FBFDFF', alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '900', color: colors.textPrimary },
  statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  useCases: { gap: 10, marginTop: 8, alignSelf: 'center', width: '100%', maxWidth: 720 },
  useCaseRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, alignSelf: 'center' },
  useCaseText: { color: colors.textPrimary, fontSize: 14 },
  testimonials: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 8 },
  testimonialCard: { width: 300, borderRadius: 12, borderWidth: 1, borderColor: '#E6EEF9', backgroundColor: '#FFFFFF', padding: 14 },
  testimonialText: { color: colors.textPrimary, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  testimonialUser: { color: colors.textSecondary, marginTop: 8, textAlign: 'center', fontWeight: '700' },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 8 },
  galleryImage: { width: 140, height: 140, borderRadius: 12, borderWidth: 1, borderColor: '#EDF1FF' },
  partnersRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 8 },
  partnerLogo: { width: 120, height: 40, resizeMode: 'contain' },
  partnerLogoSmall: { width: 40, height: 40, resizeMode: 'contain', opacity: 0.8 },
  trustList: { gap: 10, marginTop: 8, alignItems: 'center' },
  trustRow: { flexDirection: 'row-reverse', gap: 8, alignItems: 'center' },
  trustText: { color: colors.textPrimary, fontSize: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 8 },
  categoryCard: { width: 150, height: 80, borderRadius: 12, borderWidth: 1, borderColor: '#E6EEF9', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', gap: 6 },
  categoryText: { fontWeight: '700', color: colors.textPrimary },
});

export default LandingSiteScreen;


