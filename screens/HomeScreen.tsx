import styles from '../navigations/styles';
import TopBarNavigator from "../navigations/TopBarNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { View, TouchableOpacity, Text } from "react-native";


export default function HomeScreen({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => navigation.navigate("FirstScreen")}
          style={styles.button}>
            
          <Text style={styles.buttonText}>
            {"Go to First\nthis is Home1 page"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// import React, { useState } from "react";
// import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback } from "react-native";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withRepeat,
//   withTiming,
// } from "react-native-reanimated";

// const { width, height } = Dimensions.get("window");

// const NUM_BUBBLES = 35;
// const NUM_BACKGROUND_BUBBLES = 200; // Increased to fill the screen more
// const MIN_SIZE = 30;
// const MAX_SIZE = 100;
// const MIN_NUMBER = 1;
// const MAX_NUMBER = 100000;

// const numberToWords = (num) => {
//   const units = ["", "אחת", "שתיים", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע"];
//   const tens = ["", "עשר", "עשרים", "שלושים", "ארבעים", "חמישים", "שישים", "שבעים", "שמונים", "תשעים"];
//   const teens = ["עשר", "אחת עשרה", "שתים עשרה", "שלוש עשרה", "ארבע עשרה", "חמש עשרה", "שש עשרה", "שבע עשרה", "שמונה עשרה", "תשע עשרה"];

//   if (num === 0) return "אפס";

//   let result = "";

//   const addPart = (n, word) => {
//     if (n > 0) result += `${numberToWords(n)} ${word} `;
//   };

//   if (num >= 1000) {
//     const thousands = Math.floor(num / 1000);
//     result += thousands === 1 ? "אלף " : numberToWords(thousands) + " אלפים ";
//     num %= 1000;
//   }

//   if (num >= 100) {
//     const hundreds = Math.floor(num / 100);
//     result += hundreds === 1 ? "מאה " : numberToWords(hundreds) + " מאות ";
//     num %= 100;
//   }

//   if (num >= 20) {
//     const t = Math.floor(num / 10);
//     const u = num % 10;
//     result += tens[t];
//     if (u > 0) result += ` ו${units[u]}`;
//   } else if (num >= 10) {
//     result += teens[num - 10];
//   } else if (num > 0) {
//     result += units[num];
//   }

//   return result.trim();
// };

// const scaleNumberToSize = (num) => {
//   return (
//     MIN_SIZE +
//     ((num - MIN_NUMBER) / (MAX_NUMBER - MIN_NUMBER)) * (MAX_SIZE - MIN_SIZE)
//   );
// };

// const isOverlapping = (x, y, size, bubbles) => {
//   for (const b of bubbles) {
//     const dx = b.x - x;
//     const dy = b.y - y;
//     const distance = Math.sqrt(dx * dx + dy * dy);
//     // Reduced overlap threshold to allow for more bubbles, especially background ones
//     if (distance < (b.size + size) / 2.5) {
//       return true;
//     }
//   }
//   return false;
// };

// const generateBubbles = () => {
//   const bubbles = [];
//   let attempts = 0;

//   // First, generate background bubbles
//   while (bubbles.length < NUM_BACKGROUND_BUBBLES && attempts < 2000) {
//     const size = 20 + Math.random() * 80; // Larger range for background bubble sizes
//         // --- שינוי בנקודה זו: הרחבת טווח המיקום האקראי ---
//     const x = Math.random() * (width + size) - size / 2;
//     const y = Math.random() * (height + size) - size / 2;
//     const directionX = Math.random() > 0.5 ? 1 : -1;
//     const directionY = Math.random() > 0.5 ? 1 : -1;
//     const delay = Math.random() * 1000;

//       bubbles.push({
//         id: `bg-${bubbles.length}`,
//         size,
//         x,
//         y,
//         value: null,
//         name: null,
//         directionX,
//         directionY,
//         delay,
//         isBackground: true,
//       });
//     attempts++;
//   }

//   // Reset attempts for main bubbles
//   attempts = 0;
//   const mainBubbles = [];

//   // Then, generate main bubbles (on top)
//   while (mainBubbles.length < NUM_BUBBLES && attempts < 2000) {
//     const value = Math.floor(Math.random() * MAX_NUMBER) + 1;
//     const size = scaleNumberToSize(value);
//     const x = Math.random() * (width - size);
//     const y = Math.random() * (height - size);
//     const directionX = Math.random() > 0.5 ? 1 : -1;
//     const directionY = Math.random() > 0.5 ? 1 : -1;
//     const delay = Math.random() * 1000;
//     const name = numberToWords(value);

//     // Check overlap only with other main bubbles for placement
//     if (!isOverlapping(x, y, size, mainBubbles)) {
//       mainBubbles.push({
//         id: `main-${mainBubbles.length}`,
//         size,
//         x,
//         y,
//         value,
//         name,
//         directionX,
//         directionY,
//         delay,
//         isBackground: false,
//       });
//     }

//     attempts++;
//   }

//   // Combine background and main bubbles, ensuring main bubbles are rendered last (on top)
//   return [...bubbles, ...mainBubbles];
// };

// const BubblesScreen = () => {
//   const bubbles = React.useMemo(generateBubbles, []);

//   return (
//     <View style={styles.container}>
//       {bubbles.map((bubble) => (
//         <AnimatedBubble key={bubble.id} {...bubble} />
//       ))}
//     </View>
//   );
// };

// const AnimatedBubble = ({ size, x, y, value, name, directionX, directionY, delay, isBackground }) => {
//   const offset = useSharedValue(0);
//   const opacity = useSharedValue(isBackground ? 0.2 : 1);
//   const scale = useSharedValue(1);
//   const [isSelected, setIsSelected] = useState(false);

//   React.useEffect(() => {
//     offset.value = withRepeat(
//       withTiming(1, {
//         duration: 4000 + Math.random() * 2000,
//         delay,
//       }),
//       -1,
//       true
//     );
//   }, []);

//  const handlePress = () => {
//     if (isBackground) return;

//     const newSelectedState = !isSelected;
//     setIsSelected(newSelectedState);

//     // אנימציה של שקיפות וקנה מידה
//     opacity.value = withTiming(newSelectedState ? 1 : 0.7, { duration: 200 }); // שקיפות 1 (אטום) כשהיא נבחרת
//     scale.value = withSpring(newSelectedState ? 1.1 : 1);
//   };

//   const animatedStyle = useAnimatedStyle(() => {
//     const dx = Math.sin(offset.value * Math.PI * 2) * (isBackground ? 8 : 5) * directionX; // Slightly more movement for background bubbles
//     const dy = Math.cos(offset.value * Math.PI * 2) * (isBackground ? 8 : 5) * directionY; // Slightly more movement for background bubbles
//     return {
//       transform: [{ translateX: x + 0.5*dx }, { translateY: y + 0.5*dy }],
//             // opacity: opacity.value, // <-- הוספת opacity לאנימציה
//       backgroundColor: isBackground
//         ? "rgba(0, 230, 255, 0.2)" // צבע רקע לבועות רקע
//         : isSelected // אם הבועה נבחרה
//           ? "rgba(0, 100, 250, 1)" // ירוק זוהר ואטום
//           : "rgba(173, 216, 255, 0.35)", // כחול בהיר ושקוף כשהיא לא נבחרת
//       borderColor: isBackground
//         ? "rgba(255, 255, 255, 0.5)" // גבול לבועות רקע
//         : isSelected
//           ? "rgba(50, 205, 50, 1)" // גבול ירוק כהה יותר כשהיא נבחרת
//           : "rgba(255, 255, 255, 0.9)", // גבול לבועות רגילות
//     };
//   });

//   const fontSize = Math.max(8, size / 6);
//   const nameSize = Math.max(6, size / 8);

//   return (
//         <TouchableWithoutFeedback onPress={handlePress}>
//     <Animated.View
//       style={[
//         styles.bubble,
//         {
//           width: size,
//           height: size,
//           borderRadius: size / 2,
//           // Background bubbles have lower opacity and different color
//           backgroundColor: isBackground ? "rgba(200, 230, 255, 0.2)" : "rgba(173, 216, 255, 0.35)",
//           borderColor: isBackground ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.9)",
//           zIndex: isBackground ? 0 : 1, // Ensure main bubbles are on top
//         },
//         animatedStyle,
//       ]}
//     >
//       {!isBackground && (
//         <View style={styles.textContainer}>
//           <Text style={[styles.bubbleText, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit>
//             {value.toLocaleString()}
//           </Text>
//           <Text
//             style={[styles.bubbleName, { fontSize: nameSize }]}
//             numberOfLines={2}
//             adjustsFontSizeToFit
//           >
//             {name}
//           </Text>
//         </View>
//       )}
//     </Animated.View>
//         </TouchableWithoutFeedback>

//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#e6f7ff",
//   },
//   bubble: {
//     position: "absolute",
//     borderWidth: 1,
//     shadowColor: "#ffffff",
//     shadowOpacity: 0.3,
//     shadowOffset: { width: -1, height: -1 },
//     shadowRadius: 3,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 2,
//   },
//   textContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 2,
//   },
//   bubbleText: {
//     color: "#0",
//     fontWeight: "bold",
//     textAlign: "center",
//     opacity: 0.7,
//   },
//   bubbleName: {
//     color: "#0",
//     textAlign: "center",
//     opacity: 0.5,
//     lineHeight: 10,
//   },
// });

// export default BubblesScreen;