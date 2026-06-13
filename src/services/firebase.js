// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirebaseConfig, getCurrentEnvironment } from '../config/environment.js';

// Firebase configuration
const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (getCurrentEnvironment() === 'development') {
  try {
    // Auth emulator
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Firestore emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Storage emulator
    connectStorageEmulator(storage, 'localhost', 9199);
    
    // Functions emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    console.log('Firebase emulators not running, using production services');
  }
}

export default app;
