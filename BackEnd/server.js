  import http from 'http';
  import fs from 'fs';
  import path from 'path';
  import { fileURLToPath } from 'url';

  import {setupSocketIO} from './ws/wsHandler.js';


  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const frontendDir = path.join(__dirname, '..', 'FrontEnd');
  const indexFile = path.join(frontendDir, 'index.html');

  const PORT = 3000;
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

  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: `API response for ${req.url}` }));
      return;
    }

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

    fs.readFile(indexFile, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Failed to load index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  });

  setupSocketIO(server);

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
