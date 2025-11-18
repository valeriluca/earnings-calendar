// This file can be replaced during build by using the ileReplacements array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  fmpApiUrl: 'https://financialmodelingprep.com/api/v3',
  fmpApiKey: '6S0xwIwuOSnsdpoJEpIN7rf7CZBpJI0p',
  alphaVantageApiKey: '', // Add your Alpha Vantage API key here (free at alphavantage.co)
  useAlphaVantage: true, // Set to true to use Alpha Vantage instead of FMP
  pythonApiUrl: 'http://localhost:5000/api' // Python yfinance API
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
