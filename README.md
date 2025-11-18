# Earnings Calendar App

Mobile-first earnings calendar PWA built with Ionic, Angular, and Capacitor.

## Features

- 📅 Calendar view of upcoming earnings
- 📋 Chronological list view
- ⭐ Customizable stock watchlist
- 🔔 Daily local notifications
- 📱 PWA with offline support
- 🚀 Optional native builds (iOS/Android)

## Development

### Prerequisites

- Node.js 18+ and npm
- Ionic CLI: `npm install -g @ionic/cli`

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Add your FMP API key to `src/environments/environment.ts`:
   ```typescript
   fmpApiKey: '6S0xwIwuOSnsdpoJEpIN7rf7CZBpJI0p'
   ```

### Run Development Server

```bash
ionic serve
```

App runs at `http://localhost:8100`

### Build for Production

```bash
ionic build --prod
```

Output in `www/` directory.

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Set environment variable:
   ```bash
   vercel env add FMP_API_KEY
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Netlify

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy `www/` folder

3. Add environment variable `FMP_API_KEY` in Netlify dashboard

## Native Builds

### Android

```bash
ionic cap add android
ionic cap sync android
ionic cap open android
```

Build APK in Android Studio.

### iOS

```bash
ionic cap add ios
ionic cap sync ios
ionic cap open ios
```

Build in Xcode (requires macOS and Apple Developer account).

## Configuration

### API Proxy

The app uses a serverless function (`/api/earnings`) to proxy FMP API requests and secure the API key. The function is automatically deployed with Vercel/Netlify.

### Notifications

Notifications work on native builds (Android/iOS). PWA notifications have limited support on mobile browsers.

### Storage

User preferences and watchlist are stored locally using Capacitor Preferences API.

## Tech Stack

- **Framework**: Angular 18+
- **Mobile**: Ionic 8+
- **Native**: Capacitor
- **Calendar**: FullCalendar
- **API**: Financial Modeling Prep
- **Deployment**: Vercel/Netlify

## License

MIT
