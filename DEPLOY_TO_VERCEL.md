# 🚀 Deploy Your Earnings Calendar PWA to Vercel

Your app is ready to deploy! Follow these simple steps to get it online and share with friends.

## ✅ What's Already Done

- ✅ Production build successfully tested
- ✅ API key removed from code (secure serverless proxy ready)
- ✅ Vercel configuration (`vercel.json`) already set up
- ✅ PWA manifest and service worker configured

## 📋 Quick Deployment Steps

### Option 1: Deploy via GitHub + Vercel (Recommended)

#### 1. Push to GitHub
```powershell
# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/earnings-calendar.git
git branch -M main
git push -u origin main
```

#### 2. Deploy on Vercel
1. Go to **https://vercel.com** and sign up/login (use your GitHub account)
2. Click **"Add New Project"** or **"Import Project"**
3. Select your `earnings-calendar` repository
4. Vercel will auto-detect the settings (no changes needed!)
5. Click **"Deploy"**

#### 3. Add Your API Key (Important!)
After first deployment:
1. Go to your project dashboard on Vercel
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `FMP_API_KEY`
   - **Value:** `6S0xwIwuOSnsdpoJEpIN7rf7CZBpJI0p` (your actual FMP key)
   - **Environment:** Select all (Production, Preview, Development)
4. Click **"Save"**
5. Go to **Deployments** tab and click **"Redeploy"** on the latest deployment

#### 4. Share Your App! 🎉
Your app will be live at: `https://earnings-calendar-XXXX.vercel.app`

Copy this URL and send it to your friends! They can:
- Open it in any browser
- Install it as a PWA on mobile (Add to Home Screen)
- Use it just like a native app

---

### Option 2: Deploy via Vercel CLI (Alternative)

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Add your API key as environment variable
vercel env add FMP_API_KEY production

# When prompted, paste: 6S0xwIwuOSnsdpoJEpIN7rf7CZBpJI0p

# Deploy to production
vercel --prod
```

Your app URL will be shown in the terminal output.

---

## 🎯 Post-Deployment

### Test Your Live App
1. Open the URL on your phone
2. Tap the share/menu button
3. Select **"Add to Home Screen"** or **"Install App"**
4. The PWA will install like a native app!

### Share with Friends
Send them the URL via:
- Text message
- Email
- Social media
- QR code (generate at https://www.qr-code-generator.com/)

### Monitor Usage
- Check **Vercel Dashboard** → **Analytics** to see how many people are using your app
- View **Logs** to debug any issues

---

## 🔧 Making Updates

After deployment, whenever you make changes:

```powershell
# Make your code changes, then:
git add .
git commit -m "Describe your changes"
git push

# Vercel will automatically deploy the update!
```

---

## 💡 Tips

### Custom Domain (Optional)
Want a nicer URL like `earnings.yourdomain.com`?
1. Go to Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow the DNS setup instructions

### Improve Performance
The app already includes:
- ✅ Service worker for offline access
- ✅ PWA installability
- ✅ Responsive design
- ✅ Code splitting & lazy loading

### Notifications
- Web browsers have limited notification support
- For full notification features, consider building native apps using Capacitor (see original DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check the build logs in Vercel dashboard
- Ensure `package.json` dependencies are correct
- Try running `npm run build` locally first

### API Not Working
- Verify `FMP_API_KEY` environment variable is set correctly
- Check Vercel Functions logs in dashboard
- Test the API endpoint: `https://your-app.vercel.app/api/yahoo-earnings?symbols=AAPL,GOOGL&from=2025-11-01&to=2025-12-31`

### App Won't Install as PWA
- Open on HTTPS (Vercel provides this automatically)
- Check browser console for service worker errors
- Ensure manifest.webmanifest is accessible

---

## 📱 What Your Friends Will See

When they visit your URL:
1. **Mobile:** Full-screen app experience with bottom navigation
2. **Desktop:** Responsive layout that adapts to screen size
3. **Install Option:** Browser will prompt to "Install App" or "Add to Home Screen"
4. **Offline:** App works offline with cached data
5. **Fast:** Loads instantly thanks to service worker

---

## 🎉 You're Done!

Your earnings calendar is now live and shareable. Your friends can access it from anywhere, on any device!

**Next Steps:**
- Share the URL
- Get feedback from friends
- Make improvements based on usage
- Add more features!

Need help? Check the original DEPLOYMENT.md for more advanced options.
