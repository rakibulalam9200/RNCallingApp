import { useSyncExternalStore } from 'react';

/**
 * Lightweight Zero-Dependency Zustand-Compatible Store
 * Uses React 19's native `useSyncExternalStore`
 * Guarantees immediate zero-crash execution in Emulator/Devices even before npm install
 */
export function createStore<T>(
  initializer: (
    set: (updater: Partial<T> | ((prev: T) => Partial<T>)) => void,
    get: () => T
  ) => T
) {
  let state: T;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (updater: Partial<T> | ((prev: T) => Partial<T>)) => {
    const nextState =
      typeof updater === 'function' ? (updater as any)(state) : updater;
    state = Object.assign({}, state, nextState);
    listeners.forEach((listener) => listener());
  };

  state = initializer(setState, getState);

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const useStore = <U = T>(selector: (state: T) => U = (s: T) => s as any) => {
    return useSyncExternalStore(
      subscribe,
      () => selector(state),
      () => selector(state)
    );
  };

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;

  return useStore;
}

