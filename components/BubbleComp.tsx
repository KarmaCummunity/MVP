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
import { FontSizes, BUBBLE_CONSTANTS } from "../globals/constants";
import { motivationalQuotes } from "../globals/fakeData";
import { texts } from "../globals/texts";
import { TouchableOpacity } from "react-native";
import colors from "../globals/colors";
import { communityStats } from "../globals/fakeData";
import { BubbleData } from "../globals/types";

// Get the dimensions of the device window for responsive sizing
const { width, height } = Dimensions.get("window");

// --- Constants ---
const NUM_BUBBLES = BUBBLE_CONSTANTS.NUM_BUBBLES;
const MIN_SIZE = BUBBLE_CONSTANTS.MIN_SIZE;
const MAX_SIZE = BUBBLE_CONSTANTS.MAX_SIZE;
const MIN_NUMBER = BUBBLE_CONSTANTS.MIN_NUMBER;
const MAX_NUMBER = BUBBLE_CONSTANTS.MAX_NUMBER;

/**
 * ממיר מספר לערך גודל בועה בטווח המוגדר
 * @param num - המספר להמרה
 * @returns גודל הבועה בפיקסלים
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
 * בודק אם בועה חדשה תחפוף עם בועות קיימות
 * @param x - מיקום X של הבועה החדשה
 * @param y - מיקום Y של הבועה החדשה
 * @param size - גודל הבועה החדשה
 * @param bubbles - מערך הבועות הקיימות
 * @returns true אם יש חפיפה, false אחרת
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
    if (distance < (b.size + size) / BUBBLE_CONSTANTS.OVERLAP_THRESHOLD) {
      return true;
    }
  }
  return false;
};

/**
 * יוצר מערך של בועות עם נתונים אקראיים
 * @returns מערך של BubbleData
 */
const generateBubbles = (): BubbleData[] => {
  console.log("Generating bubbles...");
  const bubbles: BubbleData[] = [];
  let attempts = 0;
  let index = 0;
  const mainBubbles: BubbleData[] = [];
  
  // Creates main bubbles until reaching desired count or after maximum attempts
  while (mainBubbles.length < NUM_BUBBLES && attempts < BUBBLE_CONSTANTS.MAX_ATTEMPTS) {
    const value = Math.floor(Math.random() * MAX_NUMBER) + 1;
    const size = scaleNumberToSize(value);
    const x = Math.random() * (width - size);
    const y = Math.random() * (height - size - BUBBLE_CONSTANTS.HEIGHT_OFFSET); // Leave space for message
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    const delay = Math.random() * 1000;

    // Use community statistics names
    const name = communityStats[index++ % communityStats.length].name;

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
 * קומפוננטה ראשית להצגת בועות סטטיסטיקות צפות
 * כוללת בועות אינטראקטיביות והודעות מוטיבציוניות
 */
const BubbleComp: React.FC = () => {
  const bubbles = useMemo(generateBubbles, []);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  /**
   * מטפל בלחיצה על בועה
   * @param id - מזהה הבועה שנלחצה
   */
  const handleBubblePress = useCallback((id: string) => {
    setSelectedBubbleId((prevId) => {
      const newId = prevId === id ? null : id;
      return newId;
    });
    setCurrentSentenceIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % motivationalQuotes.length;
      return newIndex;
    });
  }, []);

  /**
   * מטפל בלחיצה על הודעה מוטיבציונית
   */
  const handleMessagePress = useCallback(() => {
    setCurrentSentenceIndex(
      (prevIndex) => (prevIndex + 1) % motivationalQuotes.length
    );
  }, []);

  return (
    <View style={localStyles.container}>
              <Text style={localStyles.title}>{texts.bubbleTitle}</Text>
      
      {/* Bubbles container */}
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

      {/* Motivational message container - fixed position */}
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

/**
 * קומפוננטת בועה בודדת עם אנימציות
 * כוללת אפקט ציפה, בחירה ואינטראקציה
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
  const offset = useSharedValue(0);
  const animatedOpacity = useSharedValue(isBackground ? BUBBLE_CONSTANTS.OPACITY_BACKGROUND : 1);
  const animatedScale = useSharedValue(1);

  // Floating animation effect
  useEffect(() => {
    offset.value = withRepeat(
      withDelay(
        delay,
        withTiming(1, {
          duration: BUBBLE_CONSTANTS.ANIMATION_DURATION + Math.random() * BUBBLE_CONSTANTS.ANIMATION_DELAY,
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
      animatedOpacity.value = withTiming(isSelected ? BUBBLE_CONSTANTS.OPACITY_SELECTED : BUBBLE_CONSTANTS.OPACITY_DEFAULT, {
        duration: BUBBLE_CONSTANTS.ANIMATION_DURATION_SHORT,
      });
      animatedScale.value = withSpring(isSelected ? BUBBLE_CONSTANTS.SCALE_SELECTED : BUBBLE_CONSTANTS.SCALE_DEFAULT, {
        damping: BUBBLE_CONSTANTS.ANIMATION_DAMPING,
        stiffness: BUBBLE_CONSTANTS.ANIMATION_STIFFNESS,
      });
    }
  }, [isSelected, isBackground, animatedOpacity, animatedScale]);

  /**
   * מטפל בלחיצה פנימית על הבועה
   */
  const handleInternalPress = useCallback(
    (event: GestureResponderEvent) => {
      if (!isBackground) {
        onPress(id);
      }
    },
    [id, isBackground, onPress]
  );

  // Animated bubble style
  const animatedStyle = useAnimatedStyle(() => {
    const dx =
      Math.sin(offset.value * Math.PI * 2) *
      (isBackground ? BUBBLE_CONSTANTS.MOVEMENT_BACKGROUND : BUBBLE_CONSTANTS.MOVEMENT_FOREGROUND) *
      directionX;
    const dy =
      Math.cos(offset.value * Math.PI * 2) *
      (isBackground ? BUBBLE_CONSTANTS.MOVEMENT_BACKGROUND : BUBBLE_CONSTANTS.MOVEMENT_FOREGROUND) *
      directionY;

    const backgroundColor = isBackground
      ? colors.bubbleBackgroundInactive
      : isSelected
      ? colors.bubbleBackgroundSelected
      : colors.bubbleBackgroundDefault;
    const borderColor = isBackground
      ? colors.bubbleBorderInactive
      : isSelected
      ? colors.bubbleBorderSelected
      : colors.bubbleBorderDefault;

    return {
      transform: [
        { translateX: x + 0.5 * dx },
        { translateY: y + 0.5 * dy },
        { scale: animatedScale.value },
      ] as any,
      backgroundColor,
      borderColor,
      opacity: animatedOpacity.value,
    };
  });

  // Calculate dynamic font sizes based on bubble size
  const fontSize = Math.max(BUBBLE_CONSTANTS.MIN_FONT_SIZE, size / BUBBLE_CONSTANTS.FONT_SIZE_RATIO);
  const nameSize = Math.max(BUBBLE_CONSTANTS.MIN_NAME_SIZE, size / BUBBLE_CONSTANTS.NAME_SIZE_RATIO);

  return (
    <TouchableWithoutFeedback onPress={handleInternalPress}>
      <Animated.View
        style={[
          localStyles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            zIndex: isBackground ? 0 : isSelected ? 10 : 5,
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
                  fontSize: size * BUBBLE_CONSTANTS.TEXT_SIZE_RATIO,
                  color: isSelected ? colors.bubbleTextSelected : colors.bubbleTextDefault,
                  marginBottom: 2,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={BUBBLE_CONSTANTS.MIN_FONT_SCALE}
            >
              {value?.toLocaleString()}
            </Text>
            <Text
              style={[
                localStyles.bubbleName,
                {
                  fontSize: nameSize,
                  color: isSelected ? colors.bubbleNameSelected : colors.bubbleNameDefault,
                  lineHeight: nameSize * BUBBLE_CONSTANTS.NAME_LINE_HEIGHT_RATIO,
                },
              ]}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={BUBBLE_CONSTANTS.MIN_NAME_SCALE}
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
    backgroundColor: colors.bubbleBackground
  },
  bubblesContainer: {
    flex: 1,
    position: "relative",
  },
  bubble: {
    position: "absolute",
    borderWidth: 1,
    shadowColor: colors.bubbleShadow,
    shadowOpacity: BUBBLE_CONSTANTS.SHADOW_OPACITY,
    shadowOffset: { width: BUBBLE_CONSTANTS.SHADOW_OFFSET, height: BUBBLE_CONSTANTS.SHADOW_OFFSET },
    shadowRadius: BUBBLE_CONSTANTS.SHADOW_RADIUS,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
    width: "100%",
  },
  bubbleText: {
    fontWeight: "900",
    textAlign: "center",
    opacity: 1,
  },
  bubbleName: {
    textAlign: "center",
    opacity: 0.8,
    fontWeight: "bold",
  },
  messageContainer: {
    marginVertical: BUBBLE_CONSTANTS.MESSAGE_MARGIN_VERTICAL,
    marginHorizontal: BUBBLE_CONSTANTS.MESSAGE_MARGIN_HORIZONTAL,
    alignSelf: "center",
    zIndex: 1000,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  title: {
    textAlign: "center",
    fontSize: BUBBLE_CONSTANTS.TITLE_FONT_SIZE,
    marginTop: BUBBLE_CONSTANTS.TITLE_MARGIN_TOP,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: FontSizes.small,
    fontWeight: "bold",
    backgroundColor: colors.messageBackground,
    textAlign: "center",
    paddingHorizontal: BUBBLE_CONSTANTS.MESSAGE_PADDING_HORIZONTAL,
    paddingVertical: BUBBLE_CONSTANTS.MESSAGE_PADDING_VERTICAL,
    borderRadius: BUBBLE_CONSTANTS.MESSAGE_BORDER_RADIUS,
    shadowColor: colors.messageShadow,
    shadowOffset: { width: 0, height: BUBBLE_CONSTANTS.MESSAGE_SHADOW_OFFSET },
    shadowOpacity: BUBBLE_CONSTANTS.MESSAGE_SHADOW_OPACITY,
    shadowRadius: BUBBLE_CONSTANTS.MESSAGE_SHADOW_RADIUS,
    opacity: BUBBLE_CONSTANTS.MESSAGE_OPACITY,
    elevation: BUBBLE_CONSTANTS.MESSAGE_ELEVATION,
  },
});

export default BubbleComp;
