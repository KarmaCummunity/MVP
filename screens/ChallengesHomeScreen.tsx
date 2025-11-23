// Challenges Home Screen - מסך הבית של האתגרים
// מועתק מ-HomeScreen של TimrsApp ומותאם לעבודה עם KC-MVP-server
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Challenge, ChallengeFormData } from '../types/challenges';
import { ChallengeService } from '../utils/challengeService';
import { ChallengeCard } from '../components/ChallengeCard';
import { ChallengeForm } from '../components/ChallengeForm';
import { Ionicons } from '@expo/vector-icons';
import colors from '../globals/colors';
import apiService from '../utils/apiService';
import { useUser } from '../stores/userStore';

export default function ChallengesHomeScreen() {
  const { selectedUser } = useUser();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  
  // Refs for debouncing and preventing memory leaks
  const lastUpdateTime = useRef<number>(0);
  const updateDebounceMs = 5000; // עדכון רק כל 5 שניות

  // טעינת אתגרים
  useEffect(() => {
    loadChallenges();
  }, []);

  // עדכון אוטומטי כל שנייה
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadChallenges = async () => {
    if (!selectedUser?.id) {
      // console removed
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.getChallenges(selectedUser.id);
      if (result.success && result.data) {
        // המרת תאריכים מ-string ל-number אם צריך
        const parsedChallenges = result.data.map((c: any) => ({
          ...c,
          startDate: typeof c.start_date === 'number' ? c.start_date : parseInt(c.start_date, 10),
          timeUnit: c.time_unit,
          customResetAmount: c.custom_reset_amount,
          currentValue: c.current_value,
          lastCalculated: typeof c.last_calculated === 'number' ? c.last_calculated : parseInt(c.last_calculated, 10),
          currentStreak: c.current_streak,
          bestStreak: c.best_streak,
          resetCount: c.reset_count,
          lastResetDate: typeof c.last_reset_date === 'number' ? c.last_reset_date : parseInt(c.last_reset_date, 10),
          userId: c.user_id,
        }));
        setChallenges(parsedChallenges);
      } else {
        console.error('Error loading challenges:', result.error);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChallenge = () => {
    setEditingChallenge(null);
    setIsFormVisible(true);
  };

  const handleEditChallenge = useCallback((challenge: Challenge) => {
    setEditingChallenge(challenge);
    setIsFormVisible(true);
  }, []);

  const handleSaveChallenge = async (data: ChallengeFormData) => {
    if (!selectedUser?.id) return;

    try {
      if (editingChallenge) {
        // עריכת אתגר קיים
        const updatedChallenge: Challenge = {
          ...editingChallenge,
          name: data.name,
          timeUnit: data.timeUnit,
          customResetAmount: data.customResetAmount,
        };
        await apiService.updateChallenge(
          editingChallenge.id,
          selectedUser.id,
          updatedChallenge
        );
      } else {
        // יצירת אתגר חדש
        await apiService.createChallenge({
          name: data.name,
          timeUnit: data.timeUnit,
          customResetAmount: data.customResetAmount,
          userId: selectedUser.id,
        });
      }
      await loadChallenges();
      setIsFormVisible(false);
      setEditingChallenge(null);
    } catch (error) {
      console.error('Error saving challenge:', error);
      Alert.alert('שגיאה', 'לא הצלחנו לשמור את האתגר');
    }
  };

  const handleUpdateChallenge = useCallback(async (challenge: Challenge) => {
    try {
      await apiService.updateChallenge(challenge.id, challenge.userId, challenge);
      await loadChallenges();
    } catch (error) {
      console.error('Error updating challenge:', error);
      Alert.alert('שגיאה', 'לא הצלחנו לעדכן את האתגר');
    }
  }, []);

  const handleDeleteChallenge = useCallback(async (challengeId: string) => {
    if (!selectedUser?.id) return;

    try {
      await apiService.deleteChallenge(challengeId, selectedUser.id);
      await loadChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      Alert.alert('שגיאה', 'לא הצלחנו למחוק את האתגר');
    }
  }, [selectedUser]);

  const handleShowResetHistory = useCallback((challengeId: string, challengeName: string) => {
    // TODO: הוסף מסך היסטוריית איפוסים
    Alert.alert('היסטוריית איפוסים', `מציג היסטוריה של ${challengeName}`);
  }, []);

  const handleShowRecordBreaks = useCallback((challengeId?: string, challengeName?: string) => {
    // TODO: הוסף מסך שיאים
    if (challengeName) {
      Alert.alert('שיאים', `מציג שיאים של ${challengeName}`);
    } else {
      Alert.alert('שיאים', 'מציג כל השיאים');
    }
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.emptyTitle}>אין עדיין אתגרים</Text>
      <Text style={styles.emptySubtitle}>
        לחץ על הכפתור למטה כדי ליצור אתגר ראשון
      </Text>
    </View>
  );

  const renderChallenge = useCallback(
    ({ item }: { item: Challenge }) => (
      <ChallengeCard
        challenge={item}
        onUpdate={handleUpdateChallenge}
        onDelete={handleDeleteChallenge}
        onEdit={handleEditChallenge}
        onShowResetHistory={handleShowResetHistory}
        onShowRecordBreaks={handleShowRecordBreaks}
      />
    ),
    [
      handleUpdateChallenge,
      handleDeleteChallenge,
      handleEditChallenge,
      handleShowResetHistory,
      handleShowRecordBreaks,
    ]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>טוען אתגרים...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>האתגרים שלי</Text>
            <Text style={styles.headerSubtitle}>
              {challenges.length} {challenges.length === 1 ? 'אתגר' : 'אתגרים'}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={challenges}
        renderItem={renderChallenge}
        keyExtractor={item => item.id}
        extraData={refreshKey}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          challenges.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* כפתור FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddChallenge}>
        <Ionicons name="add" size={32} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#F8F9FA',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 62,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
});

