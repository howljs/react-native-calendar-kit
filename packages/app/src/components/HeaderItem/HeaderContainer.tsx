import { type FC, type PropsWithChildren, useMemo } from 'react';

import { HeaderItemContext } from './HeaderItemContext';

interface HeaderContainerProps {
  item: number;
  index: number;
}

const HeaderContainer: FC<PropsWithChildren<HeaderContainerProps>> = ({
  item,
  index,
  children,
}) => {
  const headerItemValue = useMemo(() => ({ item, index }), [item, index]);

  return (
    <HeaderItemContext.Provider value={headerItemValue}>{children}</HeaderItemContext.Provider>
  );
};

export default HeaderContainer;
