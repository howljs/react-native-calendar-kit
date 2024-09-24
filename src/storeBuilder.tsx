export interface Store<T extends Record<string, any>> {
  getState: () => T;
  setState: (newState: T) => void;
  subscribe: (listener: () => void) => () => void;
}

export const createStore = <T extends Record<string, any>>(
  initialState: T
): Store<T> => {
  let state = initialState;
  let listeners = new Set<() => void>();

  const getState = () => state;

  const setState = (newState: T) => {
    state = newState;
    for (const listener of listeners) {
      listener();
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
};
