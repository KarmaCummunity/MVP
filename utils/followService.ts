// שירות לניהול מערכת העוקבים
import { allUsers, CharacterType } from '../globals/characterTypes';

export interface FollowRelationship {
  followerId: string;
  followingId: string;
  followDate: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

// מערך לשמירת יחסי העוקבים (במציאות זה יהיה בבסיס נתונים)
let followRelationships: FollowRelationship[] = [];

// פונקציה לקבלת סטטיסטיקות עוקבים למשתמש
export const getFollowStats = (userId: string, currentUserId: string): FollowStats => {
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
};

// פונקציה לעקוב אחרי משתמש
export const followUser = (followerId: string, followingId: string): boolean => {
  // בדיקה אם מנסים לעקוב אחרי עצמם
  if (followerId === followingId) {
    return false; // לא ניתן לעקוב אחרי עצמך
  }

  // בדיקה אם כבר עוקבים
  const existingFollow = followRelationships.find(rel => 
    rel.followerId === followerId && rel.followingId === followingId
  );

  if (existingFollow) {
    return false; // כבר עוקבים
  }

  // הוספת יחס עקיבה חדש
  const newFollow: FollowRelationship = {
    followerId,
    followingId,
    followDate: new Date().toISOString()
  };

  followRelationships.push(newFollow);
  return true;
};

// פונקציה לבטל עקיבה אחרי משתמש
export const unfollowUser = (followerId: string, followingId: string): boolean => {
  const followIndex = followRelationships.findIndex(rel => 
    rel.followerId === followerId && rel.followingId === followingId
  );

  if (followIndex === -1) {
    return false; // לא עוקבים
  }

  followRelationships.splice(followIndex, 1);
  return true;
};

// פונקציה לקבלת רשימת העוקבים של משתמש
export const getFollowers = (userId: string): CharacterType[] => {
  const followerIds = followRelationships
    .filter(rel => rel.followingId === userId)
    .map(rel => rel.followerId);

  return allUsers.filter(char => followerIds.includes(char.id));
};

// פונקציה לקבלת רשימת האנשים שמשתמש עוקב אחריהם
export const getFollowing = (userId: string): CharacterType[] => {
  const followingIds = followRelationships
    .filter(rel => rel.followerId === userId)
    .map(rel => rel.followingId);

  return allUsers.filter(char => followingIds.includes(char.id));
};

// פונקציה לקבלת המלצות למשתמשים לעקוב אחריהם
export const getFollowSuggestions = (currentUserId: string, limit: number = 10): CharacterType[] => {
  // קבלת רשימת האנשים שכבר עוקבים אחריהם
  const alreadyFollowing = followRelationships
    .filter(rel => rel.followerId === currentUserId)
    .map(rel => rel.followingId);

  // סינון משתמשים שלא עוקבים אחריהם
  const suggestions = allUsers.filter(char => 
    char.id !== currentUserId && 
    !alreadyFollowing.includes(char.id)
  );

  // מיון לפי נקודות קארמה (גבוה יותר = מומלץ יותר)
  suggestions.sort((a, b) => b.karmaPoints - a.karmaPoints);

  return suggestions.slice(0, limit);
};

// פונקציה לאיפוס כל יחסי העוקבים (לצורך בדיקות)
export const resetFollowRelationships = (): void => {
  followRelationships = [];
};

// פונקציה לקבלת היסטוריית עקיבה
export const getFollowHistory = (userId: string): FollowRelationship[] => {
  return followRelationships.filter(rel => 
    rel.followerId === userId || rel.followingId === userId
  );
};

// פונקציה לקבלת משתמשים פופולריים (עם הכי הרבה עוקבים)
export const getPopularUsers = (limit: number = 10): CharacterType[] => {
  const userStats = allUsers.map(char => {
    const stats = getFollowStats(char.id, '');
    return { ...char, followersCount: stats.followersCount };
  });

  return userStats
    .sort((a, b) => b.followersCount - a.followersCount)
    .slice(0, limit);
};

// פונקציה לבדיקה ויזואלית של מצב העוקבים (לצורך דיבוג)
export const debugFollowRelationships = (): void => {
  console.log('🔍 Debug Follow Relationships:');
  console.log('Total relationships:', followRelationships.length);
  
  allUsers.forEach(char => {
    const stats = getFollowStats(char.id, '');
    console.log(`${char.name}: ${stats.followersCount} followers, ${stats.followingCount} following`);
  });
  
  console.log('All relationships:', followRelationships);
};

// פונקציה לבדיקה מקיפה של המערכת
export const comprehensiveSystemCheck = (): void => {
  console.log('🔍 Comprehensive System Check:');
  console.log('================================');
  
  // בדיקת כמות משתמשים
  console.log(`📊 Total Users: ${allUsers.length}`);
  console.log(`📊 Character Types: ${allUsers.filter(u => u.id.startsWith('char')).length}`);
  console.log(`📊 Additional Users: ${allUsers.filter(u => u.id.startsWith('u')).length}`);
  
  // בדיקת יחסי עוקבים
  console.log(`📊 Total Follow Relationships: ${followRelationships.length}`);
  
  // בדיקת משתמשים עם הכי הרבה עוקבים
  const popularUsers = getPopularUsers(5);
  console.log('🏆 Top 5 Popular Users:');
  popularUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}: ${user.followersCount} followers`);
  });
  
  // בדיקת המלצות
  if (allUsers.length > 0) {
    const suggestions = getFollowSuggestions(allUsers[0].id, 5);
    console.log(`💡 Follow Suggestions for ${allUsers[0].name}:`);
    suggestions.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.karmaPoints} karma points)`);
    });
  }
  
  // בדיקת מבנה נתונים
  console.log('📋 Data Structure Check:');
  const sampleUser = allUsers[0];
  if (sampleUser) {
    console.log(`✅ Sample User Structure:`);
    console.log(`   - ID: ${sampleUser.id}`);
    console.log(`   - Name: ${sampleUser.name}`);
    console.log(`   - Email: ${sampleUser.email || 'N/A'}`);
    console.log(`   - Phone: ${sampleUser.phone || 'N/A'}`);
    console.log(`   - Karma Points: ${sampleUser.karmaPoints}`);
    console.log(`   - Roles: ${sampleUser.roles.join(', ')}`);
    console.log(`   - Is Active: ${sampleUser.isActive}`);
    console.log(`   - Is Verified: ${sampleUser.isVerified}`);
    console.log(`   - Preferences: ${JSON.stringify(sampleUser.preferences)}`);
    console.log(`   - Notifications: ${sampleUser.notifications?.length || 0} items`);
    console.log(`   - Character Data: ${Object.keys(sampleUser.characterData).length} properties`);
  }
  
  console.log('================================');
  console.log('✅ System Check Complete');
};

// פונקציה לבדיקת תקינות המערכת
export const validateSystemIntegrity = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // בדיקת כפילות ID
  const ids = allUsers.map(user => user.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push('Duplicate user IDs found');
  }
  
  // בדיקת מבנה נתונים
  allUsers.forEach((user, index) => {
    if (!user.id || !user.name || !user.avatar) {
      errors.push(`User at index ${index} missing required fields`);
    }
    
    if (user.followersCount !== 0 || user.followingCount !== 0) {
      errors.push(`User ${user.name} has non-zero follow counts (should be 0 initially)`);
    }
    
    if (!user.isActive) {
      errors.push(`User ${user.name} is marked as inactive`);
    }
    
    if (!user.characterData) {
      errors.push(`User ${user.name} missing characterData`);
    }
  });
  
  // בדיקת יחסי עוקבים
  followRelationships.forEach(rel => {
    const followerExists = allUsers.some(user => user.id === rel.followerId);
    const followingExists = allUsers.some(user => user.id === rel.followingId);
    
    if (!followerExists) {
      errors.push(`Follow relationship references non-existent follower: ${rel.followerId}`);
    }
    
    if (!followingExists) {
      errors.push(`Follow relationship references non-existent following: ${rel.followingId}`);
    }
    
    if (rel.followerId === rel.followingId) {
      errors.push(`User ${rel.followerId} cannot follow themselves`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 