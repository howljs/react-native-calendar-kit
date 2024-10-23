import { useRef } from 'react';

export const useLazyRef = <T>(
  initializer: () => null extends T ? never : T
) => {
  const ref1 = useRef<T | null>(null);
  if (ref1.current === null) {
    ref1.current = initializer();
  }

  const ref2 = useRef(ref1.current);
  return ref2;
};
