// MIX-1934: ładuje vite.config.ts tak jak `vite build` (command=build, mode=production) w osobnym
// procesie Node. Katalog bieżący = katalog z plikami środowiska (loadEnv czyta process.cwd()).
// rc 0 + "OK" = konfiguracja przeszła strażnika; rc 1 + linia błędu = build przerwany.
import { loadConfigFromFile } from 'vite';

const [configFile] = process.argv.slice(2);
try {
  await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    configFile,
    process.cwd(),
    'silent',
  );
  console.log('OK');
} catch (e) {
  console.error(String(e instanceof Error ? e.message : e));
  process.exit(1);
}
