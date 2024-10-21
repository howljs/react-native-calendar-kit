import React, { FC, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocale } from '../context/LocaleProvider';
import { useTheme } from '../context/ThemeProvider';
import { ResourceItem } from '../types';
import { parseDateTime } from '../utils/dateUtils';

interface ResourceHeaderItemProps {
  startUnix: number;
  resources?: ResourceItem[];
  DateComponent?: React.ReactElement | null;
  renderResource?: (resource: ResourceItem) => React.ReactElement | null;
  isShowSeparator?: boolean;
  dateFormat?: string;
  isShowWeekDay?: boolean;
}

const ResourceHeaderItem: FC<ResourceHeaderItemProps> = ({
  resources,
  startUnix,
  DateComponent,
  renderResource,
  isShowSeparator = true,
  dateFormat = 'yyyy-MM-dd',
  isShowWeekDay = true,
}) => {
  const { weekDayShort } = useLocale();
  const borderColor = useTheme(useCallback((state) => state.colors.border, []));

  const _renderDate = () => {
    const date = parseDateTime(startUnix);

    return (
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>
          {`${date.toFormat(dateFormat)}`}
          {isShowWeekDay && ` (${weekDayShort[date.weekday % 7]})`}
        </Text>
      </View>
    );
  };

  const _renderResource = (resource: ResourceItem) => {
    return (
      <View key={resource.id} style={styles.resource}>
        {isShowSeparator && (
          <View
            style={{
              width: 1,
              position: 'absolute',
              left: -0.5,
              height: '100%',
              backgroundColor: borderColor,
            }}
          />
        )}
        {renderResource ? (
          renderResource(resource)
        ) : (
          <View style={[styles.resourceContent, { borderColor }]}>
            <Text>{resource.title}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {DateComponent ?? _renderDate()}
      <View style={styles.resourceContainer}>
        {resources?.map(_renderResource)}
      </View>
    </View>
  );
};

export default ResourceHeaderItem;

const styles = StyleSheet.create({
  container: { flex: 1 },
  resourceContainer: { flex: 1, flexDirection: 'row' },
  resource: { flex: 1 },
  resourceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ccc',
    borderTopWidth: 1,
  },
  dateContainer: {
    paddingVertical: 4,
  },
  dateText: { textAlign: 'center', fontWeight: 'bold' },
});
