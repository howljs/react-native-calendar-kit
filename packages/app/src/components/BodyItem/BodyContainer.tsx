import { type FC, memo, type PropsWithChildren, useMemo } from 'react';

import { BodyContainerContext } from './BodyItemContext';

interface BodyContainerProps {
  item: number;
  index: number;
}

const BodyContainer: FC<PropsWithChildren<BodyContainerProps>> = ({ item, index, children }) => {
  const bodyItemValue = useMemo(() => ({ item, index }), [item, index]);

  return (
    <BodyContainerContext.Provider value={bodyItemValue}>{children}</BodyContainerContext.Provider>
  );
};

export default memo(BodyContainer);
