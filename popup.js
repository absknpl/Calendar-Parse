document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const textInput = document.getElementById('textInput');
  const parseBtn = document.getElementById('parseBtn');
  const errorDisplay = document.getElementById('errorDisplay');
  const eventTitle = document.getElementById('eventTitle');
  const eventDate = document.getElementById('eventDate');
  const startTime = document.getElementById('startTime');
  const endTime = document.getElementById('endTime');
  const eventLocation = document.getElementById('eventLocation');
  const eventUrl = document.getElementById('eventUrl');
  const recurringCheckbox = document.getElementById('recurringCheckbox');
  const exportGoogle = document.getElementById('exportGoogle');
  const exportApple = document.getElementById('exportApple');
  const exportNotion = document.getElementById('exportNotion');
  const titleError = document.getElementById('titleError');
  const dateError = document.getElementById('dateError');
  const startTimeError = document.getElementById('startTimeError');
  const endTimeError = document.getElementById('endTimeError');

  // Try to paste clipboard content automatically
  navigator.clipboard.readText().then(text => {
    if (text.trim().length > 0) {
      textInput.value = text;
    }
  }).catch(err => {
    console.log('Could not read clipboard:', err);
  });

  // Parse button click handler
  parseBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
      showError('Please paste some event text first');
      return;
    }
    
    hideError();
    const event = extractEventDetails(text);
    populateForm(event);
    validateForm();
  });

  // Extract event details from text
  function extractEventDetails(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const lowerText = text.toLowerCase();

    // Title extraction (first line or "Event Name:" pattern)
    let title = lines.find(l => l.match(/event\s*name:|title:/i)) || lines[0] || '';
    if (title.includes(':')) {
      title = title.split(':').slice(1).join(':').trim();
    }
    if (title.includes('Appointments are')) {
      title = title.split('Appointments are')[0].trim();
    }

    // Date extraction (multiple formats)
    let date = '';
    const dateMatch1 = text.match(/(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i);
    const dateMatch2 = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    
    if (dateMatch1) {
      date = formatDate(`${dateMatch1[1]}/${dateMatch1[2]}/${dateMatch1[3]}`);
    } else if (dateMatch2) {
      date = formatDate(`${dateMatch2[1]}/${dateMatch2[2]}/${dateMatch2[3]}`);
    }

    // Time extraction (multiple formats)
    let startTime = '', endTime = '';
    const timeMatch1 = text.match(/(\d{1,2}:\d{2}\s*[ap]m)\s*[-–]\s*(\d{1,2}:\d{2}\s*[ap]m)/i);
    const timeMatch2 = text.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);

    if (timeMatch1) {
      startTime = formatTime(timeMatch1[1]);
      endTime = formatTime(timeMatch1[2]);
    } else if (timeMatch2) {
      startTime = timeMatch2[1].trim();
      endTime = timeMatch2[2].trim();
    }

    // URL extraction
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[0] : '';

    // Location detection
    let location = '';
    if (/virtual/i.test(text)) location = 'Virtual Meeting';
    else if (/in[- ]?person/i.test(text)) location = 'In-Person Meeting';
    else if (/microsoft teams/i.test(text)) location = 'Microsoft Teams';
    else if (/zoom/i.test(text)) location = 'Zoom Meeting';
    else if (/meet\.google|google meet/i.test(text)) location = 'Google Meet';

    // Recurring detection
    const recurring = /(every week|weekly|repeats)/i.test(text);

    return {
      title,
      date,
      startTime,
      endTime,
      location,
      url,
      recurring
    };
  }

  // Helper functions
  function formatDate(dateStr) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  }

  function formatTime(timeStr) {
    const time = timeStr.trim();
    const period = time.match(/[ap]m$/i)?.[0]?.toLowerCase();
    let [hours, minutes] = time.replace(/[ap]m$/i, '').split(':');
    
    hours = parseInt(hours, 10);
    minutes = minutes || '00';
    
    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`.trim();
  }

  function populateForm(event) {
    eventTitle.value = event.title;
    eventDate.value = event.date;
    startTime.value = event.startTime;
    endTime.value = event.endTime;
    eventLocation.value = event.location;
    eventUrl.value = event.url;
    recurringCheckbox.checked = event.recurring;
  }

  function validateForm() {
    const errors = {
      title: !eventTitle.value,
      date: !eventDate.value,
      startTime: !startTime.value,
      endTime: !endTime.value
    };

    // Update error displays
    titleError.style.display = errors.title ? 'block' : 'none';
    dateError.style.display = errors.date ? 'block' : 'none';
    startTimeError.style.display = errors.startTime ? 'block' : 'none';
    endTimeError.style.display = errors.endTime ? 'block' : 'none';

    // Add error classes to inputs
    eventTitle.classList.toggle('error', errors.title);
    eventDate.classList.toggle('error', errors.date);
    startTime.classList.toggle('error', errors.startTime);
    endTime.classList.toggle('error', errors.endTime);

    return !Object.values(errors).some(Boolean);
  }

  // Export functions
  exportGoogle.addEventListener('click', () => {
    if (validateForm()) {
      const googleUrl = generateGoogleCalendarUrl();
      window.open(googleUrl, '_blank');
    }
  });

  exportApple.addEventListener('click', () => {
    if (validateForm()) {
      const icsContent = generateIcsFile();
      downloadFile(`${eventTitle.value}.ics`, icsContent, 'text/calendar');
    }
  });

  exportNotion.addEventListener('click', () => {
    if (validateForm()) {
      const notionContent = generateNotionContent();
      downloadFile(`${eventTitle.value}.txt`, notionContent, 'text/plain');
    }
  });

  function generateGoogleCalendarUrl() {
    const start = new Date(`${eventDate.value}T${startTime.value}`);
    const end = new Date(`${eventDate.value}T${endTime.value}`);
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventTitle.value,
      dates: `${formatDateForGoogle(start)}/${formatDateForGoogle(end)}`,
      details: `Location: ${eventLocation.value}\nURL: ${eventUrl.value}`,
      location: eventLocation.value,
      recur: recurringCheckbox.checked ? `RRULE:FREQ=WEEKLY` : ''
    });
    
    return `https://www.google.com/calendar/render?${params.toString()}`;
  }

  function formatDateForGoogle(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  }

  function generateIcsFile() {
    const start = new Date(`${eventDate.value}T${startTime.value}`);
    const end = new Date(`${eventDate.value}T${endTime.value}`);
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Calendar Parser//EN
BEGIN:VEVENT
UID:${Date.now()}@calendarparser
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}
DTSTART:${start.toISOString().replace(/-|:|\.\d+/g, '')}
DTEND:${end.toISOString().replace(/-|:|\.\d+/g, '')}
SUMMARY:${eventTitle.value}
DESCRIPTION:${eventUrl.value ? `Meeting URL: ${eventUrl.value}\\n` : ''}${eventLocation.value ? `Location: ${eventLocation.value}` : ''}
${eventLocation.value ? `LOCATION:${eventLocation.value}` : ''}
${eventUrl.value ? `URL:${eventUrl.value}` : ''}
${recurringCheckbox.checked ? 'RRULE:FREQ=WEEKLY' : ''}
END:VEVENT
END:VCALENDAR`;
  }

  function generateNotionContent() {
    return `Event: ${eventTitle.value}
Date: ${eventDate.value}
Time: ${startTime.value} - ${endTime.value}
${eventLocation.value ? `Location: ${eventLocation.value}` : ''}
${eventUrl.value ? `URL: ${eventUrl.value}` : ''}
${recurringCheckbox.checked ? 'Repeats: Weekly' : ''}`;
  }

  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // UI helper functions
  function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.style.display = 'block';
  }

  function hideError() {
    errorDisplay.style.display = 'none';
  }
});