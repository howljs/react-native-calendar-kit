import { type FC, memo, type PropsWithChildren, useMemo } from 'react';

import { BodyItemContext } from '../../context/BodyContext';

interface BodyColumnProps {
  item: number;
  index: number;
}

const BodyItem: FC<PropsWithChildren<BodyColumnProps>> = ({ item, index, children }) => {
  const bodyColumnValue = useMemo(() => ({ item, index }), [item, index]);

  return <BodyItemContext.Provider value={bodyColumnValue}>{children}</BodyItemContext.Provider>;
};

export default memo(BodyItem);
