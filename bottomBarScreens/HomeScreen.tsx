import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import BubbleComp from "../components/BubbleComp";
import colors from "../globals/colors";
import PostsReelsScreen from "../components/PostsReelsScreen";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PANEL_HEIGHT = SCREEN_HEIGHT - 50;
const CLOSED_POSITION = PANEL_HEIGHT - 60;
const OPEN_POSITION = 0;
const MID_POSITION = PANEL_HEIGHT / 2;

export default function HomeScreen() {
  const isFocused = useIsFocused();

  // Only show PostsReelsScreen if focused AND revealed
  const [isScreenRevel, setisScreenRevel] = useState(false);
  const shouldShowReels = isFocused && isScreenRevel;

  const translateY = useSharedValue(CLOSED_POSITION);
  const isGestureActive = useSharedValue(false);
  const canDrag = useSharedValue(true);

  // Store the starting position when gesture begins
  const startPosition = useSharedValue(CLOSED_POSITION);

  // Reset state immediately when screen loses focus
  React.useEffect(() => {
    if (!isFocused) {
      // console.log("[HomeScreen] Screen lost focus: Resetting reveal state");
      setisScreenRevel(false);
    }
  }, [isFocused]);

  useFocusEffect(
    React.useCallback(() => {
      // console.log("[HomeScreen] Screen focused: Resetting panel position and enabling drag");
      translateY.value = CLOSED_POSITION; // Set immediately without animation on focus
      canDrag.value = true;
      // Ensure isScreenRevel is false when screen comes into focus
      setisScreenRevel(false);

      // Then animate to position smoothly
      translateY.value = withSpring(CLOSED_POSITION, {
        damping: 20,
        stiffness: 150,
        mass: 0.8,
      });
    }, [])
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      if (!canDrag.value) {
        // console.log("[HomeScreen] Drag attempt blocked: dragging disabled");
        return;
      }
      isGestureActive.value = true;
      // Store the starting position
      startPosition.value = translateY.value;
      // console.log("[HomeScreen] Drag started from position:",startPosition.value);
    })
    .onUpdate((event) => {
      if (!canDrag.value) return;

      // Calculate new position based on start position + translation
      const newPosition = startPosition.value + event.translationY;

      // Apply constraints
      translateY.value = Math.max(
        OPEN_POSITION - 100,
        Math.min(CLOSED_POSITION + 50, newPosition)
      );
    })
    .onEnd((event) => {
      // console.log("[HomeScreen] Drag ended");

      if (!canDrag.value) return;

      // Use runOnJS to safely update React state
      
      isGestureActive.value = false;
      
      const currentPosition = translateY.value;
      const velocity = event.velocityY;
      // console.log("[HomeScreen] Current position:", currentPosition);
      let targetPosition;
      
      if (Math.abs(velocity) > 800) {
        targetPosition = velocity < 0 ? OPEN_POSITION - 30 : CLOSED_POSITION;
      } else {
        if (currentPosition < PANEL_HEIGHT * 0.25) {
          // console.log("[HomeScreen] Position is in the top quarter");
          targetPosition = OPEN_POSITION - 30;
          runOnJS(setisScreenRevel)(true);
          canDrag.value = false;
        // For half screen 
        // } else if (currentPosition < PANEL_HEIGHT * 0.75) {
        //   targetPosition = MID_POSITION;
        } else {
          // console.log("[HomeScreen] Position is in the bottom half");
          targetPosition = CLOSED_POSITION;
        }
      }

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
    const scale = isGestureActive.value
      ? interpolate(
          translateY.value,
          [OPEN_POSITION, CLOSED_POSITION],
          [1.02, 1],
          Extrapolation.CLAMP
        )
      : 1;

    return {
      transform: [{ translateY: translateY.value }, { scale }],
    };
  });

  const handleAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = isGestureActive.value ? "#999" : "#ccc";
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
      {/* <BubbleComp /> */}
      {!shouldShowReels && <BubbleComp />}

      {!shouldShowReels ? (
        <View>
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.panel, animatedStyle]}>
              <Animated.View
                style={[styles.panelHandle, handleAnimatedStyle]}
              />
              <PostsReelsScreen />
            </Animated.View>
          </GestureDetector>
        </View>
      ) : (
        <Animated.View style={[styles.panel, animatedStyle]}>
          <Animated.View style={[styles.panelHandle, handleAnimatedStyle]} />
          <PostsReelsScreen />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  panel: {
    height: PANEL_HEIGHT,
    width: "100%",
    backgroundColor: colors.white,
    position: "absolute",
    bottom: 10,
    borderTopLeftRadius: 250,
    borderTopRightRadius: 250,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  panelHandle: {
    height: 6,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
});
