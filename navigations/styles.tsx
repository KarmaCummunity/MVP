import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container_bottom_nav: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#fffff0", // white yellwo 
  },
  title: {
    fontSize: 20, // Set the font size
    fontWeight: "bold", // Set the font weight (e.g., 'bold', 'normal')
    color: "black", // Set the text color
    textAlign: "center", // Set the text alignment
    // marginTop: 20 ,       // Add some margin at the bottom
  },
  subTitle: {
    fontSize: 15, // Set the font size
    color: "black", // Set the text color
    textAlign: "center", // Set the text alignment
  },
  container: {
    flex: 1, // This makes the container take up the entire screen height
    justifyContent: "flex-end", // Positions content at the top and bottom
    backgroundColor: "#fff0f0", // white pink
  },

  container_top_bar: { 
    backgroundColor: "transparent", 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 0,
    height: 60
  },
  content: {
    flex: 1,
    justifyContent: "center", // centers the button vertically
    alignItems: "center",     // centers the button horizontally
  },
  button: {
    backgroundColor: "#007AFF", // blue color
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default styles;
