import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

// JWT parsing utility
const parseJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (error) {
    console.error('❌ Failed to parse JWT:', error);
    return null;
  }
};

// Extract token from URL hash
const extractTokenFromURL = () => {
  if (typeof window === 'undefined') return null;
  
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  
  return {
    idToken: params.get('id_token'),
    state: params.get('state'),
    error: params.get('error')
  };
};

export default function OAuthRedirect() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('מעבד את התחברות עם Google...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    const completeAuth = async () => {
      try {
        console.log('🔄 OAuth redirect: Starting session completion');
        
        // Extract token from URL
        const urlParams = extractTokenFromURL();
        console.log('🔄 OAuth redirect: URL params extracted:', {
          hasIdToken: !!urlParams?.idToken,
          hasError: !!urlParams?.error,
          state: urlParams?.state,
          tokenLength: urlParams?.idToken?.length
        });
        
        if (urlParams?.error) {
          throw new Error(`OAuth error: ${urlParams.error}`);
        }
        
        if (urlParams?.idToken) {
          setMessage('מפענח נתוני משתמש...');
          
          // Parse the JWT token
          const profile = parseJWT(urlParams.idToken);
          console.log('🔄 OAuth redirect: JWT parsed:', {
            hasProfile: !!profile,
            email: profile?.email,
            name: profile?.name,
            sub: profile?.sub
          });
          
          if (profile) {
            setMessage('שומר נתוני משתמש...');
            
            // Create user data
            const userData = {
              id: profile.sub,
              name: profile.name || profile.given_name || 'Google User',
              email: profile.email,
              avatar: profile.picture,
              isActive: true,
              lastActive: new Date().toISOString(),
              roles: ['user'],
              settings: { 
                language: 'he', 
                darkMode: false, 
                notificationsEnabled: true 
              },
              phone: '+972501234567',
              bio: '',
              karmaPoints: 0,
              joinDate: new Date().toISOString(),
              location: { city: 'ישראל', country: 'IL' },
              interests: [],
              postsCount: 0,
              followersCount: 0,
              followingCount: 0,
              notifications: [
                { type: 'system', text: 'ברוך הבא לקרמה קומיוניטי!', date: new Date().toISOString() }
              ],
            };
            
            // Store user data for the main app to pick up
            await AsyncStorage.setItem('google_auth_user', JSON.stringify(userData));
            await AsyncStorage.setItem('google_auth_token', urlParams.idToken);
            await AsyncStorage.setItem('oauth_success_flag', 'true');
            await AsyncStorage.removeItem('oauth_in_progress');
            
            console.log('✅ OAuth redirect: User data stored in AsyncStorage');
            
            setStatus('success');
            setMessage(`שלום ${profile.name || profile.email}!`);
            setDetails('התחברות הושלמה בהצלחה. מעביר לעמוד הבית...');
            
            // Complete the expo-auth-session flow
            const result = WebBrowser.maybeCompleteAuthSession();
            console.log('🔄 OAuth redirect: maybeCompleteAuthSession result:', result);
            
            // Notify parent window if in popup
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_SUCCESS',
                userData,
                token: urlParams.idToken
              }, window.location.origin);
            }
            
          } else {
            throw new Error('Failed to parse user profile from JWT token');
          }
        } else {
          // No token found - maybe expo-auth-session will handle it
          console.log('⚠️ OAuth redirect: No token in URL, trying expo-auth-session');
          setMessage('מחפש נתוני אימות...');
        }
        
        // Complete the expo-auth-session flow regardless
        const result = WebBrowser.maybeCompleteAuthSession();
        console.log('🔄 OAuth redirect: maybeCompleteAuthSession result:', result);
        
        if (status !== 'success') {
          setStatus('success');
          setMessage('האימות הושלם!');
          setDetails('מעביר לעמוד הבית...');
        }
        
        // Redirect to home
        setTimeout(() => {
          console.log('🔄 OAuth redirect: Redirecting to home');
          router.replace('/');
        }, 2500);
        
      } catch (error) {
        console.error('❌ OAuth redirect error:', error);
        setStatus('error');
        setMessage('שגיאה בהתחברות');
        setDetails(error instanceof Error ? error.message : String(error));
        
        // Still complete the session
        try {
          WebBrowser.maybeCompleteAuthSession();
        } catch {}
        
        // Still redirect to home after showing error
        setTimeout(() => {
          router.replace('/');
        }, 4000);
      }
    };

    completeAuth();
  }, [router, status]);

  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'error': return '#FF6B6B';
      default: return '#FF69B4';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#F0F8FF',
      padding: 20
    }}>
      {status === 'processing' && (
        <ActivityIndicator size="large" color={getStatusColor()} />
      )}
      
      <View style={{ 
        marginTop: status === 'processing' ? 16 : 0,
        alignItems: 'center'
      }}>
        <Text style={{ fontSize: 32, marginBottom: 16 }}>
          {getStatusIcon()}
        </Text>
        
        <Text style={{ 
          fontSize: 18, 
          color: '#333',
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: 8
        }}>
          {message}
        </Text>
        
        {details && (
          <Text style={{ 
            fontSize: 14, 
            color: '#666',
            textAlign: 'center',
            lineHeight: 20
          }}>
            {details}
          </Text>
        )}
      </View>
    </View>
  );
}

// Log page load for debugging
if (typeof window !== 'undefined') {
  console.log('🔄 OAuth redirect page loaded:', {
    url: window.location.href,
    search: window.location.search,
    hash: window.location.hash ? window.location.hash.substring(0, 100) + '...' : '',
    timestamp: new Date().toISOString()
  });
  
  // Also check if we have the token
  const params = extractTokenFromURL();
  if (params?.idToken) {
    console.log('🎉 OAuth redirect: Google ID token found in URL!');
  } else {
    console.log('⚠️ OAuth redirect: No Google ID token found in URL');
  }
}