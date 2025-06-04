'use strict';
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const NUM_BUBBLES = 30;
const NUM_BACKGROUND_BUBBLES = 200;
const MIN_SIZE = 50;
const MAX_SIZE = 150;
const MIN_NUMBER = 1;
const MAX_NUMBER = 100000;

interface BubbleData {
  id: string;
  size: number;
  x: number;
  y: number;
  value: number | null;
  name: string | null;
  directionX: number;
  directionY: number;
  delay: number;
  isBackground: boolean;
}

const numberToWords = (num: number): string => {
  const units = ["", "אחת", "שתיים", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע"];
  const tens = ["", "עשר", "עשרים", "שלושים", "ארבעים", "חמישים", "שישים", "שבעים", "שמונים", "תשעים"];
  const teens = ["עשר", "אחת עשרה", "שתים עשרה", "שלוש עשרה", "ארבע עשרה", "חמש עשרה", "שש עשרה", "שבע עשרה", "שמונה עשרה", "תשע עשרה"];

  if (num === 0) return "אפס";

  let result = "";

  const addPart = (n: number, word: string) => {
    if (n > 0) result += `${numberToWords(n)} ${word} `;
  };

  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    result += thousands === 1 ? "אלף " : numberToWords(thousands) + " אלפים ";
    num %= 1000;
  }

  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    result += hundreds === 1 ? "מאה " : numberToWords(hundreds) + " מאות ";
    num %= 100;
  }

  if (num >= 20) {
    const t = Math.floor(num / 10);
    const u = num % 10;
    result += tens[t];
    if (u > 0) result += ` ו${units[u]}`;
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += units[num];
  }

  return result.trim();
};

const scaleNumberToSize = (num: number): number => {
  return (
    MIN_SIZE +
    ((num - MIN_NUMBER) / (MAX_NUMBER - MIN_NUMBER)) * (MAX_SIZE - MIN_SIZE)
  );
};

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

const generateBubbles = (): BubbleData[] => {
  const bubbles: BubbleData[] = [];
  let attempts = 0;

  while (bubbles.length < NUM_BACKGROUND_BUBBLES && attempts < 2000) {
    const size = 20 + Math.random() * 80;
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size);
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    const delay = Math.random() * 1000;

    if (!isOverlapping(x, y, size, bubbles)) {
      bubbles.push({
        id: `bg-${bubbles.length}`,
        size,
        x,
        y,
        value: null,
        name: null,
        directionX,
        directionY,
        delay,
        isBackground: true,
      });
    }
    attempts++;
  }

  attempts = 0;
  const mainBubbles: BubbleData[] = [];

  while (mainBubbles.length < NUM_BUBBLES && attempts < 2000) {
    const value = Math.floor(Math.random() * MAX_NUMBER) + 1;
    const size = scaleNumberToSize(value);
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size);
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    const delay = Math.random() * 1000;
    const name = numberToWords(value);

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

  return [...bubbles, ...mainBubbles];
};

const BubblesScreen = () => {
  const bubbles = React.useMemo(generateBubbles, []);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);

  const handleBubblePress = (id: string) => {
    setSelectedBubbleId((prevId) => (prevId === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {bubbles.map((bubble) => (
        <AnimatedBubble
          key={bubble.id}
          {...bubble}
          isSelected={selectedBubbleId === bubble.id}
          onPress={handleBubblePress}
        />
      ))}
    </View>
  );
};

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
// Then in useEffect:

offset.value = withRepeat(
  withDelay(
    delay,
    withTiming(1, {
      duration: 4000 + Math.random() * 2000,
    })
  ),
  -1,
  true
);

  React.useEffect(() => {
    if (!isBackground) {
      animatedOpacity.value = withTiming(isSelected ? 1 : 0.7, { duration: 200 });
      animatedScale.value = withSpring(isSelected ? 1.1 : 1);
    }
  }, [isSelected, isBackground]);

  const handleInternalPress = () => {
    if (!isBackground) {
      onPress(id);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const dx = Math.sin(offset.value * Math.PI * 2) * (isBackground ? 8 : 5) * directionX;
    const dy = Math.cos(offset.value * Math.PI * 2) * (isBackground ? 8 : 5) * directionY;
    return {
      transform: [
        { translateX: x + 0.5 * dx },
        { translateY: y + 0.5 * dy },
        { scale: animatedScale.value },
      ],
      backgroundColor: isBackground
        ? "rgba(0, 230, 255, 0.2)"
        : isSelected
        ? "rgba(250, 220, 220, 0.9)"
        : "rgba(173, 216, 255, 0.8)",
      borderColor: isBackground
        ? "rgba(255, 255, 255, 0.5)"
        : isSelected
        ? "rgba(0, 0, 0, 1)"
        : "rgba(255, 255, 255, 0.9)",
    };
  });

  const fontSize = Math.max(8, size / 6);
  const nameSize = Math.max(6, size / 8);

  return (
    <TouchableWithoutFeedback onPress={handleInternalPress}>
      <Animated.View
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            zIndex: isBackground ? 0 : isSelected ? 2 : 1,
          },
          animatedStyle,
        ]}
      >
        {!isBackground && (
          <View style={styles.textContainer}>
            <Text
              style={[styles.bubbleText, { fontSize, color: isSelected ? "#333" : "#000" }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {value?.toLocaleString()}
            </Text>
            <Text
              style={[styles.bubbleName, { fontSize: nameSize, color: isSelected ? "#555" : "#000" }]}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {name}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e6f7ff",
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
    padding: 2,
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  bubbleText: {
    fontWeight: "bold",
    textAlign: "center",
    opacity: 1,
  },
  bubbleName: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 10,
    
  },
});

export default BubblesScreen;
