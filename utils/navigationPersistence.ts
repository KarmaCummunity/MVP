// navigationPersistence.ts
// Utility for saving and loading React Navigation state
// Supports both web (localStorage) and native (AsyncStorage)
// Session-only persistence - state is cleared when app closes

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationState } from '@react-navigation/native';
import { logger } from './loggerService';

const LOG_SOURCE = 'NavigationPersistence';

// Storage key format: nav_state_{mode}_{userId}_{platform}
const getStorageKey = (mode: string, userId: string | null, platform: string): string => {
  const userIdPart = userId || 'guest';
  return `nav_state_${mode}_${userIdPart}_${platform}`;
};

// Debounce function to limit save frequency
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 300; // ms

/**
 * Save navigation state to persistent storage
 * Uses debouncing to avoid excessive I/O operations
 */
export const saveNavigationState = (
  state: NavigationState | undefined,
  mode: string,
  userId: string | null
): void => {
  if (!state) {
    return;
  }

  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Debounce the save operation
  saveTimeout = setTimeout(() => {
    try {
      const storageKey = getStorageKey(mode, userId, Platform.OS);
      const stateString = JSON.stringify(state);

      if (Platform.OS === 'web') {
        // Web: synchronous localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(storageKey, stateString);
          logger.debug(LOG_SOURCE, 'Navigation state saved to localStorage', {
            key: storageKey,
            stateSize: stateString.length,
          });
        }
      } else {
        // Native: asynchronous AsyncStorage
        AsyncStorage.setItem(storageKey, stateString).catch((error) => {
          logger.error(LOG_SOURCE, 'Failed to save navigation state to AsyncStorage', { error });
        });
        logger.debug(LOG_SOURCE, 'Navigation state saved to AsyncStorage', {
          key: storageKey,
          stateSize: stateString.length,
        });
      }
    } catch (error) {
      logger.error(LOG_SOURCE, 'Error saving navigation state', { error });
    }
  }, DEBOUNCE_DELAY);
};

/**
 * Load navigation state from persistent storage
 * Returns null if no state is found or if there's an error
 */
export const loadNavigationState = async (
  mode: string,
  userId: string | null
): Promise<NavigationState | null> => {
  try {
    const storageKey = getStorageKey(mode, userId, Platform.OS);
    let stateString: string | null = null;

    if (Platform.OS === 'web') {
      // Web: synchronous localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        stateString = window.localStorage.getItem(storageKey);
      }
    } else {
      // Native: asynchronous AsyncStorage
      stateString = await AsyncStorage.getItem(storageKey);
    }

    if (!stateString) {
      logger.debug(LOG_SOURCE, 'No saved navigation state found', { key: storageKey });
      return null;
    }

    const state = JSON.parse(stateString) as NavigationState;
    logger.debug(LOG_SOURCE, 'Navigation state loaded from storage', {
      key: storageKey,
      stateSize: stateString.length,
    });

    return state;
  } catch (error) {
    logger.error(LOG_SOURCE, 'Error loading navigation state', { error });
    return null;
  }
};

/**
 * Clear navigation state for a specific mode and user
 * Useful when user logs out or mode changes
 */
export const clearNavigationState = async (
  mode: string,
  userId: string | null
): Promise<void> => {
  try {
    const storageKey = getStorageKey(mode, userId, Platform.OS);

    if (Platform.OS === 'web') {
      // Web: synchronous localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(storageKey);
        logger.debug(LOG_SOURCE, 'Navigation state cleared from localStorage', { key: storageKey });
      }
    } else {
      // Native: asynchronous AsyncStorage
      await AsyncStorage.removeItem(storageKey);
      logger.debug(LOG_SOURCE, 'Navigation state cleared from AsyncStorage', { key: storageKey });
    }
  } catch (error) {
    logger.error(LOG_SOURCE, 'Error clearing navigation state', { error });
  }
};

/**
 * Clear all navigation states (useful for cleanup)
 */
export const clearAllNavigationStates = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Web: remove all keys matching the pattern
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(window.localStorage);
        keys.forEach((key) => {
          if (key.startsWith('nav_state_')) {
            window.localStorage.removeItem(key);
          }
        });
        logger.debug(LOG_SOURCE, 'All navigation states cleared from localStorage');
      }
    } else {
      // Native: get all keys and remove matching ones
      const allKeys = await AsyncStorage.getAllKeys();
      const navKeys = allKeys.filter((key) => key.startsWith('nav_state_'));
      if (navKeys.length > 0) {
        await AsyncStorage.multiRemove(navKeys);
        logger.debug(LOG_SOURCE, 'All navigation states cleared from AsyncStorage', {
          count: navKeys.length,
        });
      }
    }
  } catch (error) {
    logger.error(LOG_SOURCE, 'Error clearing all navigation states', { error });
  }
};

