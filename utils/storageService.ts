// utils/storageService.ts
import { getFirebase } from './firebaseClient';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface UploadResult {
  url: string;
  fullPath: string;
}

export async function uploadFile(
  fullPath: string,
  uri: string,
  contentType?: string
): Promise<UploadResult> {
  const { storage } = getFirebase();
  const storageRef = ref(storage, fullPath);

  const response = await fetch(uri);
  const blob = await response.blob();

  await uploadBytes(storageRef, blob, { contentType });
  const url = await getDownloadURL(storageRef);
  return { url, fullPath };
}

export function buildChatFilePath(conversationId: string, messageId: string, fileName: string) {
  return `chat/${conversationId}/${messageId}/${fileName}`;
}

export function buildUserImagePath(userId: string, fileName: string) {
  return `images/users/${userId}/${fileName}`;
}

export function buildDonationImagePath(donationId: string, fileName: string) {
  return `images/donations/${donationId}/${fileName}`;
}


