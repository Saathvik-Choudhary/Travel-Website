#!/usr/bin/env node

/**
 * Firebase Database Initialization Script
 * This script initializes the Firebase database with default data if collections are empty
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

// Firebase configuration - using production config for initialization
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "travel-website",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Default data structures
const defaultStats = {
  completedRides: 47,
  happyRiders: 320,
  kilometersCovered: 18500,
  monthsOfAdventure: 24,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

const defaultConfig = {
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
  googleForm: "https://docs.google.com/forms/d/1H2ZRxI1cqRVBWSbnCFSZG_gqVc2BBXQANjL3MVMBtto/viewform?edit_requested=true",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
};

const defaultHeroSlides = [
  {
    title: "RIDE THE HEIGHTS",
    subtitle: "TOUCH THE SKY",
    tagline: "Conquer the Himalayas",
    background: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    cta: "Start Your Journey",
    order: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "COASTAL DREAMS",
    subtitle: "ENDLESS HORIZONS",
    tagline: "Ride Along Paradise",
    background: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&h=1080&fit=crop",
    cta: "Book Your Ride",
    order: 1,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "DESERT TRAILS",
    subtitle: "ROYAL HERITAGE",
    tagline: "Experience Rajasthan",
    background: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa5?w=1920&h=1080&fit=crop",
    cta: "Explore Routes",
    order: 2,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "MOUNTAIN ROADS",
    subtitle: "EPIC JOURNEYS",
    tagline: "Beyond the Ordinary",
    background: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop",
    cta: "Join the Tribe",
    order: 3,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

const defaultRides = [
  // Upcoming Rides
  {
    title: "Spiti Valley Expedition - The Desert Mountain",
    startDate: "2025-11-15",
    endDate: "2025-11-22",
    duration: "8D 7N",
    distance: "1850 km",
    participants: 0,
    description: "Embark on an unforgettable journey through the cold desert of Spiti Valley, exploring ancient monasteries, pristine landscapes, and thrilling high-altitude passes.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    status: "upcoming",
    featured: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Coastal Karnataka Adventure",
    startDate: "2025-11-08",
    endDate: "2025-11-10",
    duration: "3D 2N",
    distance: "380 km",
    participants: 0,
    description: "Ride along the stunning Konkan coastline from Mangalore to Gokarna, discovering hidden beaches, temples, and coastal cuisine.",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    status: "upcoming",
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Leh-Ladakh Ultimate Expedition",
    startDate: "2025-12-01",
    endDate: "2025-12-12",
    duration: "12D 11N",
    distance: "2400 km",
    participants: 0,
    description: "The legendary Leh-Ladakh circuit covering Khardung La, Nubra Valley, Pangong Lake, and the mesmerizing landscapes of the Himalayas.",
    image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa5?w=400&h=300&fit=crop",
    status: "upcoming",
    featured: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Weekend Gateway - Chikmagalur Coffee Trail",
    startDate: "2025-10-25",
    endDate: "2025-10-26",
    duration: "2D 1N",
    distance: "285 km",
    participants: 0,
    description: "A relaxing weekend ride through coffee plantations, waterfalls, and the lush Western Ghats of Chikmagalur.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    status: "upcoming",
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Meghalaya - Abode of Clouds",
    startDate: "2025-11-20",
    endDate: "2025-11-26",
    duration: "7D 6N",
    distance: "980 km",
    participants: 0,
    description: "Explore the wettest place on Earth! Ride through living root bridges, crystal clear rivers, waterfalls, and the stunning landscapes of Meghalaya.",
    image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop",
    status: "upcoming",
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  // Previous Rides
  {
    title: "Rajasthan Royal Heritage Ride",
    startDate: "2025-09-10",
    endDate: "2025-09-17",
    duration: "8D 7N",
    distance: "1240 km",
    participants: 18,
    description: "An incredible journey through royal Rajasthan covering Jaipur, Pushkar, Udaipur, and Jodhpur. Witnessed stunning forts, palaces, and desert landscapes.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    status: "completed",
    featured: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Goa Monsoon Magic",
    startDate: "2025-08-22",
    endDate: "2025-08-25",
    duration: "4D 3N",
    distance: "420 km",
    participants: 14,
    description: "Rode through the lush green landscapes of monsoon Goa, exploring hidden waterfalls, spice plantations, and pristine beaches.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    status: "completed",
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Himalayan Adventure - Manali Circuit",
    startDate: "2025-07-15",
    endDate: "2025-07-21",
    duration: "7D 6N",
    distance: "850 km",
    participants: 16,
    description: "Epic ride through Rohtang Pass, Solang Valley, and the stunning Himalayan ranges around Manali. Unforgettable mountain vistas!",
    image: "https://images.unsplash.com/photo-1544191696-102dbdaeeaa5?w=400&h=300&fit=crop",
    status: "completed",
    featured: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Tamil Nadu Temple Trail",
    startDate: "2025-06-28",
    endDate: "2025-07-01",
    duration: "4D 3N",
    distance: "680 km",
    participants: 11,
    description: "Cultural expedition covering ancient temples of Thanjavur, Madurai, Rameswaram, and Kanyakumari. Rich heritage and stunning architecture!",
    image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=300&fit=crop",
    status: "completed",
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Konkan Coastal Ride",
    startDate: "2025-05-12",
    endDate: "2025-05-14",
    duration: "3D 2N",
    distance: "620 km",
    participants: 20,
    description: "Breathtaking coastal ride along the Konkan coast from Mumbai to Goa, exploring pristine beaches, ancient forts, and delicious seafood.",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    status: "completed",
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Weekend Escape - Coorg Plantations",
    startDate: "2025-04-20",
    endDate: "2025-04-21",
    duration: "2D 1N",
    distance: "295 km",
    participants: 9,
    description: "Perfect weekend getaway through misty coffee estates, rolling hills, and Abbey Falls in the Scotland of India.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    status: "completed",
    featured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Helper function to check if collection is empty
async function isCollectionEmpty(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.empty;
  } catch (error) {
    console.error(`Error checking collection ${collectionName}:`, error);
    return true; // Assume empty if error
  }
}

// Helper function to initialize collection with default data
async function initializeCollection(collectionName, defaultData, documentId = 'main') {
  try {
    const isEmpty = await isCollectionEmpty(collectionName);
    
    if (isEmpty) {
      if (Array.isArray(defaultData)) {
        // For arrays (like hero slides, rides), add each item
        for (let i = 0; i < defaultData.length; i++) {
          const docRef = doc(collection(db, collectionName));
          await setDoc(docRef, defaultData[i]);
          console.log(`✅ Added ${collectionName} item ${i + 1}`);
        }
      } else {
        // For single documents (like stats, config)
        const docRef = doc(db, collectionName, documentId);
        await setDoc(docRef, defaultData);
        console.log(`✅ Initialized ${collectionName} collection with default data`);
      }
    } else {
      console.log(`ℹ️  Collection ${collectionName} already has data, skipping`);
    }
  } catch (error) {
    console.error(`❌ Error initializing ${collectionName}:`, error);
  }
}

// Main initialization function
async function initializeFirebaseData() {
  console.log('🚀 Starting Firebase database initialization...\n');

  try {
    // Initialize stats
    console.log('📊 Initializing stats collection...');
    await initializeCollection('stats', defaultStats);

    // Initialize config
    console.log('⚙️  Initializing config collection...');
    await initializeCollection('config', defaultConfig);

    // Initialize hero slides
    console.log('🎯 Initializing hero slides collection...');
    await initializeCollection('heroSlides', defaultHeroSlides);

    // Initialize rides
    console.log('🚴 Initializing rides collection...');
    await initializeCollection('rides', defaultRides);

    console.log('\n✅ Firebase database initialization completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Deploy Firestore rules: firebase deploy --only firestore:rules');
    console.log('   2. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
    console.log('   3. Deploy your application: firebase deploy');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    process.exit(1);
  }
}

// Run the initialization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeFirebaseData()
    .then(() => {
      console.log('\n🎉 All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { initializeFirebaseData };
