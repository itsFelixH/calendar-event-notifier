/**
 * Sends HTML email notification for a calendar event
 * @param {GoogleAppsScript.Calendar.CalendarEvent} event - The calendar event
 * @param {string} calendarName - Name of the calendar
 * @param {Object|null} rule - Matching notification rule or null
 */
function sendNotificationEmail(event, calendarName, rule = null) {
  try {
    console.log(`--- SENDING EMAIL FOR EVENT ---`);
    console.log(`Event Title: ${event.getTitle()}`);
    console.log(`Calendar: ${calendarName}`);
    console.log(`Event ID: ${event.getId()}`);
    console.log(`Event Created: ${event.getDateCreated()}`);
    console.log(`Notification Rule: ${rule ? rule.subject : 'Default'}`);
    
    const eventData = extractEventData(event);
    const subject = buildEmailSubject(event, rule);
    const htmlBody = buildEmailBody(event, calendarName, eventData, rule);
    
    const email = (rule && rule.email) || CONFIG.notificationEmail || Session.getActiveUser().getEmail();
    console.log(`Sending email to: ${email}`);
    console.log(`Email subject: ${subject}`);
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: htmlBody
    });
    console.log(`✅ HTML email sent successfully!`);
    
  } catch (error) {
    console.error(`❌ Failed to send email:`, error);
  }
}

function extractEventData(event) {
  const startTime = event.getStartTime();
  const endTime = event.getEndTime();
  const isAllDay = event.isAllDayEvent();
  const duration = Math.round((endTime - startTime) / (1000 * 60));
  const guestList = event.getGuestList();
  const organizer = event.getCreators()[0] || 'Unknown';
  const isRecurring = event.getEventSeries() !== null;
  const createdTime = event.getDateCreated();
  const lastModified = event.getLastUpdated();
  
  const timeFormat = isAllDay ? 
    `All day on ${startTime.toDateString()}` :
    `${startTime.toLocaleString()} - ${endTime.toLocaleString()}`;
  
  return {
    startTime, endTime, isAllDay, duration, guestList, organizer,
    isRecurring, createdTime, lastModified, timeFormat
  };
}

function buildEmailSubject(event, rule) {
  const priorityEmoji = rule && rule.priority === 'high' ? '🔥 ' : '📅 ';
  return rule ? 
    `${priorityEmoji}${rule.subject}: ${event.getTitle()}` : 
    `📅 New Event: ${event.getTitle()}`;
}

/**
 * Builds the HTML email body with calendar colors
 * @param {GoogleAppsScript.Calendar.CalendarEvent} event - The calendar event
 * @param {string} calendarName - Name of the calendar
 * @param {Object} eventData - Extracted event data
 * @param {Object|null} rule - Matching notification rule
 * @returns {string} HTML email body
 */
function buildEmailBody(event, calendarName, eventData, rule) {
  // Get calendar color for visual identification
  const calendarId = CONFIG.calendarIds.find(id => {
    try {
      return CalendarApp.getCalendarById(id).getName() === calendarName;
    } catch (error) {
      return false;
    }
  });
  
  const calendarColor = calendarId ? getCalendarColor(calendarId) : '#4285f4';
  const calendarBgColor = getLighterColor(calendarColor);
  
  // Priority colors override calendar colors for high-priority events
  const priorityColor = rule && rule.priority === 'high' ? '#ff4444' : calendarColor;
  const priorityBg = rule && rule.priority === 'high' ? '#fff5f5' : calendarBgColor;
  const priorityEmoji = rule && rule.priority === 'high' ? '🔥 ' : '📅 ';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: ${priorityColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">${priorityEmoji}${event.getTitle()}</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">New event added to your calendar</p>
      </div>
      
      <div style="background: ${priorityBg}; padding: 20px; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>📅 Calendar:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><span style="display: inline-block; width: 12px; height: 12px; background: ${calendarColor}; border-radius: 50%; margin-right: 8px;"></span>${calendarName}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>⏰ Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${eventData.timeFormat}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>⏱️ Duration:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${eventData.isAllDay ? 'All day' : `${eventData.duration} minutes`}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>👤 Organizer:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${eventData.organizer}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>👥 Guests:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${eventData.guestList.length > 0 ? `${eventData.guestList.length} attendees` : 'None'}</td></tr>
          ${eventData.guestList.length > 0 && eventData.guestList.length <= 5 ? `<tr><td></td><td style="padding: 4px 0; font-size: 14px; color: #666;">${eventData.guestList.map(g => g.getEmail()).join(', ')}</td></tr>` : ''}
          ${eventData.guestList.length > 5 ? `<tr><td></td><td style="padding: 4px 0; font-size: 14px; color: #666;">${eventData.guestList.slice(0, 3).map(g => g.getEmail()).join(', ')} and ${eventData.guestList.length - 3} more</td></tr>` : ''}
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>📍 Location:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${event.getLocation() || 'No location'}</td></tr>
          <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>🔄 Recurring:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${eventData.isRecurring ? 'Yes' : 'No'}</td></tr>
          ${rule && rule.priority === 'high' ? `<tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>🔥 Priority:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #ff4444; font-weight: bold;">HIGH</td></tr>` : ''}
        </table>
        
        ${event.getDescription() ? `<div style="margin-top: 20px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid ${priorityColor};"><strong>📝 Description:</strong><br><span style="color: #666;">${event.getDescription()}</span></div>` : ''}
        
        <!-- Calendar Link -->
        <div style="margin-top: 20px; text-align: center;">
          <a href="https://calendar.google.com/calendar/u/0/r/eventedit/${event.getId().split('@')[0]}" style="display: inline-block; background: ${priorityColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📝 Edit Event in Calendar
          </a>
        </div>
        
        <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 6px; font-size: 12px; color: #888;">
          <strong>📊 Event Details:</strong><br>
          📅 Created: ${eventData.createdTime.toLocaleString()}<br>
          ✏️ Last Modified: ${eventData.lastModified.toLocaleString()}<br>
          🏷️ Event ID: ${event.getId()}
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0; text-align: center;">
        <div style="margin-bottom: 10px;">
          <a href="https://calendar.google.com" style="display: inline-block; background: #4285f4; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; margin: 0 3px; font-size: 12px;">📅 Calendar</a>
          <a href="https://calendar.google.com/calendar/u/0/r/settings" style="display: inline-block; background: #34a853; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; margin: 0 3px; font-size: 12px;">⚙️ Settings</a>
        </div>
        <div style="font-size: 11px; color: #666; line-height: 1.3;">
          🤖 Calendar Event Notifier v1.3.0<br>
          📧 Monitoring ${CONFIG.calendarIds.length} calendar${CONFIG.calendarIds.length > 1 ? 's' : ''} • ⏱️ Every ${CONFIG.checkInterval} min<br>
          <span style="color: #999;">⏰ ${new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
}