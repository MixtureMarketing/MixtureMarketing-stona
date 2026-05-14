/**
 * IndexNow API ping — szybka indeksacja Bing / Yandex / Naver.
 *
 * Wywoluj recznie (`node scripts/indexnow-ping.js`) lub w CI po deployu.
 * Bezpieczne do pominiecia w buildzie — to add-on, nie krytyczna sciezka.
 *
 * Dokumentacja: https://www.indexnow.org/documentation
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY = 'aa29ae7090739ce39b53f5f06e8348ce';
const HOST = 'mixturemarketing.pl';
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

async function ping() {
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.warn('Sitemap not found, skipping IndexNow ping');
    return;
  }

  const xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  if (urls.length === 0) {
    console.warn('No URLs in sitemap');
    return;
  }

  console.log(`IndexNow: pinging ${urls.length} URLs to api.indexnow.org`);

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    if (res.ok || res.status === 202) {
      console.log(`IndexNow: OK (${res.status})`);
    } else {
      const text = await res.text();
      console.warn(`IndexNow: HTTP ${res.status} - ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.warn('IndexNow ping failed:', err.message);
  }
}

ping();
