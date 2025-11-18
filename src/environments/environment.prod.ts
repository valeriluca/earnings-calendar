export const environment = {
  production: true,
  fmpApiUrl: 'https://financialmodelingprep.com/api/v3',
  fmpApiKey: '', // Not used in production - uses serverless proxy
  pythonApiUrl: '/api' // Will be proxied in production
};
