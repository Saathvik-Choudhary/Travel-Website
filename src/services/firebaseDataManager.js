// Firebase Firestore data management utilities
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase.js';
import { COLLECTIONS } from './firestoreSchema.js';
import { calculateDuration, formatDuration } from '../utils/dateUtils.js';

// Generic Firestore operations
export const firestoreManager = {
  // Get all documents from a collection
  getAll: async (collectionName) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Remove any 'id' field from data to prevent conflicts
        const { id: dataId, ...restData } = data;
        if (dataId !== undefined) {
          console.warn(`Document ${doc.id} has 'id' field in data (value: ${dataId}). Using document ID instead.`);
        }
        return {
          ...restData,
          id: doc.id // Document ID always takes precedence
        };
      });
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      return [];
    }
  },

  // Get a single document
  getById: async (collectionName, docId) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Remove any 'id' field from data to prevent conflicts
        const { id: dataId, ...restData } = data;
        if (dataId !== undefined) {
          console.warn(`Document ${docSnap.id} has 'id' field in data (value: ${dataId}). Using document ID instead.`);
        }
        return {
          ...restData,
          id: docSnap.id // Document ID always takes precedence
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${collectionName}/${docId}:`, error);
      return null;
    }
  },

  // Add a new document
  add: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      return null;
    }
  },

  // Update a document
  update: async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error(`Error updating ${collectionName}/${docId}:`, error);
      return false;
    }
  },

  // Delete a document
  delete: async (collectionName, docId) => {
    try {
      console.log(`firestoreManager.delete: Attempting to delete ${collectionName}/${docId}`);
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      console.log(`firestoreManager.delete: Successfully deleted ${collectionName}/${docId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting ${collectionName}/${docId}:`, error);
      console.error('Delete error details:', {
        code: error.code,
        message: error.message,
        name: error.name
      });
      return false;
    }
  },

  // Real-time listener
  listen: (collectionName, callback, filters = []) => {
    let q = collection(db, collectionName);
    
    // Apply filters if provided
    if (filters.length > 0) {
      q = query(collection(db, collectionName), ...filters);
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        // Remove any 'id' field from data to prevent conflicts
        const { id: dataId, ...restData } = docData;
        return {
          ...restData,
          id: doc.id // Document ID always takes precedence
        };
      });
      callback(data);
    });
  }
};

// Hero slides management
export const heroManager = {
  getSlides: async () => {
    return await firestoreManager.getAll(COLLECTIONS.HERO_SLIDES);
  },

  addSlide: async (slideData) => {
    // Get current slides to determine order
    const slides = await heroManager.getSlides();
    const order = slides.length;
    
    return await firestoreManager.add(COLLECTIONS.HERO_SLIDES, {
      ...slideData,
      order,
      isActive: true
    });
  },

  updateSlide: async (slideId, slideData) => {
    return await firestoreManager.update(COLLECTIONS.HERO_SLIDES, slideId, slideData);
  },

  deleteSlide: async (slideId) => {
    return await firestoreManager.delete(COLLECTIONS.HERO_SLIDES, slideId);
  },

  // Real-time listener for slides
  listenToSlides: (callback) => {
    return firestoreManager.listen(
      COLLECTIONS.HERO_SLIDES, 
      callback, 
      [orderBy('order', 'asc')]
    );
  }
};

// Featured ride management
export const featuredRideManager = {
  getFeaturedRide: async () => {
    const featuredRide = await firestoreManager.getById(COLLECTIONS.FEATURED_RIDE, 'main');
    return featuredRide || {
      title: 'Signature Expedition',
      subtitle: 'Leh-Ladakh Ultimate 2025',
      description: 'Join us for the most iconic motorcycle journey through the breathtaking Himalayas, covering legendary passes and pristine lakes',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      ctaText: 'Know More',
      ctaLink: '',
      isActive: true
    };
  },

  updateFeaturedRide: async (featuredRideData) => {
    // If the document doesn't exist, create it first
    const existing = await firestoreManager.getById(COLLECTIONS.FEATURED_RIDE, 'main');
    if (!existing) {
      try {
        const docRef = doc(db, COLLECTIONS.FEATURED_RIDE, 'main');
        await setDoc(docRef, {
          ...featuredRideData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error('Error creating featured ride document:', error);
        return false;
      }
    }
    return await firestoreManager.update(COLLECTIONS.FEATURED_RIDE, 'main', featuredRideData);
  },

  // Real-time listener for featured ride
  listenToFeaturedRide: (callback) => {
    return onSnapshot(doc(db, COLLECTIONS.FEATURED_RIDE, 'main'), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  }
};

// Ride management
export const rideManager = {
  getUpcomingRides: async () => {
    const rides = await firestoreManager.getAll(COLLECTIONS.RIDES);
    const upcomingRides = rides.filter(ride => ride.status === 'upcoming');
    // Sort by order field, then by creation date as fallback
    upcomingRides.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 999;
      const orderB = b.order !== undefined ? b.order : 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
    });
    console.log('getUpcomingRides returned:', upcomingRides.length, 'rides');
    return upcomingRides;
  },

  getPreviousRides: async () => {
    const rides = await firestoreManager.getAll(COLLECTIONS.RIDES);
    const completedRides = rides.filter(ride => ride.status === 'completed');
    // Sort by order field, then by creation date as fallback
    completedRides.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 999;
      const orderB = b.order !== undefined ? b.order : 999;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt?.toDate?.() || b.createdAt || 0) - new Date(a.createdAt?.toDate?.() || a.createdAt || 0);
    });
    return completedRides;
  },

  getAllRides: async () => {
    const rides = await firestoreManager.getAll(COLLECTIONS.RIDES);
    console.log('getAllRides returned:', rides.length, 'rides');
    rides.forEach(ride => {
      console.log('Ride:', ride.id, ride.title, 'status:', ride.status);
    });
    return rides;
  },

  // Migration function to handle old date format and duration format
  migrateRideData: (rideData) => {
    let migratedData = { ...rideData };
    
    // If ride has old 'date' field but no startDate/endDate, we need to handle it
    if (rideData.date && !rideData.startDate && !rideData.endDate) {
      // For now, we'll set both start and end date to today
      // In a real migration, you'd want to parse the old date string
      const today = new Date().toISOString().split('T')[0];
      migratedData = {
        ...migratedData,
        startDate: today,
        endDate: today,
        // Remove the old date field
        date: undefined
      };
    }
    
    // If ride has startDate and endDate, regenerate duration in new format
    if (migratedData.startDate && migratedData.endDate) {
      const days = calculateDuration(migratedData.startDate, migratedData.endDate);
      migratedData.duration = formatDuration(days);
    }
    
    // Ensure participants is a valid number
    if (migratedData.participants !== undefined) {
      if (typeof migratedData.participants === 'string') {
        const parsed = parseInt(migratedData.participants, 10);
        migratedData.participants = isNaN(parsed) ? 0 : Math.max(0, parsed);
      } else if (typeof migratedData.participants !== 'number' || isNaN(migratedData.participants)) {
        migratedData.participants = 0;
      } else {
        migratedData.participants = Math.max(0, migratedData.participants);
      }
    } else {
      migratedData.participants = 0;
    }
    
    return migratedData;
  },

  addRide: async (rideData) => {
    console.log('Adding ride with data:', rideData);
    
    // Remove any existing 'id' field from rideData to prevent conflicts
    const { id, ...dataWithoutId } = rideData;
    if (id) {
      console.warn('Removing id field from ride data before adding to Firestore:', id);
    }
    
    // Get current rides to determine the next order value
    const currentRides = await rideManager.getAllRides();
    const ridesWithSameStatus = currentRides.filter(ride => ride.status === (dataWithoutId.status || 'upcoming'));
    const nextOrder = ridesWithSameStatus.length;
    
    const result = await firestoreManager.add(COLLECTIONS.RIDES, {
      ...dataWithoutId,
      status: dataWithoutId.status || 'upcoming', // Use provided status or default to 'upcoming'
      participants: parseInt(dataWithoutId.participants) || 0,
      order: dataWithoutId.order !== undefined ? dataWithoutId.order : nextOrder
    });
    console.log('Ride added with ID:', result);
    
    // Auto-update stats after adding ride
    if (result) {
      await statsManager.autoUpdateStats();
    }
    
    return result;
  },

  updateRide: async (rideId, rideData) => {
    // Remove any existing 'id' field from rideData to prevent conflicts
    const { id, ...dataWithoutId } = rideData;
    if (id && id !== rideId) {
      console.warn('Removing/ignoring id field from ride data during update. Document ID:', rideId, 'Data ID:', id);
    }
    
    const result = await firestoreManager.update(COLLECTIONS.RIDES, rideId, dataWithoutId);
    
    // Auto-update stats after updating ride
    if (result) {
      await statsManager.autoUpdateStats();
    }
    
    return result;
  },

  deleteRide: async (rideId) => {
    console.log('rideManager.deleteRide called with ID:', rideId);
    
    try {
      const result = await firestoreManager.delete(COLLECTIONS.RIDES, rideId);
      console.log('firestoreManager.delete returned:', result);
      
      // Auto-update stats after deleting ride
      if (result) {
        console.log('Delete successful, updating stats...');
        await statsManager.autoUpdateStats();
      }
      
      return result;
    } catch (error) {
      console.error('Error in rideManager.deleteRide:', error);
      throw error;
    }
  },

  changeRideStatus: async (rideId, newStatus) => {
    const result = await firestoreManager.update(COLLECTIONS.RIDES, rideId, { status: newStatus });
    
    // Auto-update stats after changing ride status
    if (result) {
      await statsManager.autoUpdateStats();
    }
    
    return result;
  },

  // Reorder rides based on drag and drop
  reorderRides: async (rideIds, status) => {
    try {
      console.log('Reordering rides:', { rideIds, status });
      
      // Update each ride with its new order
      const updatePromises = rideIds.map((rideId, index) => {
        return firestoreManager.update(COLLECTIONS.RIDES, rideId, { order: index });
      });
      
      const results = await Promise.all(updatePromises);
      const allSuccessful = results.every(result => result === true);
      
      if (allSuccessful) {
        console.log('Successfully reordered rides');
        return true;
      } else {
        console.error('Some rides failed to update during reordering');
        return false;
      }
    } catch (error) {
      console.error('Error reordering rides:', error);
      return false;
    }
  },

  // Real-time listener for rides
  listenToRides: (callback) => {
    return firestoreManager.listen(
      COLLECTIONS.RIDES, 
      callback, 
      [orderBy('createdAt', 'desc')]
    );
  }
};

// Statistics management
export const statsManager = {
  getStats: async () => {
    // Get auto-calculated stats from rides
    const rides = await firestoreManager.getAll(COLLECTIONS.RIDES);
    const { calculateStatsFromRides } = await import('../utils/statsCalculator.js');
    const autoStats = calculateStatsFromRides(rides);
    
    // Get manually set stats (if any)
    const manualStats = await firestoreManager.getById(COLLECTIONS.STATS, 'main');
    
    // If no manual stats exist, use auto-calculated
    if (!manualStats) {
      return autoStats;
    }
    
    // For now, we'll use auto-calculated stats
    // In the future, you could merge manual overrides with auto-calculated
    return autoStats;
  },

  updateStats: async (newStats) => {
    // If the document doesn't exist, create it first
    const existingStats = await firestoreManager.getById(COLLECTIONS.STATS, 'main');
    if (!existingStats) {
      // Create the document with 'main' as the ID
      try {
        const docRef = doc(db, COLLECTIONS.STATS, 'main');
        await setDoc(docRef, {
          ...newStats,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error('Error creating stats document:', error);
        return false;
      }
    }
    return await firestoreManager.update(COLLECTIONS.STATS, 'main', newStats);
  },

  // Auto-update stats when rides change
  autoUpdateStats: async () => {
    try {
      const rides = await firestoreManager.getAll(COLLECTIONS.RIDES);
      const { calculateStatsFromRides } = await import('../utils/statsCalculator.js');
      const autoStats = calculateStatsFromRides(rides);
      
      // Update the stats document with auto-calculated values
      const existingStats = await firestoreManager.getById(COLLECTIONS.STATS, 'main');
      if (!existingStats) {
        // Create the document with 'main' as the ID
        try {
          const docRef = doc(db, COLLECTIONS.STATS, 'main');
          await setDoc(docRef, {
            ...autoStats,
            isAutoCalculated: true,
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          return true;
        } catch (error) {
          console.error('Error creating auto-calculated stats document:', error);
          return false;
        }
      }
      
      return await firestoreManager.update(COLLECTIONS.STATS, 'main', {
        ...autoStats,
        isAutoCalculated: true,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error auto-updating stats:', error);
      return false;
    }
  },

  // Real-time listener for stats
  listenToStats: (callback) => {
    return onSnapshot(doc(db, COLLECTIONS.STATS, 'main'), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  }
};

// Website configuration management
export const configManager = {
  getConfig: async () => {
    const config = await firestoreManager.getById(COLLECTIONS.CONFIG, 'main');
    return config || {
      company: {
        name: "Travel Website",
        email: "info@travelwebsite.com",
        phone: "+91 98765 43210",
        location: "Bangalore, Karnataka, India",
        businessHours: "Mon-Sat, 9 AM - 6 PM"
      },
      socialMedia: {
        instagram: "https://instagram.com/travelwebsite",
        youtube: "https://youtube.com/@travelwebsite",
        whatsapp: "https://wa.me/919876543210",
        email: "mailto:info@travelwebsite.com"
      },
      googleForm: "https://docs.google.com/forms/d/1H2ZRxI1cqRVBWSbnCFSZG_gqVc2BBXQANjL3MVMBtto/viewform?edit_requested=true"
    };
  },

  updateConfig: async (configData) => {
    // If the document doesn't exist, create it first
    const existingConfig = await firestoreManager.getById(COLLECTIONS.CONFIG, 'main');
    if (!existingConfig) {
      // Create the document with 'main' as the ID
      try {
        const docRef = doc(db, COLLECTIONS.CONFIG, 'main');
        await setDoc(docRef, {
          ...configData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return true;
      } catch (error) {
        console.error('Error creating config document:', error);
        return false;
      }
    }
    return await firestoreManager.update(COLLECTIONS.CONFIG, 'main', configData);
  },

  // Real-time listener for config
  listenToConfig: (callback) => {
    return onSnapshot(doc(db, COLLECTIONS.CONFIG, 'main'), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  }
};

// Image upload management
export const imageManager = {
  uploadImage: async (file, path = 'images') => {
    try {
      console.log('ImageManager: Starting upload', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        path: path
      });

      // Check if storage is properly initialized
      if (!storage) {
        throw new Error('Firebase Storage is not initialized');
      }

      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const storageRef = ref(storage, `${path}/${fileName}`);
      
      console.log('ImageManager: Created storage reference', { fullPath: `${path}/${fileName}` });
      
      // Upload file with timeout
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout - please check your internet connection')), 30000)
      );
      
      console.log('ImageManager: Starting file upload...');
      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      console.log('ImageManager: File uploaded successfully', { bytesTransferred: snapshot.metadata.size });
      
      // Get download URL
      console.log('ImageManager: Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('ImageManager: Got download URL', { url: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('ImageManager: Upload failed', { 
        error: error,
        errorMessage: error.message,
        errorCode: error.code,
        errorName: error.name,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      });
      
      // Provide user-friendly error messages
      if (error.code === 'storage/unauthorized') {
        throw new Error('Permission denied. Please make sure you are logged in as admin and storage rules are deployed.');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload was cancelled.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('An unknown error occurred. Please check your internet connection and try again.');
      } else if (error.message && error.message.includes('timeout')) {
        throw error;
      } else {
        throw new Error(error.message || 'Failed to upload image. Please try again.');
      }
    }
  },

  validateImage: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
    const maxSize = 20 * 1024 * 1024; // 20MB
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPEG, JPG, PNG, WebP, GIF, BMP, or TIFF images.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: `File size too large. Please upload images smaller than 20MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` };
    }
    
    return { valid: true };
  }
};
