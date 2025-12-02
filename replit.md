# Photo App

## Overview
A mobile-friendly web application for capturing and managing photos. Built with HTML, CSS, and JavaScript with a Node.js/Express backend.

## Features
- **Open Camera**: Opens device camera to take photos with vibration feedback when capturing
- **Upload Photo**: Upload photos from gallery (no camera option, gallery only)
- **View Photos**: View all captured/uploaded photos in a gallery grid
- **Photo Enlargement**: Click on any photo to view it enlarged in a lightbox modal

## Color Theme
Uses a coral/orange color scheme inspired by the reference design:
- Primary Coral: #E8845F
- Primary Dark: #8B4D3B  
- Background Cream: #F5E6DC

## Project Structure
```
/
├── public/
│   ├── index.html    # Main HTML page
│   ├── styles.css    # Styling with coral theme
│   ├── app.js        # JavaScript functionality
│   └── favicon.svg   # App favicon
├── server.js         # Express server
├── package.json      # Dependencies
└── replit.md         # This file
```

## Technical Details
- Photos are stored in browser localStorage
- Camera uses MediaDevices API
- Vibration uses Navigator Vibrate API (mobile devices)
- File upload uses File API with gallery-only access

## Running the App
The app runs on port 5000 via the workflow "Photo App Server".
