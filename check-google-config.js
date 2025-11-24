#!/usr/bin/env node
/**
 * Check Google OAuth Configuration
 * This script verifies that all Google OAuth settings are correct
 */

const config = require('./app.config.js');

console.log('🔍 Checking Google OAuth Configuration...\n');

const extra = config.expo.extra;

console.log('📋 Google Client IDs:');
console.log('   Web:', extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? '✅ SET' : '❌ MISSING');
console.log('       ', extra.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
console.log('   iOS:', extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ? '✅ SET' : '❌ MISSING');
console.log('       ', extra.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
console.log('   Android:', extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ? '✅ SET' : '❌ MISSING');
console.log('       ', extra.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);

console.log('\n📍 Redirect URIs that need to be added to Google Console:');
console.log('   For localhost development:');
console.log('   - http://localhost:8081/oauthredirect');
console.log('   - http://localhost:19006/oauthredirect');
console.log('   For production:');
console.log('   - https://karma-community-kc.com/oauthredirect');

console.log('\n🔗 API Configuration:');
console.log('   API Base URL:', extra.EXPO_PUBLIC_API_BASE_URL || 'NOT SET');

console.log('\n✅ Configuration check complete!');
console.log('\n📝 Next steps:');
console.log('   1. Make sure the redirect URIs are added to Google Cloud Console');
console.log('   2. Go to: https://console.cloud.google.com/apis/credentials');
console.log('   3. Click on your Web Client ID');
console.log('   4. Add the redirect URIs listed above');
console.log('   5. Click Save and wait a few minutes for changes to take effect');

