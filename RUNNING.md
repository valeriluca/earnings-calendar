# Running the Earnings Calendar App Locally

## Prerequisites
- Node.js installed
- npm installed

## Development Setup

The app now uses `yahoo-finance2` to fetch earnings data through a local API server.

### Step 1: Install dependencies
```powershell
npm install
```

### Step 2: Start the API server (Terminal 1)
```powershell
npm run api
```

This starts a local Express server on port 3001 that fetches data from Yahoo Finance using the `yahoo-finance2` package.

### Step 3: Start the Angular/Ionic app (Terminal 2)
```powershell
ionic serve
```
or
```powershell
ng serve
```

The Angular dev server will proxy `/api/*` requests to the local API server on port 3001, eliminating CORS issues.

### Testing the API directly

You can test the API endpoint directly:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/yahoo-earnings?symbols=AAPL,MSFT&from=2025-11-01&to=2025-12-31" | Select-Object -ExpandProperty Content
```

## Production Deployment

For production (Vercel):
- The `/api/yahoo-earnings.js` file is deployed as a serverless function
- The Angular app builds to `/www` and is served as static files
- The `vercel.json` config routes `/api/*` requests to the serverless functions
- No need to run the dev-server.mjs in production

## How It Works

1. **Frontend (Angular/Ionic)**: Makes requests to `/api/yahoo-earnings`
2. **Dev Proxy**: Angular's proxy forwards requests to `http://localhost:3001` during development
3. **API Server**: Express server (dev-server.mjs) or Vercel serverless function (api/yahoo-earnings.js) uses `yahoo-finance2` to fetch data
4. **Yahoo Finance**: The API server fetches data from Yahoo Finance (no CORS issues since it's server-side)

This architecture eliminates CORS issues while keeping the app "frontend-focused" with minimal backend code.
