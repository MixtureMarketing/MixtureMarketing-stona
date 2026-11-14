# Dekoduje linie BIEG:PNG <nazwa> <base64> z logu biegu do katalogu. python3 -B -I dekoduj.py <log> <katalog>
import base64, sys, pathlib
log, out = sys.argv[1], pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
n = 0
for line in open(log, errors='replace'):
    if line.startswith('BIEG:PNG '):
        _, name, b64 = line.rstrip('\n').split(' ', 2)
        (out / name).write_bytes(base64.b64decode(b64))
        n += 1
print('zapisano', n)
