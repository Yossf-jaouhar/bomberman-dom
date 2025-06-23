import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { WebSocketServer } from 'ws'

const PORT = 3000;

const server = http.createServer((req, res) => {
  let parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  if (pathname === './') pathname = './index.html';

  fs.stat(pathname, function (err, stats) {
    if (!err && stats.isFile()) {
      const ext = path.parse(pathname).ext;
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
      };
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mimeType });
      fs.createReadStream(pathname).pipe(res);
    } else {
      fs.readFile('./index.html', function (err, data) {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    }
  });
});

// ---------------- WebSocket Part ---------------- //

const wss = new WebSocketServer({ server })

let clients = [];

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.push(ws);

  ws.on('message', (data) => {
    console.log('Received:', data.toString());

    // Broadcast to all clients
    for (let client of clients) {
      if (client.readyState === ws.OPEN) {
        client.send(data.toString());
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(c => c !== ws);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
