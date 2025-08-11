function testManualCheck() {
  console.log('=== MANUAL TEST START ===');
  console.log(`Timestamp: ${new Date()}`);
  console.log(`Calendar IDs: ${CONFIG.calendarIds.join(', ')}`);
  console.log(`Check Interval: ${CONFIG.checkInterval} minutes`);
  console.log(`User email: ${Session.getActiveUser().getEmail()}`);
  console.log(`Notification email: ${CONFIG.notificationEmail || 'Using active user email'}`);
  
  console.log('--- FILTER SETTINGS ---');
  console.log(`Include keywords: ${CONFIG.filters.includeKeywords.join(', ') || 'None (all events)'}`);
  console.log(`Exclude keywords: ${CONFIG.filters.excludeKeywords.join(', ')}`);
  console.log(`Business hours only: ${CONFIG.filters.businessHoursOnly}`);
  console.log(`Skip weekends: ${CONFIG.filters.skipWeekends}`);
  console.log(`Min duration: ${CONFIG.filters.minDuration} minutes`);
  console.log(`Notification rules: ${CONFIG.notificationRules.length}`);
  console.log(`Weekly summary enabled: ${CONFIG.weeklySummary.enabled}`);
  if (CONFIG.weeklySummary.enabled) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log(`Weekly summary: ${days[CONFIG.weeklySummary.dayOfWeek]} at ${CONFIG.weeklySummary.hour}:00`);
  }
  
  let totalEvents = 0;
  
  CONFIG.calendarIds.forEach((calendarId, index) => {
    try {
      console.log(`--- TESTING CALENDAR ${index + 1}: ${calendarId} ---`);
      const calendar = CalendarApp.getCalendarById(calendarId);
      console.log(`✅ Calendar found: ${calendar.getName()}`);
      console.log(`Calendar timezone: ${calendar.getTimeZone()}`);
      
      console.log('--- CHECKING RECENT EVENTS ---');
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      console.log(`Searching from: ${thirtyMinutesAgo}`);
      console.log(`Searching to: ${now}`);
      
      const allEvents = calendar.getEvents(thirtyMinutesAgo, now);
      console.log(`📅 Events found in ${calendar.getName()}: ${allEvents.length}`);
      totalEvents += allEvents.length;
      
      allEvents.forEach((event, eventIndex) => {
        const passesFilter = shouldNotifyForEvent(event, calendar.getName());
        const rule = getNotificationRule(event, calendar.getName());
        const duration = Math.round((event.getEndTime() - event.getStartTime()) / (1000 * 60));
        const organizer = event.getCreators()[0] || 'Unknown';
        const isRecurring = event.getEventSeries() !== null;
        
        console.log(`  Event ${eventIndex + 1}:`);
        console.log(`    Title: ${event.getTitle()}`);
        console.log(`    Organizer: ${organizer}`);
        console.log(`    Created: ${event.getDateCreated()}`);
        console.log(`    Last Modified: ${event.getLastUpdated()}`);
        console.log(`    Start: ${event.getStartTime()}`);
        console.log(`    Duration: ${duration} minutes`);
        console.log(`    Guests: ${event.getGuestList().length}`);
        console.log(`    Recurring: ${isRecurring}`);
        console.log(`    ID: ${event.getId()}`);
        console.log(`    Is processed: ${isProcessedEvent(event.getId())}`);
        console.log(`    Passes filter: ${passesFilter}`);
        console.log(`    Notification rule: ${rule ? rule.subject : 'Default'}`);
      });
      
    } catch (calendarError) {
      console.error(`❌ Cannot access calendar ${calendarId}:`, calendarError);
    }
  });
  
  console.log(`--- SUMMARY: ${totalEvents} total events across all calendars ---`);
  
  console.log('--- TESTING PROCESSED EVENTS STORAGE ---');
  const properties = PropertiesService.getScriptProperties();
  const allProps = properties.getProperties();
  const processedEvents = Object.keys(allProps).filter(key => key.startsWith('processed_'));
  console.log(`📝 Processed events in storage: ${processedEvents.length}`);
  processedEvents.forEach(key => {
    console.log(`  ${key}: ${allProps[key]}`);
  });
  
  console.log('--- RUNNING MAIN CHECK FUNCTION ---');
  checkForNewEvents();
  
  console.log('=== MANUAL TEST END ===');
}