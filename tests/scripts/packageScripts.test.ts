import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

const root = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>;
};

describe('package.json — skrypty utrzymaniowe', () => {
  it('żaden skrypt nie uruchamia paczki przez npx w wersji @latest (łańcuch dostaw)', () => {
    for (const [name, cmd] of Object.entries(pkg.scripts)) {
      expect(cmd, name).not.toMatch(/npx\b[^&|;]*@latest\b/);
    }
  });

  it('mcp:sanity ma przypiętą, dokładną wersję @sanity/mcp-server', () => {
    expect(pkg.scripts['mcp:sanity']).toMatch(/@sanity\/mcp-server@\d+\.\d+\.\d+(\s|$)/);
  });

  it('test:e2e mockuje aktualny endpoint /api/contact-submit (nie legacy contact_submit.php)', () => {
    const file = pkg.scripts['test:e2e'].match(/node\s+(\S+)/)?.[1];
    expect(file).toBeTruthy();
    const src = fs.readFileSync(path.join(root, file!), 'utf8');
    expect(src).toContain("'/api/contact-submit'");
    expect(src).not.toMatch(/contact_submit\.php/);
    // Funkcja nie istnieje w vite → każda akcja huba leadów musi być obsłużona mockiem.
    for (const action of ['create', 'update', 'send_notification', 'get_lead']) {
      expect(src, action).toMatch(new RegExp(`\\b${action}:`));
    }
  });
});
