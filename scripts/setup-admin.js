// Admin user setup script
// This script creates the first admin user for the Firebase project

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import readline from 'readline';
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
const auth = getAuth(app);
const db = getFirestore(app);

// Helper function to get user input
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Admin setup function
async function setupAdmin() {
  try {
    console.log('🔐 Setting up admin user...');
    console.log('');
    console.log('Choose authentication method:');
    console.log('1. Email/Password (traditional)');
    console.log('2. Google Authentication (recommended)');
    console.log('');
    
    const method = await askQuestion('Enter your choice (1 or 2): ');
    
    if (method === '2') {
      console.log('');
      console.log('📋 Google Authentication Setup Instructions:');
      console.log('');
      console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
      console.log('2. Select your project: travel-website');
      console.log('3. Go to Authentication > Sign-in method');
      console.log('4. Enable Google provider');
      console.log('5. Add your Google account email to the authorized domains');
      console.log('6. Add your domain to authorized domains:');
      console.log('   - localhost (for development)');
      console.log('   - travelwebsite.com (for production)');
      console.log('');
      console.log('✅ Once Google authentication is enabled, you can:');
      console.log('   - Sign in with your Google account');
      console.log('   - The first Google user will need admin role manually assigned');
      console.log('');
      console.log('🔧 To manually assign admin role:');
      console.log('1. Sign in with Google on your website');
      console.log('2. Check the Firebase Console > Authentication > Users');
      console.log('3. Copy the UID of your Google account');
      console.log('4. Run: node scripts/assign-admin-role.js <UID>');
      console.log('');
      return;
    }
    
    // Email/Password setup
    const email = process.argv[2] || await askQuestion('Enter admin email: ');
    const password = process.argv[3] || await askQuestion('Enter admin password: ');
    const displayName = process.argv[4] || await askQuestion('Enter display name (optional): ') || 'Admin';
    
    if (!email || !password) {
      console.log('❌ Email and password are required');
      process.exit(1);
    }
    
    // Create user
    console.log('👤 Creating user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, { displayName });
    
    // Create user document with admin role
    console.log('🔑 Setting admin role...');
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName,
      role: 'admin',
      createdAt: new Date(),
      lastLoginAt: new Date()
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Display Name: ${displayName}`);
    console.log(`🔑 Role: admin`);
    console.log('');
    console.log('🌐 You can now login to the admin portal at:');
    console.log('http://localhost:5173/admin (development)');
    console.log('https://your-project-id.web.app/admin (production)');
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 This email is already registered. Please use a different email or login with existing credentials.');
    } else if (error.code === 'auth/weak-password') {
      console.log('💡 Password is too weak. Please use a stronger password (at least 6 characters).');
    }
    
    process.exit(1);
  }
}

// Run setup
setupAdmin();
