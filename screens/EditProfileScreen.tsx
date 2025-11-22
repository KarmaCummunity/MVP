import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import ScrollContainer from '../components/ScrollContainer';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { useUser } from '../stores/userStore';
import { useTranslation } from 'react-i18next';
import { pickImage, takePhoto } from '../utils/fileService';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const { selectedUser, setSelectedUserWithMode } = useUser();
  const { t } = useTranslation(['profile', 'common']);

  // Core fields
  const [firstName, setFirstName] = useState((selectedUser?.name || '').split(' ')[0] || '');
  const [lastName, setLastName] = useState((selectedUser?.name || '').split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(selectedUser?.email || '');
  const [phone, setPhone] = useState(selectedUser?.phone || '');
  const [gender, setGender] = useState<'male'|'female'|'other'|''>('');
  const [birthDate, setBirthDate] = useState('');
  const [avatar, setAvatar] = useState(selectedUser?.avatar || '');
  const [city, setCity] = useState(selectedUser?.location?.city || '');
  const [country, setCountry] = useState(selectedUser?.location?.country || '');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [bio, setBio] = useState(selectedUser?.bio || '');
  const [interests, setInterests] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [language, setLanguage] = useState<'he'|'en'|''>('');

  const handleSave = async () => {
    const fullName = `${firstName} ${lastName}`.trim();
    if (!fullName || !email.trim() || !avatar.trim() || !city.trim() || !country.trim()) {
      Alert.alert(t('common:errorTitle'), t('common:genericTryAgain'));
      return;
    }
    const updated = {
      ...selectedUser!,
      name: fullName,
      avatar: avatar.trim(),
      bio: bio.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: { city: city.trim(), country: country.trim() },
      settings: { ...(selectedUser?.settings || {}), language: language || (selectedUser?.settings?.language as any) },
    };
    await setSelectedUserWithMode(updated as any, 'real');
    navigation.goBack();
  };

  const handlePickImage = async () => {
    const result = await pickImage();
    if (result.success && result.fileData) {
      setAvatar(result.fileData.uri);
    } else if (result.error) {
      Alert.alert(t('common:errorTitle'), result.error);
    }
  };

  const handleTakePhoto = async () => {
    const result = await takePhoto();
    if (result.success && result.fileData) {
      setAvatar(result.fileData.uri);
    } else if (result.error) {
      Alert.alert(t('common:errorTitle'), result.error);
    }
  };

  return (
    <View style={styles.pageWrapper}>
      {/* Top bar back button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          <Text style={styles.backText}>{t('common:back')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollContainer
        style={styles.container}
        contentStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        bounces={Platform.OS === 'ios'}
      >
      <Text style={styles.header}>{t('profile:banner.editTitle')}</Text>

      {/* Profile image picker */}
      <View style={styles.avatarRow}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person-outline" size={28} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.avatarButtons}>
          <TouchableOpacity style={styles.smallButton} onPress={handlePickImage}>
            <Ionicons name="image-outline" size={16} color={colors.white} />
            <Text style={styles.smallButtonText}>{t('profile:edit.gallery')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallButton, { backgroundColor: colors.primary }]} onPress={handleTakePhoto}>
            <Ionicons name="camera-outline" size={16} color={colors.white} />
            <Text style={styles.smallButtonText}>{t('profile:edit.camera')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Name */}
      <View style={styles.fieldRow}> 
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
          <Text style={styles.label}>{t('profile:edit.firstName')}</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder={t('profile:edit.firstName')} />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.lastName')}</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder={t('profile:edit.lastName')} />
        </View>
      </View>

      {/* Contact */}
      <View style={styles.fieldRow}> 
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
          <Text style={styles.label}>{t('profile:edit.email')}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder={'email@example.com'} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.phone')}</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder={'+9725XXXXXXXX'} keyboardType="phone-pad" />
        </View>
      </View>

      {/* Location */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('profile:banner.fields.avatar')}</Text>
        <TextInput style={styles.input} value={avatar} onChangeText={setAvatar} placeholder={t('profile:banner.fields.avatar')} />
      </View>
      <View style={styles.fieldRow}>
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
          <Text style={styles.label}>{t('profile:edit.city')}</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder={t('profile:edit.city')} />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.country')}</Text>
          <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder={t('profile:edit.country')} />
        </View>
      </View>
      <View style={styles.fieldRow}>
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
          <Text style={styles.label}>{t('profile:edit.street')}</Text>
          <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder={t('profile:edit.street')} />
        </View>
        <View style={[styles.fieldGroup, { width: 120, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.houseNumber')}</Text>
          <TextInput style={styles.input} value={houseNumber} onChangeText={setHouseNumber} placeholder={t('profile:edit.houseNumber')} />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.zipcode')}</Text>
          <TextInput style={styles.input} value={zipcode} onChangeText={setZipcode} placeholder={t('profile:edit.zipcode')} />
        </View>
      </View>

      {/* Personal */}
      <View style={styles.fieldRow}>
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
          <Text style={styles.label}>{t('profile:edit.gender')}</Text>
          <TextInput style={styles.input} value={gender} onChangeText={(v)=>setGender(v as any)} placeholder={t('profile:edit.genderPlaceholder')} />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.birthDate')}</Text>
          <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} placeholder={t('profile:edit.birthDatePlaceholder')} />
        </View>
      </View>

      {/* Social */}
      <View style={styles.fieldRow}>
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
          <Text style={styles.label}>{t('profile:edit.website')}</Text>
          <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder={'https://example.com'} autoCapitalize="none" />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.linkedin')}</Text>
          <TextInput style={styles.input} value={linkedin} onChangeText={setLinkedin} placeholder={'https://linkedin.com/in/...'} autoCapitalize="none" />
        </View>
      </View>
      <View style={styles.fieldRow}>
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
          <Text style={styles.label}>{t('profile:edit.facebook')}</Text>
          <TextInput style={styles.input} value={facebook} onChangeText={setFacebook} placeholder={'https://facebook.com/...'} autoCapitalize="none" />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.instagram')}</Text>
          <TextInput style={styles.input} value={instagram} onChangeText={setInstagram} placeholder={'https://instagram.com/...'} autoCapitalize="none" />
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.fieldRow}>
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
          <Text style={styles.label}>{t('profile:edit.preferredLanguage')}</Text>
          <TextInput style={styles.input} value={language} onChangeText={(v)=>setLanguage(v as any)} placeholder={t('profile:edit.preferredLanguagePlaceholder')} autoCapitalize="none" />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
          <Text style={styles.label}>{t('profile:edit.interests')}</Text>
          <TextInput style={styles.input} value={interests} onChangeText={setInterests} placeholder={t('profile:edit.interestsPlaceholder')} />
        </View>
      </View>

      <View style={[styles.fieldRow]}>
        <View style={[styles.fieldGroup, { flex: 1 }]}> 
        <Text style={styles.label}>{t('profile:banner.fields.city')}</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder={t('profile:banner.fields.city')} />
        </View>
        <View style={[styles.fieldGroup, { flex: 1, marginLeft: LAYOUT_CONSTANTS.SPACING.SM }]}> 
        <Text style={styles.label}>{t('profile:banner.fields.country')}</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} placeholder={t('profile:banner.fields.country')} />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>{t('profile:banner.fields.bio')}</Text>
        <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top' }]} value={bio} onChangeText={setBio} placeholder={t('profile:banner.fields.bio')} multiline />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={18} color={colors.white} />
        <Text style={styles.saveText}>{t('common:done')}</Text>
      </TouchableOpacity>
      </ScrollContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrapper: { flex: 1, backgroundColor: colors.backgroundPrimary },
  topBar: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: LAYOUT_CONSTANTS.SPACING.LG, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  backText: { color: colors.textPrimary, fontSize: FontSizes.body },
  container: { flex: 1 },
  content: { padding: LAYOUT_CONSTANTS.SPACING.LG },
  header: { fontSize: FontSizes.heading3, fontWeight: '700', color: colors.textPrimary, textAlign: 'right', marginBottom: LAYOUT_CONSTANTS.SPACING.LG },
  fieldGroup: { marginBottom: LAYOUT_CONSTANTS.SPACING.MD },
  fieldRow: { flexDirection: 'row-reverse', gap: LAYOUT_CONSTANTS.SPACING.SM },
  label: { fontSize: FontSizes.small, color: colors.textSecondary, marginBottom: 6, textAlign: 'right' },
  input: { backgroundColor: colors.cardBackground, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 8, textAlign: 'right' },
  avatarRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: LAYOUT_CONSTANTS.SPACING.MD, marginBottom: LAYOUT_CONSTANTS.SPACING.LG },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.backgroundSecondary },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarButtons: { flexDirection: 'row-reverse', gap: LAYOUT_CONSTANTS.SPACING.SM },
  smallButton: { backgroundColor: colors.pink, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  smallButtonText: { color: colors.white, fontSize: FontSizes.small, fontWeight: '600' },
  saveButton: { marginTop: LAYOUT_CONSTANTS.SPACING.LG, alignSelf: 'flex-start', backgroundColor: colors.pink, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  saveText: { color: colors.white, fontSize: FontSizes.body, fontWeight: '600' },
});


