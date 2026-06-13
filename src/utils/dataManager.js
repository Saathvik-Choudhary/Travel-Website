// Data management utilities for the admin portal
import { STORAGE_KEYS, defaultRideStructure } from '../data/config.js';

// Generic data management functions
export const dataManager = {
  // Save data to localStorage
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },

  // Load data from localStorage
  load: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error loading data:', error);
      return defaultValue;
    }
  },

  // Delete data from localStorage
  delete: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }
};

// Ride management functions
export const rideManager = {
  // Get all upcoming rides
  getUpcomingRides: () => {
    return dataManager.load(STORAGE_KEYS.UPCOMING_RIDES, []);
  },

  // Get all previous rides
  getPreviousRides: () => {
    return dataManager.load(STORAGE_KEYS.PREVIOUS_RIDES, []);
  },

  // Add a new ride
  addRide: (rideData) => {
    const rides = rideManager.getUpcomingRides();
    const newRide = {
      ...defaultRideStructure,
      ...rideData,
      id: Date.now(), // Simple ID generation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    rides.push(newRide);
    return dataManager.save(STORAGE_KEYS.UPCOMING_RIDES, rides);
  },

  // Update an existing ride
  updateRide: (rideId, updatedData) => {
    const rides = rideManager.getUpcomingRides();
    const index = rides.findIndex(ride => ride.id === rideId);
    
    if (index !== -1) {
      rides[index] = {
        ...rides[index],
        ...updatedData,
        id: rideId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };
      return dataManager.save(STORAGE_KEYS.UPCOMING_RIDES, rides);
    }
    return false;
  },

  // Delete a ride
  deleteRide: (rideId) => {
    const rides = rideManager.getUpcomingRides();
    const filteredRides = rides.filter(ride => ride.id !== rideId);
    return dataManager.save(STORAGE_KEYS.UPCOMING_RIDES, filteredRides);
  },

  // Move ride from upcoming to previous (mark as completed)
  completeRide: (rideId) => {
    const upcomingRides = rideManager.getUpcomingRides();
    const previousRides = rideManager.getPreviousRides();
    
    const rideIndex = upcomingRides.findIndex(ride => ride.id === rideId);
    if (rideIndex !== -1) {
      const completedRide = {
        ...upcomingRides[rideIndex],
        status: 'completed',
        updatedAt: new Date().toISOString()
      };
      
      // Remove from upcoming
      upcomingRides.splice(rideIndex, 1);
      
      // Add to previous
      previousRides.push(completedRide);
      
      // Save both arrays
      dataManager.save(STORAGE_KEYS.UPCOMING_RIDES, upcomingRides);
      dataManager.save(STORAGE_KEYS.PREVIOUS_RIDES, previousRides);
      
      return true;
    }
    return false;
  },

  // Change ride status
  changeRideStatus: (rideId, newStatus) => {
    if (newStatus === 'completed') {
      return rideManager.completeRide(rideId);
    } else {
      return rideManager.updateRide(rideId, { status: newStatus });
    }
  }
};

// Hero slides management
export const heroManager = {
  getSlides: () => {
    return dataManager.load(STORAGE_KEYS.HERO_SLIDES, []);
  },

  saveSlides: (slides) => {
    return dataManager.save(STORAGE_KEYS.HERO_SLIDES, slides);
  },

  addSlide: (slideData) => {
    const slides = heroManager.getSlides();
    const newSlide = {
      ...slideData,
      id: Date.now()
    };
    slides.push(newSlide);
    return heroManager.saveSlides(slides);
  },

  updateSlide: (slideId, updatedData) => {
    const slides = heroManager.getSlides();
    const index = slides.findIndex(slide => slide.id === slideId);
    
    if (index !== -1) {
      slides[index] = { ...slides[index], ...updatedData };
      return heroManager.saveSlides(slides);
    }
    return false;
  },

  deleteSlide: (slideId) => {
    const slides = heroManager.getSlides();
    const filteredSlides = slides.filter(slide => slide.id !== slideId);
    return heroManager.saveSlides(filteredSlides);
  }
};

// Statistics management
export const statsManager = {
  getStats: () => {
    return dataManager.load(STORAGE_KEYS.STATS, {
      completedRides: 25,
      happyRiders: 150,
      kilometersCovered: 5000,
      monthsOfAdventure: 12
    });
  },

  updateStats: (newStats) => {
    return dataManager.save(STORAGE_KEYS.STATS, newStats);
  }
};

// Website configuration management
export const configManager = {
  getConfig: () => {
    return dataManager.load(STORAGE_KEYS.WEBSITE_CONFIG, {});
  },

  updateConfig: (configData) => {
    return dataManager.save(STORAGE_KEYS.WEBSITE_CONFIG, configData);
  }
};

// Image upload utility (for future implementation)
export const imageManager = {
  // This would handle image uploads to a service like Cloudinary, AWS S3, etc.
  // For now, we'll use placeholder functionality
  uploadImage: async (file) => {
    // Placeholder for image upload
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result); // Returns data URL
      };
      reader.readAsDataURL(file);
    });
  },

  // Validate image file
  validateImage: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large. Please upload images smaller than 5MB.' };
    }
    
    return { valid: true };
  }
};
