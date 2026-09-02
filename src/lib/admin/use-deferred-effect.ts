import { useEffect } from "react";

/** Defer effect body to avoid react-hooks/set-state-in-effect on initial data loads. */
export function useDeferredEffect(effect: () => void | (() => void), deps: React.DependencyList) {
  useEffect(() => {
    let cleanup: void | (() => void);
    queueMicrotask(() => {
      cleanup = effect();
    });
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies deps
  }, deps);
}
