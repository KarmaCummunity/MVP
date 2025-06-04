import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import styles from "../navigations/styles";
export default function FirstScreen({
  navigation,
}: {
  navigation: NavigationProp<ParamListBase>;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.topSection}>
          <Text style={styles.title}>קהילת קארמה</Text>
          <Text style={styles.subtitle}>מקום שבו טוב הלב הופך לכוח משותף</Text>

          <Text style={styles.description}>
            קהילת קארמה היא יוזמה חברתית שמחברת בין אנשים טובים — מתנדבים,
            תורמים, יוזמים, וחולמים. אנחנו מאמינים שפעולה קטנה אחת יכולה לשנות
            חיים שלמים.
            {"\n\n"}
            כאן תוכלו למצוא פרויקטים להתנדבות, דרכים לתרום, וקהילה תומכת שמוקירה
            כל תרומה – קטנה כגדולה.
            {"\n\n"}
            בכל יום תקבלו השראה עם משפטים מעוררי מוטיבציה, ותוכלו לצבור קרדיטים
            לפעולות טובות, לזכות בהכרה חודשית, ואפילו בפרסים סמליים.
            {"\n\n"}
            בואו להיות חלק ממשהו גדול יותר – ביחד ניצור עולם של ערבות הדדית,
            נתינה ואור.
          </Text>
          <Text style={styles.description}>
            קהילת קארמה (KC) היא יוזמה חברתית חדשנית המוגדרת כ"קיבוץ הקפיטליסטי
            הראשון". אנחנו מאמינים שפעולה קטנה אחת יכולה לשנות חיים שלמים.
            {"\n\n"}
            האפליקציה של קהילת קארמה היא הרשת החברתית הראשונה בעולם ללא מטרות
            רווח. היא מציעה פלטפורמה נגישה ונוחה במרחב הדיגיטלי שתהווה חברה
            שיתופית, בה כל אחד יוכל לתת ולקבל, בין אם זה זמן, כסף, אפשרויות
            תחבורה, חפצים או ידע. ה"פיד" של האפליקציה מורכב רק מעשייה בקהילה,
            והיא מעודדת שותפויות, יוזמות משותפות ושיתוף משאבים כדי להגביר את
            ההשפעה של מאמצים שנעשים כיום בנפרד. המטרה היא לאחד את כל סוגי הנתינה
            האפשריים ולייעל את התהליך כולו.
            {"\n\n"}
            באמצעות האפליקציה, נבנה קהילה חזקה ומגובשת, שתגשים את הרעיון האוטופי
            של חיים קיבוציים בעולם קפיטליסטי מתקדם. האפליקציה תספק אמינות
            ושקיפות מלאה לגבי הפעילות המתבצעת, ובכך תמנע ניצול לרעה. אנחנו
            מציעים רשת חברתית ללא פרסומות וללא תוכן חומרי או פוגעני, המקדשת
            קהילתיות ושיתוף.
            {"\n\n"}
            קהילת קארמה שואפת להקים רשת מתנדבים חברתית ועוצמתית, המעודדת קבוצות
            ויחידים לעסוק באופן פעיל בקהילה. היא תטפח תחושה של קהילתיות והעצמה,
            כך שהמשתמשים יוכלו להשפיע בצורה משמעותית זה על זה ועל סביבתם, ולהביא
            לשינוי חיובי. המטרה היא גם להפגיש אנשים מרקעים שונים ומנקודות מבט
            מגוונות כדי לשתף פעולה למען הפיכת העולם למקום טוב יותר.
            {"\n\n"}
          </Text>
          <Text style={styles.subtitle}>
            בואו להיות חלק ממשהו גדול יותר {"\n"}
            כי לתת זה גם לקבל {"\n"} ביחד ניצור עולם של ערבות הדדית, נתינה ואור.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={styles.buttonText}>התחברות / הרשמה</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
