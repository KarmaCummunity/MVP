import React from 'react'
import Colors from '../globals/Colors' // Assuming Colors.js is in the same directory or accessible path
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // For header back button
import styles from '../globals/Styles';


export default function AboutKarmaCommunityScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <SafeAreaView style={localStyles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={localStyles.headerButton}
        >
          <Icon name='arrow-back' size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>אודות</Text>
        <View style={localStyles.headerButton} />{' '}
        {/* Placeholder for consistent spacing */}
      </View>
      <ScrollView style={localStyles.container}>
        {/* Header Section */}
        <Text style={localStyles.mainTitle}>
          אודות קהילת קארמה (Karma Community)
        </Text>
        <Text style={localStyles.subtitle}>הקיבוץ הקפיטליסטי הראשון מסוגו</Text>

        {/* Introduction */}
        <Text style={localStyles.paragraph}>
          קהילת קארמה (KC) מציגה רשת חברתית חדשנית וללא מטרות רווח, המשלבת את
          יעילות הקפיטליזם עם האנושיות שבסוציאליזם. חזוננו הוא ליצור מרחב
          דיגיטלי סוציאליסטי בתוך עולם קפיטליסטי מתקדם, שיעודד עשייה קהילתית
          משותפת ויתרום לשינוי חיובי בעולם.
        </Text>

        {/* What is Karma Community? */}
        <Text style={localStyles.sectionTitle}>מהי קהילת קארמה?</Text>
        <Text style={localStyles.paragraph}>
          קהילת קארמה היא פלטפורמה דיגיטלית נגישה ונוחה שתשמש כחברה שיתופית.
          בפלטפורמה זו, כל אחד יוכל לתת ולקבל - החל מזמן וכסף, דרך אפשרויות
          תחבורה נוספות, ועד לחפצים וידע. ה"פיד" של הרשת החברתית הזו יורכב אך
          ורק מעשייה בקהילה. אנו שואפים לבנות קהילה חדשה ומיוחדת מאפס, ובמקביל
          לאגד קהילות קיימות, גדולות כקטנות, שכבר פועלות רבות למען הקהילה אך
          בנפרד. המוטו שלנו הוא ש"לתת זה גם לקבל".
        </Text>

        {/* Our Aspirations */}
        <Text style={localStyles.sectionTitle}>השאיפות המרכזיות שלנו</Text>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            הקמת רשת מתנדבים עוצמתית: הקמת רשת מתנדבים חברתית וחזקה, שתעודד
            קבוצות ויחידים לעסוק באופן פעיל בקהילה.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            טיפוח תחושה של קהילתיות והעצמה: טיפוח תחושה עמוקה של קהילתיות
            והעצמה, שתאפשר למשתמשים להשפיע באופן משמעותי זה על זה ועל סביבתם,
            ולהביא לשינוי חיובי.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            יצירת פלטפורמה מפגישה: פיתוח פלטפורמה שתפגיש בין אנשים מרקעים שונים
            ומנקודות מבט מגוונות, במטרה לשתף פעולה למען המטרה הפשוטה אך מורכבת
            של הפיכת העולם למקום טוב יותר.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            הנגשת אפשרויות תרומה ועשייה: הפלטפורמה תספק גישה למגוון רחב של
            אפשרויות תרומה, יוזמות חדשות, התנדבויות, וכל סוג של עשייה חברתית.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            עידוד שותפויות ושיתוף משאבים: עידוד שותפויות, יוזמות משותפות ושיתוף
            משאבים, כדי להגביר את ההשפעה של מאמצים שנעשים כיום בנפרד.
          </Text>
        </View>

        {/* Existing Challenges */}
        <Text style={localStyles.sectionTitle}>
          האתגרים הקיימים כיום (הבעיות שאנו פותרים)
        </Text>
        <Text style={localStyles.paragraph}>
          כיום, קיימים מספר אתגרים משמעותיים בתחום העשייה הקהילתית וההתנדבותית:
        </Text>
        <View style={localStyles.challengeSection}>
          <Text style={localStyles.challengeTitle}>כפילויות</Text>
          <Text style={localStyles.paragraph}>
            ארגונים רבים בעלי מטרות זהות פועלים בנפרד ואף מתחרים ביניהם, מה
            שמוביל לאיבוד משאבים יקרים.
          </Text>
        </View>
        <View style={localStyles.challengeSection}>
          <Text style={localStyles.challengeTitle}>חוסר אמינות</Text>
          <Text style={localStyles.paragraph}>
            בשל כמות גדולה של ארגונים כפולים והיעדר סטנדרט אחיד בתחום, קל
            לארגונים או אנשים מושחתים לנצל את טוב לבם של התורמים באמצעות
            מניפולציות פשוטות.
          </Text>
        </View>
        <View style={localStyles.challengeSection}>
          <Text style={localStyles.challengeTitle}>פיזור</Text>
          <Text style={localStyles.paragraph}>
            מגוון האפשרויות הרחב הקיים עבור האזרח הפשוט לתרום לקהילה יצר מצב של
            ארגונים רבים ונפרדים, שכל אחד מהם מנגיש שירות אחר. מצב זה מונע
            מהתורם לקבל תמונה רחבה ולהבין את כל האפשרויות העומדות בפניו. בנוסף,
            פיזור זה מונע היווצרות של קהילה גדולה ומאוחדת העוסקת כולה בנתינה,
            שיכולה לשנות את כללי המשחק.
          </Text>
        </View>

        {/* Vision and Solutions */}
        <Text style={localStyles.sectionTitle}>החזון והפתרונות שאנו מציעים</Text>
        <View style={localStyles.solutionSection}>
          <Text style={localStyles.solutionTitle}>אמינות</Text>
          <Text style={localStyles.paragraph}>
            באמצעות אפליקציה נוחה ושקופה לחלוטין, אנו נאיר על עולם שלם המצוי
            בשוליים החברתיים, ונספק לתורם את האמינות הנדרשת.
          </Text>
        </View>
        <View style={localStyles.solutionSection}>
          <Text style={localStyles.solutionTitle}>איחוד</Text>
          <Text style={localStyles.paragraph}>
            פלטפורמה אחודה ויחידה שתכלול את כל סוגי הנתינה האפשריים תאפשר לנו
            לחסוך ולייעל את כל תהליך הנתינה, ובכך לתרום יותר.
          </Text>
        </View>
        <View style={localStyles.solutionSection}>
          <Text style={localStyles.solutionTitle}>קהילה</Text>
          <Text style={localStyles.paragraph}>
            יצירת קהילה חזקה ומגובשת בתוך הפלטפורמה תאפשר לנו להגשים את הרעיון
            האוטופי של חיים קיבוציים בעולם קפיטליסטי מתקדם.
          </Text>
        </View>

        {/* Why Now? */}
        <Text style={localStyles.sectionTitle}>
          מדוע דווקא עכשיו? מיצוי הרשתות החברתיות וחוסר קהילתיות
        </Text>
        <Text style={localStyles.paragraph}>
          כבר שנים שיש לאדם את הדיסוננס בין הרצון לקהילה והרצון לחופשיות, הרי כל
          קהילה עם הגבלות ומוסכמות משלה.
        </Text>
        <Text style={localStyles.paragraph}>
          דווקא בעידן של רשתות חברתיות המונעות מאינטרסים של כסף ופרסומות, אנו
          רואים את הפוטנציאל והצורך האמיתי שיש לנו כבני אדם ב"רשתות" האלה.
        </Text>
        <Text style={localStyles.paragraph}>
          KC באה להציע רשת חברתית ללא פרסומות וללא תוכן חומרי/פוגעני. פלטפורמה
          המקדשת קהילתיות ושיתוף. KC באה להציע פלטפורמה, מין רשת חברתית, אשר מצד
          אחד שמה דגש על ביחד ומצד שני דגש על חופש וליברליות.
        </Text>

        {/* Economic Model */}
        <Text style={localStyles.sectionTitle}>מודל כלכלי</Text>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            תרומות ישירות: כמו כל עמותה, נוכל לקבל תרומות ישירות. מכסף ורהיטים,
            ועד ייעוץ ארגוני ועסקי.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            עמלת פלטפורמה: כמו כל פלטפורמה שנותנת שירותים, ושרותי העברת כספים
            בפרט, נוכל לקחת עמלה על העברות כספים דרכנו.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            תשלום מהעמותות: כמו כל פלטפורמה שנותנת שירות, נוכל לקחת תשלום חודשי
            סמלי מהעמותות, אשר בזכות הפלטפורמה יקבלו חשיפה גדולה יותר.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            "מניות": גורמים בעלי השפעה יהיו מעוניינים בהשפעה רחבה שתוחזר. עם
            זאת, נשאיר את רוב השליטה בידי העמותה.
          </Text>
        </View>

        {/* Development Model */}
        <Text style={localStyles.sectionTitle}>מודל פיתוח</Text>
        <Text style={localStyles.paragraph}>
          לנוכח אופי הפרויקט עיצבנו מודל פיתוח אשר יוכל להבטיח איכות בעלויות
          נמוכות.
        </Text>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            צוות קטן ומקצועי: צוות מצומצם של עובדים שיהיו "מנהלי הפרויקט" אשר
            ינהלו את התהליך, יובילו ויכוונו את מערך המתנדבים המבוזר.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            פיתוח בעזרת מתנדבים: בעזרת גל גדול של מתכנתים בתעשייה אשר משמיעים
            קולות של חוסר משמעות במשרתם הנוכחית, בנוסף לכמות גדולה של סטודנטים
            ומתכנתים אחרים שישמחו לתת יד בפרויקט כזה, זיהינו את הפוטנציאל שיש
            במערך מבוזר שכזה.
          </Text>
        </View>
        <Text style={localStyles.paragraph}>
          בעזרת צוות קטן ומקצועי נוכל לנהל כמות גדולה של מתכנתים בעלויות נמוכות
          מאוד עד אפסיות, ובכך לנצל את המשאבים ולהאיץ את הפיתוח.
        </Text>

        {/* Initial Steps */}
        <Text style={localStyles.sectionTitle}>שלבים ראשונים</Text>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>הגדלת הקהילה</Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>משקיע ראשוני</Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>אפיון</Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>עיצוב</Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>MVP (Minimum Viable Product)</Text>
        </View>

        {/* Regulations for Organizations */}
        <Text style={localStyles.sectionTitle}>תקנון ביחס לארגונים שנצרף</Text>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            פוליטיקה ואידיאולוגיה - ארגון אינו רשאי להיות פוליטי ולפעול לצורך
            קידום אידיאולוגיה או לשון הרע לכל קבוצה או אדם פרטי.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            אלימות והפרת זכויות האדם - הארגון אינו רשאי לקדם או לתמוך באלימות,
            פשיזם, נאציזם, או כל סוג של הפרת זכויות האדם.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            דת - הארגון אינו רשאי לקדם או להפיץ את דעותיו הדתיות באופן שיידחה
            קבוצה או אדם פרטי.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            פרסום שקרי או מזיק - הארגון אינו רשאי לפרסם מידע שקרי או מזיק שיכול
            לגרום נזק לציבור הרחב או לאדם פרטי.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            ארגונים מסוכנים - הארגון אינו רשאי לקיים קשרים עם קבוצות המוכרות
            כמסוכנות.
          </Text>
        </View>
        <View style={localStyles.bulletPointContainer}>
          <Text style={localStyles.bulletPoint}>•</Text>
          <Text style={localStyles.bulletText}>
            ניהול כספי נאות - הארגון חייב לנהוג כראוי בנושא ניהול הכספים ולא
            לעשות שימוש לא ראוי בכספי הארגון למטרות אישיות.
          </Text>
        </View>
        <Text style={localStyles.paragraph}>
          אנו שומרים לעצמנו את הזכות לסרב להצטרפות או להמשיך שיתוף פעולה עם כל
          עמותה או ארגון שיזדהה עם כל אחת מהתנאים המפורטים לעיל, לפי שיקול דעתנו
          הבלעדי.
        </Text>

        {/* Call to Action */}
        <Text style={localStyles.sectionTitle}>מחפשים אתכם</Text>
        <Text style={localStyles.paragraph}>
          הפרויקט ממש בתחילת דרכו, ולכן כל עזרה, ייעוץ ואפילו ביקורת, מקדם
          ומשפיע.
        </Text>
        <Text style={localStyles.paragraph}>כל עזרה משמעותית.</Text>
        <Text style={localStyles.paragraph}>כי לתת זה גם לקבל. זאת לא קלישאה.</Text>

        {/* Team Members - General Section */}
        <Text style={localStyles.sectionTitle}>הצוות שלנו</Text>
        <Text style={localStyles.paragraph}>
          קהילת קארמה מורכבת מצוות מסור ומקצועי של יזמים, מתכנתים, מעצבים
          ויועצים, הפועלים יחד מתוך אמונה עמוקה בחזון הפרויקט. אנו משלבים ידע
          וניסיון ממגוון תחומים כדי לבנות פלטפורמה חזקה ויציבה, הממוקדת בצרכי
          הקהילה. הצוות שלנו מחויב להצלחת הפרויקט ולקידום ערכי הנתינה
          והשיתופיות, והוא פועל בשקיפות מלאה ובשיתוף פעולה עם המתנדבים הרבים
          שמצטרפים לדרך.
        </Text>

        {/* Contact Information (Optional - you might prefer a separate screen) */}
        <Text style={localStyles.sectionTitle}>צרו קשר</Text>
        <Text style={localStyles.paragraph}>
          לכל שאלה, רעיון או שיתוף פעולה, אל תהססו ליצור קשר. אנו נשמח לשמוע
          מכם!
        </Text>
        <View style={localStyles.contactInfo}>
          <Text style={localStyles.contactText}>
            מייל כללי: info@karmacommunity.org
          </Text>
          <Text style={localStyles.contactText}>טלפון: 123-456-7890</Text>
          <Text style={localStyles.contactText}>
            כתובת: רחוב הדוגמה 1, עיר הדוגמה
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const localStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 30 : 0, // Adjust for Android status bar
    marginBottom: Platform.OS === 'android' ? 40 : 0, // Adjust for Android status bar
    backgroundColor: Colors.lightBackground // Using lightBackground from your Colors file
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: Colors.lightOrange, // Using white from your Colors file
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: Colors.textPrimary // Using textPrimary
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.mediumGray // Using mediumGray
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 15,
    color: Colors.darkGray, // Using darkGray
    borderBottomWidth: 1,
    borderBottomColor: Colors.headerBorder, // Using headerBorder
    paddingBottom: 5
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
    color: Colors.textPrimary // Using textPrimary
  },
  bulletPointContainer: {
    flexDirection: 'row-reverse',
    marginBottom: 8
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
    color: Colors.textPrimary // Using textPrimary
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: Colors.textPrimary // Using textPrimary
  },
  challengeSection: {
    marginBottom: 20,
    paddingRight: 10,
    borderRightWidth: 3,
    borderRightColor: Colors.danger // Using danger for challenges
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
    color: Colors.danger // Using danger for challenges
  },
  solutionSection: {
    marginBottom: 20,
    paddingRight: 10,
    borderRightWidth: 3,
    borderRightColor: Colors.accent // Using accent for solutions (green)
  },
  solutionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
    color: Colors.accent // Using accent for solutions
  },
  contactInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: Colors.offWhite, // Using offWhite
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.border // Using border color
  },
  contactText: {
    fontSize: 15,
    textAlign: 'right',
    lineHeight: 22,
    color: Colors.textPrimary // Using textPrimary
  },
  headerButton: {
    width: 24, // To keep consistent spacing with the icon
  },
})