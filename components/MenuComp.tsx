// components/MenuComp.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  LayoutRectangle, // Import LayoutRectangle
  findNodeHandle, // Import findNodeHandle
  UIManager, // Import UIManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the menu icon

// Define the props that the MenuComp component will accept
interface MenuCompProps {
  options: string[]; // Array of strings for the menu items
  onSelectOption: (option: string) => void; // Function to call when an option is selected
}

const MenuComp: React.FC<MenuCompProps> = ({
  options,
  onSelectOption,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [menuIconPosition, setMenuIconPosition] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const menuIconRef = useRef<View>(null); // Ref for the internal menu icon

  // Animated values for scale and opacity
  const scaleAnim = useRef(new Animated.Value(0.01)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    const handle = findNodeHandle(menuIconRef.current);
    if (handle) {
      UIManager.measure(
        handle,
        (x, y, width, height, pageX, pageY) => {
          setMenuIconPosition({ x: pageX, y: pageY, width, height });
          setIsVisible(true);
        }
      );
    }
  };

  const closeMenu = () => setIsVisible(false);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.01,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Optional: Reset visibility after animation completes
        if (!isVisible) {
          // This can be useful to completely unmount the modal content
          // However, for smooth re-opening, keeping it mounted and just hidden is often better.
        }
      });
    }
  }, [isVisible, scaleAnim, opacityAnim]);

  return (
    <>
      {/* The menu icon that opens the dropdown */}
      <TouchableOpacity
        onPress={openMenu}
        style={localStyles.menuIconPlacement}
        ref={menuIconRef} // Attach ref to the icon
      >
        <Ionicons name="menu" size={24} color="black" />
      </TouchableOpacity>

      {/* Modal is only rendered when isVisible is true */}
      {isVisible && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isVisible}
          onRequestClose={closeMenu}
        >
          <TouchableOpacity
            style={localStyles.modalOverlay}
            activeOpacity={1}
            onPressOut={closeMenu}
          >
            <Animated.View
              style={[
                localStyles.modalContent,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                  // Position the modal content relative to the anchor icon
                  top: menuIconPosition.y + menuIconPosition.height / 2,
                  // Adjust right position based on desired offset from right edge
                  right: 15, // A small offset from the right edge of the screen
                },
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      localStyles.menuOption,
                      index === options.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => {
                      onSelectOption(option);
                      closeMenu(); // Close the menu after selection
                    }}
                  >
                    <Text style={localStyles.menuOptionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
};

const localStyles = StyleSheet.create({
  menuIconPlacement: {
    padding: 10,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute",
    minWidth: 180,
    maxHeight: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 10,
  },
  menuOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: "100%",
    alignSelf: "flex-end", // Align text to the right for RTL layout
  },
  menuOptionText: {
    fontSize: 16,
    textAlign: "right", // Text alignment for RTL
    writingDirection: "rtl", // Explicit RTL text direction
  },
});

export default MenuComp;