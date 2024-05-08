import is from 'lodash/isEqual';
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

type InstRef<T> = {
  hasValue: boolean;
  value: T | null;
};

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean
): Selection {
  const instRef = useRef<InstRef<Selection> | null>(null);

  let inst: InstRef<Selection>;
  if (instRef.current === null) {
    inst = {
      hasValue: false,
      value: null,
    };
    instRef.current = inst;
  } else {
    inst = instRef.current;
  }

  const getSelection = useMemo(() => {
    let hasMemo = false;
    let memoizedSnapshot: Snapshot;
    let memoizedSelection: Selection;

    const memoizedSelector = (nextSnapshot: Snapshot): Selection => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        const nextSelection = selector(nextSnapshot);

        if (isEqual !== undefined && inst.hasValue) {
          const currentSelection = inst.value!;
          if (isEqual(currentSelection, nextSelection)) {
            memoizedSelection = currentSelection;
            return currentSelection;
          }
        }

        memoizedSelection = nextSelection;
        return nextSelection;
      }

      const prevSnapshot = memoizedSnapshot;
      const prevSelection = memoizedSelection;

      if (is(prevSnapshot, nextSnapshot)) {
        return prevSelection;
      }

      const nextSelection = selector(nextSnapshot);

      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
        return prevSelection;
      }

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return nextSelection;
    };

    const getSnapshotWithSelector = () => memoizedSelector(getSnapshot());
    return getSnapshotWithSelector;
  }, [selector, isEqual, inst.hasValue, inst.value, getSnapshot]);

  const value = useSyncExternalStore(subscribe, getSelection);

  useEffect(() => {
    if (instRef.current) {
      instRef.current.hasValue = true;
      instRef.current.value = value;
    }
  }, [value]);

  return value;
}
