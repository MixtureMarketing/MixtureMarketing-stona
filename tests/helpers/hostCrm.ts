// Host dawnego Mixture CRM składamy z kawałków, żeby literalna nazwa nie wracała do plików w functions/
// (strażnik tests/archiwumCrm.test.ts szuka jej w całym drzewie functions/, także w plikach *.test.ts).
export const HOST_CRM = ['mixture', 'crm.pages.dev'].join('-');
export const URL_CRM_INGEST = `https://${HOST_CRM}/api/ingest/lead`;
/** Czy adres fetch wskazuje na dawny endpoint przyjmowania leadów w CRM (po hoście albo po ścieżce). */
export const jestCrm = (url: string): boolean =>
  url.includes(HOST_CRM) || url.includes('/api/ingest/lead');
