// Składanie projektów z dokumentami i etapami (bez handlerów → nie tworzy trasy).
// Zamiast zapytania per projekt (N+1) pobieramy dokumenty i etapy hurtem
// i grupujemy je tutaj po project_id, zachowując kolejność z SQL.

type Row = Record<string, unknown>;

export function attachChildren<P extends Row>(
  projects: P[] | undefined,
  documents: Row[] | undefined,
  milestones: Row[] | undefined,
): Array<P & { documents: Row[]; milestones: Row[] }> {
  const group = (rows: Row[] | undefined) => {
    const map = new Map<unknown, Row[]>();
    for (const r of rows ?? []) {
      const key = Number(r.project_id);
      const list = map.get(key);
      if (list) list.push(r);
      else map.set(key, [r]);
    }
    return map;
  };
  const docs = group(documents);
  const miles = group(milestones);
  return (projects ?? []).map((p) => ({
    ...p,
    documents: docs.get(Number(p.id)) ?? [],
    milestones: miles.get(Number(p.id)) ?? [],
  }));
}
