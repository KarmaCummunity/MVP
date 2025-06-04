import { StyleSheet, Dimensions } from "react-native";


const { width } = Dimensions.get('window');
const categoryButtonWidth = (width - 60) / 4; // 20px padding on each side, 20px space between buttons

const styles = StyleSheet.create({
  container_bottom_nav: {
    flex: 1,
    justifyContent: "flex-end",
    // backgroundColor: "#fffff0", // white yellwo 
    backgroundColor: '#F8F5F0',

  },
  subTitle: {
    fontSize: 15, // Set the font size
    color: "black", // Set the text color
    textAlign: "center", // Set the text alignment
  },
  container_top_bar: { 
    backgroundColor: "transparent", 
    // backgroundColor: "#0fff0f", // Dark background for the top bar
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 0,
    // height: 60
  },
  content: {
    flex: 1,
    justifyContent: "center", // centers the button vertically
    alignItems: "center",     // centers the button horizontally
  },
  safeArea: {
    // flex: 1,
    backgroundColor: 'white', // Light background color for the entire screen
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIconsLeft: {
    flexDirection: 'row',
    width: 60, // Give some space for icons
    justifyContent: 'space-between',
  },
  headerIconsRight: {
    flexDirection: 'row',
    width: 60, // Give some space for icons
    justifyContent: 'space-between',
  },
  icon: {
    marginHorizontal: 6,
    fontSize: 22,
  },
  sectionContainer: {
    padding: 20,
    // flex: 1,
  },
  mainSectionContainer: {
    flex: 1, // This makes the content area take up all remaining space
    backgroundColor: '#f8f8f8', // Match your desired background, or keep it transparent
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center', // Align to right for Hebrew
    // textDecorationLine: 'underline',
    textDecorationColor: '#ffb38a', // Underline color
    // textDecorationThickness: 2,
    paddingBottom: 0,
  },
  recentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffe5d2', // Lighter orange background
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  recentButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  recentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  allCategoriesGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#ffe5d2', // Lighter orange background
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 0, // Smaller horizontal padding for grid
  },
  categoryButton: {
    backgroundColor: '#fff',
    width: categoryButtonWidth,
    height: categoryButtonWidth, // Make buttons square
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10, // Adjust margin for spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingVertical: 10,
  },
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavIcon: {
    fontSize: 20,
  },
  bottomNavText: {
    fontSize: 12,
    color: '#666',
  },
  bottomNavCenterIconContainer: {
    backgroundColor: '#ff9966', // Orange background for the center icon
    borderRadius: 30, // Make it circular
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, // Lift it up
    borderWidth: 4,
    borderColor: '#f8f8f8', // Match screen background color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomNavCenterIcon: {
    fontSize: 30,
    color: '#fff', // White icon color
  },
  searchFilterContainer: {
    padding: 15,
    backgroundColor: '#f8f0eb', // Light orange background
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignSelf: 'flex-end', // Align to the right
  },
  searchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e79d7f', // Orange text color
  },
  searchInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 5,
    textAlign: 'right', // For Hebrew input
  },
  searchIcon: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f8f0eb',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  filterButton: {
    backgroundColor: '#e79d7f', // Orange button
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputSection: {
    padding: 15,
    backgroundColor: '#fff',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Align to the right
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%', // Adjust as needed
  },
  section: {
    padding: 15,
    backgroundColor: '#f8f0eb', // Light orange background for sections
    marginTop: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Make it circular
    marginLeft: 15, // Margin for Hebrew layout
  },
  cardContent: {
    flex: 1,
    alignItems: 'flex-end', // Align text to the right for Hebrew
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: 'gray',
  },
  container: {
    justifyContent: "flex-end", // Positions content at the top and bottom
    flex: 1,
    backgroundColor: '#F8F5F0',
    // alignItems: 'center', // Centers content horizontally
    // backgroundColor: '#FFEAF4',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  topSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    textAlign: 'right',
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#f2cddb',
    backgroundColor: '#FFEAF4',
  },
  button: {
    backgroundColor: '#F06292',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logo: {
    width: 180,
    height: 180,
    marginTop: 20,
    justifyContent: "center", // centers the button vertically
    alignSelf: 'center',  // <-- centers the logo horizontally

  },
  formContainer: {
    width: '90%',
    height: '60%',
    backgroundColor: '#FA815D', // כתום חזק יותר לטופס
    padding: 24,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center', // Center the form container
  },
  // header: {
  //   fontSize: 20,
  //   fontWeight: 'bold',
  //   backgroundColor: '#FFE6D6',
  //   padding: 10,
  //   textAlign: 'center',
  //   borderRadius: 20,
  //   marginBottom: 20,
  // },
  input: {
    backgroundColor: '#FFB19A',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    color: '#fff',
  },
  passwordHint: {
    color: 'black',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  buttonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#FF7A5A',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  secondaryButton: {
    backgroundColor: '#FFE6D6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  orText: {
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  topContentWrapper: {
    flex: 1, // זה מה שידחוף את התוכן שמתחתיו כלפי מטה
    justifyContent: 'flex-start', // ודא שהתוכן בפנים מתחיל מלמעלה
  },
});

export default styles;
