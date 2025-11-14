/**
 * CharacterSelection Component
 * 
 * A comprehensive character selection component that displays available character personas
 * for demo/real augmented data mode. Features include character cards with animations,
 * selection states, and proper accessibility support.
 * 
 * @author KC Development Team
 * @version 1.8.0
 * @since 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { characterTypes } from '../globals/characterTypes';

// TypeScript Interfaces
interface CharacterSelectionProps {
  /** Callback when a character is selected */
  onCharacterSelect: (characterId: string) => void;
  /** Callback when login with character is requested */
  onLoginWithCharacter: () => void;
  /** Currently selected character ID */
  selectedCharacter: string | null;
}

interface CharacterCardProps {
  character: any;
  isSelected: boolean;
  animationValue: Animated.Value;
  onSelect: (characterId: string) => void;
}

interface CharacterState {
  selectedCharacter: string | null;
  animationValues: Record<string, Animated.Value>;
}

/**
 * Individual Character Card Component
 * 
 * Displays a single character with selection state and animations
 */
const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isSelected,
  animationValue,
  onSelect,
}) => {
  const { t } = useTranslation(['auth', 'profile']);

  return (
    <TouchableOpacity
      style={[
        styles.characterCard,
        isSelected && styles.selectedCharacter,
      ]}
      onPress={() => onSelect(character.id)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${character.name} - ${character.description}`}
      accessibilityHint={isSelected ? 'Character selected' : 'Tap to select character'}
      accessibilityRole="button"
    >
      <Animated.View
        style={{
          transform: [{ scale: animationValue }],
          width: '100%',
          height: '100%',
        }}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: character.avatar }} style={styles.characterAvatar} />
          {isSelected && (
            <View style={styles.checkmarkContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#FF6B9D" />
            </View>
          )}
        </View>
        
        <View style={styles.characterInfo}>
          <Text style={[
            styles.characterName,
            isSelected && styles.selectedCharacterName
          ]}>
            {character.name}
          </Text>
          
          <Text style={[
            styles.characterDescription,
            isSelected && styles.selectedCharacterDescription
          ]}>
            {character.description}
          </Text>
          
          <View style={styles.characterStats}>
            <Text style={[
              styles.characterStat,
              isSelected && styles.selectedCharacterStat
            ]}>
              💎 {character.karmaPoints} {t('profile:stats.karmaPointsSuffix')}
            </Text>
            <Text style={[
              styles.characterStat,
              isSelected && styles.selectedCharacterStat
            ]}>
              📍 {character.location.city}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * CharacterSelection Component
 * 
 * Handles the complete character selection flow including:
 * - Character card display with animations
 * - Selection state management
 * - Login button with proper disabled states
 * - Error handling for missing character data
 */
const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  onCharacterSelect,
  onLoginWithCharacter,
  selectedCharacter,
}) => {
  const { t } = useTranslation(['auth']);
  
  // State management
  const [characterState, setCharacterState] = useState<CharacterState>({
    selectedCharacter: null,
    animationValues: {},
  });

  // Initialize animation values for all characters
  useEffect(() => {
    const animationValues = characterTypes.reduce((acc, character) => {
      acc[character.id] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>);

    setCharacterState(prev => ({
      ...prev,
      animationValues,
    }));
  }, []);

  // Update selected character when prop changes
  useEffect(() => {
    setCharacterState(prev => ({
      ...prev,
      selectedCharacter,
    }));
  }, [selectedCharacter]);

  /**
   * Handles character selection with animation
   */
  const handleCharacterSelect = (characterId: string) => {
    const currentSelected = characterState.selectedCharacter;
    const animationValue = characterState.animationValues[characterId];

    if (currentSelected === characterId) {
      // Deselect character
      setCharacterState(prev => ({ ...prev, selectedCharacter: null }));
      console.log('🔐 CharacterSelection - Character deselected:', characterId);
      
      Animated.spring(animationValue, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      // Select character
      setCharacterState(prev => ({ ...prev, selectedCharacter: characterId }));
      console.log('🔐 CharacterSelection - Character selected:', characterId);
      
      Animated.spring(animationValue, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    }

    // Notify parent component
    onCharacterSelect(characterId);
  };

  /**
   * Handles login with selected character
   */
  const handleLoginWithCharacter = () => {
    if (!characterState.selectedCharacter) {
      return;
    }
    onLoginWithCharacter();
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.characterTitle}>
          {t('auth:characters.selectTitle')}
        </Text>
        <Text style={styles.characterSubtitle}>
          {t('auth:characters.selectSubtitle')}
        </Text>
      </View>

      {/* Characters Grid */}
      <View style={styles.charactersSection}>
        <ScrollView 
          horizontal 
          style={styles.charactersContainer} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.charactersContent}
          accessible={true}
          accessibilityLabel="Character selection list"
        >
          {characterTypes && characterTypes.length > 0 ? (
            characterTypes.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={characterState.selectedCharacter === character.id}
                animationValue={characterState.animationValues[character.id] || new Animated.Value(1)}
                onSelect={handleCharacterSelect}
              />
            ))
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {t('auth:characters.loadError')}
              </Text>
              <Text style={styles.errorSubtext}>
                characterTypes length: {characterTypes?.length || 'undefined'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Login Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.characterButton,
            !characterState.selectedCharacter && styles.disabledButton
          ]}
          onPress={handleLoginWithCharacter}
          disabled={!characterState.selectedCharacter}
          activeOpacity={characterState.selectedCharacter ? 0.8 : 1}
          accessible={true}
          accessibilityLabel={
            characterState.selectedCharacter 
              ? t('auth:characters.loginAsSelected')
              : t('auth:characters.selectTitle')
          }
          accessibilityHint={
            characterState.selectedCharacter 
              ? 'Login with selected character'
              : 'Select a character first'
          }
          accessibilityRole="button"
        >
          <Text style={[
            styles.characterButtonText,
            !characterState.selectedCharacter && styles.disabledButtonText
          ]}>
            {characterState.selectedCharacter 
              ? t('auth:characters.loginAsSelected') 
              : t('auth:characters.selectTitle')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  headerSection: {
    marginBottom: 15,
    alignItems: 'center',
  },
  characterTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 5,
    textAlign: 'center',
  },
  characterSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  charactersSection: {
    flex: 1,
    marginBottom: 20,
  },
  charactersContainer: {
    flex: 1,
  },
  charactersContent: {
    paddingHorizontal: 15,
  },
  characterCard: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 12 : 16,
    marginRight: 12,
    marginBottom: 12,
    marginTop: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
    minHeight: Platform.OS === 'web' ? 180 : 220,
    width: Platform.OS === 'web' 
      ? Math.max(Dimensions.get('window').width * 0.28, 120)
      : Math.max(Dimensions.get('window').width * 0.3, 130),
    maxWidth: Platform.OS === 'web' ? 150 : 170,
  },
  selectedCharacter: {
    backgroundColor: 'rgba(255, 240, 245, 0.95)',
    transform: [{ scale: 1.05 }],
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 8px rgba(255, 107, 157, 0.3)',
    } : {
      shadowColor: '#FF6B9D',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    }),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  characterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    })
  },
  characterInfo: {
    alignItems: 'center',
    width: '100%',
    flex: 1,
    justifyContent: 'space-between',
  },
  characterName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 6,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  characterDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 16,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  characterStats: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  characterStat: {
    fontSize: 10,
    color: '#888888',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  selectedCharacterName: {
    color: '#FF6B9D',
    fontWeight: '700',
  },
  selectedCharacterDescription: {
    color: '#FF6B9D',
  },
  selectedCharacterStat: {
    color: '#FF6B9D',
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  characterButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
    maxWidth: Dimensions.get('window').width * 0.9, // 90% of screen width
  },
  characterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#999999',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default CharacterSelection;
