import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { GoogleWorkspaceService } from './services/googleSheetsService';

// Initialize Firebase App (guard against duplicate init)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Request Google Workspace scopes for Sheets and Drive file access
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Cloud Firestore
export const db = getFirestore(
  app,
  (firebaseConfig as any).firestoreDatabaseId || '(default)'
);

// Test connection on startup per Firebase guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase offline mode active.');
    }
  }
}

// Sign in with Google popup and automatically acquire Workspace token
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      GoogleWorkspaceService.setToken(credential.accessToken);
    }

    // Save/update user profile in users collection
    if (result.user) {
      try {
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(
          userRef,
          {
            uid: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || 'Google User',
            photoURL: result.user.photoURL || '',
            role: 'editor',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Could not sync user profile to firestore:', err);
      }
    }
    return result.user;
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

// Sign out and clear cached token in memory
export async function signOutUser(): Promise<void> {
  await signOut(auth);
  GoogleWorkspaceService.clearAuth();
}

// Helper to verify if user has a valid Google account
export function isGoogleUser(user: User | null): boolean {
  if (!user) return false;
  const isGoogle = user.providerData?.some(p => p.providerId === 'google.com');
  const hasEmail = Boolean(user.email && user.email.includes('@'));
  return isGoogle || hasEmail;
}

export type { User };
