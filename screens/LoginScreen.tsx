import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../globals/styles'; // Import your styles

export default function LoginScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sectionContainer}>
      {/* לוגו */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      </View>

      <View style={styles.formContainer}>
        {/* עוטפים את התוכן העליון ב-View חדש עם flex: 1 */}
        <View style={styles.topContentWrapper}>
            <TextInput style={styles.input} placeholder="שם משתמש" placeholderTextColor="#fff" />
            <TextInput style={styles.input} placeholder="סיסמה" placeholderTextColor="#fff" secureTextEntry />

            <TouchableOpacity>
              <Text style={styles.passwordHint}>שכחת סיסמה?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.buttonText}>התחברות</Text>
            </TouchableOpacity>
        </View>

        <Text style={styles.orText}>התחבר באמצעות</Text>
        <View style={styles.iconsRow}>
          <FontAwesome name="envelope" size={28} style={styles.icon} />
          <FontAwesome name="apple" size={28}    style={styles.icon} />
          <FontAwesome name="google" size={28}   style={styles.icon} />
          <FontAwesome name="github" size={28}   style={styles.icon} />
          <FontAwesome name="facebook" size={28} style={styles.icon} />
        </View>
      </View>
    </SafeAreaView>
  );
};