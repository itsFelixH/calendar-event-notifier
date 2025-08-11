/**
 * Generates and sends HTML weekly summary email with calendar overview
 * Triggered automatically based on CONFIG.weeklySummary settings
 */
function sendWeeklySummary() {
  try {
    console.log('=== GENERATING WEEKLY SUMMARY ===');
    
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    console.log(`Summary period: ${now.toDateString()} to ${nextWeek.toDateString()}`);
    
    const summaryData = collectWeeklySummaryData(now, nextWeek);
    
    if (summaryData.allEvents.length === 0) {
      console.log('No events found, skipping weekly summary');
      return;
    }
    
    const subject = `📅 Weekly Calendar Summary - ${formatDateRange(now, nextWeek)}`;
    const htmlBody = buildWeeklySummaryHTML(summaryData, now, nextWeek);
    
    const email = CONFIG.weeklySummary.email || CONFIG.notificationEmail || Session.getActiveUser().getEmail();
    
    console.log(`Sending weekly summary to: ${email}`);
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });
    console.log(`✅ Weekly summary sent successfully!`);
    
  } catch (error) {
    console.error('Error generating weekly summary:', error);
  }
}

/**
 * Collects and organizes data for weekly summary
 * @param {Date} startDate - Start of summary period
 * @param {Date} endDate - End of summary period
 * @returns {Object} Organized summary data
 */
function collectWeeklySummaryData(startDate, endDate) {
  let allEvents = [];
  let calendarSummaries = [];
  let totalDuration = 0;
  let highPriorityCount = 0;
  
  CONFIG.calendarIds.forEach((calendarId) => {
    try {
      const calendar = CalendarApp.getCalendarById(calendarId);
      const events = calendar.getEvents(startDate, endDate);
      
      const filteredEvents = events.filter(event => 
        shouldNotifyForEvent(event, calendar.getName())
      );
      
      console.log(`${calendar.getName()}: ${filteredEvents.length} events`);
      
      // Calculate calendar statistics
      let calendarDuration = 0;
      let calendarHighPriority = 0;
      
      filteredEvents.forEach(event => {
        const duration = getEventDuration(event);
        calendarDuration += duration;
        totalDuration += duration;
        
        const rule = getNotificationRule(event, calendar.getName());
        if (rule && rule.priority === 'high') {
          calendarHighPriority++;
          highPriorityCount++;
        }
      });
      
      calendarSummaries.push({
        name: calendar.getName(),
        id: calendarId,
        events: filteredEvents,
        totalEvents: events.length,
        duration: calendarDuration,
        highPriorityCount: calendarHighPriority,
        color: getCalendarColor(calendarId)
      });
      
      allEvents = allEvents.concat(filteredEvents.map(event => ({
        event: event,
        calendarName: calendar.getName(),
        calendarId: calendarId,
        color: getCalendarColor(calendarId)
      })));
      
    } catch (error) {
      console.error(`Error accessing calendar ${calendarId}:`, error);
    }
  });
  
  // Sort events by start time
  allEvents.sort((a, b) => a.event.getStartTime() - b.event.getStartTime());
  
  return {
    allEvents,
    calendarSummaries,
    totalDuration,
    highPriorityCount,
    totalEvents: allEvents.length
  };
}

/**
 * Builds HTML email body for weekly summary
 * @param {Object} summaryData - Collected summary data
 * @param {Date} startDate - Start of summary period
 * @param {Date} endDate - End of summary period
 * @returns {string} HTML email body
 */
function buildWeeklySummaryHTML(summaryData, startDate, endDate) {
  const { allEvents, calendarSummaries, totalDuration, highPriorityCount, totalEvents } = summaryData;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #4285f4, #34a853); color: white; padding: 25px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📅 Weekly Calendar Summary</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${formatDateRange(startDate, endDate)}</p>
      </div>
      
      <!-- Statistics Overview -->
      <div style="background: #f8f9fa; padding: 20px; border-bottom: 1px solid #e0e0e0;">
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #4285f4;">${totalEvents}</div>
            <div style="font-size: 14px; color: #666;">Total Events</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #34a853;">${formatDuration(totalDuration)}</div>
            <div style="font-size: 14px; color: #666;">Total Time</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #ea4335;">${highPriorityCount}</div>
            <div style="font-size: 14px; color: #666;">High Priority</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: #fbbc04;">${calendarSummaries.length}</div>
            <div style="font-size: 14px; color: #666;">Calendars</div>
          </div>
        </div>
      </div>
      
      <!-- Calendar Breakdown -->
      <div style="padding: 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">📊 Calendar Breakdown</h2>
        ${buildCalendarBreakdownHTML(calendarSummaries)}
      </div>
      
      <!-- Daily Schedule -->
      <div style="padding: 0 20px 20px;">
        <h2 style="color: #333; margin-bottom: 15px;">🗓️ Daily Schedule</h2>
        ${buildDailyScheduleHTML(allEvents)}
      </div>
      
      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
        <div style="text-align: center; margin-bottom: 15px;">
          <a href="https://calendar.google.com" style="display: inline-block; background: #4285f4; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin: 0 5px;">📅 Open Calendar</a>
          <a href="https://calendar.google.com/calendar/u/0/r/settings" style="display: inline-block; background: #34a853; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; margin: 0 5px;">⚙️ Settings</a>
        </div>
        <div style="text-align: center; font-size: 12px; color: #666; line-height: 1.4;">
          🤖 Generated by Calendar Event Notifier v1.3.0<br>
          📧 Monitoring ${CONFIG.calendarIds.length} calendar${CONFIG.calendarIds.length > 1 ? 's' : ''} • ⏱️ Check interval: ${CONFIG.checkInterval} minute${CONFIG.checkInterval > 1 ? 's' : ''}<br>
          📊 Next summary: ${CONFIG.weeklySummary.enabled ? getNextSummaryDate() : '❌ Disabled'}<br>
          <span style="font-size: 11px; color: #999;">⏰ Generated on ${new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Builds HTML for calendar breakdown section
 * @param {Array} calendarSummaries - Array of calendar summary objects
 * @returns {string} HTML for calendar breakdown
 */
function buildCalendarBreakdownHTML(calendarSummaries) {
  return calendarSummaries.map(cal => `
    <div style="margin-bottom: 15px; padding: 15px; background: ${getLighterColor(cal.color)}; border-left: 4px solid ${cal.color}; border-radius: 4px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="display: inline-block; width: 12px; height: 12px; background: ${cal.color}; border-radius: 50%; margin-right: 8px;"></span>
          <strong style="font-size: 16px;">${cal.name}</strong>
        </div>
        <div style="text-align: right; font-size: 14px; color: #666;">
          <div>${cal.events.length} events • ${formatDuration(cal.duration)}</div>
          ${cal.highPriorityCount > 0 ? `<div style="color: #ea4335;">🔥 ${cal.highPriorityCount} high priority</div>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Builds HTML for daily schedule section
 * @param {Array} allEvents - Array of all events
 * @returns {string} HTML for daily schedule
 */
function buildDailyScheduleHTML(allEvents) {
  const eventsByDay = {};
  allEvents.forEach(({event, calendarName, calendarId, color}) => {
    const dayKey = event.getStartTime().toDateString();
    if (!eventsByDay[dayKey]) {
      eventsByDay[dayKey] = [];
    }
    eventsByDay[dayKey].push({event, calendarName, calendarId, color});
  });
  
  return Object.keys(eventsByDay).sort().map(day => {
    const dayEvents = eventsByDay[day];
    const dayDate = new Date(day);
    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayMonth = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    return `
      <div style="margin-bottom: 20px;">
        <h3 style="background: #4285f4; color: white; padding: 10px 15px; margin: 0; border-radius: 4px; font-size: 16px;">
          ${dayName}, ${dayMonth}
        </h3>
        <div style="border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 4px 4px;">
          ${dayEvents.map(({event, calendarName, color}) => {
            const timeStr = event.isAllDayEvent() ? 
              '<span style="background: #34a853; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px;">ALL DAY</span>' : 
              `<span style="font-weight: bold;">${event.getStartTime().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${event.getEndTime().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>`;
            
            const rule = getNotificationRule(event, calendarName);
            const priority = rule && rule.priority === 'high' ? '<span style="color: #ea4335; margin-left: 5px;">🔥</span>' : '';
            const duration = event.isAllDayEvent() ? '' : ` • ${formatDuration(getEventDuration(event))}`;
            
            const calendarUrl = `https://calendar.google.com/calendar/u/0/r/eventedit/${event.getId().split('@')[0]}`;
            
            return `
              <div style="padding: 12px 15px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center;">
                <span style="display: inline-block; width: 8px; height: 8px; background: ${color}; border-radius: 50%; margin-right: 10px; flex-shrink: 0;"></span>
                <div style="flex-grow: 1;">
                  <div style="font-weight: bold; margin-bottom: 2px;">
                    <a href="${calendarUrl}" style="color: #1a73e8; text-decoration: none;">${event.getTitle()}</a>${priority}
                  </div>
                  <div style="font-size: 14px; color: #666;">
                    ${timeStr}${duration}
                    ${event.getLocation() ? ` • 📍 ${event.getLocation()}` : ''}
                    ${event.getGuestList().length > 0 ? ` • 👥 ${event.getGuestList().length} guests` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Formats date range for display
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Formatted date range
 */
function formatDateRange(startDate, endDate) {
  const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} - ${end}`;
}

/**
 * Calculates next weekly summary date
 * @returns {string} Formatted next summary date
 */
function getNextSummaryDate() {
  const now = new Date();
  const daysUntilNext = (CONFIG.weeklySummary.dayOfWeek + 7 - now.getDay()) % 7 || 7;
  const nextDate = new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);
  nextDate.setHours(CONFIG.weeklySummary.hour, 0, 0, 0);
  return nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + 
         ` at ${CONFIG.weeklySummary.hour}:00`;
}