// MIX-1736 r2: preload for the behavioural test of scripts/audit-proportions.mjs.
// `node --import <this file> scripts/audit-proportions.mjs <dist>` makes the bare import 'puppeteer'
// resolve to ./fake.mjs, so the REAL script main path (server, loop, evaluate, exit code) runs without a browser.
import { register } from 'node:module';

register('./hooks.mjs', import.meta.url);
