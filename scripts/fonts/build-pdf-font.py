"""Generator fontu PDF (jednorazowy, uruchamiany ręcznie — NIE w buildzie).

jsPDF potrzebuje TTF, a repo ma tylko woff2 per-skrypt (fontsource). Skrypt:
  1. dekompresuje woff2 (latin + latin-ext) → ttf,
  2. scala oba subsety w jeden font,
  3. tnie do znaków realnie używanych w dokumentach PL (Latin + Latin Ext-A + interpunkcja),
  4. zapisuje base64 jako moduł TS.

Uruchomienie: python scripts/fonts/build-pdf-font.py
Wymaga: fonttools + brotli (dev-only, poza package.json).
"""
import base64, io, sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.merge import Merger
from fontTools.subset import Subsetter, Options

SRC = Path('node_modules/@fontsource/manrope/files')
OUT = Path('components/portal/admin/estimation/pdf')

# Znaki: ASCII drukowalne + polskie diakrytyki + typografia (– — „ " ' × €)
CHARS = ''.join(chr(c) for c in range(0x20, 0x7F))
CHARS += 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ'
CHARS += '–—„”"\'×€§°'

def woff2_to_ttf(p: Path) -> TTFont:
    f = TTFont(str(p))          # fontTools czyta woff2 wprost (brotli)
    f.flavor = None             # zdejmij kompresję → zwykły TTF
    return f

def build(weight: str, out_name: str, var_name: str):
    tmp = []
    for sub in ('latin', 'latin-ext'):
        src = SRC / f'manrope-{sub}-{weight}-normal.woff2'
        if not src.exists():
            sys.exit(f'BRAK: {src}')
        f = woff2_to_ttf(src)
        t = Path(f'.tmp-{sub}-{weight}.ttf')
        f.save(str(t)); tmp.append(t)

    merged_path = Path(f'.tmp-merged-{weight}.ttf')
    Merger().merge([str(t) for t in tmp]).save(str(merged_path))

    font = TTFont(str(merged_path))
    opts = Options()
    opts.layout_features = ['*']
    opts.drop_tables += ['DSIG']
    s = Subsetter(opts); s.populate(text=CHARS); s.subset(font)

    buf = io.BytesIO(); font.save(buf)
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')

    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / out_name).write_text(
        '// WYGENEROWANE — nie edytuj ręcznie. Źródło: scripts/fonts/build-pdf-font.py\n'
        f'// Manrope {weight} (Latin + Latin Ext), subset do znaków PL. jsPDF wymaga TTF w base64.\n'
        f'export const {var_name} = \'{b64}\';\n',
        encoding='utf-8', newline='\n')
    print(f'  {out_name}: {len(b64)/1024:.1f} kB base64 ({len(buf.getvalue())/1024:.1f} kB ttf)')
    for t in tmp + [merged_path]:
        t.unlink(missing_ok=True)

build('400', 'manropeRegular.ts', 'MANROPE_REGULAR_B64')
build('700', 'manropeBold.ts', 'MANROPE_BOLD_B64')
print('OK')
