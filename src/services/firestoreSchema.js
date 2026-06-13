// Firestore database schema and collection definitions
// This file defines the structure of data stored in Firestore

export const COLLECTIONS = {
  // Hero section slides
  HERO_SLIDES: 'heroSlides',
  
  // Featured ride
  FEATURED_RIDE: 'featuredRide',
  
  // Ride management
  RIDES: 'rides',
  
  // Website configuration
  CONFIG: 'config',
  
  // Statistics
  STATS: 'stats',
  
  // Users (for admin authentication)
  USERS: 'users',
  
  // Contact information
  CONTACT: 'contact'
};

// Hero slide document structure
export const heroSlideSchema = {
  id: 'string', // Auto-generated document ID
  title: 'string', // e.g., "LOSE YOURSELF"
  subtitle: 'string', // e.g., "DISCOVER YOURSELF"
  tagline: 'string', // e.g., "Travel Like A Pro"
  background: 'string', // Image URL
  cta: 'string', // Call-to-action button text
  order: 'number', // Display order (0, 1, 2, ...)
  isActive: 'boolean', // Whether slide is active
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Featured ride document structure
export const featuredRideSchema = {
  id: 'string', // Document ID (usually 'main')
  title: 'string', // e.g., "Signature Expedition"
  subtitle: 'string', // e.g., "Leh-Ladakh Ultimate 2025"
  description: 'string', // Description text
  image: 'string', // Image URL
  ctaText: 'string', // Button text (e.g., "Know More")
  ctaLink: 'string', // Button link URL or ride ID
  isActive: 'boolean', // Whether featured ride banner is active
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Ride document structure
export const rideSchema = {
  id: 'string', // Auto-generated document ID
  title: 'string', // e.g., "Ride to Kolli Hills from Bangalore"
  startDate: 'string', // ISO date string for start date
  endDate: 'string', // ISO date string for end date
  duration: 'string', // Auto-calculated duration (e.g., "3 Days")
  distance: 'string', // e.g., "450 km"
  participants: 'number', // Number of participants
  description: 'string', // Ride description
  image: 'string', // Image URL
  status: 'string', // 'upcoming', 'completed', 'cancelled'
  featured: 'boolean', // Whether it's a featured ride
  order: 'number', // Display order for drag and drop (0, 1, 2, ...)
  
  // Pricing information
  price: 'string', // Optional: Legacy price field
  tripCost: 'string', // e.g., "₹5000 per person"
  bookingCost: 'string', // e.g., "₹1000 advance"
  bookingFormUrl: 'string', // Google Form URL for booking this ride
  
  // Overview details
  vehicleType: 'string', // e.g., "Bike/Car"
  difficulty: 'string', // e.g., "Easy", "Moderate", "Challenging", "Difficult"
  maxParticipants: 'string', // e.g., "15-20"
  bestSeason: 'string', // e.g., "All Year"
  highlights: 'array', // Array of strings - ride highlights
  
  // Itinerary
  itinerary: 'array', // Array of day objects: { day: number, title: string, description: string }
  
  // Inclusions and Exclusions
  included: 'array', // Array of strings - what's included in the trip
  excluded: 'array', // Array of strings - what's not included
  
  // Things to Carry
  thingsToCarry: 'array', // Array of strings - items participants should bring
  
  // Policies and Instructions
  cancellationPolicy: 'string', // Text describing cancellation terms
  howToJoin: 'string', // Instructions on how to join the trip
  
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Website configuration structure
export const configSchema = {
  id: 'string', // Document ID (usually 'main')
  company: {
    name: 'string',
    email: 'string',
    phone: 'string',
    location: 'string',
    businessHours: 'string'
  },
  socialMedia: {
    instagram: 'string',
    youtube: 'string',
    whatsapp: 'string',
    email: 'string'
  },
  googleForm: 'string',
  updatedAt: 'timestamp'
};

// Statistics structure
export const statsSchema = {
  id: 'string', // Document ID (usually 'main')
  completedRides: 'number',
  happyRiders: 'number',
  kilometersCovered: 'number',
  monthsOfAdventure: 'number',
  updatedAt: 'timestamp'
};

// User document structure (for admin authentication)
export const userSchema = {
  id: 'string', // User UID
  email: 'string',
  role: 'string', // 'admin', 'user'
  displayName: 'string',
  createdAt: 'timestamp',
  lastLoginAt: 'timestamp'
};

// Contact information structure
export const contactSchema = {
  id: 'string', // Document ID (usually 'main')
  company: {
    name: 'string',
    email: 'string',
    phone: 'string',
    location: 'string',
    businessHours: 'string'
  },
  socialMedia: {
    instagram: 'string',
    youtube: 'string',
    whatsapp: 'string',
    email: 'string'
  },
  googleForm: 'string',
  updatedAt: 'timestamp'
};

// Firestore security rules structure
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for website content
    match /{collection}/{document} {
      allow read: if true;
    }
    
    // Admin write access for content management
    match /heroSlides/{document} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /featuredRide/{document} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /rides/{document} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /config/{document} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /stats/{document} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /contact/{document} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // User management
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
`;

// Indexes needed for Firestore queries
export const firestoreIndexes = {
  rides: [
    {
      collectionGroup: 'rides',
      fields: [
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    }
  ],
  heroSlides: [
    {
      collectionGroup: 'heroSlides',
      fields: [
        { fieldPath: 'isActive', order: 'ASCENDING' },
        { fieldPath: 'order', order: 'ASCENDING' }
      ]
    }
  ]
};
