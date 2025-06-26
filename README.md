Karma Community Platform Demo
![Project Screenshot/Logo - Optional but Recommended]
(Replace this with a screenshot of your app or your project's logo for better visual appeal)

Table of Contents
About the Project

Features

Technologies Used

Getting Started

Prerequisites

Installation

Running the Demo

Usage

Project Structure

Future Enhancements

License

Contact

About the Project
This project serves as a proof-of-concept and demonstration of future functionalities intended for the Karma Community Platform. Built with React Native and Expo, it aims to provide a tangible preview of key features and user experiences envisioned for the platform.

The Karma Community Platform seeks to foster connections and facilitate services within a community, and this demo specifically highlights core interactions such as ride-sharing services and a comprehensive user settings interface, all designed with a focus on usability and Right-to-Left (RTL) language support for Hebrew speakers.

Features
This demo currently showcases the following core functionalities:

Ride-Sharing Module:

Search for Rides (מחפש): Users can search for available rides based on origin, destination, and desired time.

Offer Rides (מציע): Users can switch modes to offer rides, changing the primary action button accordingly.

Location Search Integration: Seamless location input powered by Google Places Autocomplete API for accurate origin and destination selection.

Time Selection: Intuitive interface for selecting specific times for rides.

Dynamic UI: Button text adapts based on the selected mode ("חפש" / "פרסם").

WhatsApp Group Integration: Direct links to relevant WhatsApp community groups, allowing users to connect and coordinate outside the app.

Comprehensive Settings Interface:

User Account Settings: Options for editing profile, changing password, privacy, and security settings.

Notification Management: Toggles for push and email notifications.

App Preferences: Customization options including language selection, dark mode, data saver, and autoplay video settings.

Utility Actions: Functionality for clearing app cache.

Help & Support: Links to help center, problem reporting, contact, privacy policy, and terms of service.

About Section: Displays app version information.

Account Management: Options for logging out and deleting the account.

Right-to-Left (RTL) Language Support:

The entire application interface, including text alignment, layout direction, and icon placement, is meticulously designed and implemented to provide a natural and intuitive experience for Hebrew users.

Technologies Used
This project leverages the following key technologies and libraries:

React Native: A framework for building native mobile apps using React.

Expo: A set of tools and services built on top of React Native that allows for rapid development, testing, and deployment. This project uses the managed workflow.

TypeScript: A strongly typed superset of JavaScript that enhances code quality and maintainability.

@react-native-community/datetimepicker: For native date and time picker components.

react-native-vector-icons: For a wide range of customizable vector icons.

@react-native-picker/picker: For a customizable cross-platform dropdown picker.

Google Places Autocomplete API: Used for intelligent location search suggestions.

react-navigation: For handling app navigation.

Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Make sure you have the following installed on your machine:

Node.js (LTS version recommended)

npm (comes with Node.js) or Yarn

Expo CLI:

Bash

npm install -g expo-cli
# OR
yarn global add expo-cli
For mobile testing: The Expo Go app installed on your iOS or Android device.

Installation
Clone the repository:

Bash

git clone [YOUR_REPO_URL_HERE]
cd [YOUR_PROJECT_FOLDER_NAME]
(Replace [YOUR_REPO_URL_HERE] and [YOUR_PROJECT_FOLDER_NAME] with your actual repository URL and project folder name)

Install dependencies:

Bash

npm install
# OR
yarn install
Google Places API Key:

Obtain a Google Places API key from the Google Cloud Console.

Enable the "Places API" for your project.

Important: Restrict your API key to prevent unauthorized use (e.g., by IP address, Android/iOS app restriction).

Replace "AIzaSyAgkx8Jp2AfhhYL0wwgcOqONpaJ0-Mkcf8" in components/LocationSearchComp.tsx with your actual API key.

Running the Demo
You have two main options to run the demo:

On a Mobile Device (Recommended for full experience):

Bash

expo start
This will open the Expo Dev Tools in your browser. Scan the QR code displayed using the Expo Go app on your mobile device.

In a Web Browser:

Bash

expo start --web
This will open the app in your default web browser. Note that some native functionalities (like direct WhatsApp linking on all platforms, or specific DateTimePicker displays) might behave differently or be unavailable on the web.

Usage
Navigate through the app to explore the ride-sharing search/offer interface.

Experiment with the location search and time selection.

Visit the settings screen to see various user configuration options and toggles.

Observe the RTL layout and text direction throughout the application.

Project Structure
.
├── assets/                     # Static assets (images, fonts)
├── components/                 # Reusable UI components (e.g., SettingsItem, LocationSearchComp)
├── globals/                    # Global styles, constants, colors
├── screens/                    # Main application screens (e.g., TrumpScreen, SettingsScreen)
├── App.tsx                     # Main application entry point
├── app.json                    # Expo configuration file
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript configuration
Future Enhancements
This demo lays the groundwork for the Karma Community Platform. Future development will focus on:

Backend integration for actual ride matching and user management.

User authentication and profiles.

Real-time updates and push notifications for ride status.

Integration with mapping services for route visualization.

Expanded community features beyond ride-sharing.

License
Distributed under the MIT License. See LICENSE for more information.
(Create a LICENSE file in your root directory if you choose this license)

Contact
[Your Name/Team Name] - [Your Email Address]
[Your Project Link (e.g., GitHub Profile, Company Website)]

