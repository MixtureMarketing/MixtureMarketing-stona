// MIX-1445: prawdziwa sonda, której grupa procesów != jej pid (jak sonda uruchomiona z powłoki
// albo npm). Użycie: node own-group-member.mjs leader <ścieżka-pomocnika> <cel>
//   leader - nowa grupa (test uruchamia go z detached: true); uruchamia siebie w trybie member
//            w TEJ SAMEJ grupie i po jego końcu wypisuje `LIDER-ZYJE rc=<kod>`;
//   member - woła killGroup(<cel>), gdzie cel `own` = własna grupa z ownProcessGroup();
//            wypisuje `GRUPA <g> PID <p>`, potem `ZABITA <wynik>` (kod 0) albo `ODMOWA <powód>` (kod 3).
// Gdy strażnik nie działa, SIGTERM trafia w grupę lidera: lider ginie i nie wypisze LIDER-ZYJE.
// Szkoda ograniczona do tej jednej, testowej grupy.
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [mode, helper, target] = process.argv.slice(2);
if (mode === 'leader') {
  const c = spawn(process.execPath, [fileURLToPath(import.meta.url), 'member', helper, target], {
    stdio: 'inherit',
  });
  c.on('exit', (code) => {
    console.log(`LIDER-ZYJE rc=${code}`);
    process.exit(0);
  });
} else {
  const { killGroup, ownProcessGroup } = await import(pathToFileURL(helper).href);
  const own = ownProcessGroup();
  console.log(`GRUPA ${own} PID ${process.pid}`);
  try {
    const r = await killGroup(target === 'own' ? own : Number(target), 300);
    console.log(`ZABITA ${r}`);
    process.exit(0);
  } catch (e) {
    console.log(`ODMOWA ${e.message}`);
    process.exit(3);
  }
}
