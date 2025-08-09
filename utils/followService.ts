// שירות לניהול מערכת העוקבים
import { allUsers, CharacterType } from '../globals/characterTypes';
import { sendFollowNotification } from './notificationService';
import { db, DB_COLLECTIONS, DatabaseService } from './databaseService';

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

// פונקציה לקבלת מספרי העוקבים המעודכנים
export const getUpdatedFollowCounts = async (userId: string): Promise<{ followersCount: number; followingCount: number }> => {
  try {
    const followers = await db.getFollowers(userId);
    const following = await db.getFollowing(userId);
    
    return {
      followersCount: followers.length,
      followingCount: following.length,
    };
  } catch (error) {
    console.error('❌ Get updated follow counts error:', error);
    return {
      followersCount: 0,
      followingCount: 0,
    };
  }
};

// פונקציה לקבלת סטטיסטיקות עוקבים למשתמש
export const getFollowStats = async (userId: string, currentUserId: string): Promise<FollowStats> => {
  try {
    const followers = await db.getFollowers(userId);
    const following = await db.getFollowing(userId);
    
    // בדיקה אם המשתמש הנוכחי עוקב אחרי המשתמש
    const isFollowing = following.some((rel: any) => rel.followerId === currentUserId);

    return {
      followersCount: followers.length,
      followingCount: following.length,
      isFollowing
    };
  } catch (error) {
    console.error('❌ Get follow stats error:', error);
    return {
      followersCount: 0,
      followingCount: 0,
      isFollowing: false
    };
  }
};

// פונקציה לעקוב אחרי משתמש
export const followUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    // בדיקה אם מנסים לעקוב אחרי עצמם
    if (followerId === followingId) {
      return false; // לא ניתן לעקוב אחרי עצמך
    }

    // בדיקה אם כבר עוקבים
    const existingFollowers = await db.getFollowers(followingId);
    const isAlreadyFollowing = existingFollowers.some((rel: any) => rel.followerId === followerId);

    if (isAlreadyFollowing) {
      return false; // כבר עוקבים
    }

    // הוספת יחס עקיבה חדש
    const newFollow: FollowRelationship = {
      followerId,
      followingId,
      followDate: new Date().toISOString()
    };

    // שמירת העוקב אצל המשתמש שמעקבים אחריו
    await db.addFollower(followingId, followerId, newFollow);
    
    // שמירת היחס אצל העוקב
    await db.addFollowing(followerId, followingId, newFollow);
    
    // Send notification to the person being followed
    const follower = allUsers.find(user => user.id === followerId);
    if (follower) {
      sendFollowNotification(follower.name, followingId);
    }
    
    // Update follow counts for both users
    await updateFollowCounts(followerId);
    await updateFollowCounts(followingId);
    
    return true;
  } catch (error) {
    console.error('❌ Follow user error:', error);
    return false;
  }
};

// פונקציה לבטל עקיבה אחרי משתמש
export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    // מחיקת העוקב אצל המשתמש שמעקבים אחריו
    await db.removeFollower(followingId, followerId);
    
    // מחיקת היחס אצל העוקב
    await db.removeFollowing(followerId, followingId);
    
    // Update follow counts for both users
    await updateFollowCounts(followerId);
    await updateFollowCounts(followingId);
    
    return true;
  } catch (error) {
    console.error('❌ Unfollow user error:', error);
    return false;
  }
};

// פונקציה לקבלת רשימת העוקבים של משתמש
export const getFollowers = async (userId: string): Promise<CharacterType[]> => {
  try {
    const followers = await db.getFollowers(userId);
    const followerIds = (followers as any[]).map(rel => rel.followerId);
    return allUsers.filter(char => followerIds.includes(char.id));
  } catch (error) {
    console.error('❌ Get followers error:', error);
    return [];
  }
};

// פונקציה לקבלת רשימת האנשים שמשתמש עוקב אחריהם
export const getFollowing = async (userId: string): Promise<CharacterType[]> => {
  try {
    const following = await db.getFollowing(userId);
    const followingIds = (following as any[]).map(rel => rel.followingId);
    return allUsers.filter(char => followingIds.includes(char.id));
  } catch (error) {
    console.error('❌ Get following error:', error);
    return [];
  }
};

// פונקציה לקבלת המלצות למשתמשים לעקוב אחריהם
export const getFollowSuggestions = async (currentUserId: string, limit: number = 10): Promise<CharacterType[]> => {
  try {
    // קבלת רשימת האנשים שכבר עוקבים אחריהם
    const following = await db.getFollowing(currentUserId);
    const alreadyFollowing = (following as any[]).map(rel => rel.followingId);

    // סינון משתמשים שלא עוקבים אחריהם
    const suggestions = allUsers.filter(char => 
      char.id !== currentUserId && 
      !alreadyFollowing.includes(char.id)
    );

    // מיון לפי נקודות קארמה (גבוה יותר = מומלץ יותר)
    suggestions.sort((a, b) => b.karmaPoints - a.karmaPoints);

    return suggestions.slice(0, limit);
  } catch (error) {
    console.error('❌ Get follow suggestions error:', error);
    return [];
  }
};

// פונקציה לאיפוס כל יחסי העוקבים (לצורך בדיקות)
export const resetFollowRelationships = async (): Promise<void> => {
  try {
    // Clear all follow relationships from database
    await DatabaseService.clearAllData();
    console.log('✅ All follow relationships reset');
  } catch (error) {
    console.error('❌ Reset follow relationships error:', error);
  }
};

// פונקציה ליצירת נתונים לדוגמה
export const createSampleFollowData = async (): Promise<void> => {
  try {
    console.log('📊 Creating sample follow data...');
    
    // יצירת יחסי עוקבים לדוגמה
    const sampleRelationships: FollowRelationship[] = [
      {
        followerId: 'char1',
        followingId: 'char2',
        followDate: new Date().toISOString()
      },
      {
        followerId: 'char1',
        followingId: 'char3',
        followDate: new Date().toISOString()
      },
      {
        followerId: 'char2',
        followingId: 'char1',
        followDate: new Date().toISOString()
      },
      {
        followerId: 'char3',
        followingId: 'char1',
        followDate: new Date().toISOString()
      },
      {
        followerId: 'u1',
        followingId: 'char1',
        followDate: new Date().toISOString()
      },
      {
        followerId: 'char1',
        followingId: 'u1',
        followDate: new Date().toISOString()
      },
    ];
    
    // שמירת הנתונים למסד הנתונים
    for (const relationship of sampleRelationships) {
      await db.addFollower(relationship.followingId, relationship.followerId, relationship);
      await db.addFollowing(relationship.followerId, relationship.followingId, relationship);
    }
    
    console.log('✅ Sample follow data created:', sampleRelationships.length, 'relationships');
  } catch (error) {
    console.error('❌ Create sample follow data error:', error);
  }
};

// פונקציה לקבלת היסטוריית עקיבה
export const getFollowHistory = async (userId: string): Promise<FollowRelationship[]> => {
  try {
    const followers = await db.getFollowers(userId);
    const following = await db.getFollowing(userId);
    
    const allRelationships: FollowRelationship[] = [
      ...(followers as any[]),
      ...(following as any[])
    ];
    
    return allRelationships;
  } catch (error) {
    console.error('❌ Get follow history error:', error);
    return [];
  }
};

// פונקציה לקבלת משתמשים פופולריים (עם הכי הרבה עוקבים)
export const getPopularUsers = async (limit: number = 10): Promise<CharacterType[]> => {
  try {
    const userStats = await Promise.all(
      allUsers.map(async char => {
        const stats = await getFollowStats(char.id, '');
        return { ...char, followersCount: stats.followersCount };
      })
    );

    return userStats
      .sort((a, b) => b.followersCount - a.followersCount)
      .slice(0, limit);
  } catch (error) {
    console.error('❌ Get popular users error:', error);
    return [];
  }
};

// פונקציה לבדיקה ויזואלית של מצב העוקבים (לצורך דיבוג)
export const debugFollowRelationships = async (): Promise<void> => {
  try {
    console.log('🔍 Debug Follow Relationships:');
    
    for (const char of allUsers) {
      const stats = await getFollowStats(char.id, '');
      console.log(`${char.name}: ${stats.followersCount} followers, ${stats.followingCount} following`);
    }
    
    console.log('✅ Debug complete');
  } catch (error) {
    console.error('❌ Debug follow relationships error:', error);
  }
};

// פונקציה לבדיקה מקיפה של המערכת
export const comprehensiveSystemCheck = async (): Promise<void> => {
  try {
    console.log('🔍 Comprehensive System Check:');
    console.log('================================');
    
    // בדיקת כמות משתמשים
    console.log(`📊 Total Users: ${allUsers.length}`);
    console.log(`📊 Character Types: ${allUsers.filter(u => u.id.startsWith('char')).length}`);
    console.log(`📊 Additional Users: ${allUsers.filter(u => u.id.startsWith('u')).length}`);
    
    // בדיקת משתמשים עם הכי הרבה עוקבים
    const popularUsers = await getPopularUsers(5);
    console.log('🏆 Top 5 Popular Users:');
    popularUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}: ${user.followersCount} followers`);
    });
    
    // בדיקת המלצות
    if (allUsers.length > 0) {
      const suggestions = await getFollowSuggestions(allUsers[0].id, 5);
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
  } catch (error) {
    console.error('❌ Comprehensive system check error:', error);
  }
};

// פונקציה לבדיקת תקינות המערכת
export const validateSystemIntegrity = async (): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    const errors: string[] = [];
    
    // בדיקת כפילות ID
    const ids = allUsers.map(user => user.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      errors.push('Duplicate user IDs found');
    }
    
    // בדיקת מבנה נתונים
    for (const user of allUsers) {
      if (!user.id || !user.name || !user.avatar) {
        errors.push(`User ${user.id} missing required fields`);
      }
      
      if (!user.isActive) {
        errors.push(`User ${user.name} is marked as inactive`);
      }
      
      if (!user.characterData) {
        errors.push(`User ${user.name} missing characterData`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    console.error('❌ Validate system integrity error:', error);
    return {
      isValid: false,
      errors: ['System validation failed']
    };
  }
}; 

// פונקציה לעדכון מספרי העוקבים במסד הנתונים
export const updateFollowCounts = async (userId: string): Promise<void> => {
  try {
    const followers = await db.getFollowers(userId);
    const following = await db.getFollowing(userId);
    
    // עדכון מספרי העוקבים במסד הנתונים
    const userData = {
      followersCount: followers.length,
      followingCount: following.length,
    };
    
    await db.updateUser(userId, userData);
    console.log('✅ Updated follow counts for user:', userId, userData);
  } catch (error) {
    console.error('❌ Update follow counts error:', error);
  }
}; 