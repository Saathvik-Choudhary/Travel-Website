// Date utility functions for ride management

/**
 * Calculate the duration between two dates in days
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {number} Number of days between the dates
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate the difference in milliseconds
  const diffTime = end - start;
  
  // Convert to days (add 1 to include both start and end dates)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  return Math.max(0, diffDays);
};

/**
 * Format duration in a human-readable format
 * @param {number} days - Number of days
 * @returns {string} Formatted duration string (e.g., "3D 2N" or "1D" for single day)
 */
export const formatDuration = (days) => {
  if (days === 0) return '0D';
  if (days === 1) return '1D';
  const nights = days - 1;
  return `${days}D ${nights}N`;
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date range for display
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // If same date, show single date
  if (startDate === endDate) {
    return formatDateForDisplay(startDate);
  }
  
  // If same month and year, show "1st - 3rd July 2025"
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = start.toLocaleDateString('en-US', { month: 'long' });
    const year = start.getFullYear();
    
    return `${startDay}${getOrdinalSuffix(startDay)} - ${endDay}${getOrdinalSuffix(endDay)} ${month} ${year}`;
  }
  
  // Different months or years
  const startFormatted = formatDateForDisplay(startDate);
  const endFormatted = formatDateForDisplay(endDate);
  
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Get ordinal suffix for day numbers
 * @param {number} day - Day number
 * @returns {string} Ordinal suffix (st, nd, rd, th)
 */
const getOrdinalSuffix = (day) => {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

/**
 * Get today's date in YYYY-MM-DD format for date inputs
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get minimum date for date inputs (today)
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getMinDateString = () => {
  return getTodayDateString();
};
