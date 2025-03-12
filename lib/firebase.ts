// Import the Firebase SDK
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Check if environment variables are available
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

// Check if config is valid
const isConfigValid = Object.values(firebaseConfig).every(value => value !== '');

let app;
let auth;
let db;
let storage;
let googleProvider;

// Only initialize Firebase if the configuration is valid or if we're not in production
if (isConfigValid) {
  // Initialize Firebase
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
} else {
  console.warn(
    'Firebase configuration is missing or incomplete. ' +
    'Make sure you have added the required environment variables in .env.local'
  );
  
  // In development mode, provide mock implementations for demo purposes
  if (process.env.NODE_ENV !== 'production') {
    // Mock implementations for development
    const mockUser = {
      uid: 'mock-user-id',
      email: 'user@example.com',
      displayName: 'Demo User',
    };
    
    auth = {
      currentUser: null,
      onAuthStateChanged: (callback) => {
        setTimeout(() => callback(null), 500);
        return () => {};
      },
    };
    
    db = {
      // Mock implementation
    };
    
    storage = {
      // Mock implementation
    };
    
    console.info('Running with mock Firebase implementation for development');
  }
}

// Authentication functions with fallbacks for development
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    if (!auth || process.env.NODE_ENV !== 'production') {
      console.log('Mock signup:', { email, displayName });
      return { uid: 'mock-user-id', email, displayName };
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user's profile with the display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    if (!auth || process.env.NODE_ENV !== 'production') {
      console.log('Mock sign in:', email);
      return { uid: 'mock-user-id', email, displayName: 'Demo User' };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    if (!auth || !googleProvider || process.env.NODE_ENV !== 'production') {
      console.log('Mock Google sign in');
      return { uid: 'mock-google-user-id', email: 'google@example.com', displayName: 'Google User' };
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    if (!auth || process.env.NODE_ENV !== 'production') {
      console.log('Mock sign out');
      return;
    }
    
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Custom hook for auth state
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth || process.env.NODE_ENV !== 'production') {
    // Mock auth state change for development
    console.log('Using mock auth state change');
    setTimeout(() => callback({ 
      uid: 'mock-user-id',
      email: 'user@example.com',
      displayName: 'Demo User',
    } as unknown as User), 500);
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
};

// Export Firebase instances
export { auth, db, storage };
export default app; 