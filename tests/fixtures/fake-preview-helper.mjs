// MIX-1445: atrapa scripts/lib/preview-server.mjs dla testu ścieżki „stop() serwera zawodzi”
// w skryptach audytów (mutant X6). Adres serwera z ATRAPA_URL; ATRAPA_STOP_FAIL=1 = stop()
// odrzuca obietnicę z tym samym zdaniem co prawdziwy pomocnik, gdy grupa nie znika.
export async function startPreviewOrExit() {
  return {
    url: process.env.ATRAPA_URL,
    async stop() {
      if (process.env.ATRAPA_STOP_FAIL === '1')
        throw new Error('grupa serwera 4242 nie zniknęła po SIGKILL');
    },
  };
}
