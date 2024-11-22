import { type FC, type PropsWithChildren, useMemo } from 'react';
import { View } from 'react-native';

import { useHeader } from '../../context/HeaderContext';
import { HeaderColumnContext } from './HeaderItemContext';

interface HeaderColumnProps {
  item: number;
  index: number;
}

const HeaderColumn: FC<PropsWithChildren<HeaderColumnProps>> = ({ item, index, children }) => {
  const { columnWidth, numberOfDays, hourWidth } = useHeader();
  const headerColumnValue = useMemo(() => ({ item, index }), [item, index]);

  return (
    <HeaderColumnContext.Provider value={headerColumnValue}>
      <View style={{ width: numberOfDays === 1 ? hourWidth + columnWidth : columnWidth }}>
        {children}
      </View>
    </HeaderColumnContext.Provider>
  );
};

export default HeaderColumn;
