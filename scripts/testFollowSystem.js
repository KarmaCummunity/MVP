// Test script for the followers system with unified data
// Run with: node scripts/testFollowSystem.js

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

// System tests
// console removed

// Test 1: Start following
const user1 = allUsers[0]; // user001
const user2 = allUsers[15]; // user016

// console removed
// console removed`);
// console removed`);

const followResult = followUser(user1.id, user2.id);
// console removed

// Test 2: Follow stats
const stats1 = getFollowStats(user1.id, user1.id);
const stats2 = getFollowStats(user2.id, user1.id);

// console removed
// console removed
// console removed
// console removed

// Test 3: Followers/following lists
const user2Followers = getFollowers(user2.id);
const user1Following = getFollowing(user1.id);

// console removed
// console removed.join(', ')}`);
// console removed.join(', ')}`);

// Test 4: Suggestions
const suggestions = getFollowSuggestions(user1.id, 5);
// console removed
suggestions.forEach((user, index) => {
  // console removed`);
});

// Test 5: Unfollow
// console removed
const unfollowResult = unfollowUser(user1.id, user2.id);
// console removed

const statsAfterUnfollow = getFollowStats(user2.id, user1.id);
// console removed

// Test 6: Multiple follows
// console removed
const usersToFollow = allUsers.slice(1, 6); // 5 additional users
usersToFollow.forEach(user => {
  followUser(user1.id, user.id);
});

const finalStats = getFollowStats(user1.id, user1.id);
// console removed

// Test 7: Popular users
// console removed
const allUserStats = allUsers.map(char => {
  const stats = getFollowStats(char.id, '');
  return { ...char, followersCount: stats.followersCount };
});

const popularUsers = allUserStats
  .sort((a, b) => b.followersCount - a.followersCount)
  .slice(0, 5);

// console removed
popularUsers.forEach((user, index) => {
  // console removed
});

// Test 8: Data integrity
// console removed
const totalRelationships = followRelationships.length;
const uniqueFollowers = new Set(followRelationships.map(r => r.followerId));
const uniqueFollowing = new Set(followRelationships.map(r => r.followingId));

// console removed
// console removed
// console removed

// Test 9: Performance
// console removed
const startTime = Date.now();
for (let i = 0; i < 100; i++) {
  const randomUser1 = allUsers[Math.floor(Math.random() * allUsers.length)];
  const randomUser2 = allUsers[Math.floor(Math.random() * allUsers.length)];
  if (randomUser1.id !== randomUser2.id) {
    getFollowStats(randomUser1.id, randomUser2.id);
  }
}
const endTime = Date.now();
// console removed

// console removed
// console removed
// console removed
// console removed
// console removed 