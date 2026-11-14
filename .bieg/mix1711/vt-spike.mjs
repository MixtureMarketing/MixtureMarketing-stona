// MIX-1711 r2 spike: can a paused view-transition pseudo be read with getComputedStyle at a set currentTime?
import puppeteer from 'puppeteer';
const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const p = await b.newPage();
await p.setViewport({ width: 800, height: 600 });
await p.setContent(`<style>#a{position:absolute;left:10px;top:10px;width:100px;height:50px;background:red;view-transition-name:x}
.m #a{left:410px;top:310px;width:300px;height:200px}::view-transition-group(x){animation-duration:.3s;animation-timing-function:linear}</style><div id=a></div>`);
const r = await p.evaluate(async () => {
  const t = document.startViewTransition(() => document.documentElement.classList.add('m'));
  await t.ready;
  const an = document.getAnimations().filter((a) => String(a.effect?.pseudoElement || '').startsWith('::view-transition'));
  an.forEach((a) => a.pause());
  const out = [];
  for (const k of [0, 5, 10]) {
    an.forEach((a) => (a.currentTime = (k * 300) / 10));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const g = getComputedStyle(document.documentElement, '::view-transition-group(x)');
    const o = getComputedStyle(document.documentElement, '::view-transition-old(x)');
    const n = getComputedStyle(document.documentElement, '::view-transition-new(x)');
    out.push([k, g.transform, g.width, g.height, o.opacity, n.opacity, o.width, n.height, g.animationTimingFunction].join(' '));
  }
  out.push(an.map((a) => a.effect.pseudoElement + '=' + a.effect.getComputedTiming().duration).join(','));
  an.forEach((a) => a.finish());
  return out;
});
const shot = await p.screenshot({ type: 'png' });
console.log(r.join('\n'), '\nshot bytes', shot.length);
await b.close();
