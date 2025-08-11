---
layout: default
title: Calendar Event Notifier
---

# Calendar Event Notifier

Smart Google Calendar event notifications with filtering and HTML emails.

## 🚀 Quick Navigation

- [📖 **Setup Guide**](#setup) - Get started in 5 minutes
- [🗺️ **Roadmap**](roadmap.md) - Development plans and priorities
- [📝 **Changelog**](changelog.md) - Version history and updates
- [🤝 **Contributing**](contributing.md) - Help improve the project

---

## 🎯 Overview

A Google Apps Script that monitors your Google Calendar and sends smart email notifications when new events are added. Features include multiple calendar support, advanced filtering, HTML emails, and weekly summaries.

### ✨ Key Features

- **Multiple Calendar Support** - Monitor work, personal, and shared calendars
- **Smart Event Filtering** - Include/exclude by keywords, business hours, duration
- **Rich HTML Emails** - Professional design with priority indicators
- **Custom Notification Rules** - Different alerts for different event types
- **Weekly Summary Emails** - Automated weekly calendar overviews
- **Real-time Monitoring** - Instant notifications for new events

---

## 🚀 Setup

### 1. Create Google Apps Script Project

1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Replace default code with files from this repository

### 2. Configure Your Settings

```javascript
const CONFIG = {
  calendarIds: ['your-email@gmail.com'],
  checkInterval: 1,
  notificationEmail: null,
  // ... see full configuration below
};
```

### 3. Start Monitoring

Run `setupCalendarTrigger()` once to begin monitoring your calendars.

---

## ⚙️ Configuration

```javascript
const CONFIG = {
  calendarIds: [
    'your-email@gmail.com',
    'work@company.com'
  ],
  checkInterval: 1,
  notificationEmail: null,
  
  weeklySummary: {
    enabled: true,
    dayOfWeek: 0,
    hour: 18,
    email: null
  },
  
  filters: {
    includeKeywords: [],
    excludeKeywords: ['lunch', 'personal'],
    businessHoursOnly: false,
    skipWeekends: false,
    minDuration: 0
  },
  
  notificationRules: [
    {
      condition: (event) => event.getTitle().includes('urgent'),
      subject: '🔥 Urgent Meeting',
      priority: 'high'
    }
  ]
};
```

---

## 🛠️ Functions

| Function | Purpose |
|----------|---------|
| `setupCalendarTrigger()` | Start monitoring (run once) |
| `testManualCheck()` | Debug and test with detailed logs |
| `checkForNewEvents()` | Main monitoring (auto-triggered) |
| `sendWeeklySummary()` | Weekly overview (auto-triggered) |
| `clearProcessedEvents()` | Reset duplicate tracking |

---

## 📧 Email Examples

### Regular Event

```
📅 New Event: Team Standup
📋 Title: Team Standup
📅 Calendar: Work Calendar
⏰ Time: 12/15/2023, 2:00:00 PM - 3:00:00 PM
⏱️ Duration: 60 minutes
👤 Organizer: teamlead@company.com
👥 Guests: 5 attendees
📍 Location: Conference Room A
🔄 Recurring: Yes
```

### High Priority Event

```
🔥 Urgent Meeting: Emergency Call
📋 Title: Emergency Call
📅 Calendar: Work Calendar
⏰ Time: 12/15/2023, 2:00:00 PM - 3:00:00 PM
🔥 Priority: HIGH
```

---

## 🔧 Troubleshooting

### No emails received?

1. Run `testManualCheck()` and check logs
2. Verify calendar IDs are correct
3. Check if events are filtered out
4. Ensure calendar permissions are granted

### Events being filtered?

- Check `includeKeywords` and `excludeKeywords`
- Verify `businessHoursOnly` and `skipWeekends`
- Review custom notification rules

---

## 📊 Project Status

**Current Version:** v1.1.0 - Enhanced Filtering & Rich Emails ✅

**Next Phase:** Visual & Integration Enhancements

- Event color coding
- Slack integration
- Conflict detection

See the [Roadmap](roadmap.md) for detailed development plans.

---

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](contributing.md) for details on:

- Development setup
- Code style guidelines
- Testing procedures
- Pull request process

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/yourusername/calendar-event-notifier/blob/main/LICENSE) file for details.
