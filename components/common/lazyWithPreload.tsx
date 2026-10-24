import React, { lazy, useState, type ComponentType } from 'react';

type Module<P> = { default: ComponentType<P> };

export type PreloadableComponent<P> = React.FC<P> & {
  /** Ładuje chunk (idempotentnie); zwraca moduł, żeby wołający mógł użyć jego eksportów. */
  preload: () => Promise<unknown>;
};

/**
 * `React.lazy()` z jawnym `preload()`. Gdy chunk jest już załadowany w chwili
 * montowania, komponent renderuje się SYNCHRONICZNIE — bez rzucania obietnicy,
 * więc najbliższy `<Suspense>` nie pokazuje fallbacku (spinnera). To warunek
 * niewidocznej podmiany prerenderowanego HTML przy starcie (`index.tsx` woła
 * `preloadRoute()` przed `root.render()`). Bez preloadu działa jak zwykłe `lazy()`.
 */
export function lazyWithPreload<P extends object>(
  factory: () => Promise<Module<P>>,
): PreloadableComponent<P> {
  let loaded: ComponentType<P> | undefined;
  let pending: Promise<Module<P>> | undefined;

  const load = () => {
    pending ??= factory().then(
      (m) => {
        loaded = m.default;
        return m;
      },
      (err: unknown) => {
        pending = undefined; // pozwól spróbować ponownie (np. reload chunka)
        throw err;
      },
    );
    return pending;
  };

  const Lazy = lazy(load);

  function Preloadable(props: P) {
    // Typ ustalany RAZ na montowanie — bez remountu poddrzewa, gdy chunk dojedzie
    // w trakcie życia komponentu (wtedy dalej renderuje się przez Lazy).
    const [Comp] = useState<ComponentType<P>>(() => loaded ?? Lazy);
    return <Comp {...props} />;
  }

  return Object.assign(Preloadable, { preload: load });
}
