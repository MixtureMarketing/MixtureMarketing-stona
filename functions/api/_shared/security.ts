// Wspólne helpery bezpieczeństwa dla Pages Functions (bez handlerów → nie tworzy trasy).
// Jedno źródło dla escapowania HTML w mailach, walidacji URL i weryfikacji Turnstile,
// żeby każdy endpoint nie miał własnej, rozjeżdżającej się kopii.

/** Escapuje tekst do wstawienia w HTML maila (treść i wartości atrybutów). */
export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Jak escapeHtml, ale zachowuje podział linii jako <br>. */
export function escapeHtmlMultiline(s: unknown): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br>');
}

/**
 * Zwraca znormalizowany URL tylko dla schematów http/https (inaczej null).
 * Dopuszcza adres bez schematu (np. "firma.pl") — wtedy zakłada https.
 */
export function safeHttpUrl(raw: unknown): string | null {
  const input = String(raw ?? '').trim();
  if (!input || input.length > 2048) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(input) ? input : `https://${input}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (!u.hostname || u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** IP klienta wg Cloudflare (pusty string poza CF, np. w testach). */
export function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') || '';
}

/**
 * Weryfikacja tokenu Turnstile po stronie serwera. Brak tokenu/sekretu = odrzucenie
 * (bez pseudo-tokenów obejścia).
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  secret: string | undefined,
  ip: string,
): Promise<boolean> {
  if (!token || !secret) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** SHA-256 jako hex — do kluczy KV (np. limit per adres e-mail bez trzymania adresu). */
export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
