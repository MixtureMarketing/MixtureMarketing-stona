// MIX-1441: atrapa `vite preview` do testów scripts/lib/preview-server.mjs.
// Użycie: node preview-fixture-server.mjs <tryb> <port>
//   serve    - HTTP 200 + wnuk (sleep), jak `npx` -> node -> vite
//   stubborn - jak serve, ale ignoruje SIGTERM (wymaga SIGKILL)
//   die-now  - kończy się od razu kodem 1 (jak --strictPort przy zajętym porcie)
//   die-soon - nasłuchuje, po 300 ms kończy się
//   silent   - żyje, ale nie nasłuchuje
import http from 'node:http';
import { spawn } from 'node:child_process';

const [mode, portArg] = process.argv.slice(2);
const port = Number(portArg);
if (mode === 'die-now') process.exit(1);
if (mode === 'stubborn') process.on('SIGTERM', () => {});
if (mode === 'silent') {
  setInterval(() => {}, 1000);
} else {
  const server = http.createServer((_q, res) => res.writeHead(200).end('ok'));
  server.on('error', () => process.exit(1)); // jak vite --strictPort
  server.listen(port, '127.0.0.1');
  const ignoreTerm = mode === 'stubborn' ? "process.on('SIGTERM',()=>{});" : '';
  spawn(process.execPath, ['-e', `${ignoreTerm}setInterval(()=>{},1000)`], { stdio: 'ignore' });
  if (mode === 'die-soon') setTimeout(() => process.exit(0), 300);
}
