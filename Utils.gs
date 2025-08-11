// ===== EVENT PROCESSING STORAGE =====

/**
 * Checks if an event has already been processed to prevent duplicate notifications
 * @param {string} eventId - Unique identifier for the calendar event
 * @returns {boolean} True if event was already processed, false otherwise
 */
function isProcessedEvent(eventId) {
  const properties = PropertiesService.getScriptProperties();
  return properties.getProperty(`processed_${eventId}`) !== null;
}

/**
 * Marks an event as processed with timestamp to prevent duplicate notifications
 * @param {string} eventId - Unique identifier for the calendar event
 */
function markEventAsProcessed(eventId) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(`processed_${eventId}`, new Date().toISOString());
}

function clearProcessedEvents() {
  const properties = PropertiesService.getScriptProperties();
  const allProperties = properties.getProperties();
  
  Object.keys(allProperties).forEach(key => {
    if (key.startsWith('processed_')) {
      properties.deleteProperty(key);
    }
  });
  
  console.log('Cleared all processed event records');
}

/**
 * Gets the total count of processed events in storage
 * @returns {number} Number of events currently tracked as processed
 */
function getProcessedEventCount() {
  const properties = PropertiesService.getScriptProperties();
  const allProperties = properties.getProperties();
  return Object.keys(allProperties).filter(key => key.startsWith('processed_')).length;
}

// ===== DATE & TIME UTILITIES =====

/**
 * Converts numeric day (0-6) to Google Apps Script WeekDay enum
 * @param {number} dayNumber - Day of week (0=Sunday, 1=Monday, etc.)
 * @returns {GoogleAppsScript.Script.WeekDay} Apps Script WeekDay enum value
 */
function getWeekDayFromNumber(dayNumber) {
  const days = [
    ScriptApp.WeekDay.SUNDAY,
    ScriptApp.WeekDay.MONDAY,
    ScriptApp.WeekDay.TUESDAY,
    ScriptApp.WeekDay.WEDNESDAY,
    ScriptApp.WeekDay.THURSDAY,
    ScriptApp.WeekDay.FRIDAY,
    ScriptApp.WeekDay.SATURDAY
  ];
  return days[dayNumber] || ScriptApp.WeekDay.SUNDAY;
}

/**
 * Formats duration in minutes to human-readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m", "45 minutes")
 */
function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`;
}

/**
 * Checks if a given date/time falls within business hours
 * @param {Date} date - Date to check
 * @param {number} startHour - Business day start hour (default: 9)
 * @param {number} endHour - Business day end hour (default: 17)
 * @returns {boolean} True if within business hours
 */
function isBusinessHours(date, startHour = 9, endHour = 17) {
  const hour = date.getHours();
  return hour >= startHour && hour < endHour;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getTimeUntilEvent(event) {
  const now = new Date();
  const eventStart = event.getStartTime();
  const diffMs = eventStart - now;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 0) return 'Event has passed';
  if (diffMinutes < 60) return `${diffMinutes} minutes`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours`;
  return `${Math.floor(diffMinutes / 1440)} days`;
}

// Event Analysis
function getEventDuration(event) {
  return Math.round((event.getEndTime() - event.getStartTime()) / (1000 * 60));
}

function isLongEvent(event, thresholdMinutes = 120) {
  return getEventDuration(event) >= thresholdMinutes;
}

function hasKeyword(text, keywords) {
  if (!keywords || keywords.length === 0) return false;
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

function getEventPriority(event, calendarName) {
  const rule = getNotificationRule(event, calendarName);
  return rule ? rule.priority : 'normal';
}

// Calendar Utilities
/**
 * Gets the color for a specific calendar
 * @param {string} calendarId - Calendar ID to get color for
 * @returns {string} Hex color code (e.g., '#4285f4')
 */
function getCalendarColor(calendarId) {
  try {
    const calendar = CalendarApp.getCalendarById(calendarId);
    return calendar.getColor();
  } catch (error) {
    console.error(`Cannot get color for calendar ${calendarId}:`, error);
    return '#4285f4'; // Default Google blue
  }
}

/**
 * Gets a lighter version of a color for backgrounds
 * @param {string} hexColor - Hex color code (e.g., '#4285f4')
 * @returns {string} Lighter hex color for backgrounds
 */
function getLighterColor(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Make it lighter (blend with white)
  const lighterR = Math.round(r + (255 - r) * 0.8);
  const lighterG = Math.round(g + (255 - g) * 0.8);
  const lighterB = Math.round(b + (255 - b) * 0.8);
  
  // Convert back to hex
  return `#${lighterR.toString(16).padStart(2, '0')}${lighterG.toString(16).padStart(2, '0')}${lighterB.toString(16).padStart(2, '0')}`;
}

/**
 * Determines if a color is dark (for text contrast)
 * @param {string} hexColor - Hex color code
 * @returns {boolean} True if color is dark
 */
function isDarkColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}

function getAllCalendarNames() {
  return CONFIG.calendarIds.map(calendarId => {
    try {
      return CalendarApp.getCalendarById(calendarId).getName();
    } catch (error) {
      return `Unknown (${calendarId})`;
    }
  });
}

// Email Utilities
function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function formatGuestList(guestList, maxShow = 3) {
  if (guestList.length === 0) return 'None';
  if (guestList.length <= maxShow) {
    return guestList.map(g => g.getEmail()).join(', ');
  }
  const shown = guestList.slice(0, maxShow).map(g => g.getEmail()).join(', ');
  return `${shown} and ${guestList.length - maxShow} more`;
}

// Validation Utilities
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCalendarId(calendarId) {
  try {
    CalendarApp.getCalendarById(calendarId);
    return true;
  } catch (error) {
    return false;
  }
}

// ===== STATISTICS =====

/**
 * Generates comprehensive statistics about the notification system
 * @returns {Object} Statistics object with system metrics
 */
function getNotificationStats() {
  const stats = {
    processedEvents: getProcessedEventCount(),
    activeCalendars: CONFIG.calendarIds.length,
    notificationRules: CONFIG.notificationRules.length,
    checkInterval: CONFIG.checkInterval,
    weeklySummaryEnabled: CONFIG.weeklySummary.enabled
  };
  
  console.log('Notification Statistics:', JSON.stringify(stats, null, 2));
  return stats;
}

// Cleanup Utilities
function cleanupOldProcessedEvents(daysOld = 30) {
  const properties = PropertiesService.getScriptProperties();
  const allProperties = properties.getProperties();
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  let cleaned = 0;
  
  Object.keys(allProperties).forEach(key => {
    if (key.startsWith('processed_')) {
      const dateStr = allProperties[key];
      const eventDate = new Date(dateStr);
      if (eventDate < cutoffDate) {
        properties.deleteProperty(key);
        cleaned++;
      }
    }
  });
  
  console.log(`Cleaned up ${cleaned} old processed event records`);
  return cleaned;
}