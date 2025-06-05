import { StyleSheet, Dimensions } from "react-native";
import Colors from "./Colors";


const { width } = Dimensions.get('window');

// Calculate category button width based on screen dimensions
const categoryButtonWidth = (width - 60) / 4; // 20px padding on each side, 20px space between buttons

const styles = StyleSheet.create({
  /**
   * Container for the bottom navigation bar.
   * Flexes to take available space and aligns content to the bottom.
   */
  container_bottom_nav: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: Colors.offWhite,
  },
  /**
   * Style for a subtitle text.
   * Centers the text and sets a black color.
   */
  subTitle: {
    fontSize: 15,
    color: Colors.black,
    textAlign: "center",
  },
  /**
   * Container for the top bar of the screen.
   * Uses transparent background, aligns items, and adds horizontal padding.
   */
  container_top_bar: {
    backgroundColor: "transparent",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 0,
  },
  /**
   * Generic content container that centers its children both vertically and horizontally.
   */
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  /**
   * Safe area view style with a white background for the entire screen.
   */
  safeArea: {
    backgroundColor: Colors.white,
  },
  /**
   * Style for a scroll view, allowing it to take up available space.
   */
  scrollView: {
    flex: 1,
  },
  /**
   * Header container with row layout, space between content, and bottom border.
   */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  /**
   * Style for the main title in the header.
   */
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  /**
   * Container for left-aligned header icons.
   */
  headerIconsLeft: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
  /**
   * Container for right-aligned header icons.
   */
  headerIconsRight: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'space-between',
  },
  /**
   * Content style for scrollable areas with top and bottom padding.
   */
  scrollContent: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  /**
   * Style for individual icons, providing horizontal margin and font size.
   */
  icon: {
    marginHorizontal: 6,
    fontSize: 22,
  },
  /**
   * General section container with padding.
   */
  sectionContainer: {
    padding: 20,
  },
  /**
   * Main section container that fills available space with a light background.
   */
  mainSectionContainer: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  /**
   * Title style for sections, bold and centered.
   */
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    paddingBottom: 0,
  },
  /**
   * Container for recent buttons, arranged with space around them, light orange background, and rounded corners.
   */
  recentButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightOrange,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  /**
   * Style for individual recent buttons, with white background, padding, rounded corners, and shadow.
   */
  recentButton: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  /**
   * Text style for recent buttons.
   */
  recentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.mediumGray,
  },
  /**
   * Grid container for all categories, with wrap functionality, centered content, light orange background, and rounded corners.
   */
  allCategoriesGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: Colors.lightOrange,
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 0,
  },
  /**
   * Style for individual category buttons, making them square, centered, with white background, rounded corners, and shadow.
   */
  categoryButton: {
    backgroundColor: Colors.white,
    width: categoryButtonWidth,
    height: categoryButtonWidth,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  /**
   * Text style for category buttons, centered.
   */
  categoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.mediumGray,
    textAlign: 'center',
  },
  /**
   * Bottom navigation bar style with row layout, space around items, white background, and top border.
   */
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingVertical: 10,
  },
  /**
   * Style for individual items in the bottom navigation.
   */
  bottomNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  /**
   * Icon style for bottom navigation items.
   */
  bottomNavIcon: {
    fontSize: 20,
  },
  /**
   * Text style for bottom navigation items.
   */
  bottomNavText: {
    fontSize: 12,
    color: Colors.mediumGray,
  },
  /**
   * Container for the special center icon in the bottom navigation.
   * Features an orange background, circular shape, lifted position, border, and shadow.
   */
  bottomNavCenterIconContainer: {
    backgroundColor: Colors.mediumOrange,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    borderWidth: 4,
    borderColor: Colors.lightGray, // Match screen background color
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  /**
   * Icon style for the center icon in the bottom navigation.
   */
  bottomNavCenterIcon: {
    fontSize: 30,
    color: Colors.white,
  },
  /**
   * Container for search and filter elements with a light orange background.
   */
  searchFilterContainer: {
    padding: 15,
    backgroundColor: Colors.lightBackground,
  },
  /**
   * Search box style with white background, rounded corners, and right alignment.
   */
  searchBox: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  /**
   * Text style within the search box.
   */
  searchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.darkOrange,
  },
  /**
   * Container for search input fields, arranged in a row.
   */
  searchInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  /**
   * Style for individual search input fields, with white background, rounded corners, and right-aligned text.
   */
  searchInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 8,
    marginHorizontal: 5,
    textAlign: 'right',
  },
  /**
   * Style for search icons.
   */
  searchIcon: {
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  /**
   * Container for filter buttons, arranged with space around, light orange background, and rounded bottom corners.
   */
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: Colors.lightBackground,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  /**
   * Style for individual filter buttons, with orange background, rounded corners, and padding.
   */
  filterButton: {
    backgroundColor: Colors.darkOrange,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  /**
   * Text style for filter buttons.
   */
  filterButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  /**
   * Input section container with white background and padding.
   */
  inputSection: {
    padding: 15,
    backgroundColor: Colors.white,
  },
  /**
   * Style for an input field row, with right alignment for content.
   */
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  /**
   * Style for input field labels.
   */
  inputLabel: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  /**
   * Style for a dropdown component, with border, padding, and centered content.
   */
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  /**
   * Generic section style with light orange background, margin, and rounded corners.
   */
  section: {
    padding: 15,
    backgroundColor: Colors.lightBackground,
    marginTop: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  /**
   * Card style with row layout, white background, rounded corners, padding, and shadow.
   */
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  /**
   * Style for images within cards, circular and with left margin.
   */
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 15,
  },
  /**
   * Content style for cards, aligning text to the right.
   */
  cardContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  /**
   * Title style for cards.
   */
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  /**
   * Description style for cards.
   */
  cardDescription: {
    fontSize: 14,
    color: 'gray', // Keeping this as a literal as no specific gray color is defined in Colors for this
  },
  /**
   * Main container style, aligning content to the bottom and with an off-white background.
   */
  container: {
    justifyContent: "flex-end",
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  /**
   * Scroll container with padding for content.
   */
  scrollContainer: {
    padding: 20,
    paddingTop: 60,
  },
  /**
   * Top section style, centering its content.
   */
  topSection: {
    alignItems: 'center',
  },
  /**
   * Main title style, bold, black, and centered.
   */
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  /**
   * Subtitle style, with specific color and centered.
   */
  subtitle: {
    fontSize: 18,
    color: '#555', // Keeping this as a literal as no specific gray color is defined in Colors for this
    marginBottom: 20,
    textAlign: 'center',
  },
  /**
   * Description text style, with specific color, line height, and right alignment.
   */
  description: {
    fontSize: 16,
    color: '#444', // Keeping this as a literal as no specific gray color is defined in Colors for this
    lineHeight: 24,
    textAlign: 'right',
  },
  /**
   * Bottom section container with padding, top border, and pink background.
   */
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: Colors.headerBorder,
    backgroundColor: Colors.pink,
  },
  /**
   * Button style with dark pink background, padding, rounded corners, and centered content.
   */
  button: {
    backgroundColor: Colors.darkPink,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  /**
   * Text style for buttons.
   */
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  /**
   * Logo image style, centered and with specific dimensions.
   */
  logo: {
    width: 180,
    height: 180,
    marginTop: 20,
    justifyContent: "center",
    alignSelf: 'center',
  },
  /**
   * Form container style with vibrant orange background, padding, rounded corners, and centered.
   */
  formContainer: {
    width: '90%',
    height: '60%',
    backgroundColor: Colors.vibrantOrange,
    padding: 24,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  /**
   * Input field style within forms, with peach background, padding, rounded corners, and white text.
   */
  input: {
    backgroundColor: Colors.peach,
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    color: Colors.white,
  },
  /**
   * Style for password hint text, black, right-aligned, and underlined.
   */
  passwordHint: {
    color: Colors.black,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  /**
   * Row for buttons, with reverse direction and space between them.
   */
  buttonsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  /**
   * Style for a primary button.
   */
  primaryButton: {
    backgroundColor: Colors.accentOrange,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  /**
   * Style for a secondary button.
   */
  secondaryButton: {
    backgroundColor: Colors.lightOrange,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  /**
   * Style for "or" text, centered and bold.
   */
  orText: {
    textAlign: 'center',
    color: Colors.black,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  /**
   * Row for social media icons, distributed evenly.
   */
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  /**
   * Wrapper for top content, ensuring it pushes subsequent content downwards and starts from the top.
   */
  topContentWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
});

export default styles;