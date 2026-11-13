// MIX-1441: mały „skrypt sondy" do testów ścieżek wyjścia (SIGINT, wyjątek, exit bez stop()).
// Użycie: node preview-runner.mjs <tryb-wyjścia> <port> <helper.mjs> <fixture.mjs>
import { pathToFileURL } from 'node:url';

const [exitMode, portArg, helperPath, fixturePath] = process.argv.slice(2);
const { startPreview } = await import(pathToFileURL(helperPath).href);
const s = await startPreview({
  port: Number(portArg),
  command: process.execPath,
  args: [fixturePath, 'serve', portArg],
  readyTimeoutMs: 10000,
  killTimeoutMs: 500,
});
console.log(`PGID ${s.pid}`);
if (exitMode === 'throw') setTimeout(() => Promise.reject(new Error('sonda rzuciła')), 1500);
else if (exitMode === 'exit0') setTimeout(() => process.exit(0), 1500);
else if (exitMode === 'stop') await s.stop().then(() => process.exit(0));
else setInterval(() => {}, 1000); // sigint: czeka na sygnał
