import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useHeader } from '../context/DayBarContext';
import { ResourceItem } from '../types';

interface HeaderResourceItemProps {
  resources: ResourceItem[];
}

const HeaderResourceItem = ({ resources }: HeaderResourceItemProps) => {
  const { columnWidth, resourcePerPage } = useHeader();
  const renderItem = useCallback(
    (resource: ResourceItem) => {
      return (
        <View
          key={resource.id}
          style={{
            width: columnWidth / resourcePerPage,
            backgroundColor: '#ccc',
            height: '100%',
          }}>
          <Text>{resource.title}</Text>
        </View>
      );
    },
    [columnWidth, resourcePerPage]
  );

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {resources.map(renderItem)}
    </View>
  );
};

export default HeaderResourceItem;
