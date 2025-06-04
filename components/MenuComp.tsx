// components/DropdownMenu.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";

// Define the props that the DropdownMenu component will accept
interface DropdownMenuProps {
  isVisible: boolean; // Controls the visibility of the menu
  onClose: () => void; // Function to call when the menu should close
  options: string[]; // Array of strings for the menu items
  onSelectOption: (option: string) => void; // Function to call when an option is selected
  // Position of the "anchor" element (e.g., the menu icon) to position the dropdown
  anchorPosition: { x: number; y: number; width: number; height: number };
}

const MenuComp: React.FC<DropdownMenuProps> = ({
  isVisible,
  onClose,
  options,
  onSelectOption,
  anchorPosition,
}) => {
  // Animated values for scale and opacity, ensuring they are initialized
  const scaleAnim = useRef(new Animated.Value(0.01)).current; // Start very small
  const opacityAnim = useRef(new Animated.Value(0)).current; // Start invisible

  // Use useEffect to run animations when isVisible changes
  useEffect(() => {
    if (isVisible) {
      // If the menu is becoming visible, run the "open" animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1, // Scale up to full size
          friction: 8, // Controls "bounciness"
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1, // Fade in
          duration: 200, // Quick fade-in
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // If the menu is becoming hidden, run the "close" animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.01, // Shrink back to tiny
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0, // Fade out
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, scaleAnim, opacityAnim]); // Dependencies for useEffect

  // Don't render the modal at all if it's not supposed to be visible.
  // This helps prevent flickering and unnecessary rendering.
  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      animationType="fade" // Use fade for Modal, as we control scale/opacity with Animated
      transparent={true} // Essential for the overlay effect
      visible={isVisible}
      onRequestClose={onClose} // Handle Android back button
    >
      <TouchableOpacity
        style={localStyles.modalOverlay}
        activeOpacity={1} // Prevents visual feedback on touch
        onPressOut={onClose} // Closes menu when tapping outside
      >
        <Animated.View // Use Animated.View for scale and opacity animations
          style={[
            localStyles.modalContent,
            {
              opacity: opacityAnim, // Apply animated opacity
              transform: [{ scale: scaleAnim }], // Apply animated scale
              // Position the modal content relative to the anchor icon
              top: anchorPosition.y + anchorPosition.height / 2,
              right: 0, // Position from the right edge
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  localStyles.menuOption,
                  // Remove the bottom border from the last item for a cleaner look
                  index === options.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => onSelectOption(option)} // Pass selected option back
              >
                <Text style={localStyles.menuOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black overlay
    justifyContent: "flex-start", // Start content from the top
    alignItems: "flex-start", // Start content from the left
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute", // Allows precise positioning relative to the anchor
    minWidth: 180, // Minimum width for the menu
    maxHeight: 250, // Fixed maximum height, enabling scrolling
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Shadow for Android
    paddingVertical: 10, // Vertical padding inside the modal content
  },
  menuOption: {
    paddingHorizontal: 20, // Horizontal padding for each option
    paddingVertical: 12, // Vertical padding for each option
    borderBottomWidth: 1, // Separator line for options
    borderBottomColor: "#eee", // Light gray separator
    width: "100%", // Options take full width of the modal content
    alignSelf: "flex-end", // Align text to the right for RTL layout
  },
  menuOptionText: {
    fontSize: 16,
    textAlign: "right", // Text alignment for RTL
    writingDirection: "rtl", // Explicit RTL text direction
  },
});

export default MenuComp;