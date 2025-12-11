// File overview:
// - Purpose: Wrapper component that uses the unified ProfileScreen to view other users' profiles.
// - Reached from: Home/Search/Profile/Donations stacks via 'UserProfileScreen'.
// - Expects route params: `{ userId: string, userName: string, characterData?: CharacterType }`.
// - Provides: Passes route params to ProfileScreen which handles all the logic.
// - Notes: Uses ProfileScreen which now handles both own profile and other users' profiles.
//   ProfileScreen will automatically detect if it's viewing another user and use tabBarHeight = 0.
import React from 'react';
import ProfileScreen from '../bottomBarScreens/ProfileScreen';

// --- Main Component ---
// This component is a wrapper that uses ProfileScreen
// ProfileScreen will automatically detect that we're viewing another user's profile
// and use tabBarHeight = 0 instead of calling useBottomTabBarHeight
export default function UserProfileScreen() {
  return <ProfileScreen />;
} 