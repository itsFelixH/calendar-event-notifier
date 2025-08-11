/**
 * Configuration settings for Calendar Event Notifier
 * Modify these settings to customize the behavior
 * 
 * SETUP INSTRUCTIONS:
 * 1. Update calendarIds with your calendar email addresses
 * 2. Adjust checkInterval (1=fastest, 30=slowest)
 * 3. Configure filters and notification rules as needed
 * 4. Run setupCalendarTrigger() once to start monitoring
 */
const CONFIG = {
  /** 
   * Array of calendar IDs to monitor
   * Find your calendar ID: Calendar Settings → Calendar ID
   * Examples:
   *   'your-email@gmail.com'        // Personal calendar
   *   'work@company.com'            // Work calendar  
   *   'team-calendar@company.com'   // Shared team calendar
   */
  calendarIds: [
    'jojofelix.bundehoffmann@gmail.com',
    // 'work@company.com',
    // 'personal@gmail.com'
  ],
  
  /** 
   * Check interval in minutes - MUST be 1, 5, 10, 15, or 30
   * Recommendations:
   *   1  = Instant notifications (uses more quota)
   *   5  = Good balance of speed and quota usage
   *   15 = Conservative quota usage
   */
  checkInterval: 1,
  
  /** 
   * Email for notifications - null uses your Google account email
   * Examples:
   *   null                    // Use your Google account
   *   'alerts@company.com'    // Send to specific email
   */
  notificationEmail: null,
  
  /** 
   * Weekly summary email configuration
   * Sends overview of upcoming week's events
   * Examples:
   *   { enabled: true, dayOfWeek: 0, hour: 18, email: null }     // Sunday 6 PM
   *   { enabled: true, dayOfWeek: 1, hour: 8, email: null }      // Monday 8 AM
   *   { enabled: false, dayOfWeek: 0, hour: 18, email: null }    // Disabled
   */
  weeklySummary: {
    /** Enable/disable weekly overview emails */
    enabled: true,
    /** Day of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday */
    dayOfWeek: 0,
    /** Hour to send summary (24-hour format: 0-23) */
    hour: 18,
    /** Email for weekly summary - null uses notificationEmail or your Google account */
    email: null
  },
  
  /** 
   * Event filtering configuration
   * Controls which events trigger notifications
   */
  filters: {
    /** 
     * Only notify for events containing these keywords (empty = all events)
     * Examples:
     *   []                                    // All events
     *   ['meeting', 'call', 'interview']     // Only these types
     *   ['urgent', 'emergency']              // Only urgent events
     */
    includeKeywords: [],
    
    /** 
     * Skip events containing these keywords
     * Examples:
     *   ['lunch', 'personal', 'blocked']     // Skip personal time
     *   ['break', 'gym', 'dentist']          // Skip non-work events
     *   []                                   // Don't skip any events
     */
    excludeKeywords: ['lunch', 'personal', 'blocked', 'busy'],
    
    /** 
     * Only send notifications during business hours
     * Examples:
     *   false  // Notify 24/7
     *   true   // Only during businessHours
     */
    businessHoursOnly: false,
    
    /** 
     * Business hours definition (24-hour format)
     * Examples:
     *   { start: 9, end: 17 }   // 9 AM - 5 PM
     *   { start: 8, end: 19 }   // 8 AM - 7 PM
     *   { start: 18, end: 2 }   // 6 PM - 2 AM (night shift)
     */
    businessHours: { start: 9, end: 17 },
    
    /** 
     * Skip weekend event notifications
     * Examples:
     *   false  // Notify on weekends
     *   true   // Skip Saturday/Sunday events
     */
    skipWeekends: false,
    
    /** 
     * Skip events shorter than X minutes (0 = no limit)
     * Examples:
     *   0   // All events regardless of duration
     *   15  // Skip quick calls/check-ins
     *   30  // Only substantial meetings
     *   60  // Only hour+ events
     */
    minDuration: 0
  },
  
  /** 
   * Custom notification rules - processed in order, first match wins
   * Each rule can customize email subject, priority, and recipient
   * 
   * Rule Structure:
   *   condition: (event, calendarName) => boolean  // Function that returns true if rule matches
   *   email: string|null                          // Custom email or null for default
   *   subject: string                             // Email subject prefix
   *   priority: 'high'|'normal'                   // Priority level (affects email styling)
   * 
   * Available event properties:
   *   event.getTitle()           // Event title
   *   event.getGuestList()       // Array of attendees
   *   event.getLocation()        // Event location
   *   event.getStartTime()       // Start date/time
   *   event.getEndTime()         // End date/time
   *   event.isAllDayEvent()      // True if all-day event
   *   event.getEventSeries()     // Recurring event series (null if not recurring)
   *   calendarName               // Name of the calendar
   */
  notificationRules: [
    // ===== HIGH PRIORITY EVENTS (checked first) =====
    // Urgent/Emergency events
    {
      condition: (event, calendarName) => {
        const title = event.getTitle().toLowerCase();
        return title.includes('urgent') || title.includes('emergency');
      },
      email: null,  // Use default email
      subject: '😨 Urgent Event',
      priority: 'high'
    },
    
    // Job interviews
    {
      condition: (event, calendarName) => 
        event.getTitle().toLowerCase().includes('interview'),
      email: null,
      subject: '💼 Job Interview',
      priority: 'high'
    },
    
    // Deadlines
    {
      condition: (event, calendarName) => {
        const title = event.getTitle().toLowerCase();
        return title.includes('deadline') || title.includes('due');
      },
      email: null,
      subject: '⏰ Deadline Alert',
      priority: 'high'
    },
    
    // ===== MEETING TYPES =====
    // General meetings
    {
      condition: (event, calendarName) => 
        event.getTitle().toLowerCase().includes('meeting'),
      email: null,
      subject: '🏢 Meeting',
      priority: 'normal'
    },
    
    // Daily standups
    {
      condition: (event, calendarName) => {
        const title = event.getTitle().toLowerCase();
        return title.includes('standup') || title.includes('daily');
      },
      email: null,
      subject: '🗣️ Daily Standup',
      priority: 'normal'
    },
    
    // Review meetings
    {
      condition: (event, calendarName) => {
        const title = event.getTitle().toLowerCase();
        return title.includes('review') || title.includes('retrospective');
      },
      email: null,
      subject: '🔍 Review Meeting',
      priority: 'normal'
    },
    
    // ===== EVENT SIZE BASED =====
    // Large events (10+ people)
    {
      condition: (event, calendarName) => 
        event.getGuestList().length > 10,
      email: null,
      subject: '🎆 Large Event',
      priority: 'high'
    },
    
    // Group meetings (5+ people)
    {
      condition: (event, calendarName) => 
        event.getGuestList().length > 5,
      email: null,
      subject: '👥 Group Meeting',
      priority: 'normal'
    },
    
    // 1-on-1 meetings
    {
      condition: (event, calendarName) => 
        event.getGuestList().length === 1,
      email: null,
      subject: '👤 1-on-1 Meeting',
      priority: 'normal'
    },
    
    // ===== DURATION BASED =====
    // Long events (2+ hours)
    {
      condition: (event, calendarName) => {
        const duration = (event.getEndTime() - event.getStartTime()) / (1000 * 60);
        return duration >= 120;
      },
      email: null,
      subject: '🕰️ Long Event',
      priority: 'normal'
    },
    
    // All-day events
    {
      condition: (event, calendarName) => 
        event.isAllDayEvent(),
      email: null,
      subject: '🌅 All-Day Event',
      priority: 'normal'
    },
    
    // ===== TIME BASED =====
    // Off-hours events (before 8 AM or after 6 PM)
    {
      condition: (event, calendarName) => {
        const hour = event.getStartTime().getHours();
        return hour < 8 || hour > 18;
      },
      email: null,
      subject: '🌙 Off-Hours Event',
      priority: 'high'
    },
    
    // Weekend events
    {
      condition: (event, calendarName) => {
        const day = event.getStartTime().getDay();
        return day === 0 || day === 6; // 0=Sunday, 6=Saturday
      },
      email: null,
      subject: '🎆 Weekend Event',
      priority: 'normal'
    },
    
    // ===== LOCATION BASED =====
    // Video calls (Zoom, Meet, Teams)
    {
      condition: (event, calendarName) => {
        const location = event.getLocation();
        if (!location) return false;
        const loc = location.toLowerCase();
        return loc.includes('zoom') || loc.includes('meet') || loc.includes('teams');
      },
      email: null,
      subject: '📹 Video Call',
      priority: 'normal'
    },
    
    // Conference room meetings
    {
      condition: (event, calendarName) => {
        const location = event.getLocation();
        return location && location.toLowerCase().includes('conference');
      },
      email: null,
      subject: '🏢 Conference Room',
      priority: 'normal'
    },
    
    // ===== CALENDAR BASED =====
    // Work calendar events
    {
      condition: (event, calendarName) => {
        const name = calendarName.toLowerCase();
        return name.includes('work') || name.includes('office');
      },
      email: null,
      subject: '💼 Work Event',
      priority: 'normal'
    },
    
    // Personal calendar events
    {
      condition: (event, calendarName) => 
        calendarName.toLowerCase().includes('personal'),
      email: null,
      subject: '🏠 Personal Event',
      priority: 'normal'
    },
    
    // ===== RECURRING EVENTS =====
    // Recurring events
    {
      condition: (event, calendarName) => 
        event.getEventSeries() !== null,
      email: null,
      subject: '🔄 Recurring Event',
      priority: 'normal'
    }
    
    // ===== CUSTOM RULES EXAMPLES (commented out) =====
    // Uncomment and modify these examples for your needs:
    
    // Events with specific attendees
    // {
    //   condition: (event, calendarName) => {
    //     const guests = event.getGuestList().map(g => g.getEmail());
    //     return guests.some(email => email.includes('ceo@company.com'));
    //   },
    //   email: 'assistant@company.com',  // Send to assistant
    //   subject: '👑 Executive Meeting',
    //   priority: 'high'
    // },
    
    // Events in specific time range
    // {
    //   condition: (event, calendarName) => {
    //     const hour = event.getStartTime().getHours();
    //     return hour >= 12 && hour <= 14;  // Lunch time events
    //   },
    //   email: null,
    //   subject: '🍽️ Lunch Event',
    //   priority: 'normal'
    // },
    
    // Events with specific keywords in description
    // {
    //   condition: (event, calendarName) => {
    //     const description = event.getDescription() || '';
    //     return description.toLowerCase().includes('important');
    //   },
    //   email: null,
    //   subject: '⭐ Important Event',
    //   priority: 'high'
    // }
  ]
};

// ===== CONFIGURATION EXAMPLES =====
// Copy and modify these examples for different use cases:

// PERSONAL USE EXAMPLE:
// const CONFIG = {
//   calendarIds: ['your-email@gmail.com'],
//   checkInterval: 5,
//   notificationEmail: null,
//   weeklySummary: { enabled: true, dayOfWeek: 0, hour: 18, email: null },
//   filters: {
//     includeKeywords: [],
//     excludeKeywords: ['lunch', 'gym', 'personal'],
//     businessHoursOnly: false,
//     skipWeekends: false,
//     minDuration: 0
//   },
//   notificationRules: [
//     {
//       condition: (event) => event.getTitle().includes('interview'),
//       subject: '💼 Job Interview',
//       priority: 'high'
//     }
//   ]
// };

// WORK ENVIRONMENT EXAMPLE:
// const CONFIG = {
//   calendarIds: ['work@company.com', 'team-calendar@company.com'],
//   checkInterval: 1,
//   notificationEmail: 'work-alerts@company.com',
//   weeklySummary: { enabled: true, dayOfWeek: 1, hour: 8, email: 'manager@company.com' },
//   filters: {
//     includeKeywords: ['meeting', 'standup', 'review'],
//     excludeKeywords: ['lunch', 'break'],
//     businessHoursOnly: true,
//     businessHours: { start: 9, end: 17 },
//     skipWeekends: true,
//     minDuration: 15
//   },
//   notificationRules: [
//     {
//       condition: (event) => event.getTitle().includes('urgent'),
//       subject: '🚨 Urgent Work Event',
//       priority: 'high',
//       email: 'emergency@company.com'
//     }
//   ]
// };