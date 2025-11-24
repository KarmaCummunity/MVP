// Comprehensive test script for the unified followers system
// Run with: node scripts/testUnifiedSystem.js

// console removed

// Read the unified file
const fs = require('fs');
const path = require('path');

const characterTypesPath = path.join(__dirname, '../globals/characterTypes.ts');
const content = fs.readFileSync(characterTypesPath, 'utf8');

// Extract data
const allUsersMatch = content.match(/export const allUsers: CharacterType\[\] = (\[[\s\S]*?\]);/);
const allUsers = allUsersMatch ? eval(allUsersMatch[1]) : [];

// console removed

// Validate IDs structure
// console removed
const userIds = allUsers.map(user => user.id);
const charIds = userIds.filter(id => id.startsWith('char'));
const userIdsOnly = userIds.filter(id => id.startsWith('user'));

// console removed
// console removed
// console removed.size}`);

if (charIds.length > 0) {
  // console removed
} else {
  // console removed
}

// Followers system simulation
let followRelationships = [];

// Followers system functions
function getFollowStats(userId, currentUserId) {
  const followers = followRelationships.filter(rel => rel.followingId === userId);
  const following = followRelationships.filter(rel => rel.followerId === userId);
  const isFollowing = followRelationships.some(rel => 
    rel.followerId === currentUserId && rel.followingId === userId
  );

  return {
    followersCount: followers.length,
    followingCount: following.length,
    isFollowing
  };
}

function followUser(followerId, followingId) {
  // Prevent self-follow
  if (followerId === followingId) {
    return false; // Not allowed to follow yourself
  }

  const existingFollow = followRelationships.find(rel => 
    rel.followerId === followerId && rel.followingId === followingId
  );

  if (existingFollow) {
    return false;
  }

  const newFollow = {
    followerId,
    followingId,
    followDate: new Date().toISOString()
  };

  followRelationships.push(newFollow);
  return true;
}

function unfollowUser(followerId, followingId) {
  const followIndex = followRelationships.findIndex(rel => 
    rel.followerId === followerId && rel.followingId === followingId
  );

  if (followIndex === -1) {
    return false;
  }

  followRelationships.splice(followIndex, 1);
  return true;
}

function getFollowers(userId) {
  const followerIds = followRelationships
    .filter(rel => rel.followingId === userId)
    .map(rel => rel.followerId);

  return allUsers.filter(char => followerIds.includes(char.id));
}

function getFollowing(userId) {
  const followingIds = followRelationships
    .filter(rel => rel.followerId === userId)
    .map(rel => rel.followingId);

  return allUsers.filter(char => followingIds.includes(char.id));
}

function getFollowSuggestions(currentUserId, limit = 10) {
  const alreadyFollowing = followRelationships
    .filter(rel => rel.followerId === currentUserId)
    .map(rel => rel.followingId);

  const suggestions = allUsers.filter(char => 
    char.id !== currentUserId && 
    !alreadyFollowing.includes(char.id)
  );

  suggestions.sort((a, b) => b.karmaPoints - a.karmaPoints);
  return suggestions.slice(0, limit);
}

function getPopularUsers(limit = 10) {
  const userStats = allUsers.map(char => {
    const stats = getFollowStats(char.id, '');
    return { ...char, followersCount: stats.followersCount };
  });

  return userStats
    .sort((a, b) => b.followersCount - a.followersCount)
    .slice(0, limit);
}

// Comprehensive tests
// console removed

// Test 1: Basic follow operations
// console removed
const user1 = allUsers[0]; // user001
const user2 = allUsers[15]; // user016
const user3 = allUsers[10]; // user011

// console removed, ${user2.name} (${user2.id}), ${user3.name} (${user3.id})`);

// Follow
const follow1 = followUser(user1.id, user2.id);
const follow2 = followUser(user1.id, user3.id);
const follow3 = followUser(user2.id, user3.id);

// console removed

// Check stats
const stats1 = getFollowStats(user1.id, user1.id);
const stats2 = getFollowStats(user2.id, user1.id);
const stats3 = getFollowStats(user3.id, user1.id);

// console removed
// console removed
// console removed

// Test 2: Lists
// console removed
const user1Following = getFollowing(user1.id);
const user3Followers = getFollowers(user3.id);

// console removed.join(', ')}`);
// console removed.join(', ')}`);

// Test 3: Suggestions
// console removed
const suggestions = getFollowSuggestions(user1.id, 5);
// console removed
suggestions.forEach((user, index) => {
  // console removed`);
});

// Test 4: Popular users
// console removed
const popularUsers = getPopularUsers(5);
// console removed
popularUsers.forEach((user, index) => {
  // console removed
});

// Test 5: Unfollow
// console removed
const unfollow1 = unfollowUser(user1.id, user2.id);
const statsAfterUnfollow = getFollowStats(user2.id, user1.id);

// console removed
// console removed

// Test 6: Duplicate follow
// console removed
const duplicateFollow = followUser(user1.id, user3.id);
// console removed' : 'BLOCKED (CORRECT)'}`);

// Test 7: Self-follow
// console removed
const selfFollow = followUser(user1.id, user1.id);
// console removed' : 'BLOCKED (CORRECT)'}`);

// Test 8: Performance
// console removed
const startTime = Date.now();
for (let i = 0; i < 1000; i++) {
  const randomUser1 = allUsers[Math.floor(Math.random() * allUsers.length)];
  const randomUser2 = allUsers[Math.floor(Math.random() * allUsers.length)];
  if (randomUser1.id !== randomUser2.id) {
    getFollowStats(randomUser1.id, randomUser2.id);
  }
}
const endTime = Date.now();
// console removed

// Test 9: Data integrity
// console removed
const totalRelationships = followRelationships.length;
const uniqueFollowers = new Set(followRelationships.map(r => r.followerId));
const uniqueFollowing = new Set(followRelationships.map(r => r.followingId));

// console removed
// console removed
// console removed

// Test 10: Real-world simulation
// console removed
// console removed

// New user starts following
const newUser = allUsers[20]; // user021
const usersToFollow = allUsers.slice(0, 5).filter(u => u.id !== newUser.id);
usersToFollow.forEach(user => {
  followUser(newUser.id, user.id);
});

const newUserStats = getFollowStats(newUser.id, newUser.id);
// console removed

// Check suggestions for new user
const newUserSuggestions = getFollowSuggestions(newUser.id, 3);
// console removed
newUserSuggestions.forEach((user, index) => {
  // console removed`);
});

// Summary
// console removed
// console removed
// console removed
// console removed
// console removed
// console removed
// console removed
// console removed

if (charIds.length === 0) {
  // console removed
  // console removed
} else {
  // console removed
} 