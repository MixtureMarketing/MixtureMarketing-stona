// MIX-1441: atrapa `vite preview` do testów scripts/lib/preview-server.mjs.
// Użycie: node preview-fixture-server.mjs <tryb> <port> [katalog-znaczników]
//   serve    - HTTP 200 + wnuk (sleep), jak `npx` -> node -> vite
//   stubborn - jak serve, ale ignoruje SIGTERM (wymaga SIGKILL)
//   die-now  - kończy się od razu kodem 1 (jak --strictPort przy zajętym porcie)
//   die-soon - nasłuchuje, po 300 ms kończy się
//   silent   - żyje, ale nie nasłuchuje
//   http500  - MIX-1443: nasłuchuje, ale zawsze HTTP 500 (serwer zepsuty, nie „gotowy”)
//   http404  - MIX-1443: nasłuchuje, HTTP 404 (bliźniak: 4xx to żywy serwer)
//   graceful - MIX-1443: jak serve, ale rodzic i wnuk na SIGTERM zapisują znacznik
//              <katalog>/<rola>.term i kończą się (dowód, że SIGTERM doszedł do CAŁEJ grupy)
import http from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const [mode, portArg, markerDir] = process.argv.slice(2);
const port = Number(portArg);
const STATUS = { http500: 500, http404: 404 };
if (mode === 'die-now') process.exit(1);
if (mode === 'stubborn') process.on('SIGTERM', () => {});
const termMarker = (role) =>
  `process.on('SIGTERM',()=>{require('node:fs').writeFileSync(${JSON.stringify(`${markerDir}/${role}.term`)},'1');process.exit(0)});`;
if (mode === 'graceful')
  process.on('SIGTERM', () => {
    fs.writeFileSync(`${markerDir}/parent.term`, '1');
    process.exit(0);
  });
if (mode === 'silent') {
  setInterval(() => {}, 1000);
} else {
  const status = STATUS[mode] ?? 200;
  const server = http.createServer((_q, res) => res.writeHead(status).end('ok'));
  server.on('error', () => process.exit(1)); // jak vite --strictPort
  server.listen(port, '127.0.0.1');
  let grandchild = 'setInterval(()=>{},1000)';
  if (mode === 'stubborn') grandchild = "process.on('SIGTERM',()=>{});" + grandchild;
  if (mode === 'graceful') grandchild = termMarker('child') + grandchild;
  spawn(process.execPath, ['-e', grandchild], { stdio: 'ignore' });
  if (mode === 'die-soon') setTimeout(() => process.exit(0), 300);
}
