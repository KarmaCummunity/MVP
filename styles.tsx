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
    container2: {
      flex: 1, // This makes the container take up the entire screen height
      justifyContent: 'flex-end', // Positions content at the top and bottom
      backgroundColor: "black"
    },
    bottomContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: 'lightgray',
      paddingVertical: 8,
    },
    tab: {
      alignItems: 'center',
    },
    tabText: {
      marginTop: 4,
      fontSize: 12,
    },
  });
  
  export default styles;