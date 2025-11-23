// Challenge Card Component - מועתק מ-TimerCard של TimrsApp
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Challenge, ChallengeResetLog } from '../types/challenges';
import { ChallengeService } from '../utils/challengeService';
import apiService from '../utils/apiService';

interface ChallengeCardProps {
  challenge: Challenge;
  onUpdate: (challenge: Challenge) => void;
  onDelete: (challengeId: string) => void;
  onEdit: (challenge: Challenge) => void;
  onShowResetHistory?: (challengeId: string, challengeName: string) => void;
  onShowRecordBreaks?: (challengeId: string, challengeName: string) => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onUpdate,
  onDelete,
  onEdit,
  onShowResetHistory,
  onShowRecordBreaks,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const currentValue = ChallengeService.calculateElapsedTime(challenge);
  const currentStreak = ChallengeService.calculateCurrentStreak(challenge);
  const smartDisplay = ChallengeService.getSmartTimeDisplay(currentValue, challenge.timeUnit);
  const smartStreakDisplay = ChallengeService.getSmartTimeDisplay(currentStreak, challenge.timeUnit);
  const smartBestDisplay = ChallengeService.getSmartTimeDisplay(challenge.bestStreak, challenge.timeUnit);

  const handleCustomReset = async (amount: number, reason: string, mood: number) => {
    const resetValue = ChallengeService.calculateElapsedTime(challenge);
    
    const updatedChallenge = { ...challenge, customResetAmount: amount };
    const { challenge: resetChallenge, recordBreak } = ChallengeService.customReset(updatedChallenge);
    
    try {
      // עדכון האתגר בשרת
      await apiService.updateChallenge(challenge.id, challenge.userId, resetChallenge);
      
      // שמירת לוג איפוס
      await apiService.createResetLog({
        challengeId: challenge.id,
        userId: challenge.userId,
        amountReduced: amount,
        reason: reason,
        mood: mood,
        valueBeforeReset: resetValue,
        valueAfterReset: Math.max(0, resetValue - amount),
      });
      
      // אם נשבר שיא
      if (recordBreak) {
        await apiService.createRecordBreak(recordBreak);
        Alert.alert(
          '🏆 שיא חדש!',
          `מזל טוב! שברת את השיא הקודם של ${recordBreak.oldRecord} ${ChallengeService.getTimeUnitLabel(challenge.timeUnit, recordBreak.oldRecord)}!`,
          [{ text: 'מעולה!' }]
        );
      }
      
      onUpdate(resetChallenge);
    } catch (error) {
      console.error('Error during custom reset:', error);
      Alert.alert('שגיאה', 'לא הצלחנו לשמור את האיפוס');
    }
  };

  const handleFullReset = useCallback(async () => {
    const resetValue = ChallengeService.calculateElapsedTime(challenge);
    
    Alert.alert(
      'איפוס מלא',
      'לאפס את האתגר לחלוטין?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'אישור',
          style: 'destructive',
          onPress: async () => {
            const resetChallenge = ChallengeService.fullReset(challenge);
            
            try {
              // עדכון בשרת
              await apiService.updateChallenge(challenge.id, challenge.userId, resetChallenge);
              
              // שמירת לוג איפוס מלא
              await apiService.createResetLog({
                challengeId: challenge.id,
                userId: challenge.userId,
                amountReduced: resetValue,
                reason: 'איפוס מלא',
                mood: 3,
                valueBeforeReset: resetValue,
                valueAfterReset: 0,
              });
              
              onUpdate(resetChallenge);
            } catch (error) {
              console.error('Error during full reset:', error);
              Alert.alert('שגיאה', 'לא הצלחנו לשמור את האיפוס, אך האתגר אופס');
              onUpdate(resetChallenge);
            }
          },
        },
      ],
    );
  }, [challenge, onUpdate]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'מחיקת אתגר',
      `למחוק את האתגר "${challenge.name}"?`,
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: () => onDelete(challenge.id),
        },
      ],
    );
  }, [challenge.id, challenge.name, onDelete]);

  const handleEdit = useCallback(() => {
    onEdit(challenge);
  }, [challenge, onEdit]);

  const handleShowHistory = useCallback(() => {
    onShowResetHistory?.(challenge.id, challenge.name);
  }, [challenge.id, challenge.name, onShowResetHistory]);

  const handleToggleDialog = useCallback(() => {
    setShowResetDialog(prev => !prev);
  }, []);

  const handleOpenDetails = useCallback(() => {
    setShowDetailsModal(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetailsModal(false);
  }, []);

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={handleOpenDetails}
      >
        <Text style={styles.challengeName}>{challenge.name}</Text>
        <Text style={styles.smartDisplay}>{smartDisplay}</Text>
      </TouchableOpacity>
      
      {/* קאונטרים וסטטיסטיקות */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statBox}
          onPress={handleShowHistory}>
          <Text style={styles.statLabel}>איפוסים</Text>
          <Text style={styles.statValue}>{challenge.resetCount}</Text>
        </TouchableOpacity>
        
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>סטריק</Text>
          <Text style={styles.statValue}>{smartStreakDisplay}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.statBox}
          onPress={() => onShowRecordBreaks?.(challenge.id, challenge.name)}>
          <Text style={styles.statLabel}>🏆</Text>
          <Text style={styles.statValue}>{smartBestDisplay}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.customResetButton]}
          onPress={handleToggleDialog}>
          <Text style={styles.buttonText}>איפוס מותאם</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.fullResetButton]}
          onPress={handleFullReset}>
          <Text style={styles.buttonText}>איפוס מלא</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    maxWidth: '48%',
  },
  cardHeader: {
    marginBottom: 10,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
    textAlign: 'right',
  },
  smartDisplay: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'right',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  customResetButton: {
    backgroundColor: '#FFA726',
  },
  fullResetButton: {
    backgroundColor: '#EF5350',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
  },
});

