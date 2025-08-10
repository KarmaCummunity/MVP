import React, { useEffect } from "react";
import { Dimensions, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from "react-native-reanimated";
import colors from "../globals/colors";
import { FontSizes } from "../globals/constants";
import { useTranslation } from 'react-i18next';

// screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// number of bubbles to display
const NUM_BUBBLES = 25;

// generate a random value between min and max
const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

// single animated bubble
const Bubble = ({ icon, value, label, top, left, size, delay }: any) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-10, {
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay + 500,
      withRepeat(
        withTiming(1.05, {
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay + 1000,
      withRepeat(
        withTiming(1, {
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ] as any,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          top,
          left,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
};

const FloatingBubblesOverlay = () => {
  const { t } = useTranslation(['home']);
  const bubbles = [];

  for (let i = 0; i < NUM_BUBBLES; i++) {
    const size = randomBetween(60, 90);
    const top = randomBetween(0, SCREEN_HEIGHT - size);
    const left = randomBetween(0, SCREEN_WIDTH - size);
    const delay = i * 150;

    bubbles.push(
      <Bubble
        key={i}
        icon="💵"
        value="125K"
        label={t('home:stats.moneyDonations') as string}
        top={top}
        left={left}
        size={size}
        delay={delay}
      />
    );
  }

  return <>{bubbles}</>;
};

export default FloatingBubblesOverlay;

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    backgroundColor: colors.legacyLightGreen,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: colors.success + "30",
  },
  icon: {
    fontSize: FontSizes.heading2,
    marginBottom: 4,
  },
  value: {
    fontSize: FontSizes.medium,
    fontWeight: "bold",
    color: "#1976D2",
  },
  label: {
    fontSize: FontSizes.caption,
    color: "#1565C0",
    textAlign: "center",
  },
});
