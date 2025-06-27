import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import BubbleComp from '../components/BubbleComp';
import colors from '../globals/colors';
import PostsReelsScreen from '../components/PostsReelsScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT - 50;
const CLOSED_POSITION = PANEL_HEIGHT - 60;
const OPEN_POSITION = 0;
const MID_POSITION = PANEL_HEIGHT / 2; // Middle snap point for panel

/**
 * DragRevealScreen
 * 
 * A screen with a draggable bottom panel that can be dragged once per focus session.
 * After the first drag, further dragging is disabled until the screen is left and refocused.
 */
export default function DragRevealScreen() {
  // Shared animated value for panel vertical translation
  const translateY = useSharedValue(CLOSED_POSITION);

  // Flag to track whether the gesture is active (for UI feedback)
  const isGestureActive = useSharedValue(false);

  // Flag to control whether dragging is allowed; resets on screen focus
  const canDrag = useSharedValue(true);

  /**
   * Reset the panel position and drag permission whenever screen comes into focus.
   */
  useFocusEffect(
    React.useCallback(() => {
      console.log('[DragRevealScreen] Screen focused: Resetting panel position and enabling drag');
      translateY.value = withSpring(CLOSED_POSITION, {
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      });
      canDrag.value = true;
    }, [])
  );

  /**
   * Gesture handler for the panel drag.
   * Disables dragging after first completed drag until screen is refocused.
   */
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (!canDrag.value) {
        console.log('[DragRevealScreen] Drag attempt blocked: dragging disabled');
        return;
      }
      isGestureActive.value = true;
      console.log('[DragRevealScreen] Drag started');
    })
    .onUpdate((event) => {
      console.log('[DragRevealScreen] Drag update');
      if (!canDrag.value) return;
      const newPosition = translateY.value + event.translationY;
      translateY.value = Math.max(
        OPEN_POSITION - 50,      // Allow slight overshoot at top
        Math.min(CLOSED_POSITION + 50, newPosition) // Slight overshoot at bottom
      );
    })
    .onEnd((event) => {
      if (!canDrag.value) return;

      isGestureActive.value = false;

      const currentPosition = translateY.value;
      const velocity = event.velocityY;

      let targetPosition;

      // Use velocity for fast swipe detection and snapping
      if (Math.abs(velocity) > 800) {
        targetPosition = velocity < 0 ? OPEN_POSITION : CLOSED_POSITION;
      } else {
        // Snap to nearest position based on current position
        if (currentPosition < PANEL_HEIGHT * 0.25) targetPosition = OPEN_POSITION;
        else if (currentPosition < PANEL_HEIGHT * 0.75) targetPosition = MID_POSITION;
        else targetPosition = CLOSED_POSITION;
      }

      console.log(`[DragRevealScreen] Drag ended: Snapping to position ${targetPosition}`);

      translateY.value = withSpring(targetPosition, {
        damping: 25,
        stiffness: 200,
        mass: 0.6,
      });

      // Disable further dragging after first drag ends
      canDrag.value = false;
      console.log('[DragRevealScreen] Dragging disabled until screen refocus');
    })
    .onFinalize(() => {
      if (!canDrag.value) return;
      isGestureActive.value = false;
      console.log('[DragRevealScreen] Drag gesture finalized');
    });

  // Animated styles for panel movement and scale effect during drag
  const animatedStyle = useAnimatedStyle(() => {
    const scale = isGestureActive.value
      ? interpolate(translateY.value, [OPEN_POSITION, CLOSED_POSITION], [1.02, 1], Extrapolation.CLAMP)
      : 1;

    return {
      transform: [{ translateY: translateY.value }, { scale }],
    };
  });

  // Animated style for the draggable handle's appearance
  const handleAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = isGestureActive.value ? '#999' : '#ccc';
    const width = interpolate(
      translateY.value,
      [CLOSED_POSITION, OPEN_POSITION],
      [60, 80],
      Extrapolation.CLAMP
    );

    return {
      backgroundColor,
      width,
    };
  });

  return (
    <View style={styles.container}>
      <BubbleComp />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.panel, animatedStyle]}>
          <Animated.View style={[styles.panelHandle, handleAnimatedStyle]} />
          <PostsReelsScreen />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  panel: {
    height: PANEL_HEIGHT,
    width: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  panelHandle: {
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
});
