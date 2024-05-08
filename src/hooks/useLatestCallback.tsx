import { useLayoutEffect, useRef } from 'react';

export default function useLatestCallback<T extends any>(callback: T): T {
  const ref = useRef<T>(callback);

  const latestCallback = useRef(function latestCallback(
    this: unknown,
    ...args: unknown[]
  ) {
    if (typeof ref.current !== 'function') {
      console.warn('Should reload app to update callback');
      return;
    }
    const refCallback = ref.current as Function;
    return refCallback.apply(this, args);
  } as unknown as T).current;

  useLayoutEffect(() => {
    ref.current = callback;
  });

  return callback ? latestCallback : callback;
}
