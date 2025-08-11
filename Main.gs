/**
 * Sets up time-based triggers for calendar monitoring and weekly summaries
 * Run this function once to initialize the monitoring system
 * @throws {Error} If trigger creation fails or calendar access is denied
 */
function setupCalendarTrigger() {
  console.log('=== SETTING UP TRIGGER ===');
  console.log(`Target calendars: ${CONFIG.calendarIds.join(', ')}`);
  console.log(`Check interval: ${CONFIG.checkInterval} minutes`);
  
  // Clean up existing triggers to prevent duplicates
  const existingTriggers = ScriptApp.getProjectTriggers().filter(trigger => 
    trigger.getHandlerFunction() === 'checkForNewEvents' || trigger.getHandlerFunction() === 'sendWeeklySummary'
  );
  console.log(`Found ${existingTriggers.length} existing triggers to delete`);
  
  existingTriggers.forEach(trigger => {
    console.log(`Deleting trigger: ${trigger.getUniqueId()} (${trigger.getHandlerFunction()})`);
    ScriptApp.deleteTrigger(trigger);
  });
  
  // Create the main event monitoring trigger
  console.log('Creating event monitoring trigger...');
  const eventTrigger = ScriptApp.newTrigger('checkForNewEvents')
    .timeBased()
    .everyMinutes(CONFIG.checkInterval)
    .create();
  
  console.log(`✅ Event trigger created with ID: ${eventTrigger.getUniqueId()}`);
  
  // Create weekly summary trigger if enabled in config
  if (CONFIG.weeklySummary.enabled) {
    console.log('Creating weekly summary trigger...');
    const summaryTrigger = ScriptApp.newTrigger('sendWeeklySummary')
      .timeBased()
      .onWeekDay(getWeekDayFromNumber(CONFIG.weeklySummary.dayOfWeek))
      .atHour(CONFIG.weeklySummary.hour)
      .create();
    
    console.log(`✅ Weekly summary trigger created with ID: ${summaryTrigger.getUniqueId()}`);
  }
  
  console.log(`📅 Calendar monitoring started for ${CONFIG.calendarIds.length} calendars`);
  console.log(`⏰ Will check every ${CONFIG.checkInterval} minute(s)`);
  
  // Verify calendar access permissions immediately
  console.log('Testing calendar access...');
  CONFIG.calendarIds.forEach((calendarId, index) => {
    try {
      const calendar = CalendarApp.getCalendarById(calendarId);
      console.log(`✅ Calendar ${index + 1} accessible: ${calendar.getName()} (${calendarId})`);
    } catch (error) {
      console.error(`❌ Cannot access calendar ${calendarId}: ${error}`);
    }
  });
}

/**
 * Main function that checks all configured calendars for new events
 * Triggered automatically based on CONFIG.checkInterval
 * Processes events through filtering, rule matching, and notification sending
 */
function checkForNewEvents() {
  try {
    // Calculate time window for checking new events
    const now = new Date();
    const checkTime = new Date(now.getTime() - CONFIG.checkInterval * 60 * 1000);
    
    console.log(`Checking for events between ${checkTime} and ${now}`);
    console.log(`Monitoring ${CONFIG.calendarIds.length} calendars`);
    
    let totalNewEvents = 0;
    
    // Process each configured calendar independently
    CONFIG.calendarIds.forEach((calendarId, index) => {
      try {
        console.log(`--- Checking calendar ${index + 1}: ${calendarId} ---`);
        
        const calendar = CalendarApp.getCalendarById(calendarId);
        const events = calendar.getEvents(checkTime, now);
        
        console.log(`Found ${events.length} events in time range for ${calendar.getName()}`);
        
        // Filter events: new, unprocessed, and passing filter rules
        const newEvents = events.filter(event => {
          const created = event.getDateCreated();
          const isNew = created >= checkTime;  // Created within check window
          const isProcessed = isProcessedEvent(event.getId());  // Not already notified
          const passesFilter = shouldNotifyForEvent(event, calendar.getName());  // Passes filter rules
          
          console.log(`Event: ${event.getTitle()}, Calendar: ${calendar.getName()}, Created: ${created}, IsNew: ${isNew}, IsProcessed: ${isProcessed}, PassesFilter: ${passesFilter}`);
          
          return isNew && !isProcessed && passesFilter;
        });
        
        console.log(`Found ${newEvents.length} new unprocessed events in ${calendar.getName()}`);
        totalNewEvents += newEvents.length;
        
        // Send notifications for qualifying events
        newEvents.forEach(event => {
          console.log(`Sending notification for: ${event.getTitle()} from ${calendar.getName()}`);
          console.log(`Calendar color: ${getCalendarColor(calendarId)}`);
          const rule = getNotificationRule(event, calendar.getName());  // Find matching notification rule
          sendNotificationEmail(event, calendar.getName(), rule);
          markEventAsProcessed(event.getId());  // Prevent duplicate notifications
        });
        
      } catch (calendarError) {
        // Individual calendar errors don't stop processing other calendars
        console.error(`Error accessing calendar ${calendarId}:`, calendarError);
      }
    });
    
    console.log(`Total new events processed: ${totalNewEvents}`);
    
  } catch (error) {
    console.error('Error checking for new events:', error);
  }
}