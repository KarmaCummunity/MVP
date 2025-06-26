import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import BubbleComp from '../components/BubbleComp';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT - 50;
const CLOSED_POSITION = PANEL_HEIGHT - 60;
const OPEN_POSITION = 0;
const MID_POSITION = PANEL_HEIGHT / 2; // Add a middle snap point

export default function DragRevealScreen() {
  const translateY = useSharedValue(CLOSED_POSITION);
  const isGestureActive = useSharedValue(false);

  useFocusEffect(
    React.useCallback(() => {
      translateY.value = withSpring(CLOSED_POSITION, { 
        damping: 20, 
        stiffness: 150,
        mass: 0.8
      });
    }, [])
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      // More responsive dragging - follow finger position more directly
      const newPosition = translateY.value + event.translationY;
      
      // Allow both up and down movement with smooth boundaries
      translateY.value = Math.max(
        OPEN_POSITION - 50, // Allow slight over-drag at top
        Math.min(CLOSED_POSITION + 50, newPosition) // Allow slight over-drag at bottom
      );
    })
    .onEnd((event) => {
      isGestureActive.value = false;
      
      const currentPosition = translateY.value;
      const velocity = event.velocityY;
      
      // More intelligent snapping with multiple positions
      let targetPosition;
      
      // High velocity threshold for quick snaps
      if (Math.abs(velocity) > 800) {
        if (velocity < 0) {
          // Fast upward swipe
          targetPosition = OPEN_POSITION;
        } else {
          // Fast downward swipe
          targetPosition = CLOSED_POSITION;
        }
      } else {
        // Position-based snapping with three zones
        if (currentPosition < PANEL_HEIGHT * 0.25) {
          targetPosition = OPEN_POSITION;
        } else if (currentPosition < PANEL_HEIGHT * 0.75) {
          targetPosition = MID_POSITION;
        } else {
          targetPosition = CLOSED_POSITION;
        }
      }
      
      // Smoother spring animation
      translateY.value = withSpring(targetPosition, {
        damping: 25,
        stiffness: 200,
        mass: 0.6,
      });
    })
    .onFinalize(() => {
      isGestureActive.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => {
    // Add subtle scaling effect during drag
    const scale = isGestureActive.value 
      ? interpolate(translateY.value, [OPEN_POSITION, CLOSED_POSITION], [1.02, 1], Extrapolation.CLAMP)
      : 1;

    return {
      transform: [
        { translateY: translateY.value },
        { scale }
      ],
    };
  });

  // Animated opacity for content based on panel position
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [CLOSED_POSITION, MID_POSITION, OPEN_POSITION],
      [0.3, 0.7, 1],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  // Animated handle style
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
          {/* Animated handle */}
          <Animated.View style={[styles.panelHandle, handleAnimatedStyle]} />

          {/* Content with fade effect */}
          <Animated.View style={[styles.panelContent, contentAnimatedStyle]}>
            <Text style={styles.panelHeading}>ברוך הבא</Text>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.panelImage}
              resizeMode="cover"
            />
            <Text style={styles.panelDescription}>
              זה אזור שנפתח כשגוררים את הפאנל כלפי מעלה. כאן תוכל להציג מידע נוסף, טפסים, קישורים ועוד.
            </Text>
            
            {/* Additional visual feedback */}
            <View style={styles.progressIndicator}>
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  panel: {
    height: PANEL_HEIGHT,
    width: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 30,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
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
  panelContent: {
    alignItems: 'center',
  },
  panelHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  panelImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  panelDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  progressIndicator: {
    flexDirection: 'row',
    marginTop: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
});