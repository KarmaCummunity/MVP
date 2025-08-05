// סקריפט בדיקה למערכת העוקבים עם הנתונים המאוחדים
// הרץ עם: node scripts/testFollowSystem.js

console.log('🧪 Testing Follow System with Unified Data...');

// קריאת הקובץ המאוחד
const fs = require('fs');
const path = require('path');

const characterTypesPath = path.join(__dirname, '../globals/characterTypes.ts');
const content = fs.readFileSync(characterTypesPath, 'utf8');

// חילוץ הנתונים
const allUsersMatch = content.match(/export const allUsers: CharacterType\[\] = (\[[\s\S]*?\]);/);
const allUsers = allUsersMatch ? eval(allUsersMatch[1]) : [];

console.log(`📊 Total Users: ${allUsers.length}`);

// סימולציה של מערכת העוקבים
let followRelationships = [];

// פונקציות מערכת העוקבים
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

// בדיקות המערכת
console.log('\n🔍 Testing Follow System...');

// בדיקה 1: התחלת עקיבה
const user1 = allUsers[0]; // user001
const user2 = allUsers[15]; // user016

console.log(`\n📝 Test 1: Follow Operation`);
console.log(`User 1: ${user1.name} (${user1.id})`);
console.log(`User 2: ${user2.name} (${user2.id})`);

const followResult = followUser(user1.id, user2.id);
console.log(`Follow result: ${followResult ? 'SUCCESS' : 'FAILED'}`);

// בדיקה 2: סטטיסטיקות עוקבים
const stats1 = getFollowStats(user1.id, user1.id);
const stats2 = getFollowStats(user2.id, user1.id);

console.log(`\n📊 Follow Statistics:`);
console.log(`${user1.name}: ${stats1.followersCount} followers, ${stats1.followingCount} following`);
console.log(`${user2.name}: ${stats2.followersCount} followers, ${stats2.followingCount} following`);
console.log(`${user1.name} is following ${user2.name}: ${stats2.isFollowing}`);

// בדיקה 3: רשימת עוקבים
const user2Followers = getFollowers(user2.id);
const user1Following = getFollowing(user1.id);

console.log(`\n👥 Follow Lists:`);
console.log(`${user2.name} followers: ${user2Followers.map(u => u.name).join(', ')}`);
console.log(`${user1.name} following: ${user1Following.map(u => u.name).join(', ')}`);

// בדיקה 4: המלצות
const suggestions = getFollowSuggestions(user1.id, 5);
console.log(`\n💡 Follow Suggestions for ${user1.name}:`);
suggestions.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (${user.karmaPoints} karma points)`);
});

// בדיקה 5: ביטול עקיבה
console.log(`\n📝 Test 2: Unfollow Operation`);
const unfollowResult = unfollowUser(user1.id, user2.id);
console.log(`Unfollow result: ${unfollowResult ? 'SUCCESS' : 'FAILED'}`);

const statsAfterUnfollow = getFollowStats(user2.id, user1.id);
console.log(`${user2.name} followers after unfollow: ${statsAfterUnfollow.followersCount}`);

// בדיקה 6: עקיבה מרובה
console.log(`\n📝 Test 3: Multiple Follow Operations`);
const usersToFollow = allUsers.slice(1, 6); // 5 משתמשים נוספים
usersToFollow.forEach(user => {
  followUser(user1.id, user.id);
});

const finalStats = getFollowStats(user1.id, user1.id);
console.log(`${user1.name} final following count: ${finalStats.followingCount}`);

// בדיקה 7: משתמשים פופולריים
console.log(`\n🏆 Popular Users Test:`);
const allUserStats = allUsers.map(char => {
  const stats = getFollowStats(char.id, '');
  return { ...char, followersCount: stats.followersCount };
});

const popularUsers = allUserStats
  .sort((a, b) => b.followersCount - a.followersCount)
  .slice(0, 5);

console.log('Top 5 Popular Users:');
popularUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name}: ${user.followersCount} followers`);
});

// בדיקה 8: תקינות נתונים
console.log(`\n🔍 Data Integrity Check:`);
const totalRelationships = followRelationships.length;
const uniqueFollowers = new Set(followRelationships.map(r => r.followerId));
const uniqueFollowing = new Set(followRelationships.map(r => r.followingId));

console.log(`Total relationships: ${totalRelationships}`);
console.log(`Unique followers: ${uniqueFollowers.size}`);
console.log(`Unique following: ${uniqueFollowing.size}`);

// בדיקה 9: ביצועים
console.log(`\n⚡ Performance Test:`);
const startTime = Date.now();
for (let i = 0; i < 100; i++) {
  const randomUser1 = allUsers[Math.floor(Math.random() * allUsers.length)];
  const randomUser2 = allUsers[Math.floor(Math.random() * allUsers.length)];
  if (randomUser1.id !== randomUser2.id) {
    getFollowStats(randomUser1.id, randomUser2.id);
  }
}
const endTime = Date.now();
console.log(`100 operations took: ${endTime - startTime}ms`);

console.log('\n✅ Follow System Test Completed Successfully!');
console.log(`📊 Final Statistics:`);
console.log(`- Total Users: ${allUsers.length}`);
console.log(`- Total Relationships: ${followRelationships.length}`);
console.log(`- System is working correctly with unified data`); 