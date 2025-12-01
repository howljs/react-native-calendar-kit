import React, { useCallback } from 'react';
import { ResourceItem } from '../../types';
import { UnavailableHoursByDate } from '../TimelineBoard/UnavailableHours';
import { StyleSheet, View } from 'react-native';
import { useBody } from '../../context/BodyContext';

interface UnavailableHoursByResourceProps {
  resources: ResourceItem[];
  visibleDates: Record<string, { diffDays: number; unix: number }>;
}

const UnavailableHoursByResource = ({
  resources,
  visibleDates,
}: UnavailableHoursByResourceProps) => {
  const { enableResourceScroll, resourcePerPage } = useBody();

  const _renderColumn = useCallback(
    (currentUnix: string) => {
      const dateInfo = visibleDates[currentUnix];

      if (!dateInfo) {
        return null;
      }

      return (
        <UnavailableHoursByDate
          key={`UnavailableHours_${currentUnix}_${resources.map(r => r.id).join('-')}`}
          currentUnix={Number(currentUnix)}
          visibleDateIndex={dateInfo.diffDays}
          resources={resources}
          widthPercentage={
            enableResourceScroll ? 1 / resourcePerPage : undefined
          }
        />
      );
    },
    [visibleDates, resources, enableResourceScroll, resourcePerPage]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {Object.keys(visibleDates).map(_renderColumn)}
    </View>
  );
};

export default UnavailableHoursByResource;
