# Earnings Calendar App - Deployment Guide

## Quick Start

The Earnings Calendar app is now ready for deployment! Follow these steps to get it running.

### Local Development

1. **Add your FMP API Key**:
   - Edit `src/environments/environment.ts`
   - Replace `YOUR_FMP_API_KEY_HERE` with your actual Financial Modeling Prep API key
   - Get a free key at: https://financialmodelingprep.com/developer/docs

2. **Run the development server**:
   ```bash
   ionic serve
   ```
   App will open at `http://localhost:8100`

3. **Test the app**:
   - Navigate through Calendar, List, and Settings tabs
   - Add/remove stocks from watchlist in Settings
   - Refresh data to see earnings events

---

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

#### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- FMP API key

#### Steps

1. **Prepare for deployment**:
   ```bash
   # Commit all changes
   git add .
   git commit -m "Ready for deployment"
   ```

2. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/earnings-calendar.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure build settings:
     - **Build Command**: `npm run build`
     - **Output Directory**: `www`
     - **Install Command**: `npm install`

4. **Add environment variable**:
   - In Vercel project settings → Environment Variables
   - Add: `FMP_API_KEY` = `your_actual_api_key`
   - Click "Save"

5. **Redeploy**:
   - Click "Redeploy" to apply the environment variable

Your app will be live at: `https://your-project-name.vercel.app`

#### Vercel CLI Method

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Add environment variable
vercel env add FMP_API_KEY

# Deploy
vercel --prod
```

---

### Option 2: Deploy to Netlify

#### Steps

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login
   netlify login

   # Deploy
   netlify deploy --prod --dir=www
   ```

3. **Set environment variable**:
   - Go to Netlify dashboard → Site settings → Environment variables
   - Add: `FMP_API_KEY` = `your_actual_api_key`

4. **Create `netlify.toml` in project root**:
   ```toml
   [build]
     command = "npm run build"
     publish = "www"
     functions = "api"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

---

### Option 3: Native Mobile Builds

#### Android

1. **Add Android platform**:
   ```bash
   ionic cap add android
   ionic cap sync android
   ```

2. **Update AndroidManifest.xml**:
   Add notification permissions in `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
   ```

3. **Open in Android Studio**:
   ```bash
   ionic cap open android
   ```

4. **Build APK**:
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

5. **Install on device**:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

#### iOS

1. **Add iOS platform** (requires macOS):
   ```bash
   ionic cap add ios
   ionic cap sync ios
   ```

2. **Open in Xcode**:
   ```bash
   ionic cap open ios
   ```

3. **Configure signing**:
   - Select project → Signing & Capabilities
   - Add Apple Developer account
   - Enable Push Notifications capability

4. **Build & run**:
   - Select target device
   - Click Run button

5. **TestFlight distribution**:
   - Archive the build: Product → Archive
   - Upload to App Store Connect
   - Add to TestFlight
   - Share link with testers

---

## Environment Variables

The app requires one environment variable:

| Variable | Description | Required |
|----------|-------------|----------|
| `FMP_API_KEY` | Financial Modeling Prep API key | Yes (production) |

For development, you can also add the key directly in `src/environments/environment.ts`, but this is **NOT recommended for production**.

---

## Testing Checklist

Before deploying, test these features:

- [ ] Calendar view displays correctly
- [ ] List view shows earnings chronologically
- [ ] Filtering works (All, Today, This Week)
- [ ] Can add stocks to watchlist
- [ ] Can remove stocks from watchlist
- [ ] Reset watchlist to defaults works
- [ ] Notification settings toggle works (native only)
- [ ] PWA installs correctly on mobile
- [ ] Offline mode works (calendar caches)
- [ ] Pull-to-refresh works on all pages

---

## Post-Deployment

### Update API Proxy

The serverless function at `/api/earnings.js` proxies requests to FMP API. To add rate limiting or caching:

```javascript
// Example: Add simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  const cacheKey = `${req.query.from}-${req.query.to}`;
  
  // Check cache
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return res.status(200).json(data);
    }
  }
  
  // Fetch from API...
  const data = await fetch(fmpUrl).then(r => r.json());
  
  // Store in cache
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  res.status(200).json(data);
}
```

### Monitor Usage

- Check Vercel/Netlify dashboard for:
  - Number of requests to `/api/earnings`
  - Bandwidth usage
  - Function execution time

### Custom Domain

Add a custom domain in your hosting platform settings:
- Vercel: Settings → Domains
- Netlify: Site settings → Domain management

---

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Requests Fail

- Check environment variable is set correctly
- Verify FMP API key is valid
- Check browser console for CORS errors

### Notifications Don't Work

- Web browsers have limited notification support
- For full notification support, build native app
- iOS requires user permission prompt

### Calendar Not Loading

- Check browser console for errors
- Verify FullCalendar is installed: `npm list @fullcalendar/angular`
- Clear browser cache

---

## Next Steps

1. **Customize branding**:
   - Replace PWA icons in `public/icons/`
   - Update app name in `public/manifest.webmanifest`
   - Modify theme colors in `src/theme/variables.scss`

2. **Add features**:
   - Historical earnings data
   - Earnings surprises tracking
   - Push notifications via FCM
   - User accounts with backend sync

3. **Optimize**:
   - Add service worker caching strategies
   - Implement lazy loading for large watchlists
   - Add analytics (Google Analytics, Plausible)

---

## Support

For issues or questions:
- Check the README.md
- Review Angular/Ionic documentation
- Check FMP API docs: https://financialmodelingprep.com/developer/docs

Happy deploying! 🚀
