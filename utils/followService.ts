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

export const getFollowStats = async (userId: string, currentUserId: string): Promise<FollowStats> => {
  try {
    const followers = await db.getFollowers(userId);
    const following = await db.getFollowing(userId);
    
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

export const followUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    if (followerId === followingId) {
      return false; 
    }

    const existingFollowers = await db.getFollowers(followingId);
    const isAlreadyFollowing = existingFollowers.some((rel: any) => rel.followerId === followerId);

    if (isAlreadyFollowing) {
      return false; 
    }

    const newFollow: FollowRelationship = {
      followerId,
      followingId,
      followDate: new Date().toISOString()
    };

    await db.addFollower(followingId, followerId, newFollow);
    
    await db.addFollowing(followerId, followingId, newFollow);
    
    // Optional: fetch follower name from backend; fallback to ID
    try {
      const followerName = followerId;
      sendFollowNotification(followerName, followingId);
    } catch {}
    
    // Update follow counts for both users
    await updateFollowCounts(followerId);
    await updateFollowCounts(followingId);
    
    return true;
  } catch (error) {
    console.error('❌ Follow user error:', error);
    return false;
  }
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    await db.removeFollower(followingId, followerId);
    
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

export const getFollowers = async (userId: string): Promise<any[]> => {
  try {
    const followers = await db.getFollowers(userId);
    // TODO: Replace with real user fetch from backend
    const followerIds = (followers as any[]).map((rel: any) => rel.followerId);
    return followerIds.map((id: string) => ({ id }));
  } catch (error) {
    console.error('❌ Get followers error:', error);
    return [];
  }
};

export const getFollowing = async (userId: string): Promise<any[]> => {
  try {
    const following = await db.getFollowing(userId);
    // TODO: Replace with real user fetch from backend
    const followingIds = (following as any[]).map((rel: any) => rel.followingId);
    return followingIds.map((id: string) => ({ id }));
  } catch (error) {
    console.error('❌ Get following error:', error);
    return [];
  }
};

export const getFollowSuggestions = async (currentUserId: string, limit: number = 10): Promise<any[]> => {
  try {
    // TODO: Implement real suggestion logic against backend
    return [];
  } catch (error) {
    console.error('❌ Get follow suggestions error:', error);
    return [];
  }
};

export const resetFollowRelationships = async (): Promise<void> => {
  try {
    await DatabaseService.clearAllData();
    // console removed
  } catch (error) {
    console.error('❌ Reset follow relationships error:', error);
  }
};

export const createSampleFollowData = async (): Promise<void> => {
  try {
    // Demo data creation removed
    // console removed');
  } catch (error) {
    console.error('❌ Create sample follow data error:', error);
  }
};

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

export const getPopularUsers = async (limit: number = 10): Promise<any[]> => {
  try {
    // TODO: Implement popular users query against backend
    return [];
  } catch (error) {
    console.error('❌ Get popular users error:', error);
    return [];
  }
};


export const debugFollowRelationships = async (): Promise<void> => {
  try {
    // console removed');
  } catch (error) {
    console.error('❌ Debug follow relationships error:', error);
  }
};


export const comprehensiveSystemCheck = async (): Promise<void> => {
  try {
    // console removed');
  } catch (error) {
    console.error('❌ Comprehensive system check error:', error);
  }
};


export const validateSystemIntegrity = async (): Promise<{ isValid: boolean; errors: string[] }> => {
  try {
    return { isValid: true, errors: [] };
  } catch (error) {
    console.error('❌ Validate system integrity error:', error);
    return {
      isValid: false,
      errors: ['System validation failed']
    };
  }
}; 


export const updateFollowCounts = async (userId: string): Promise<void> => {
  try {
    const followers = await db.getFollowers(userId);
    const following = await db.getFollowing(userId);
    

    const userData = {
      followersCount: followers.length,
      followingCount: following.length,
    };
    
    await db.updateUser(userId, userData);
    // console removed
  } catch (error) {
    console.error('❌ Update follow counts error:', error);
  }
}; 