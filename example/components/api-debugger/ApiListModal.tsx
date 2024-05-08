import axios from 'axios';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApiDetailModal from './ApiDetailModal';
import { baseColors, bgColors, statusColors } from './constants';
import type { RequestItemType } from './useApiDebugger';

interface ApiListModalProps {
  visible: boolean;
  requests: RequestItemType[];
  onRequestClose: () => void;
  onPressClear: () => void;
}

const ApiListModal = ({
  visible,
  requests,
  onRequestClose,
  onPressClear,
}: ApiListModalProps) => {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState<number>();
  const selectedRequest = requests.find((r) => r.id === selectedId);

  const _renderItem = ({ item }: ListRenderItemInfo<RequestItemType>) => {
    let time: string | undefined;
    const requestMethod = item.method;
    const baseColor = baseColors[requestMethod] || baseColors.GET;
    const bgColor = bgColors[requestMethod] || bgColors.GET;
    let statusColor = statusColors.serverError;
    if (item.status) {
      if (item.status < 200) {
        statusColor = statusColors.informational;
      } else if (item.status < 300) {
        statusColor = statusColors.successful;
      } else if (item.status < 400) {
        statusColor = statusColors.redirection;
      } else if (item.status < 500) {
        statusColor = statusColors.clientError;
      }
    }
    if (item.finishedAt && item.requestedAt) {
      time = `${item.finishedAt - item.requestedAt}ms`;
    }
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedId(item.id)}
      >
        <View
          style={[
            styles.requestItem,
            {
              borderTopColor: baseColor,
              borderBottomColor: baseColor,
              backgroundColor: bgColor,
            },
          ]}
        >
          <View style={styles.leftColumn}>
            <View style={styles.badgeRow}>
              <View style={[styles.badgeContainer, styles.idContainer]}>
                <Text style={styles.badgeText}>#{item.id + 1}</Text>
              </View>
              <View
                style={[styles.badgeContainer, { backgroundColor: baseColor }]}
              >
                <Text style={styles.badgeText}>{item.method}</Text>
              </View>
            </View>
            <Text selectable style={styles.url}>
              {item.path}
            </Text>
          </View>
          {time ? (
            <View>
              <View
                style={[
                  styles.statusContainer,
                  { backgroundColor: statusColor },
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          ) : (
            <ActivityIndicator size="small" color={baseColor} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const listRef = useRef<FlatList>(null);
  const _onPressRetry = async (request: RequestItemType) => {
    setSelectedId(undefined);
    listRef.current?.scrollToOffset({ offset: 0 });
    await axios({
      url: request.url,
      method: request.method,
      headers: request.headers,
      data: request.data ? JSON.parse(request.data) : undefined,
    }).catch(() => {});
  };

  const [searchValue, setSearchValue] = useState('');
  const filteredData = requests.filter(
    (r) =>
      r.url.toLocaleLowerCase().indexOf(searchValue.toLocaleLowerCase()) !== -1
  );

  return (
    <Modal
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onRequestClose}
      animationType="slide"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>API Debugger</Text>
          <TouchableOpacity
            onPress={onRequestClose}
            hitSlop={{ top: 5, left: 5, bottom: 5, right: 5 }}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchBar}>
          <View style={styles.inputContainer}>
            <TextInput
              clearButtonMode="always"
              value={searchValue}
              onChangeText={setSearchValue}
              underlineColorAndroid="transparent"
              placeholderTextColor="#ccc"
              placeholder="Filter"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={onPressClear}>
            <Text>Clear</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={listRef}
          data={searchValue.length ? filteredData : requests}
          keyExtractor={(item) => `${item.id}`}
          renderItem={_renderItem}
          style={styles.listContainer}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: safeBottom + 16 },
          ]}
        />
        <ApiDetailModal
          visible={!!selectedRequest}
          request={selectedRequest}
          onRequestClose={() => setSelectedId(undefined)}
          onPressRetry={_onPressRetry}
        />
      </View>
    </Modal>
  );
};

export default ApiListModal;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  requestItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: { flexGrow: 1, flexShrink: 1, marginRight: 16 },
  badgeContainer: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: { fontWeight: 'bold', fontSize: 12, color: '#FFF' },
  listContainer: { flex: 1 },
  contentContainer: { paddingTop: 16 },
  url: { fontWeight: 'bold' },
  timeText: { fontSize: 12 },
  statusContainer: {
    padding: 4,
    alignSelf: 'flex-end',
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  idContainer: { backgroundColor: '#4b128d', marginRight: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 8,
    borderBottomColor: '#d7d7d7',
    borderBottomWidth: 1,
  },
  inputContainer: {
    height: 40,
    flexGrow: 1,
    marginRight: 16,
    borderColor: '#d7d7d7',
    borderWidth: 1,
    borderRadius: 6,
  },
  input: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  clearBtn: {
    borderColor: '#d7d7d7',
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
