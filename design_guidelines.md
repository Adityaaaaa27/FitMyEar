# FitMyEar Design Guidelines

## Brand Identity
**FitMyEar** is a medical-tech mobile application for creating custom-fit ear pieces through ear photo capture and 3D reconstruction. The design must convey modern medical-tech precision with a clean, premium, and futuristic aesthetic.

## Color Palette
Use ONLY these colors throughout the entire application:

- **Primary Blue**: `#1A5CFF` - Vibrant tech blue for primary actions, headers, and icons
- **Highlight Yellow**: `#FFD93D` - Bright warm yellow for accents, highlights, and focus states
- **White**: `#FFFFFF` - Clean neutral for backgrounds and cards
- **Dark Text**: `#0A0A0A` - Deep black for all text content
- **Light Background**: `#F7F7F8` - Very soft white-grey for subtle backgrounds

**Prohibited Colors**: No teal, turquoise, or green shades. Strict adherence to the five-color palette only.

## Visual Style
- Modern medical-tech aesthetic
- Clean white surfaces with soft shadows
- Rounded corners on all cards and buttons
- Consistent spacing throughout
- Sharp, futuristic UI elements
- Minimal, uncluttered layouts
- Typography: Inter, Poppins, or SF Pro style

## Authentication Flow
**Required**: Email/password authentication with sign-in and sign-up screens.

### Sign In Screen
- Blue header containing FitMyEar logo
- White card with email and password input fields
- Blue primary button: "Sign In"
- Yellow accent for highlights and subtle borders
- Text button: "Create an account" to navigate to sign-up

### Sign Up Screen
- Clean white background
- Input fields: Email, Password, Confirm Password
- Blue primary button: "Create Account"
- Yellow accent for focus states on inputs

## Navigation Architecture
**Stack-based navigation** with the following flow:
1. Splash Screen (auto-advances after 3 seconds)
2. Sign In Screen (entry point)
3. Home Dashboard (main hub after authentication)
4. Modal/Stack screens: Camera Capture, Upload, Reconstruction Status, Settings

No tab bar or drawer navigation needed.

## Screen Specifications

### 1. Splash Screen
- **Purpose**: Brand introduction and app loading
- **Layout**: Fullscreen
  - White background
  - Centered FitMyEar logo (blue + yellow)
  - Subtle fade-in animation
  - Auto-navigate to Sign In after 3 seconds
- **Components**: Logo image, animation

### 2. Home Dashboard
- **Purpose**: Main navigation hub for app features
- **Layout**:
  - App bar: Blue background with white FitMyEar logo
  - Scrollable content area with three large navigation cards
- **Cards** (white background, soft shadows, rounded corners):
  1. "Capture Ear Photos" - Blue icon, yellow accent bar
  2. "Upload Images" - Blue icon, yellow accent bar
  3. "3D Reconstruction Status" - Blue icon, yellow accent bar
- **Interaction**: Tap card to navigate to respective screen

### 3. Camera Capture Screen
- **Purpose**: Guide user to photograph their ear correctly
- **Layout**:
  - Live camera preview (fullscreen)
  - White ear-outline overlay for alignment guidance
  - Instruction text in Dark Text color (#0A0A0A)
  - Capture button: Vibrant blue circular button (#1A5CFF)
  - Preview carousel/grid below camera for captured images
- **Components**: Camera view, overlay graphics, capture button, image thumbnails

### 4. Upload Screen
- **Purpose**: Review captured images and submit to cloud
- **Layout**:
  - White background
  - Grid of rounded thumbnail previews showing captured ear images
  - Blue primary button: "Upload to FitMyEar Cloud"
  - Yellow accent along progress indicators during upload
- **Components**: Image grid, upload button, progress indicator

### 5. Reconstruction Status Screen
- **Purpose**: Display 3D reconstruction progress
- **Layout**:
  - White background
  - Blue progress steps: "Queued → Processing → Completed"
  - Yellow dots/highlights for active step
  - Placeholder area for future 3D model viewer
- **Components**: Progress stepper, status cards, placeholder view

### 6. Settings/Profile Screen
- **Purpose**: User account management
- **Layout**:
  - White cards with dark text
  - Blue icons for settings options
  - "Sign Out" button with yellow accent
- **Components**: Settings list, sign-out button

## Design System

### Buttons
- **Primary**: Blue (#1A5CFF) background, white text, rounded corners
- **Secondary**: White background, blue border, blue text
- **Text**: Yellow (#FFD93D) for accent actions

### Cards
- White (#FFFFFF) background
- Soft drop shadows
- Rounded corners (12-16px radius)
- Consistent padding (16-24px)
- Blue icons with yellow accent bars

### Input Fields
- White background with subtle border
- Yellow accent border on focus
- Dark text (#0A0A0A) for input
- Rounded corners

### Typography
- Use Inter, Poppins, or SF Pro style fonts
- Headers: Bold, larger size
- Body: Regular weight
- All text in Dark Text (#0A0A0A) unless on colored backgrounds

## Animations
- Subtle fade-in on splash screen
- Smooth transitions between screens
- Progress indicators with fluid motion
- Button press feedback with slight scale/opacity change

## Spacing System
- Maintain consistent spacing throughout (multiples of 8px recommended)
- Card margins: 16px
- Internal padding: 16-24px
- Between elements: 12-16px

## Accessibility
- Ensure sufficient color contrast (blue and yellow on white meet WCAG standards)
- Large touch targets for buttons (minimum 44x44pt)
- Clear visual feedback for all interactions
- Readable font sizes (minimum 14-16px for body text)

## Local Data Storage
- Captured ear photos stored locally using AsyncStorage or equivalent
- User session persistence
- Cache reconstruction status