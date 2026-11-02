/// <reference types="vitest" />
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function chessLibraryJsonPlugin(): Plugin {
  const jsonFilePath = path.resolve(__dirname, 'src/adapters/storage/chess-library.json');

  return {
    name: 'chess-library-json-endpoint',
    configureServer(server) {
      server.watcher.unwatch(jsonFilePath);
      server.middlewares.use('/api/chess-library', (req, res) => {
        if (req.method === 'GET') {
          const content = fs.readFileSync(jsonFilePath, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.end(content);
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(jsonFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ ok: false }));
            }
          });
          return;
        }

        res.statusCode = 405;
        res.end();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), chessLibraryJsonPlugin()],
  test: {
    globals: true,
    pool: 'forks',
    environmentMatchGlobs: [
      ['tests/adapters/**', 'jsdom'],
    ],
  },
});
