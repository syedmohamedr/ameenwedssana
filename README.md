# 💍 Cinematic Mobile-First Digital Wedding Invitation

> **Ameenul Ashif & Sana Nazrin — 27 December 2026**  
> **Venue: Cloud 7 Convention Centre, Keralasseri, Palakkad**

A luxury, mobile-first digital wedding invitation website crafted with an opulent Royal Emerald Green and Champagne Gold aesthetic, inspired by modern royal wedding cards.

---

## ✨ Features Included

- **Cinematic Opening Cover**: Elegant emerald green hero screen with Bismillah, gold diamond motif, couple names, and animated `[ OPEN INVITATION → ]` CTA.
- **Tap to Open Animation**: Smooth transition unsealing the invitation, fading in background music, and bursting romantic flower petals.
- **Metallic Gold Shimmer Effects**: High-contrast luxury serif typography with sweeping golden foil reflections and fine hairline borders.
- **Interactive Scratch-to-Reveal Date**: Real-time canvas scratch card with finger/mouse touch support and fluid erase physics.
- **Flower Petal & Stardust Burst Engine**: Realistic rose petals and gold confetti bursting across the screen upon date reveal.
- **Live Countdown Timer**: Real-time ticking down to **27 December 2026, 11:00 AM IST** displaying Days, Hours, Minutes, and Seconds.
- **Spiritual & Emotional Blessings**: Surah Ar-Rum (30:21) and heartfelt family invitations with authentic Arabic Bismillah calligraphy (`﷽`).
- **Interactive Venue & Navigation**:
  - Direct Google Maps button linking to **Cloud 7 Convention Centre** (`https://maps.app.goo.gl/V49z5e1QA4Dc1HM97`).
- **Action Buttons**:
  - `ADD TO CALENDAR 📅`: Generates `.ics` file (Apple Calendar, Outlook, iOS) and direct Google Calendar link.
  - `WILL YOU ATTEND? 💬`: Pre-filled WhatsApp message for effortless guest confirmations.
  - `SHARE INVITATION 💌`: Native mobile Web Share API sheet or WhatsApp share link.
- **Built-in Wedding Melodic Synth**: Includes a procedural romantic acoustic harp & piano soundscape that plays instantly without external dependencies, with support for custom `.mp3` files!
- **Discreet Live Edit Panel**: Built-in interactive gear panel allowing live edits on screen.

---

## 🛠️ How to Customize All Details

All details can be edited in one single file: **[`config.js`](file:///Users/racitsolutionspvtltd/Desktop/my%20pro/sana&ameen/config.js)**.

```javascript
const WEDDING_CONFIG = {
  groom: {
    name: "AMEENUL ASHIF",
    shortName: "Ameen",
  },
  bride: {
    name: "SANA NAZRIN",
    shortName: "Sana",
  },
  weddingDateISO: "2026-12-27T11:00:00+05:30", // Live countdown target
  dateFormatted: "27 DECEMBER 2026",
  dayOfWeek: "Sunday",
  timeFormatted: "11:00 AM TO 3:00 PM",
  venue: {
    name: "Cloud 7 Convention Centre",
    city: "Keralasseri",
    district: "Palakkad, Kerala",
    mapLink: "https://maps.app.goo.gl/V49z5e1QA4Dc1HM97"
  },
  contact: {
    whatsappNumber: "918606311719", // Change to couple/family WhatsApp number
  }
};
```

---

## 🎵 Adding Custom Background Music

1. Place your audio file into `assets/audio/` (e.g. `assets/audio/wedding_music.mp3`).
2. Open [`config.js`](file:///Users/racitsolutionspvtltd/Desktop/my%20pro/invitation/config.js) and set:
   ```javascript
   audio: {
     customAudioSrc: "assets/audio/wedding_music.mp3",
   }
   ```
3. If left empty `""`, the site automatically plays the built-in romantic harp and piano acoustic melody!

---

## 🚀 How to Run Locally

You can preview the invitation anytime with Python or Node:

```bash
# Using Python
python3 -m http.server 8088

# Or using Node
npx serve .
```

Open [http://localhost:8088](http://localhost:8088) in your browser (or scan via local network on your mobile phone).
