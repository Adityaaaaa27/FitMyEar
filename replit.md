# FitMyEar - Custom Ear Piece Fitting App

## Overview
FitMyEar is a medical-tech mobile application for creating custom-fit ear pieces through ear photo capture and 3D reconstruction. Built with React Native (Expo) using a warm coral/orange color palette.

## Project Status
MVP Complete - Core features implemented:
- Splash screen with animated logo
- Email/password authentication (Sign In/Sign Up)
- Dashboard with 3 navigation cards (Open Camera, Upload Photo, 3D Reconstruction Status)
- Camera capture with ear alignment guide and vibration feedback
- Photo gallery upload (gallery-only, no camera option in upload)
- Photo enlargement (lightbox) when clicking on photos
- 3D reconstruction status tracking
- Settings with sign out and data management

## Recent Changes (December 2024)
- **Removed "My Orders" card** from Dashboard - now showing 3 options only
- **Added vibration feedback** when taking photos in camera screen
- **Added photo enlargement** (lightbox modal) when clicking on photos
- **Upload screen now gallery-only** - removed camera navigation from upload
- **Updated color theme** to coral/orange scheme matching new design:
  - Primary Coral: #E8845F
  - Primary Dark: #8B4D3B
  - Cream Background: #F5E6DC

## Architecture

### Tech Stack
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation 7 (Stack-based)
- **UI**: Custom components with coral/orange theme
- **Storage**: AsyncStorage for local persistence
- **Camera**: expo-camera for photo capture
- **Image Picker**: expo-image-picker for gallery access
- **Haptics**: expo-haptics for vibration feedback

### Project Structure
```
├── App.tsx                    # Root component with providers
├── navigation/
│   ├── AuthNavigator.tsx      # Sign In/Sign Up stack
│   └── MainNavigator.tsx      # Main app stack (Dashboard, Camera, etc.)
├── screens/
│   ├── SplashScreen.tsx       # Animated splash with logo
│   ├── SignInScreen.tsx       # Email/password sign in
│   ├── SignUpScreen.tsx       # Account creation
│   ├── DashboardScreen.tsx    # Main hub with 3 feature cards
│   ├── CameraCaptureScreen.tsx # Camera with vibration & photo enlargement
│   ├── UploadScreen.tsx       # Gallery-only upload with photo enlargement
│   ├── ReconstructionStatusScreen.tsx # Processing status
│   └── SettingsScreen.tsx     # Profile and app settings
├── components/
│   ├── Button.tsx             # Primary button with animation
│   ├── Card.tsx               # Elevated card component
│   ├── PhotoLightbox.tsx      # Photo enlargement modal
│   ├── HeaderTitle.tsx        # Custom header with logo
│   ├── ErrorBoundary.tsx      # Error handling wrapper
│   └── Screen*.tsx            # Screen wrapper components
├── hooks/
│   ├── useAuth.tsx            # Authentication context
│   ├── useTheme.ts            # Theme context
│   └── useScreenInsets.ts     # Safe area calculations
├── utils/
│   └── storage.ts             # AsyncStorage utilities
└── constants/
    └── theme.ts               # Design tokens and colors
```

### Color Palette (Coral/Orange Theme)
- Primary Coral: `#E8845F`
- Primary Dark: `#8B4D3B`
- Cream: `#F5E6DC`
- Light Background: `#FAF0E8`
- Dark Text: `#4A3728`
- White: `#FFFFFF`

## Development

### Running the App
```bash
npx expo start --web --port 5000
```

### Key Features
1. **Authentication**: Local storage-based auth with email/password
2. **Camera Capture**: Native camera with ear alignment overlay + vibration
3. **Photo Management**: Capture, preview, delete, and enlarge photos
4. **Gallery Upload**: Upload photos from device gallery (no camera option)
5. **Status Tracking**: Visual progress steps for reconstruction

## User Preferences
- Clean, minimal medical-tech aesthetic
- Coral/orange color theme
- No emojis in the UI
- Modern animations (spring-based)
- Consistent spacing and typography
- Vibration feedback on photo capture
