#!/usr/bin/env node

/**
 * Script to check and display the redirect URI that should be configured
 * in Google Cloud Console for OAuth authentication
 */

const readline = require('readline');

console.log('\n🔍 Google OAuth Redirect URI Checker\n');
console.log('='.repeat(50));

// Get platform from command line or ask user
const platform = process.argv[2] || 'web';
const port = process.argv[3] || '8081';

console.log(`\n📱 Platform: ${platform}`);
console.log(`🔌 Port: ${port}\n`);

// Calculate redirect URIs based on platform
const redirectUris = [];

if (platform === 'web' || !platform) {
  // Web redirect URIs
  redirectUris.push(
    `http://localhost:${port}/oauthredirect`,
    `http://localhost:19006/oauthredirect`,
    `http://127.0.0.1:${port}/oauthredirect`,
    `http://127.0.0.1:19006/oauthredirect`,
    `exp://localhost:${port}/--/oauthredirect`,
    `exp://localhost:19006/--/oauthredirect`,
    `https://karma-community-kc.com/oauthredirect`,
    `https://www.karma-community-kc.com/oauthredirect`
  );
}

if (platform === 'ios' || platform === 'android' || !platform) {
  // Mobile redirect URIs
  redirectUris.push(
    `com.navesarussi1.KarmaCommunity://oauthredirect`
  );
}

console.log('📋 Redirect URIs to add to Google Cloud Console:\n');
console.log('─'.repeat(50));

redirectUris.forEach((uri, index) => {
  console.log(`${index + 1}. ${uri}`);
});

console.log('\n' + '='.repeat(50));
console.log('\n📝 Instructions:\n');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Select your project');
console.log('3. Click on your OAuth 2.0 Client ID (Web client)');
console.log('4. Under "Authorized redirect URIs", click "ADD URI"');
console.log('5. Add each URI from the list above');
console.log('6. Click "SAVE"');
console.log('\n⏱️  Note: Changes may take a few minutes to propagate\n');

console.log('🔍 To find your current redirect URI:');
console.log('1. Open your app in the browser');
console.log('2. Open Developer Tools (F12)');
console.log('3. Go to Console tab');
console.log('4. Look for logs containing "redirectUri"');
console.log('5. Or add this to your code temporarily:');
console.log('   console.log("Redirect URI:", redirectUri);\n');

console.log('💡 Quick Fix:');
console.log('If you see a specific URI in the error message,');
console.log('add that exact URI to Google Cloud Console.\n');

