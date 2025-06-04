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
import { sentences } from "../globals/constant"; // Assuming this path is correct

// Get the dimensions of the device window for responsive sizing
const { width, height } = Dimensions.get("window");
console.log(`[Dimensions] Screen width: ${width}, height: ${height}`);

// --- Constants ---
const NUM_BUBBLES = 30; // Number of main interactive bubbles
const NUM_BACKGROUND_BUBBLES = 200; // Number of non-interactive background bubbles
const MIN_SIZE = 50; // Minimum size for main bubbles
const MAX_SIZE = 150; // Maximum size for main bubbles
const MIN_NUMBER = 1; // Minimum number value for main bubbles
const MAX_NUMBER = 100000; // Maximum number value for main bubbles

// Interface for defining the structure of bubble data
interface BubbleData {
  id: string; // Unique identifier for the bubble
  size: number; // Diameter of the bubble
  x: number; // X-coordinate for initial position
  y: number; // Y-coordinate for initial position
  value: number | null; // Numeric value for main bubbles (null for background)
  name: string | null; // Word representation of the number for main bubbles (null for background)
  directionX: number; // X-axis movement direction (1 or -1)
  directionY: number; // Y-axis movement direction (1 or -1)
  delay: number; // Animation delay for staggered effects
  isBackground: boolean; // Flag to distinguish background bubbles from main bubbles
}

/**
 * Converts a number to its Hebrew word representation.
 * @param num The number to convert.
 * @returns The Hebrew word representation of the number.
 */
const numberToWords = (num: number): string => {
  // Define Hebrew units
  const units = [
    "",
    "אחת", // one
    "שתיים", // two
    "שלוש", // three
    "ארבע", // four
    "חמש", // five
    "שש", // six
    "שבע", // seven
    "שמונה", // eight
    "תשע", // nine
  ];
  // Define Hebrew tens
  const tens = [
    "",
    "עשר", // ten
    "עשרים", // twenty
    "שלושים", // thirty
    "ארבעים", // forty
    "חמישים", // fifty
    "שישים", // sixty
    "שבעים", // seventy
    "שמונים", // eighty
    "תשעים", // ninety
  ];
  // Define Hebrew teens (10-19)
  const teens = [
    "עשר", // ten (special case for 10)
    "אחת עשרה", // eleven
    "שתים עשרה", // twelve
    "שלוש עשרה", // thirteen
    "ארבע עשרה", // fourteen
    "חמש עשרה", // fifteen
    "שש עשרה", // sixteen
    "שבע עשרה", // seventeen
    "שמונה עשרה", // eighteen
    "תשע עשרה", // nineteen
  ];

  if (num === 0) {
    console.log("[numberToWords] Converting 0 to 'אפס'");
    return "אפס"; // Zero in Hebrew
  }

  let result = ""; // Stores the accumulated word representation
  let tempNum = num; // Use a temporary variable to manipulate the number

  // Helper function to add a part of the number to the result
  const addPart = (n: number, word: string) => {
    if (n > 0) {
      result += `${numberToWords(n)} ${word} `; // Recursively convert and append
      console.log(
        `[numberToWords] Adding part: ${n} ${word}, current result: ${result}`
      );
    }
  };

  // Handle thousands
  if (tempNum >= 1000) {
    const thousands = Math.floor(tempNum / 1000);
    result += thousands === 1 ? "אלף " : numberToWords(thousands) + " אלפים "; // "thousand" or "thousands"
    tempNum %= 1000; // Remove thousands from tempNum
    console.log(
      `[numberToWords] Handled thousands: ${thousands}, remaining num: ${tempNum}`
    );
  }

  // Handle hundreds
  if (tempNum >= 100) {
    const hundreds = Math.floor(tempNum / 100);
    result += hundreds === 1 ? "מאה " : numberToWords(hundreds) + " מאות "; // "hundred" or "hundreds"
    tempNum %= 100; // Remove hundreds from tempNum
    console.log(
      `[numberToWords] Handled hundreds: ${hundreds}, remaining num: ${tempNum}`
    );
  }

  // Handle tens and units
  if (tempNum >= 20) {
    const t = Math.floor(tempNum / 10); // Tens digit
    const u = tempNum % 10; // Units digit
    result += tens[t]; // Add tens word
    if (u > 0) {
      result += ` ו${units[u]}`; // Add "and" + units word
    }
    console.log(
      `[numberToWords] Handled tens and units (>=20): ${tempNum}, result part: ${
        tens[t]
      } ${u > 0 ? "ו" + units[u] : ""}`
    );
  } else if (tempNum >= 10) {
    result += teens[tempNum - 10]; // Handle teens (10-19)
    console.log(
      `[numberToWords] Handled teens: ${tempNum}, result part: ${
        teens[tempNum - 10]
      }`
    );
  } else if (tempNum > 0) {
    result += units[tempNum]; // Handle single units (1-9)
    console.log(
      `[numberToWords] Handled units: ${tempNum}, result part: ${units[tempNum]}`
    );
  }

  console.log(`[numberToWords] Final result for ${num}: "${result.trim()}"`);
  return result.trim(); // Return the trimmed result
};

/**
 * Scales a number value to a bubble size within the defined MIN_SIZE and MAX_SIZE range.
 * @param num The number to scale.
 * @returns The calculated size for the bubble.
 */
const scaleNumberToSize = (num: number): number => {
  // Ensure num is within the expected range for scaling
  const clampedNum = Math.max(MIN_NUMBER, Math.min(MAX_NUMBER, num));
  const scaledSize =
    MIN_SIZE +
    ((clampedNum - MIN_NUMBER) / (MAX_NUMBER - MIN_NUMBER)) *
      (MAX_SIZE - MIN_SIZE);
  console.log(
    `[scaleNumberToSize] Number: ${num}, Clamped: ${clampedNum}, Scaled Size: ${scaledSize}`
  );
  return scaledSize;
};

/**
 * Checks if a newly generated bubble would overlap with existing bubbles.
 * @param x X-coordinate of the new bubble.
 * @param y Y-coordinate of the new bubble.
 * @param size Size of the new bubble.
 * @param bubbles Array of existing BubbleData.
 * @returns True if overlapping, false otherwise.
 */
const isOverlapping = (
  x: number,
  y: number,
  size: number,
  bubbles: BubbleData[]
): boolean => {
  for (const b of bubbles) {
    // Calculate distance between centers of the two bubbles
    const dx = b.x - x;
    const dy = b.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Check if the distance is less than the sum of their radii (adjusted for a little buffer)
    if (distance < (b.size + size) / 2.5) {
      console.log(
        `[isOverlapping] Overlap detected. Bubble at (${x},${y}) size ${size} overlaps with bubble ${
          b.id
        } at (${b.x},${b.y}) size ${b.size}. Distance: ${distance}, Required: ${
          (b.size + size) / 2.5
        }`
      );
      return true;
    }
  }
  return false;
};

/**
 * Generates an array of BubbleData objects for both main and background bubbles.
 * Attempts to avoid initial overlaps.
 * @returns An array of BubbleData.
 */
const generateBubbles = (): BubbleData[] => {
  console.log("[generateBubbles] Starting bubble generation...");
  const bubbles: BubbleData[] = []; // Stores all generated bubbles
  let attempts = 0; // Counter for attempts to place a bubble

  // --- Generate Background Bubbles ---
  console.log(
    `[generateBubbles] Generating ${NUM_BACKGROUND_BUBBLES} background bubbles.`
  );
  while (bubbles.length < NUM_BACKGROUND_BUBBLES && attempts < 2000) {
    const size = 20 + Math.random() * 80; // Smaller and varied sizes for background bubbles
    // Random position within screen bounds, considering bubble size
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size);
    const directionX = Math.random() > 0.5 ? 1 : -1; // Random horizontal direction
    const directionY = Math.random() > 0.5 ? 1 : -1; // Random vertical direction
    const delay = Math.random() * 1000; // Random animation delay

    // Check for overlap before adding the bubble
    bubbles.push({
      id: `bg-${bubbles.length}`, // Unique ID for background bubble
      size,
      x,
      y,
      value: null, // No value for background bubbles
      name: null, // No name for background bubbles
      directionX,
      directionY,
      delay,
      isBackground: true,
    });
    console.log(
      `[generateBubbles] Added background bubble ${
        bubbles.length - 1
      } at (${x},${y}) with size ${size}`
    );

    attempts++;
  }
  console.log(
    `[generateBubbles] Finished generating background bubbles. Total: ${
      bubbles.filter((b) => b.isBackground).length
    }`
  );

  // --- Generate Main Bubbles ---
  attempts = 0; // Reset attempts for main bubbles
  const mainBubbles: BubbleData[] = []; // Temporary array for main bubbles
  console.log(`[generateBubbles] Generating ${NUM_BUBBLES} main bubbles.`);
  while (mainBubbles.length < NUM_BUBBLES && attempts < 2000) {
    const value = Math.floor(Math.random() * MAX_NUMBER) + 1; // Random number value
    const size = scaleNumberToSize(value); // Size based on the number value
    const x = Math.random() * (width - size); // Random position
    const y = Math.random() * (height - size); // Random position
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    const delay = Math.random() * 1000;
    const name = numberToWords(value); // Convert number to Hebrew words

    // Check for overlap with other main bubbles (important for interactivity)
    if (!isOverlapping(x, y, size, mainBubbles)) {
      mainBubbles.push({
        id: `main-${mainBubbles.length}`, // Unique ID for main bubble
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
      console.log(
        `[generateBubbles] Added main bubble ${
          mainBubbles.length - 1
        } with value ${value} and size ${size} at (${x},${y})`
      );
    } else {
      console.log(
        `[generateBubbles] Attempt ${attempts} failed for main bubble (overlap).`
      );
    }
    attempts++;
  }
  console.log(
    `[generateBubbles] Finished generating main bubbles. Total: ${mainBubbles.length}`
  );

  // Combine background and main bubbles
  const allBubbles = [...bubbles, ...mainBubbles];
  console.log(
    `[generateBubbles] Total bubbles generated: ${allBubbles.length}`
  );
  return allBubbles;
};

/**
 * BubbleScreen component displaying animated bubbles and a message.
 */
const BubbleScreen: React.FC = () => {
  // Memoize bubble generation to prevent re-rendering on every component render
  const bubbles = useMemo(generateBubbles, []);
  console.log("[BubbleScreen] Bubbles generated and memoized.");

  // State to track the currently selected bubble
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  // State to control the current message displayed at the bottom
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  /**
   * Handles the press event on a bubble.
   * Toggles the selected state of the bubble and cycles through messages.
   * @param id The ID of the pressed bubble.
   */
  const handleBubblePress = useCallback((id: string) => {
    console.log(`[BubbleScreen] Bubble pressed: ${id}`);
    setSelectedBubbleId((prevId) => {
      const newId = prevId === id ? null : id;
      console.log(
        `[BubbleScreen] Selected bubble ID changed from ${prevId} to ${newId}`
      );
      return newId;
    });
    // Cycle through the predefined sentences
    setCurrentSentenceIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % sentences.length;
      console.log(
        `[BubbleScreen] Current sentence index changed from ${prevIndex} to ${newIndex}`
      );
      return newIndex;
    });
  }, []); // Empty dependency array means this function is created once

  return (
    <View style={styles.container}>
      {/* Render each bubble */}
      {bubbles.map((bubble) => (
        <AnimatedBubble
          key={bubble.id} // Unique key for list rendering
          {...bubble} // Spread all bubble properties
          isSelected={selectedBubbleId === bubble.id} // Pass selection state
          onPress={handleBubblePress} // Pass the press handler
        />
      ))}
      {/* Message display container */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          {sentences[currentSentenceIndex]}
        </Text>
      </View>
    </View>
  );
};

// --- AnimatedBubble Component ---

// Props interface for AnimatedBubble
interface AnimatedBubbleProps extends BubbleData {
  isSelected: boolean; // Indicates if the bubble is currently selected
  onPress: (id: string) => void; // Callback for when the bubble is pressed
}

/**
 * AnimatedBubble component representing a single interactive or background bubble.
 * Handles its own animation and styling based on its properties and selection state.
 */
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
  // Shared values for Reanimated animations
  const offset = useSharedValue(0); // Controls the floating animation
  const animatedOpacity = useSharedValue(isBackground ? 0.2 : 1); // Controls bubble opacity
  const animatedScale = useSharedValue(1); // Controls bubble scale (for press effect)

  console.log(
    `[AnimatedBubble ${id}] Initializing. Is background: ${isBackground}, Initial opacity: ${animatedOpacity.value}`
  );

  // Floating animation effect
  useEffect(() => {
    console.log(`[AnimatedBubble ${id}] Setting up floating animation.`);
    offset.value = withRepeat(
      withDelay(
        delay, // Staggered start based on delay
        withTiming(1, {
          duration: 4000 + Math.random() * 2000, // Random duration for varied movement speed
          easing: Easing.inOut(Easing.ease), // Smooth easing for movement
        })
      ),
      -1, // Repeat indefinitely
      true // Reverse animation on alternate cycles
    );
  }, [delay, offset]); // Re-run if delay or offset changes

  // Selection animation effects (opacity and scale)
  useEffect(() => {
    if (!isBackground) {
      console.log(
        `[AnimatedBubble ${id}] Is selected changed: ${isSelected}. Triggering selection animations.`
      );
      animatedOpacity.value = withTiming(isSelected ? 1 : 0.7, {
        duration: 200, // Quick opacity change
      });
      animatedScale.value = withSpring(isSelected ? 1.1 : 1, {
        damping: 10, // Controls bounciness
        stiffness: 100, // Controls speed of spring
      });
    }
  }, [isSelected, isBackground, animatedOpacity, animatedScale]); // Re-run when isSelected or isBackground changes

  /**
   * Internal handler for bubble press. Only calls `onPress` if it's not a background bubble.
   * @param event The touch event.
   */
  const handleInternalPress = useCallback(
    (event: GestureResponderEvent) => {
      if (!isBackground) {
        console.log(`[AnimatedBubble ${id}] Non-background bubble pressed.`);
        onPress(id); // Call the external press handler
      } else {
        console.log(
          `[AnimatedBubble ${id}] Background bubble pressed (ignored).`
        );
      }
    },
    [id, isBackground, onPress]
  ); // Dependencies for useCallback

  // Animated style for the bubble's position, background, and border
  const animatedStyle = useAnimatedStyle(() => {
    // Calculate floating movement based on offset value
    const dx =
      Math.sin(offset.value * Math.PI * 2) *
      (isBackground ? 8 : 5) * // Smaller movement for main bubbles
      directionX;
    const dy =
      Math.cos(offset.value * Math.PI * 2) *
      (isBackground ? 8 : 5) *
      directionY;

    // Determine background and border colors based on selection and background state
    const backgroundColor = isBackground
      ? "rgba(0, 230, 255, 0.2)" // Light blue for background
      : isSelected
      ? "rgba(250, 220, 220, 0.9)" // Light red/pink when selected
      : "rgba(173, 216, 255, 0.8)"; // Light blue when not selected
    const borderColor = isBackground
      ? "rgba(255, 255, 255, 0.5)" // Faint white for background
      : isSelected
      ? "rgba(0, 0, 0, 1)" // Black for selected
      : "rgba(255, 255, 255, 0.9)"; // White for not selected

    // Return the animated styles
    return {
      transform: [
        { translateX: x + 0.5 * dx }, // Apply floating X movement
        { translateY: y + 0.5 * dy }, // Apply floating Y movement
        { scale: animatedScale.value }, // Apply scaling based on selection
      ],
      backgroundColor,
      borderColor,
      opacity: animatedOpacity.value, // Apply opacity
    };
  });

  // Calculate font sizes dynamically based on bubble size
  const fontSize = Math.max(8, size / 6);
  const nameSize = Math.max(6, size / 8);
  console.log(
    `[AnimatedBubble ${id}] Calculated font sizes: value=${fontSize}, name=${nameSize}`
  );

  return (
    <TouchableWithoutFeedback onPress={handleInternalPress}>
      <Animated.View
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2, // Makes it a perfect circle
            zIndex: isBackground ? 0 : isSelected ? 2 : 1, // Z-index for layering
          },
          animatedStyle, // Apply dynamic animated styles
        ]}
      >
        {/* Only render text content for non-background bubbles */}
        {!isBackground && (
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.bubbleText,
                { fontSize, color: isSelected ? "#333" : "#000" }, // Darker text when selected
              ]}
              numberOfLines={1} // Ensures text stays on one line
              adjustsFontSizeToFit // Shrinks font to fit
            >
              {value?.toLocaleString()} {/* Display numeric value */}
            </Text>
            <Text
              style={[
                styles.bubbleName,
                { fontSize: nameSize, color: isSelected ? "#555" : "#000" }, // Slightly darker text for name when selected
              ]}
              numberOfLines={2} // Allows name to wrap
              adjustsFontSizeToFit // Shrinks font to fit
            >
              {name} {/* Display word representation */}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes up the entire screen
    backgroundColor: "#e6f7ff", // Light blue background for the screen
  },
  bubble: {
    position: "absolute", // Allows positioning with x and y coordinates
    borderWidth: 1, // Border around the bubble
    shadowColor: "#ffffff", // White shadow for a subtle glow effect
    shadowOpacity: 0.1, // Low opacity for subtle shadow
    shadowOffset: { width: -1, height: -1 }, // Shadow direction
    shadowRadius: 3, // Blur radius of the shadow
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    padding: 2, // Small padding inside the bubble
  },
  textContainer: {
    alignItems: "center", // Center text elements horizontally
    justifyContent: "center", // Center text elements vertically
    paddingHorizontal: 2, // Horizontal padding for text
  },
  bubbleText: {
    fontWeight: "bold", // Bold text for the number
    textAlign: "center", // Center align the number
    opacity: 1, // Full opacity for the number
  },
  bubbleName: {
    textAlign: "center", // Center align the name
    opacity: 0.7, // Slightly transparent for the name
    lineHeight: 10, // Reduced line height for compact look
  },
  messageContainer: {
    position: "absolute", // Absolute positioning
    bottom: 20, // 20 units from the bottom
    width: "100%", // Takes full width
    alignItems: "center", // Center content horizontally
    paddingHorizontal: 20, // Horizontal padding
  },
  messageText: {
    fontSize: 18, // Font size for the message
    fontWeight: "bold", // Bold message text
    color: "#333", // Dark gray text color
    textAlign: "center", // Center align the message
  },
});

export default BubbleScreen;
