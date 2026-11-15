// Resolve hook: only the bare specifier 'puppeteer' is redirected, everything else resolves as usual.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'puppeteer') {
    return { url: new URL('./fake.mjs', import.meta.url).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
