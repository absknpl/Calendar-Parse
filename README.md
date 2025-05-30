# 📅 Text to Calendar - Chrome Extension

Turn messy meeting text into clean, ready-to-use calendar events with one paste.

This lightweight Chrome extension uses OCR and natural language parsing to automatically extract date, time, and location from event text or screenshots, and lets you export directly to Google Calendar, Apple Calendar (.ics), or Notion.

## ✨ Features

- 📋 **Paste Event Text** or OCR from Screenshots (optional)
- 🧠 **Smart Parsing**: Automatically fills in title, date, start/end time, location, and meeting link
- 🔁 **Recurring Options**: Supports daily, weekly, monthly, yearly events
- 📝 **Notes Field**: Stores full event details for context and exports to calendar
- 📤 **One-Click Export** to:
  - Google Calendar
  - Apple Calendar (.ics file)
  - Notion plaintext

## 📦 How to Use

1. **Install** the extension from the Chrome Web Store *(or load unpacked via `chrome://extensions/`)*
2. Open the extension popup.
3. Paste any meeting/event text (from email, message, or screenshot).
4. Click `Parse Text`.
5. Review & edit the fields.
6. Export using your preferred calendar format.

### 🧪 Example Input
Event Name: Coffee Chat
Date: 6/5/2025
Time: 2:00 PM - 2:30 PM
Location: Starbucks, Arlington
Meeting URL: https://meet.google.com/abc-defg-hij
Repeats weekly
Let’s catch up on recent updates.

## 🛠️ Development

### Load Unpacked Extension
1. Clone this repo:
   ```
   git clone https://github.com/yourusername/calendar-parse-extension.git
``
	2.	Visit chrome://extensions/
	3.	Enable “Developer mode”
	4.	Click “Load unpacked” and select the extension directory.

## Folder Structure
popup/
├── popup.html
├── popup.js
├── popup.css
└── assets/
    ├── icon.png
    └── calendar-icons.png

📄 License
Version 1.0.0
MIT License.
© Abhishek Nepal
