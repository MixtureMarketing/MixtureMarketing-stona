import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Etykieta ostatniego okruszka dla stron z CMS (/portfolio/:slug, /branza/:slug).
 * Globalne <Breadcrumbs/> stoją w App NAD trasą i znają tylko URL — bez tego pokazywały
 * slug ze spacjami („usugi b2b”, „driftmark marine e commerce z …”), także w prerenderze.
 * Wpis jest przypięty do ścieżki: po nawigacji stara etykieta nie trafi na nową stronę.
 */
type Entry = { path: string; label: string } | null;

const BreadcrumbLabelContext = createContext<{ entry: Entry; setEntry: (e: Entry) => void }>({
  entry: null,
  setEntry: () => {},
});

export const BreadcrumbLabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entry, setEntry] = useState<Entry>(null);
  const value = useMemo(() => ({ entry, setEntry }), [entry]);
  return (
    <BreadcrumbLabelContext.Provider value={value}>{children}</BreadcrumbLabelContext.Provider>
  );
};

/** Strona zgłasza nazwę bieżącego okruszka (np. tytuł projektu z CMS). */
export const useBreadcrumbLabel = (label: string | undefined) => {
  const { setEntry } = useContext(BreadcrumbLabelContext);
  const { pathname } = useLocation();
  useEffect(() => {
    if (!label) return;
    setEntry({ path: pathname, label });
    return () => setEntry(null);
  }, [label, pathname, setEntry]);
};

/** Etykieta zgłoszona dla BIEŻĄCEJ ścieżki (albo undefined). */
export const useCurrentBreadcrumbLabel = (): string | undefined => {
  const { entry } = useContext(BreadcrumbLabelContext);
  const { pathname } = useLocation();
  return entry && entry.path === pathname ? entry.label : undefined;
};
