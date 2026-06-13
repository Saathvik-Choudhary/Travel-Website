// Firebase Authentication service for admin portal
import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import { COLLECTIONS } from './firestoreSchema.js';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Authentication service
export const authService = {
  // Sign in with Google
  signInWithGoogle: async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user has admin role
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        // Update last login
        await authService.updateLastLogin(user);
        return { success: true, user };
      } else {
        // Sign out if not admin
        await signOut(auth);
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign in with email and password (fallback)
  signIn: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has admin role
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        return { success: true, user };
      } else {
        // Sign out if not admin
        await signOut(auth);
        return { success: false, error: 'Access denied. Admin privileges required.' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Create admin user (for initial setup)
  createAdminUser: async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, { displayName });
      
      // Create user document with admin role
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        email: user.email,
        displayName,
        role: 'admin',
        createdAt: new Date(),
        lastLoginAt: new Date()
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Create admin user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Check if user is admin
  isAdmin: async (user) => {
    if (!user) return false;
    
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      return userDoc.exists() && userDoc.data().role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Update user's last login time
  updateLastLogin: async (user) => {
    if (!user) return;
    
    try {
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        lastLoginAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  },

  // Auth state change listener
  onAuthStateChange: (callback) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const isAdmin = await authService.isAdmin(user);
        callback({ user, isAdmin });
      } else {
        callback({ user: null, isAdmin: false });
      }
    });
  }
};

// Auth context hook (for React components)
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(({ user, isAdmin }) => {
      setUser(user);
      setIsAdmin(isAdmin);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, isAdmin, loading };
};
