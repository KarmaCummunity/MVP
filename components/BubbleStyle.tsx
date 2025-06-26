import React from "react";
import { StyleSheet, ViewStyle, TextStyle } from "react-native";
import Animated from "react-native-reanimated";

interface BubbleStyleProps {
  size: number;
  isSelected: boolean;
  isBackground: boolean;
  animatedStyle: ViewStyle;
  children: React.ReactNode;
}

const BubbleStyle: React.FC<BubbleStyleProps> = ({
  size,
  isSelected,
  isBackground,
  animatedStyle,
  children,
}) => {
  return (
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
      {children}
    </Animated.View>
  );
};

interface BubbleTextStyles {
  bubbleText: TextStyle;
  bubbleName: TextStyle;
  textContainer: ViewStyle;
}

export const getBubbleTextStyles = (
  fontSize: number,
  nameSize: number,
  isSelected: boolean
): BubbleTextStyles => {
  return StyleSheet.create({
    textContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 2,
    },
    bubbleText: {
      fontWeight: "bold",
      textAlign: "center",
      opacity: 1,
      fontSize,
      color: isSelected ? "#333" : "#000",
    },
    bubbleName: {
      textAlign: "center",
      opacity: 0.7,
      lineHeight: nameSize * 1.5, // Adjusted for better readability
      fontSize: nameSize,
      color: isSelected ? "#555" : "#000",
    },
  });
};

const styles = StyleSheet.create({
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
});

export default BubbleStyle;