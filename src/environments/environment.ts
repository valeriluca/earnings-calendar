// This file can be replaced during build by using the ileReplacements array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  fmpApiUrl: 'https://financialmodelingprep.com/api/v3',
  fmpApiKey: '', // Not used - uses serverless proxy in production
  alphaVantageApiKey: '', // Add your Alpha Vantage API key here (free at alphavantage.co)
  useAlphaVantage: false, // Set to true to use Alpha Vantage instead of FMP
  pythonApiUrl: '/api' // Serverless API endpoint (uses yahoo-finance2 backend)
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
