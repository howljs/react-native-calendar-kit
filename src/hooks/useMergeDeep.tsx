import isEqual from 'lodash/isEqual';
import { useEffect, useRef, useState } from 'react';
import { mergeDeep } from '../utils/utils';

const useMergeDeep = <T extends Record<string, any>>(
  defaultData: T,
  next?: Partial<T>
) => {
  const previousState = useRef<Partial<T> | undefined>();
  const [data, updateData] = useState<T>(defaultData);

  useEffect(() => {
    if (!next || isEqual(previousState.current, next)) {
      return;
    }
    const newData = mergeDeep(defaultData, next, true);
    updateData(newData);
    previousState.current = next;
  }, [defaultData, next]);

  return data;
};

export default useMergeDeep;
