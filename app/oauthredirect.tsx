import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

export default function OAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Complete the OAuth session
    const completeAuth = async () => {
      try {
        // This tells expo-auth-session that the OAuth flow is complete
        WebBrowser.maybeCompleteAuthSession();
        
        // Redirect to home after a short delay to ensure the auth session completes
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      } catch (error) {
        console.error('OAuth redirect error:', error);
        // Still redirect to home even if there's an error
        router.replace('/');
      }
    };

    completeAuth();
  }, [router]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#F0F8FF' 
    }}>
      <ActivityIndicator size="large" color="#FF69B4" />
      <Text style={{ 
        marginTop: 16, 
        fontSize: 16, 
        color: '#333',
        textAlign: 'center'
      }}>
        מסיים את התחברות עם Google...
      </Text>
    </View>
  );
}

// Log page load for debugging
if (typeof window !== 'undefined') {
  console.log('🔄 OAuth redirect page loaded:', {
    url: window.location.href,
    search: window.location.search,
    hash: window.location.hash,
    timestamp: new Date().toISOString()
  });
}
