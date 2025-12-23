import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ScrollView,
    RefreshControl,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import { FontSizes, LAYOUT_CONSTANTS } from '../globals/constants';
import { AdminStackParamList } from '../globals/types';
import { useUser } from '../stores/userStore';
import { apiService } from '../utils/apiService';
import { useAdminProtection } from '../hooks/useAdminProtection';

interface AdminFilesScreenProps {
    navigation: NavigationProp<AdminStackParamList>;
}

interface GeneralFile {
    id: string;
    name: string;
    url: string;
    folder_path: string;
    created_at: string;
    mime_type?: string;
}

export default function AdminFilesScreen({ navigation }: AdminFilesScreenProps) {
    useAdminProtection();
    const { selectedUser } = useUser();
    const [files, setFiles] = useState<GeneralFile[]>([]);
    const [currentFolder, setCurrentFolder] = useState('/');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const [newFile, setNewFile] = useState({ name: '', url: '' });

    useEffect(() => {
        loadFiles();
    }, [currentFolder]);

    const loadFiles = async () => {
        try {
            setIsLoading(true);
            const res = await apiService.adminFiles.getAll({ folder: currentFolder });
            if (res.success && Array.isArray(res.data)) {
                setFiles(res.data);
            } else {
                setFiles([]);
            }
        } catch (e) {
            Alert.alert('שגיאה', 'לא ניתן לטעון קבצים');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpen = (url: string) => {
        Linking.openURL(url).catch(() => Alert.alert('שגיאה', 'לא ניתן לפתוח את הקישור'));
    };

    const handleDelete = (file: GeneralFile) => {
        // Check hierarchy - simplified to checking if admin
        Alert.alert('מחיקה', `למחוק את ${file.name}?`, [
            { text: 'ביטול' },
            {
                text: 'מחק',
                style: 'destructive',
                onPress: async () => {
                    setIsMutating(true);
                    const res = await apiService.adminFiles.delete(file.id);
                    setIsMutating(false);
                    if (res.success) loadFiles();
                    else Alert.alert('שגיאה', 'מחיקה נכשלה');
                }
            }
        ]);
    };

    const handleUpload = async () => {
        if (!newFile.name || !newFile.url) {
            Alert.alert('שגיאה', 'חובה למלא שם וקישור');
            return;
        }

        setIsMutating(true);
        const res = await apiService.adminFiles.create({
            name: newFile.name,
            url: newFile.url,
            folder_path: currentFolder,
            uploaded_by: selectedUser?.id
        });
        setIsMutating(false);

        if (res.success) {
            setIsModalVisible(false);
            setNewFile({ name: '', url: '' });
            loadFiles();
        } else {
            Alert.alert('שגיאה', 'הוספה נכשלה');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>קבצים משותפים</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                    <Ionicons name="add" size={24} color="white" />
                    <Text style={styles.addText}>הוסף קובץ</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.folderBar}>
                <Ionicons name="folder-open" size={20} color={colors.primary} />
                <Text style={styles.folderName}>{currentFolder === '/' ? 'תיקייה ראשית' : currentFolder}</Text>
            </View>

            {isLoading ? (
                <ActivityIndicator style={{ marginTop: 20 }} size="large" color={colors.primary} />
            ) : (
                <ScrollView
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadFiles} />}
                >
                    {files.map((f) => (
                        <View key={f.id} style={styles.fileItem}>
                            <TouchableOpacity style={styles.fileInfo} onPress={() => handleOpen(f.url)}>
                                <Ionicons name="document-text-outline" size={30} color={colors.secondary} />
                                <View style={styles.textContainer}>
                                    <Text style={styles.fileName}>{f.name}</Text>
                                    <Text style={styles.fileDate}>{new Date(f.created_at).toLocaleDateString('he-IL')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(f)} style={styles.deleteBtn}>
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {files.length === 0 && (
                        <Text style={styles.emptyText}>אין קבצים בתיקייה זו</Text>
                    )}
                </ScrollView>
            )}

            <Modal visible={isModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>הוספת קובץ (קישור)</Text>

                        <Text style={styles.label}>שם הקובץ</Text>
                        <TextInput
                            style={styles.input}
                            value={newFile.name}
                            onChangeText={t => setNewFile({ ...newFile, name: t })}
                            placeholder="מסמך נהלים..."
                        />

                        <Text style={styles.label}>קישור (URL)</Text>
                        <TextInput
                            style={styles.input}
                            value={newFile.url}
                            onChangeText={t => setNewFile({ ...newFile, url: t })}
                            placeholder="https://drive.google.com/..."
                            autoCapitalize="none"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelBtn}>
                                <Text>ביטול</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpload} style={styles.saveBtn} disabled={isMutating}>
                                {isMutating ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white' }}>שמור</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundSecondary },
    header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background },
    title: { fontSize: 22, fontWeight: 'bold' },
    addButton: { flexDirection: 'row', backgroundColor: colors.primary, padding: 8, borderRadius: 8 },
    addText: { color: 'white', marginLeft: 5, fontWeight: 'bold' },
    folderBar: { flexDirection: 'row', padding: 15, alignItems: 'center', backgroundColor: '#eef' },
    folderName: { marginLeft: 10, fontWeight: 'bold', color: colors.primary },
    list: { padding: 15 },
    fileItem: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between' },
    fileInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    textContainer: { marginLeft: 15 },
    fileName: { fontSize: 16, fontWeight: 'bold', textAlign: 'left' },
    fileDate: { fontSize: 12, color: '#888', textAlign: 'left' },
    deleteBtn: { padding: 10 },
    emptyText: { textAlign: 'center', marginTop: 30, color: '#999' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { marginBottom: 5, fontWeight: 'bold', textAlign: 'left' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 15, textAlign: 'right' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelBtn: { padding: 10 },
    saveBtn: { backgroundColor: colors.primary, padding: 10, borderRadius: 5, width: 100, alignItems: 'center' },
});
