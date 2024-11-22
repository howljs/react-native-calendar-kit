import { type FC, memo, type PropsWithChildren, useMemo } from 'react';

import { BodyColumnContext } from './BodyItemContext';

interface BodyColumnProps {
  item: number;
  index: number;
}

const BodyColumn: FC<PropsWithChildren<BodyColumnProps>> = ({ item, index, children }) => {
  const bodyColumnValue = useMemo(() => ({ item, index }), [item, index]);

  return (
    <BodyColumnContext.Provider value={bodyColumnValue}>{children}</BodyColumnContext.Provider>
  );
};

export default memo(BodyColumn);
