import { type FC, memo, type PropsWithChildren, useMemo } from 'react';

import { BodyItemContainerContext } from '../../context/BodyContext';

interface BodyContainerProps {
  item: number;
  index: number;
}

const BodyItemContainer: FC<PropsWithChildren<BodyContainerProps>> = ({
  item,
  index,
  children,
}) => {
  const bodyItemValue = useMemo(() => ({ item, index }), [item, index]);

  return (
    <BodyItemContainerContext.Provider value={bodyItemValue}>
      {children}
    </BodyItemContainerContext.Provider>
  );
};

export default memo(BodyItemContainer);
