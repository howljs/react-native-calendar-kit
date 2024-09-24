import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PreviewData from './PreviewData';
import { baseColors, bgColors, statusColors } from './constants';
import type { RequestItemType } from './useApiDebugger';

interface ApiListModalProps {
  visible: boolean;
  request: RequestItemType | undefined;
  onRequestClose: () => void;
  onPressRetry: (request: RequestItemType) => void;
}

function getFormattedTime(time: number) {
  const date = new Date(time);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  const miliseconds = `00${date.getMilliseconds()}`.slice(-3);
  return `${hours}:${minutes}:${seconds}:${miliseconds}`;
}

function formatByteSize(bytes: number) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + ' kB';
  } else if (bytes < 1073741824) {
    return (bytes / 1048576).toFixed(1) + ' MB';
  } else {
    return (bytes / 1073741824).toFixed(1) + ' GB';
  }
}

const tabs = ['Headers', 'Payload', 'Response'];

const ApiDetailModal = ({
  visible,
  onRequestClose,
  request,
  onPressRetry,
}: ApiListModalProps) => {
  const { bottom: safeBottom } = useSafeAreaInsets();
  const baseColor = baseColors[request?.method!] || baseColors.GET;
  const bgColor = bgColors[request?.method!] || bgColors.GET;
  let statusColor = statusColors.serverError;
  if (request?.status) {
    if (request.status < 200) {
      statusColor = statusColors.informational;
    } else if (request.status < 300) {
      statusColor = statusColors.successful;
    } else if (request.status < 400) {
      statusColor = statusColors.redirection;
    } else if (request.status < 500) {
      statusColor = statusColors.clientError;
    }
  }
  let time: string | undefined;
  if (request?.finishedAt && request?.requestedAt) {
    time = `${request.finishedAt - request.requestedAt}ms`;
  }
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  useEffect(() => {
    if (!visible) {
      setSelectedTab(tabs[0]);
    }
  }, [visible]);

  const _renderTab = (tab: string) => {
    const isHidePayload = tab === 'Payload' && !request?.data;
    const isHideResponse = tab === 'Response' && !request?.response;
    if (isHidePayload || isHideResponse) {
      return null;
    }

    const borderColor = selectedTab === tab ? baseColor : 'transparent';
    return (
      <TouchableOpacity
        key={tab}
        onPress={() => setSelectedTab(tab)}
        style={[styles.tabItem, { borderBottomColor: borderColor }]}
      >
        <Text>{tab}</Text>
      </TouchableOpacity>
    );
  };

  const _renderContent = () => {
    switch (selectedTab) {
      case 'Headers':
        return (
          <ScrollView style={styles.flex}>
            <View style={styles.contentTitleContainer}>
              <Text style={styles.contentTitle}>General</Text>
            </View>
            <View style={styles.headers}>
              <View style={styles.headersItem}>
                <Text selectable style={styles.headersKey}>
                  Full URL:
                </Text>
                <Text style={styles.headersValue} selectable>
                  {request?.url}
                </Text>
              </View>
              <View style={styles.headersItem}>
                <Text selectable style={styles.headersKey}>
                  Host:
                </Text>
                <Text style={styles.headersValue} selectable>
                  {request?.host}
                </Text>
              </View>
              {request?.path && (
                <View style={styles.headersItem}>
                  <Text selectable style={styles.headersKey}>
                    Path:
                  </Text>
                  <Text style={styles.headersValue} selectable>
                    {request?.path}
                  </Text>
                </View>
              )}
              {request?.query && (
                <View style={styles.headersItem}>
                  <Text selectable style={styles.headersKey}>
                    Query String:
                  </Text>
                  <Text style={styles.headersValue} selectable>
                    {request.query}
                  </Text>
                </View>
              )}
              <View style={styles.headersItem}>
                <Text selectable style={styles.headersKey}>
                  Request Method:
                </Text>
                <Text style={styles.headersValue} selectable>
                  {request?.method}
                </Text>
              </View>
              <View style={[styles.headersItem, styles.headerStatus]}>
                <Text selectable style={styles.headersKey}>
                  Status Code:
                </Text>
                {request?.status ? (
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusCircle,
                        { backgroundColor: statusColor },
                      ]}
                    />
                    <Text style={styles.headersValue} selectable>
                      {request?.status}
                    </Text>
                  </View>
                ) : (
                  <ActivityIndicator size="small" />
                )}
              </View>
              {time && (
                <View style={styles.headersItem}>
                  <Text selectable style={styles.headersKey}>
                    Time:
                  </Text>
                  <Text style={styles.headersValue} selectable>
                    {time}
                  </Text>
                </View>
              )}
              {request?.requestedAt && (
                <View style={styles.headersItem}>
                  <Text selectable style={styles.headersKey}>
                    Request Time:
                  </Text>
                  <Text style={styles.headersValue} selectable>
                    {getFormattedTime(request.requestedAt)}
                  </Text>
                </View>
              )}
              {request?.responseSize !== undefined && (
                <View style={styles.headersItem}>
                  <Text selectable style={styles.headersKey}>
                    Response Size:
                  </Text>
                  <Text style={styles.headersValue} selectable>
                    {formatByteSize(request.responseSize)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.contentTitleContainer}>
              <Text style={styles.contentTitle}>Request Headers</Text>
            </View>
            <View style={styles.headers}>
              {request?.headers &&
                Object.keys(request.headers).map((key) => (
                  <View key={key} style={styles.headersItem}>
                    <Text selectable style={styles.headersKey}>
                      {key}:
                    </Text>
                    <Text style={styles.headersValue} selectable>
                      {(request.headers as any)[key]}
                    </Text>
                  </View>
                ))}
            </View>
            {request?.responseHeaders && (
              <View>
                <View style={styles.contentTitleContainer}>
                  <Text style={styles.contentTitle}>Response Headers</Text>
                </View>
                <View style={styles.headers}>
                  {Object.keys(request.responseHeaders).map((key) => (
                    <View key={key} style={styles.headersItem}>
                      <Text selectable style={styles.headersKey}>
                        {key}:
                      </Text>
                      <Text style={styles.headersValue} selectable>
                        {(request.responseHeaders as any)[key]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        );

      case 'Payload':
        return (
          <View style={styles.content}>
            {request?.data && <PreviewData data={request.data} type="json" />}
          </View>
        );

      case 'Response':
        return (
          <View style={styles.content}>
            {request?.response && (
              <PreviewData
                data={request.response}
                type={request?.responseType}
              />
            )}
          </View>
        );

      default:
        return <View />;
    }
  };

  const _exportCurl = (isFormatCurl?: boolean) => {
    if (!request) {
      return;
    }
    const method = request.method.toUpperCase();
    const url = request.url;
    const headers = request.headers || [];
    const data = request.data ? JSON.stringify(request.data) : '';
    const breakLine = isFormatCurl ? '\\\n' : '';
    let curlCommand = `curl -v -X ${breakLine}${method} '${url}'`;
    Object.keys(headers).forEach((key) => {
      const headerItem = (headers as any)[key];
      const extra = breakLine ? breakLine + ' ' : '';
      curlCommand += ` -H '${key}: ${headerItem}'${extra}`;
    });
    if (data) {
      curlCommand += ` -d '${request.data}'`;
    }
    Share.share({ message: curlCommand });
  };

  return (
    <Modal
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onRequestClose}
      animationType="slide"
    >
      <View style={[styles.container, { paddingBottom: safeBottom }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>API Debugger Detail</Text>
          <TouchableOpacity
            onPress={onRequestClose}
            hitSlop={{ top: 5, left: 5, bottom: 5, right: 5 }}
          >
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: bgColor }}>
          <ScrollView horizontal>
            <View style={styles.tabContainer}>{tabs.map(_renderTab)}</View>
          </ScrollView>
        </View>
        <View style={styles.content}>{_renderContent()}</View>
        {!request?.responseType && (
          <View style={styles.actionsBar}>
            <TouchableOpacity
              style={styles.retryContainer}
              onPress={() => _exportCurl(false)}
            >
              <Text style={styles.retryText}>Export Curl</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.retryContainer}
              onPress={() => onPressRetry(request!)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default ApiDetailModal;

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatus: { alignItems: 'center' },
  statusCircle: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 4,
  },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  contentTitleContainer: {
    backgroundColor: '#d9dadc',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  contentTitle: { fontWeight: 'bold' },
  responseHeader: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 12 },
  headers: { paddingVertical: 8, paddingHorizontal: 16 },
  headersItem: { flexDirection: 'row', marginBottom: 8 },
  headersKey: { marginRight: 8, fontWeight: 'bold', fontSize: 12 },
  headersValue: { flexShrink: 1, flexGrow: 1, fontSize: 12 },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 50,
    borderTopColor: '#d9dadc',
    borderTopWidth: 1,
    paddingHorizontal: 16,
  },
  retryText: { fontSize: 12, color: '#FFF', fontWeight: 'bold' },
  retryContainer: {
    paddingHorizontal: 16,
    marginHorizontal: 8,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#262626',
    borderRadius: 6,
  },
  notSupported: { padding: 16 },
  flexGrow: { flexGrow: 1 },
});
