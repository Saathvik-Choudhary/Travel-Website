// Assign admin role to a user by UID
// Usage: node scripts/assign-admin-role.js <UID>

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, getUsers } from 'firebase/auth';

// Firebase configuration (provide values via environment variables)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function assignAdminRole() {
  try {
    const uid = process.argv[2];
    
    if (!uid) {
      console.log('❌ Usage: node scripts/assign-admin-role.js <UID>');
      console.log('');
      console.log('📋 To get the UID:');
      console.log('1. Go to Firebase Console > Authentication > Users');
      console.log('2. Find your Google account');
      console.log('3. Copy the UID (User ID)');
      console.log('');
      process.exit(1);
    }
    
    console.log('🔐 Assigning admin role...');
    console.log(`👤 User UID: ${uid}`);
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      // Update existing user with admin role
      await setDoc(doc(db, 'users', uid), {
        role: 'admin',
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('✅ Admin role assigned successfully!');
      console.log(`📧 Email: ${userDoc.data().email}`);
      console.log(`👤 Display Name: ${userDoc.data().displayName}`);
      console.log(`🔑 Role: admin`);
    } else {
      // Create new user document with admin role
      // Note: This assumes the user exists in Firebase Auth but not in Firestore
      await setDoc(doc(db, 'users', uid), {
        role: 'admin',
        createdAt: new Date(),
        lastLoginAt: new Date()
      });
      
      console.log('✅ Admin role assigned successfully!');
      console.log('📝 Note: User document created in Firestore');
      console.log(`🔑 Role: admin`);
    }
    
    console.log('');
    console.log('🌐 You can now login to the admin portal at:');
    console.log('http://localhost:5173/admin (development)');
    console.log('https://travelwebsite.com/admin (production)');
    
  } catch (error) {
    console.error('❌ Error assigning admin role:', error.message);
    process.exit(1);
  }
}

// Run the function
assignAdminRole();
