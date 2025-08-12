import React from 'react';
import { useUnavailableHoursByDate } from '../../context/UnavailableHoursProvider';
import { useDateChangedListener } from '../../context/VisibleDateProvider';
import { ResourceItem } from '../../types';
import { UnavailableHoursByDate } from '../TimelineBoard/UnavailableHours';
import { StyleSheet, View } from 'react-native';
import { useBody } from '../../context/BodyContext';

interface UnavailableHoursByResourceProps {
  resources: ResourceItem[];
}

const UnavailableHoursByResource = ({
  resources,
}: UnavailableHoursByResourceProps) => {
  const visibleDateUnix = useDateChangedListener();
  const unavailableHours = useUnavailableHoursByDate(visibleDateUnix);
  const { enableResourceScroll, resourcePerPage } = useBody();

  if (!unavailableHours) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <UnavailableHoursByDate
        currentUnix={visibleDateUnix}
        visibleDateIndex={0}
        resources={resources}
        widthPercentage={enableResourceScroll ? 1 / resourcePerPage : undefined}
      />
    </View>
  );
};

export default UnavailableHoursByResource;
