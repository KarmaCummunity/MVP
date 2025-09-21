#!/usr/bin/env python3
"""
Gmail Organizer - מארגן תיבת הדואר של Gmail
This script helps organize your Gmail inbox by creating labels and filters
"""

import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json
from datetime import datetime

# If modifying these scopes, delete the file token.pickle.
SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.settings.basic'
]

class GmailOrganizer:
    def __init__(self):
        self.service = None
        self.user_id = 'me'
        
    def authenticate(self):
        """Authenticate and create Gmail service"""
        creds = None
        
        # Token file stores the user's access and refresh tokens
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        
        # If there are no (valid) credentials available, let the user log in
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save the credentials for the next run
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        
        self.service = build('gmail', 'v1', credentials=creds)
        print("✅ התחברת בהצלחה לחשבון Gmail!")
        
    def create_labels(self):
        """Create organizational labels/folders"""
        labels_to_create = [
            {'name': 'אישי', 'color': {'backgroundColor': '#16a765', 'textColor': '#ffffff'}},
            {'name': 'אישי/משפחה', 'color': {'backgroundColor': '#43d692', 'textColor': '#ffffff'}},
            {'name': 'אישי/חברים', 'color': {'backgroundColor': '#72d6a6', 'textColor': '#ffffff'}},
            {'name': 'עבודה', 'color': {'backgroundColor': '#4285f4', 'textColor': '#ffffff'}},
            {'name': 'עבודה/KC', 'color': {'backgroundColor': '#7baaf7', 'textColor': '#ffffff'}},
            {'name': 'עבודה/פרויקטים', 'color': {'backgroundColor': '#a4c2f4', 'textColor': '#ffffff'}},
            {'name': 'לימודים', 'color': {'backgroundColor': '#fb4c2f', 'textColor': '#ffffff'}},
            {'name': 'לימודים/קורסים', 'color': {'backgroundColor': '#fc8068', 'textColor': '#ffffff'}},
            {'name': 'לימודים/מטלות', 'color': {'backgroundColor': '#fda398', 'textColor': '#ffffff'}},
            {'name': 'קניות', 'color': {'backgroundColor': '#ffad47', 'textColor': '#ffffff'}},
            {'name': 'קניות/קבלות', 'color': {'backgroundColor': '#ffc878', 'textColor': '#ffffff'}},
            {'name': 'בנקים וכספים', 'color': {'backgroundColor': '#b39ddb', 'textColor': '#ffffff'}},
            {'name': 'רשתות חברתיות', 'color': {'backgroundColor': '#f691b3', 'textColor': '#ffffff'}},
            {'name': 'ניוזלטרים', 'color': {'backgroundColor': '#a79b8e', 'textColor': '#ffffff'}},
            {'name': 'זבל', 'color': {'backgroundColor': '#666666', 'textColor': '#ffffff'}},
            {'name': 'חשוב', 'color': {'backgroundColor': '#ff0000', 'textColor': '#ffffff'}},
            {'name': 'לטיפול', 'color': {'backgroundColor': '#ffd966', 'textColor': '#000000'}}
        ]
        
        print("\n🏷️  יוצר תוויות/תיקיות...")
        
        for label_info in labels_to_create:
            try:
                # Check if label already exists
                existing_labels = self.service.users().labels().list(userId=self.user_id).execute()
                label_exists = any(label['name'] == label_info['name'] 
                                 for label in existing_labels.get('labels', []))
                
                if not label_exists:
                    label_object = {
                        'name': label_info['name'],
                        'labelListVisibility': 'labelShow',
                        'messageListVisibility': 'show',
                        'color': label_info['color']
                    }
                    
                    created_label = self.service.users().labels().create(
                        userId=self.user_id,
                        body=label_object
                    ).execute()
                    
                    print(f"   ✅ נוצרה תווית: {label_info['name']}")
                else:
                    print(f"   ℹ️ התווית כבר קיימת: {label_info['name']}")
                    
            except HttpError as error:
                print(f"   ❌ שגיאה ביצירת תווית {label_info['name']}: {error}")
    
    def create_filters(self):
        """Create automatic filtering rules"""
        filters_to_create = [
            # Personal emails
            {
                'criteria': {
                    'from': 'family@gmail.com OR mom@ OR dad@ OR brother@ OR sister@'
                },
                'action': {
                    'addLabelIds': ['אישי/משפחה'],
                    'removeLabelIds': ['INBOX']
                }
            },
            # Work - KC
            {
                'criteria': {
                    'from': '@kc.com OR subject:KC OR subject:"KC project"'
                },
                'action': {
                    'addLabelIds': ['עבודה/KC']
                }
            },
            # Studies - Universities and schools
            {
                'criteria': {
                    'from': '@.ac.il OR @university OR @college OR moodle@ OR zoom@'
                },
                'action': {
                    'addLabelIds': ['לימודים']
                }
            },
            # Shopping and receipts
            {
                'criteria': {
                    'from': 'amazon@ OR aliexpress@ OR ebay@ OR receipt@ OR invoice@',
                    'subject': 'order OR receipt OR invoice OR קבלה OR הזמנה'
                },
                'action': {
                    'addLabelIds': ['קניות/קבלות']
                }
            },
            # Banks and finance
            {
                'criteria': {
                    'from': '@bankhapoalim.co.il OR @leumi.co.il OR @discountbank.co.il OR @mizrahi-tefahot.co.il OR @fibi.co.il OR @cal-online.co.il OR @max.co.il'
                },
                'action': {
                    'addLabelIds': ['בנקים וכספים'],
                    'markAsImportant': True
                }
            },
            # Social media
            {
                'criteria': {
                    'from': 'facebook@ OR instagram@ OR twitter@ OR linkedin@ OR tiktok@ OR youtube@'
                },
                'action': {
                    'addLabelIds': ['רשתות חברתיות'],
                    'removeLabelIds': ['INBOX']
                }
            },
            # Newsletters
            {
                'criteria': {
                    'subject': 'newsletter OR unsubscribe OR "email preferences" OR ניוזלטר',
                    'hasTheWord': 'unsubscribe OR newsletter'
                },
                'action': {
                    'addLabelIds': ['ניוזלטרים'],
                    'removeLabelIds': ['INBOX']
                }
            },
            # Spam and promotional
            {
                'criteria': {
                    'hasTheWord': 'promotion OR sale OR discount OR "limited offer" OR מבצע OR הנחה'
                },
                'action': {
                    'addLabelIds': ['זבל'],
                    'removeLabelIds': ['INBOX']
                }
            },
            # Important - bills and payments
            {
                'criteria': {
                    'subject': 'payment due OR bill OR invoice OR חשבון OR תשלום',
                    'from': '-noreply -notification'
                },
                'action': {
                    'addLabelIds': ['חשוב', 'לטיפול'],
                    'markAsImportant': True
                }
            }
        ]
        
        print("\n🔧 יוצר כללי סינון אוטומטיים...")
        
        # First, get label IDs
        labels_response = self.service.users().labels().list(userId=self.user_id).execute()
        label_map = {label['name']: label['id'] for label in labels_response.get('labels', [])}
        
        for filter_data in filters_to_create:
            try:
                # Convert label names to IDs
                if 'addLabelIds' in filter_data['action']:
                    filter_data['action']['addLabelIds'] = [
                        label_map.get(label_name, label_name) 
                        for label_name in filter_data['action']['addLabelIds']
                        if label_map.get(label_name)
                    ]
                
                if 'removeLabelIds' in filter_data['action']:
                    remove_ids = []
                    for label_name in filter_data['action']['removeLabelIds']:
                        if label_name == 'INBOX':
                            remove_ids.append('INBOX')
                        elif label_name in label_map:
                            remove_ids.append(label_map[label_name])
                    filter_data['action']['removeLabelIds'] = remove_ids
                
                # Create the filter
                result = self.service.users().settings().filters().create(
                    userId=self.user_id,
                    body=filter_data
                ).execute()
                
                print(f"   ✅ נוצר כלל סינון: {filter_data['criteria']}")
                
            except HttpError as error:
                print(f"   ⚠️ לא ניתן ליצור כלל סינון: {error}")
    
    def organize_existing_emails(self, max_emails=500):
        """Apply labels to existing emails based on patterns"""
        print(f"\n📧 מארגן עד {max_emails} אימיילים קיימים...")
        
        try:
            # Get label IDs
            labels_response = self.service.users().labels().list(userId=self.user_id).execute()
            label_map = {label['name']: label['id'] for label in labels_response.get('labels', [])}
            
            # Get recent emails
            results = self.service.users().messages().list(
                userId=self.user_id,
                maxResults=max_emails,
                q='in:inbox'
            ).execute()
            
            messages = results.get('messages', [])
            
            if not messages:
                print("   ℹ️ אין אימיילים לארגן")
                return
            
            organized_count = 0
            
            for message in messages:
                try:
                    msg = self.service.users().messages().get(
                        userId=self.user_id,
                        id=message['id'],
                        format='metadata',
                        metadataHeaders=['From', 'Subject']
                    ).execute()
                    
                    headers = msg['payload'].get('headers', [])
                    from_header = next((h['value'] for h in headers if h['name'] == 'From'), '')
                    subject_header = next((h['value'] for h in headers if h['name'] == 'Subject'), '')
                    
                    labels_to_add = []
                    
                    # Categorize based on sender and subject
                    from_lower = from_header.lower()
                    subject_lower = subject_header.lower()
                    
                    # Banks
                    if any(bank in from_lower for bank in ['bankhapoalim', 'leumi', 'discount', 'mizrahi']):
                        labels_to_add.append(label_map.get('בנקים וכספים'))
                    
                    # Shopping
                    elif any(shop in from_lower for shop in ['amazon', 'aliexpress', 'ebay', 'receipt']):
                        labels_to_add.append(label_map.get('קניות/קבלות'))
                    
                    # Studies
                    elif '.ac.il' in from_lower or 'university' in from_lower or 'moodle' in from_lower:
                        labels_to_add.append(label_map.get('לימודים'))
                    
                    # Social media
                    elif any(social in from_lower for social in ['facebook', 'instagram', 'twitter', 'linkedin']):
                        labels_to_add.append(label_map.get('רשתות חברתיות'))
                    
                    # Newsletters
                    elif 'newsletter' in subject_lower or 'unsubscribe' in from_lower:
                        labels_to_add.append(label_map.get('ניוזלטרים'))
                    
                    # Apply labels if any were identified
                    if labels_to_add and any(labels_to_add):
                        self.service.users().messages().modify(
                            userId=self.user_id,
                            id=message['id'],
                            body={'addLabelIds': [l for l in labels_to_add if l]}
                        ).execute()
                        organized_count += 1
                        
                        if organized_count % 10 == 0:
                            print(f"   📊 אורגנו {organized_count} אימיילים...")
                
                except Exception as e:
                    continue
            
            print(f"   ✅ סה״כ אורגנו {organized_count} אימיילים!")
            
        except HttpError as error:
            print(f"   ❌ שגיאה בארגון אימיילים: {error}")
    
    def get_statistics(self):
        """Get inbox statistics"""
        print("\n📊 סטטיסטיקת תיבת הדואר:")
        
        try:
            # Get label statistics
            labels_response = self.service.users().labels().list(userId=self.user_id).execute()
            
            for label in labels_response.get('labels', []):
                if label.get('messagesTotal', 0) > 0:
                    print(f"   📁 {label['name']}: {label.get('messagesTotal', 0)} הודעות ({label.get('messagesUnread', 0)} לא נקראו)")
                    
        except HttpError as error:
            print(f"   ❌ שגיאה בקבלת סטטיסטיקה: {error}")

def main():
    print("""
    ╔════════════════════════════════════════╗
    ║     🌟 מארגן תיבת Gmail - פרטיות ובטיחות 🌟    ║
    ╚════════════════════════════════════════╝
    
    ⚠️  חשוב מאוד: 
    1. אל תשתף סיסמאות עם אף אחד!
    2. שנה מיד את הסיסמה שלך ל-Gmail
    3. הפעל אימות דו-שלבי בחשבון שלך
    
    כלי זה עובד בצורה בטוחה דרך Google API
    """)
    
    organizer = GmailOrganizer()
    
    print("\n🔐 מתחבר ל-Gmail בצורה בטוחה...")
    print("   📌 תפתח חלון דפדפן - התחבר לחשבון Gmail שלך")
    print("   📌 אשר את ההרשאות הנדרשות")
    
    try:
        organizer.authenticate()
        
        # Create labels
        organizer.create_labels()
        
        # Create filters
        organizer.create_filters()
        
        # Organize existing emails
        print("\n❓ כמה אימיילים קיימים לארגן? (ברירת מחדל: 100)")
        try:
            num_emails = input("   מספר אימיילים (Enter ל-100): ").strip()
            num_emails = int(num_emails) if num_emails else 100
        except:
            num_emails = 100
            
        organizer.organize_existing_emails(num_emails)
        
        # Show statistics
        organizer.get_statistics()
        
        print("""
    ✅ סיום! תיבת הדואר שלך מאורגנת!
    
    📝 מה נעשה:
    1. נוצרו תיקיות/תוויות חדשות
    2. נוצרו כללי סינון אוטומטיים
    3. אימיילים קיימים אורגנו
    
    💡 טיפים:
    - בדוק את התיקיות החדשות ב-Gmail
    - ניתן להתאים אישית את הכללים
    - הכללים יפעלו אוטומטית על אימיילים חדשים
        """)
        
    except Exception as e:
        print(f"\n❌ שגיאה: {e}")
        print("\n💡 פתרונות אפשריים:")
        print("   1. ודא שיש לך קובץ credentials.json")
        print("   2. בדוק את החיבור לאינטרנט")
        print("   3. ודא שה-Gmail API מופעל בחשבון שלך")

if __name__ == '__main__':
    main()