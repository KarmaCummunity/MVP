"use strict";
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  GestureResponderEvent,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { motivationalQuotes, FontSizes } from "../globals/constants"; // Assuming this path is correct
import { TouchableOpacity } from "react-native";
import colors from "../globals/colors";
import { communityStats } from "../globals/fakeData"; // Assuming this path is correct
import { BubbleData } from "../globals/types";
// Get the dimensions of the device window for responsive sizing
const { width, height } = Dimensions.get("window");

// --- Constants ---
const NUM_BUBBLES = 30;
const MIN_SIZE = 50;
const MAX_SIZE = 150;
const MIN_NUMBER = 1;
const MAX_NUMBER = 100;

/**
 * Scales a number value to a bubble size within the defined MIN_SIZE and MAX_SIZE range.
 */
const scaleNumberToSize = (num: number): number => {
  const clampedNum = Math.max(MIN_NUMBER, Math.min(MAX_NUMBER, num));
  const scaledSize =
    MIN_SIZE +
    ((clampedNum - MIN_NUMBER) / (MAX_NUMBER - MIN_NUMBER)) *
      (MAX_SIZE - MIN_SIZE);
  return scaledSize;
};

/**
 * Checks if a newly generated bubble would overlap with existing bubbles.
 */
const isOverlapping = (
  x: number,
  y: number,
  size: number,
  bubbles: BubbleData[]
): boolean => {
  for (const b of bubbles) {
    const dx = b.x - x;
    const dy = b.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < (b.size + size) / 2.5) {
      return true;
    }
  }
  return false;
};

/**
 * Generates an array of BubbleData objects for both main and background bubbles.
 */
const generateBubbles = (): BubbleData[] => {
  console.log("Generating bubbles...");
  const bubbles: BubbleData[] = [];
  let attempts = 0;
  // Generate Main Bubbles
  attempts = 0;
  let index = 0;
  const mainBubbles: BubbleData[] = [];
  while (mainBubbles.length < NUM_BUBBLES && attempts < 1000) {
    const value = Math.floor(Math.random() * MAX_NUMBER) + 1;
    const size = scaleNumberToSize(value);
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size - 150); // Leave space for message
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    const delay = Math.random() * 1000;
    // const name = numberToWords(value);

    const name = communityStats[index++ % communityStats.length].name; // Use names from communityStats

    if (!isOverlapping(x, y, size, mainBubbles)) {
      mainBubbles.push({
        id: `main-${mainBubbles.length}`,
        size,
        x,
        y,
        value,
        name,
        directionX,
        directionY,
        delay,
        isBackground: false,
      });
    }
    attempts++;
  }

  return mainBubbles;
};

/**
 * BubbleComp component displaying animated bubbles and a message.
 */
const BubbleComp: React.FC = () => {
  const bubbles = useMemo(generateBubbles, []);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const handleBubblePress = useCallback((id: string) => {
    // console.log(`Bubble pressed: ${id}`);
    setSelectedBubbleId((prevId) => {
      const newId = prevId === id ? null : id;
      return newId;
    });
    setCurrentSentenceIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % motivationalQuotes.length;
      return newIndex;
    });
  }, []);

  const handleMessagePress = useCallback(() => {
    setCurrentSentenceIndex(
      (prevIndex) => (prevIndex + 1) % motivationalQuotes.length
    );
  }, []);

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.title}>הקהילה במספרים</Text>
      {/* Bubbles Container */}
      <View style={localStyles.bubblesContainer}>
        {bubbles.map((bubble) => (
          <AnimatedBubble
            key={bubble.id}
            {...bubble}
            isSelected={selectedBubbleId === bubble.id}
            onPress={handleBubblePress}
          />
        ))}
      </View>

      {/* Message Container - Fixed positioning */}
      <View style={localStyles.messageContainer}>
        <TouchableOpacity onPress={handleMessagePress}>
          <Text style={localStyles.messageText}>
            {motivationalQuotes[currentSentenceIndex]}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- AnimatedBubble Component ---

interface AnimatedBubbleProps extends BubbleData {
  isSelected: boolean;
  onPress: (id: string) => void;
}

const AnimatedBubble: React.FC<AnimatedBubbleProps> = ({
  size,
  x,
  y,
  value,
  name,
  directionX,
  directionY,
  delay,
  isBackground,
  isSelected,
  onPress,
  id,
}) => {
  const offset = useSharedValue(0);
  const animatedOpacity = useSharedValue(isBackground ? 0.2 : 1);
  const animatedScale = useSharedValue(1);

  // Floating animation effect
  useEffect(() => {
    offset.value = withRepeat(
      withDelay(
        delay,
        withTiming(1, {
          duration: 4000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, [delay, offset]);

  // Selection animation effects
  useEffect(() => {
    if (!isBackground) {
      animatedOpacity.value = withTiming(isSelected ? 1 : 0.7, {
        duration: 200,
      });
      animatedScale.value = withSpring(isSelected ? 1.1 : 1, {
        damping: 10,
        stiffness: 100,
      });
    }
  }, [isSelected, isBackground, animatedOpacity, animatedScale]);

  const handleInternalPress = useCallback(
    (event: GestureResponderEvent) => {
      if (!isBackground) {
        onPress(id);
      }
    },
    [id, isBackground, onPress]
  );

  // Animated style for the bubble
  const animatedStyle = useAnimatedStyle(() => {
    const dx =
      Math.sin(offset.value * Math.PI * 2) *
      (isBackground ? 8 : 5) *
      directionX;
    const dy =
      Math.cos(offset.value * Math.PI * 2) *
      (isBackground ? 8 : 5) *
      directionY;

    const backgroundColor = isBackground
      ? "rgba(0, 230, 255, 0.2)"
      : isSelected
      ? "rgba(250, 220, 220, 0.9)"
      : "rgba(173, 216, 255, 0.8)";
    const borderColor = isBackground
      ? "rgba(255, 255, 255, 0.5)"
      : isSelected
      ? "rgba(0, 0, 0, 1)"
      : "rgba(255, 255, 255, 0.9)";

    return {
      transform: [
        { translateX: x + 0.5 * dx },
        { translateY: y + 0.5 * dy },
        { scale: animatedScale.value },
      ],
      backgroundColor,
      borderColor,
      opacity: animatedOpacity.value,
    };
  });

  // Calculate font sizes dynamically based on bubble size
  const fontSize = Math.max(10, size / 7); // Slightly larger minimum
  const nameSize = Math.max(8, size / 10); // Better proportion

  return (
    <TouchableWithoutFeedback onPress={handleInternalPress}>
      <Animated.View
        style={[
          localStyles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            zIndex: isBackground ? 0 : isSelected ? 10 : 5, // Higher z-index for selected
          },
          animatedStyle,
        ]}
      >
        {!isBackground && (
          <View style={localStyles.textContainer}>
            <Text
              style={[
                localStyles.bubbleText,
                {
                  fontSize: size * 0.2, // Adjusted for better visibility
                  color: isSelected ? "#333" : "#000",
                  marginBottom: 2, // Add space between number and name
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {value?.toLocaleString()}
            </Text>
            <Text
              style={[
                localStyles.bubbleName,
                {
                  fontSize: nameSize,
                  color: isSelected ? "#555" : "#000",
                  lineHeight: nameSize * 1.2, // Better line height
                },
              ]}
              numberOfLines={3} // Allow more lines for Hebrew text
              adjustsFontSizeToFit
              minimumFontScale={0.3}
            >
              {name}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// --- StyleSheet ---
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#e6f7ff",
   backgroundColor: 'rgba(100, 255, 255, 0.9)'
  },
  bubblesContainer: {
    flex: 1,
    position: "relative",
  },
  bubble: {
    position: "absolute",
    borderWidth: 1,
    shadowColor: "#ffffff",
    shadowOpacity: 0.1,
    shadowOffset: { width: -1, height: -1 },
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    padding: 4, // Increased padding
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4, // Increased padding
    paddingVertical: 2,
    width: "100%", // Ensure full width usage
  },
  bubbleText: {
    fontWeight: "900",
    textAlign: "center",
    opacity: 1,
  },
  bubbleName: {
    textAlign: "center",
    opacity: 0.8, // Slightly more visible
    fontWeight: "bold", // Add some weight to make it more visible
  },
  messageContainer: {
    marginVertical: 80,
    marginHorizontal: 20,
    alignSelf: "center",
    zIndex: 1000, // Very high z-index to ensure it's always on top
    alignItems: "center",
    backgroundColor: "transparent", // Ensure no background interference
  },
  title: {
    textAlign: "center",
    fontSize: 25,
    marginTop: 10,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: colors.lightGray,
    textAlign: "center",
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    opacity: 0.78,
    elevation: 1, // For Android shadow
  },
});

export default BubbleComp;
