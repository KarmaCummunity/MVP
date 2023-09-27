import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    title: {
      fontSize: 24,            // Set the font size
      fontWeight: 'bold',     // Set the font weight (e.g., 'bold', 'normal')
      color: 'black',         // Set the text color
      textAlign: 'center',    // Set the text alignment
      marginTop: 10 ,       // Add some margin at the bottom
    },
    container: {
      flex: 1, // This makes the container take up the entire screen height
      justifyContent: 'flex-end', // Positions content at the top and bottom
    },
  });
  
  export default styles;