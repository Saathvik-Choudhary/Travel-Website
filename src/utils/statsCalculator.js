// Statistics calculation utilities
// These functions automatically calculate statistics from rides data

/**
 * Calculate statistics from rides data
 * @param {Array} rides - Array of ride objects
 * @returns {Object} Calculated statistics
 */
export const calculateStatsFromRides = (rides) => {
  if (!rides || rides.length === 0) {
    return {
      completedRides: 0,
      happyRiders: 0,
      kilometersCovered: 0,
      monthsOfAdventure: 0
    };
  }

  // Filter completed rides
  const completedRides = rides.filter(ride => ride.status === 'completed');
  
  // Calculate completed rides count
  const completedRidesCount = completedRides.length;
  
  // Calculate total participants (happy riders)
  const totalParticipants = completedRides.reduce((sum, ride) => {
    const participants = ride.participants;
    // Handle various data types and invalid values
    if (typeof participants === 'number' && !isNaN(participants) && participants >= 0) {
      return sum + participants;
    } else if (typeof participants === 'string') {
      const parsed = parseInt(participants, 10);
      return sum + (isNaN(parsed) ? 0 : Math.max(0, parsed));
    }
    return sum; // Default to 0 for null, undefined, or invalid values
  }, 0);
  
  // Calculate total kilometers covered
  const totalKilometers = completedRides.reduce((sum, ride) => {
    // Extract number from distance string (e.g., "450 km" -> 450)
    const distanceStr = ride.distance || '';
    const distanceMatch = distanceStr.match(/(\d+)/);
    const distance = distanceMatch ? parseInt(distanceMatch[1]) : 0;
    return sum + distance;
  }, 0);
  
  // Calculate months of adventure based on date range
  const monthsOfAdventure = calculateMonthsOfAdventure(rides);
  
  return {
    completedRides: completedRidesCount,
    happyRiders: totalParticipants,
    kilometersCovered: totalKilometers,
    monthsOfAdventure: monthsOfAdventure
  };
};

/**
 * Calculate months of adventure based on ride dates
 * @param {Array} rides - Array of ride objects
 * @returns {number} Number of months
 */
const calculateMonthsOfAdventure = (rides) => {
  if (!rides || rides.length === 0) return 0;
  
  // Get all dates from rides (both start and end dates)
  const allDates = [];
  
  rides.forEach(ride => {
    if (ride.startDate) allDates.push(new Date(ride.startDate));
    if (ride.endDate && ride.endDate !== ride.startDate) {
      allDates.push(new Date(ride.endDate));
    }
  });
  
  if (allDates.length === 0) return 0;
  
  // Find earliest and latest dates
  const sortedDates = allDates.sort((a, b) => a - b);
  const earliestDate = sortedDates[0];
  const latestDate = sortedDates[sortedDates.length - 1];
  
  // Calculate difference in months
  const yearDiff = latestDate.getFullYear() - earliestDate.getFullYear();
  const monthDiff = latestDate.getMonth() - earliestDate.getMonth();
  const totalMonths = yearDiff * 12 + monthDiff + 1; // +1 to include both start and end months
  
  return Math.max(1, totalMonths); // At least 1 month
};

/**
 * Get statistics breakdown for admin dashboard
 * @param {Array} rides - Array of ride objects
 * @returns {Object} Detailed statistics breakdown
 */
export const getStatsBreakdown = (rides) => {
  if (!rides || rides.length === 0) {
    return {
      totalRides: 0,
      upcomingRides: 0,
      completedRides: 0,
      cancelledRides: 0,
      totalParticipants: 0,
      totalKilometers: 0,
      averageParticipants: 0,
      averageDistance: 0,
      monthsOfAdventure: 0
    };
  }

  const completedRides = rides.filter(ride => ride.status === 'completed');
  const upcomingRides = rides.filter(ride => ride.status === 'upcoming');
  const cancelledRides = rides.filter(ride => ride.status === 'cancelled');
  
  const totalParticipants = completedRides.reduce((sum, ride) => {
    const participants = ride.participants;
    // Handle various data types and invalid values
    if (typeof participants === 'number' && !isNaN(participants) && participants >= 0) {
      return sum + participants;
    } else if (typeof participants === 'string') {
      const parsed = parseInt(participants, 10);
      return sum + (isNaN(parsed) ? 0 : Math.max(0, parsed));
    }
    return sum; // Default to 0 for null, undefined, or invalid values
  }, 0);
  
  const totalKilometers = completedRides.reduce((sum, ride) => {
    const distanceStr = ride.distance || '';
    const distanceMatch = distanceStr.match(/(\d+)/);
    const distance = distanceMatch ? parseInt(distanceMatch[1]) : 0;
    return sum + distance;
  }, 0);
  
  const monthsOfAdventure = calculateMonthsOfAdventure(rides);
  
  return {
    totalRides: rides.length,
    upcomingRides: upcomingRides.length,
    completedRides: completedRides.length,
    cancelledRides: cancelledRides.length,
    totalParticipants,
    totalKilometers,
    averageParticipants: completedRides.length > 0 ? Math.round(totalParticipants / completedRides.length) : 0,
    averageDistance: completedRides.length > 0 ? Math.round(totalKilometers / completedRides.length) : 0,
    monthsOfAdventure
  };
};

/**
 * Format statistics for display
 * @param {Object} stats - Statistics object
 * @returns {Object} Formatted statistics for display
 */
export const formatStatsForDisplay = (stats) => {
  return {
    completedRides: `${stats.completedRides}+`,
    happyRiders: `${stats.happyRiders}+`,
    kilometersCovered: `${stats.kilometersCovered.toLocaleString()}+`,
    monthsOfAdventure: stats.monthsOfAdventure
  };
};
