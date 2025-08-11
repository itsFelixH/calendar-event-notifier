/**
 * Determines if an event should trigger a notification based on filter rules
 * @param {GoogleAppsScript.Calendar.CalendarEvent} event - The calendar event to check
 * @param {string} calendarName - Name of the calendar containing the event
 * @returns {boolean} True if event should trigger notification, false otherwise
 */
function shouldNotifyForEvent(event, calendarName) {
  const title = event.getTitle().toLowerCase();
  const now = new Date();
  const eventStart = event.getStartTime();
  const eventDuration = (event.getEndTime() - eventStart) / (1000 * 60); // Convert to minutes
  
  // Apply include keyword filter - if specified, event must contain at least one keyword
  if (CONFIG.filters.includeKeywords.length > 0) {
    const hasIncludeKeyword = CONFIG.filters.includeKeywords.some(keyword => 
      title.includes(keyword.toLowerCase())
    );
    if (!hasIncludeKeyword) {
      console.log(`Event filtered out: missing include keyword`);
      return false;
    }
  }
  
  // Apply exclude keyword filter - reject events containing any excluded keyword
  const hasExcludeKeyword = CONFIG.filters.excludeKeywords.some(keyword => 
    title.includes(keyword.toLowerCase())
  );
  if (hasExcludeKeyword) {
    console.log(`Event filtered out: contains exclude keyword`);
    return false;
  }
  
  // Check business hours
  if (CONFIG.filters.businessHoursOnly) {
    const hour = eventStart.getHours();
    if (hour < CONFIG.filters.businessHours.start || hour >= CONFIG.filters.businessHours.end) {
      console.log(`Event filtered out: outside business hours`);
      return false;
    }
  }
  
  // Check weekends
  if (CONFIG.filters.skipWeekends) {
    const day = eventStart.getDay();
    if (day === 0 || day === 6) { // Sunday = 0, Saturday = 6
      console.log(`Event filtered out: weekend event`);
      return false;
    }
  }
  
  // Check minimum duration
  if (CONFIG.filters.minDuration > 0 && eventDuration < CONFIG.filters.minDuration) {
    console.log(`Event filtered out: too short (${eventDuration} minutes)`);
    return false;
  }
  
  return true;
}

/**
 * Finds the first matching notification rule for an event
 * Rules are processed in order - first match wins
 * @param {GoogleAppsScript.Calendar.CalendarEvent} event - The calendar event
 * @param {string} calendarName - Name of the calendar containing the event
 * @returns {Object|null} Matching notification rule or null if no match
 */
function getNotificationRule(event, calendarName) {
  // Iterate through rules in order until first match is found
  for (const rule of CONFIG.notificationRules) {
    try {
      if (rule.condition(event, calendarName)) {
        console.log(`Event matches rule: ${rule.subject}`);
        return rule;
      }
    } catch (error) {
      // Log rule evaluation errors but continue processing other rules
      console.error(`Error evaluating notification rule:`, error);
    }
  }
  return null; // No matching rule found - use default notification
}