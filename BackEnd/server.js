const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const setupWebSocket = require('./ws/wsHandler');


const PORT = 3000;
const frontendDir = path.join(__dirname, '..', 'FrontEnd');
const indexFile = path.join(__dirname, '..', 'FrontEnd', 'index.html');

const contentTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

// Create the HTTP server
const server = http.createServer((req, res) => {


  // BackEnd API handling
  if (req.url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: `API response for ${req.url}` }));
    return;
  }


  // Serve static files from the FrontEnd directory
  const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  const staticFilePath = path.join(frontendDir, safePath);

  if (req.url !== '/' && fs.existsSync(staticFilePath) && fs.statSync(staticFilePath).isFile()) {
    const ext = path.extname(staticFilePath).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    fs.readFile(staticFilePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Server error');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }


  // Serve index.html for root or any non-file request (SPA fallback)
  fs.readFile(indexFile, (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end('Failed to load index.html');
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

setupWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
