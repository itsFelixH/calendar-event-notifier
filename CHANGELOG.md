# Changelog

All notable changes to Calendar Event Notifier will be documented in this file.

## [1.3.0] - 2024-12-15

### ✨ Added
- **Direct Calendar Links** - Event titles in emails now link directly to Google Calendar for editing
- **Enhanced Email Footers** - Added quick action buttons and comprehensive system information
  - "📅 Open Calendar" and "⚙️ Settings" buttons for quick access
  - System version, calendar count, check interval display
  - Generation timestamp with emoji indicators
- **Visual Polish** - Enhanced emoji usage throughout emails for better readability
- **Edit Event Buttons** - Prominent "📝 Edit Event in Calendar" buttons in notification emails
- **Calendar Color Integration** - Events display with actual Google Calendar colors in weekly summaries
- **Statistics Dashboard** - Weekly summaries show comprehensive event statistics

### 🔧 Enhanced
- **Email User Experience** - Significantly improved with direct calendar integration
- **Footer Information** - More comprehensive system status and quick action access
- **Weekly Summary Design** - Professional HTML with statistics, calendar breakdown, and daily schedules
- **Event Presentation** - Better visual hierarchy with colors, emojis, and clickable elements

### 🛠️ Technical
- Calendar links use proper Google Calendar URLs with event IDs
- Enhanced HTML structure for better email client compatibility
- Improved footer generation functions for consistent styling
- Calendar color utilities for visual identification

## [1.2.0] - 2024-12-15

### ✨ Added
- **Modular Architecture** - Split code into 7 focused files for better maintainability
- **20 Custom Notification Rules** - Smart categorization (urgent, interviews, meetings, etc.)
- **20+ Utility Functions** - Date formatting, validation, statistics, cleanup operations
- **Enhanced Email Service** - Improved HTML email generation with better structure
- **Statistics Tracking** - Monitor system performance and usage metrics
- **Data Cleanup** - Automatic cleanup of old processed event records

### 🔧 Enhanced
- **Code Organization** - Separated concerns into Config, Main, EmailService, EventFilters, WeeklySummary, Utils, Testing
- **Notification Rules** - Comprehensive rule set covering priority, meeting types, duration, location, calendar source
- **Utility Functions** - Time formatting, business hours checking, event analysis, validation
- **Documentation** - Updated to reflect modular structure and new features

## [1.1.1] - 2024-12-15

### 📚 Documentation & Repository
- **GitHub Pages Site** - Automatic documentation deployment via GitHub Actions
- **Professional Repository Structure** - Issue templates, contributing guide, MIT license
- **Open Source Ready** - Complete project infrastructure for community contributions
- **Development Workflow** - Automated documentation updates on every commit

## [1.1.0] - 2024-12-15

### ✨ Added

- **Multiple Calendar Support** - Monitor multiple calendars simultaneously
- **Smart Event Filtering** - Include/exclude by keywords, business hours, duration
- **Rich HTML Email Design** - Professional responsive styling with priority colors
- **Custom Notification Rules** - Conditional formatting based on event properties
- **Weekly Summary Emails** - Automated weekly calendar overviews
- **Priority Handling** - High-priority events with visual indicators
- **Comprehensive Logging** - Detailed debug information for troubleshooting

### 🔧 Enhanced

- **Email Content** - Added organizer, duration, guest count, recurring status
- **Error Handling** - Individual calendar error isolation
- **Configuration** - Flexible filtering and notification rule system
- **Documentation** - Complete setup and troubleshooting guides

### 🐛 Fixed

- Duplicate event notifications
- Calendar access permission handling
- All-day event formatting

## [1.0.0] - 2024-12-01

### ✨ Initial Release

- Basic calendar monitoring
- Email notifications for new events
- Single calendar support
- Simple text email format
- Basic duplicate prevention

---

## Upcoming in v1.2

### 🎯 Planned Features

- Event color coding from calendar API
- Slack integration with webhooks
- Conflict detection for overlapping events
- Interactive email buttons
- Enhanced email themes

See [ROADMAP.md](ROADMAP.md) for detailed development plans.
