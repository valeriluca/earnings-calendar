/**
 * Simple local server to test the yahoo-earnings API
 * Run: node test-api-server.js
 */
const http = require('http');
const url = require('url');

// Import the API handler (ESM style)
async function startServer() {
  // Dynamic import for ESM module
  const { default: handler } = await import('./api/yahoo-earnings.js');
  
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Only handle /api/yahoo-earnings
    if (parsedUrl.pathname === '/api/yahoo-earnings') {
      // Mock Vercel-style request/response objects
      const mockReq = {
        method: req.method,
        query: parsedUrl.query,
        url: req.url
      };
      
      const mockRes = {
        statusCode: 200,
        headers: {},
        setHeader: function(key, value) {
          this.headers[key] = value;
          res.setHeader(key, value);
        },
        status: function(code) {
          this.statusCode = code;
          res.statusCode = code;
          return this;
        },
        json: function(data) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data, null, 2));
        },
        end: function() {
          res.end();
        }
      };
      
      await handler(mockReq, mockRes);
    } else {
      res.statusCode = 404;
      res.end('Not Found');
    }
  });
  
  const PORT = 3000;
  server.listen(PORT, () => {
    console.log(`\n✓ Test API server running at http://localhost:${PORT}`);
    console.log(`\nTest with: http://localhost:${PORT}/api/yahoo-earnings?symbols=AAPL,MSFT&from=2025-11-18&to=2025-12-18\n`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
