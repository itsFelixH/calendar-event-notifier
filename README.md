# Calendar Event Notifier

A Google Apps Script that monitors your Google Calendar and sends smart email notifications when new events are added. Features multiple calendar support, advanced filtering, HTML emails, and weekly summaries.

## 🚀 Setup

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Copy all `.gs` files and `appsscript.json` to your project
4. Update `CONFIG.calendarIds` in `Config.gs` with your calendar emails
5. Run `setupCalendarTrigger()` once to start monitoring

## 📚 Documentation

Full documentation is available at: **[https://yourusername.github.io/calendar-event-notifier](https://yourusername.github.io/calendar-event-notifier)**

## ⚙️ Configuration

```javascript
const CONFIG = {
  calendarIds: [                          // Array of calendar IDs to monitor
    'your-email@gmail.com',
    'work@company.com',
    'personal@gmail.com'
  ],
  checkInterval: 1,                       // Check every 1, 5, 10, 15, or 30 minutes
  notificationEmail: null,                // null = use your Google account email
  
  // Weekly Summary
  weeklySummary: {
    enabled: true,                        // Enable weekly overview emails
    dayOfWeek: 0,                         // 0 = Sunday, 1 = Monday, etc.
    hour: 18,                             // 6 PM
    email: null                           // null = use default email
  },
  
  // Event Filtering
  filters: {
    includeKeywords: [], // Only these events (empty = all events)
    excludeKeywords: ['lunch', 'personal', 'blocked', 'busy'], // Skip these events
    businessHoursOnly: false,               // Only notify 9-5
    businessHours: { start: 9, end: 17 },  // Business hours definition
    skipWeekends: false,                    // Skip weekend events
    minDuration: 0                          // Skip events under X minutes (0 = no limit)
  },
  
  // Custom Notification Rules
  notificationRules: [
    {
      condition: (event, calendarName) => event.getTitle().toLowerCase().includes('meeting'),
      email: null, // null = use default email
      subject: '🏢 Work Meeting',
      priority: 'high'
    },
    {
      condition: (event, calendarName) => event.getGuestList().length > 5,
      email: null,
      subject: '👥 Large Meeting',
      priority: 'high'
    }
  ]
};
```

## 📧 Features

- **Multiple calendar support** - Monitor work, personal, and shared calendars
- **Weekly summary emails** - Get overview of upcoming week with statistics dashboard
- **Smart event filtering** - Include/exclude events by keywords, time, duration
- **Custom notification rules** - Different alerts for different event types
- **Business hours filtering** - Only notify during work hours
- **Real-time monitoring** - Checks for new events every minute
- **Duplicate prevention** - Won't spam you with repeat notifications
- **Rich HTML email format** - Professional design with event details, organizer, duration
- **20 Custom notification rules** - Smart categorization (urgent, meetings, interviews, etc.)
- **Priority notifications** - High-priority events get special treatment
- **Calendar identification** - Shows which calendar the event came from with actual colors
- **All-day event support** - Properly formats different event types
- **Direct calendar links** - Click event titles to edit in Google Calendar
- **Enhanced email footers** - Quick access buttons and system information
- **Visual calendar colors** - Events display with actual Google Calendar colors
- **Statistics dashboard** - Weekly summaries show event counts, duration, priorities
- **Modular architecture** - Clean, maintainable code structure
- **Utility functions** - 20+ helper functions for common operations
- **Error handling** - Won't crash if calendar access fails
- **Comprehensive logging** - Detailed debug information for troubleshooting

## 🛠️ Functions

### Core Functions
| Function | Purpose |
|----------|---------|
| `setupCalendarTrigger()` | Start monitoring (run once) |
| `checkForNewEvents()` | Main monitoring function (auto-triggered) |
| `sendWeeklySummary()` | Generate weekly calendar overview (auto-triggered) |
| `sendNotificationEmail()` | Send HTML email notifications |

### Filtering & Rules
| Function | Purpose |
|----------|---------|
| `shouldNotifyForEvent()` | Apply filtering rules to events |
| `getNotificationRule()` | Find matching custom notification rule |

### Utilities
| Function | Purpose |
|----------|---------|
| `formatDuration()` | Format minutes as "2h 30m" |
| `isBusinessHours()` | Check if time is during work hours |
| `getTimeUntilEvent()` | Get time remaining until event |
| `getEventDuration()` | Get event duration in minutes |
| `formatGuestList()` | Smart guest list formatting |
| `getCalendarColor()` | Get calendar color coding |
| `isValidEmail()` | Validate email format |
| `getNotificationStats()` | Get system statistics |
| `cleanupOldProcessedEvents()` | Remove old tracking data |

### Testing & Debug
| Function | Purpose |
|----------|---------|
| `testManualCheck()` | Debug and test with detailed logs |
| `clearProcessedEvents()` | Reset duplicate tracking |

## 🔧 Troubleshooting

### No emails received?

1. Run `testManualCheck()` and check logs
2. Verify all calendar IDs are correct
3. Check if events are being filtered out by your rules
4. Check spam folder
5. Ensure script has calendar permissions for all calendars

### Events being filtered out?

- Check `includeKeywords` and `excludeKeywords` settings
- Verify `businessHoursOnly` and `skipWeekends` settings
- Check `minDuration` filter
- Review custom notification rules

### Permission errors?

- Grant calendar and email permissions when prompted
- Make sure you own the calendar you're monitoring

### Want to monitor multiple calendars?

- ✅ **Built-in support!** Just add calendar IDs to the `calendarIds` array
- Each calendar is checked independently with error handling
- Email notifications show which calendar the event came from

## 📝 Email Format

**Regular Event Email:**
- Professional HTML design with calendar colors
- Clickable "📝 Edit Event in Calendar" button
- Event details table with emojis and formatting
- Calendar color identification dot
- Enhanced footer with quick action buttons
- System information and generation timestamp

**Weekly Summary Email:**
- Statistics dashboard (total events, time, high priority, calendars)
- Calendar breakdown with color coding and event counts
- Daily schedule with clickable event titles
- Visual timeline with time slots and guest information
- Enhanced footer with calendar links and system status

## 🔍 Debugging

Use `testManualCheck()` to see detailed logs:

- Calendar access status for all calendars
- Recent events found with filtering results
- Event processing details (organizer, duration, guests)
- Notification rule matching (20+ rules tested)
- Email sending status
- Filter settings and processed event storage
- System statistics and performance metrics

### Utility Functions
```javascript
// Get system statistics
getNotificationStats();

// Format event duration nicely
formatDuration(150); // "2h 30m"

// Check business hours
isBusinessHours(new Date()); // true/false

// Clean up old data
cleanupOldProcessedEvents(30); // Remove 30+ day old records
```

## ⚡ Quick Start

1. **Setup**: Run `setupCalendarTrigger()`
2. **Test**: Create a calendar event
3. **Debug**: Run `testManualCheck()` if no email arrives
4. **Monitor**: Check execution logs in Apps Script

---

## 💻 Development

### Repository Structure
```
calendar-event-notifier/
├── Config.gs              # Configuration settings & 20+ notification rules
├── Main.gs                # Core application logic (setup, monitoring)
├── EmailService.gs        # HTML email generation & formatting
├── EventFilters.gs        # Event filtering & rule matching logic
├── WeeklySummary.gs       # Weekly summary generation
├── Utils.gs               # 20+ utility functions (dates, validation, stats)
├── Testing.gs             # Debug and testing functions
├── appsscript.json        # Apps Script manifest
├── README.md              # This file
├── ROADMAP.md             # Development roadmap
├── CHANGELOG.md           # Version history
├── CONTRIBUTING.md        # Contribution guidelines
├── LICENSE                # MIT license
└── docs/                  # GitHub Pages documentation
```

### Key Features by File
- **Config.gs**: 20+ smart notification rules (urgent, interviews, large meetings)
- **Utils.gs**: Time formatting, validation, statistics, calendar color utilities
- **EmailService.gs**: Professional HTML emails with calendar links and enhanced footers
- **EventFilters.gs**: Advanced filtering (keywords, business hours, duration)
- **WeeklySummary.gs**: HTML weekly summaries with statistics and daily schedules
- **Testing.gs**: Comprehensive debugging with detailed logs

### Contributing
We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### License
This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

**Note**: Google Apps Script has daily execution limits. For heavy usage, consider increasing check intervals.
