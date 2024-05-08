import { useCallback, useEffect, useRef, useState } from 'react';
import XHRInterceptor from 'react-native/Libraries/Network/XHRInterceptor';

export type RequestItemType = {
  host?: string;
  url: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  id: number;
  status?: number;
  timeout?: number;
  response?: string;
  path?: string;
  headers?: Record<string, any>;
  data?: string;
  responseHeaders?: Record<string, any>;
  requestedAt?: number;
  finishedAt?: number;
  query?: string;
  responseType?: 'html' | 'json';
  responseSize?: number;
};

const excludesHosts: string[] = [];
const excludesPaths: string[] = ['/logs', '/symbolicate'];
const excludeTypes = ['blob', 'arraybuffer', 'document'];
const MAX_REQUESTS = 500;

const useApiDebugger = () => {
  const xhrIndex = useRef(0);
  const [requests, setRequests] = useState<RequestItemType[]>([]);
  const _setOpenCallBack = useCallback(
    (method: any, url: string, xhr: { _index: number }) => {
      const { host, path, query } = extractUrl(url);
      if (
        !host ||
        (host && excludesHosts.includes(host)) ||
        (path && excludesPaths.includes(path))
      ) {
        return;
      }
      xhr._index = xhrIndex.current;
      setRequests((prev) => {
        const cloneRequests = [...prev];
        if (cloneRequests.length >= MAX_REQUESTS) {
          cloneRequests.pop();
        }
        cloneRequests.unshift({
          url,
          host,
          path,
          query,
          method,
          id: xhrIndex.current,
        });
        return cloneRequests;
      });
      xhrIndex.current += 1;
    },
    []
  );

  const _setHeaderCallback = useCallback(
    (header: any, value: any, xhr: { _index: number | undefined }) => {
      if (xhr._index === undefined) {
        return;
      }
      setRequests((prev) => {
        const newRequests = prev.map((r) => {
          if (r.id === xhr._index) {
            return { ...r, headers: { ...r.headers, [header]: value } };
          }
          return r;
        });
        return newRequests;
      });
    },
    []
  );

  const _setHeaderReceivedCallback = useCallback(
    (
      _responseContentType: any,
      responseSize: any,
      _allResponseHeaders: any,
      xhr: { _index: number | undefined; responseHeaders: any }
    ) => {
      if (xhr._index === undefined) {
        return;
      }
      setRequests((prev) => {
        const newRequests = prev.map((r) => {
          if (r.id === xhr._index) {
            return { ...r, responseHeaders: xhr.responseHeaders, responseSize };
          }
          return r;
        });
        return newRequests;
      });
    },
    []
  );

  const _setSendCallback = useCallback(
    (data: any, xhr: { _index: number | undefined }) => {
      if (xhr._index === undefined) {
        return;
      }
      const requestData =
        data && (typeof data === 'string' ? data : JSON.stringify(data));

      setRequests((prev) => {
        const newRequests = prev.map((r) => {
          if (r.id === xhr._index) {
            return {
              ...r,
              data: requestData,
              requestedAt: Date.now(),
            };
          }
          return r;
        });
        return newRequests;
      });
    },
    []
  );

  const _setResponseCallback = useCallback(
    async (
      status: any,
      timeout: any,
      data: any | string | undefined,
      _responseURL: any,
      responseType: string,
      xhr: {
        _index: number | undefined;
        responseHeaders: { [x: string]: string };
      }
    ) => {
      if (xhr._index === undefined) {
        return;
      }
      const contentTypeIos = xhr.responseHeaders?.['Content-Type'] ?? '';
      const contentTypeAndroid = xhr.responseHeaders?.['content-type'] ?? '';
      const contentType = contentTypeIos || contentTypeAndroid;
      let customResponseType: 'html' | 'json' | undefined;

      if (contentType === 'text/html') {
        customResponseType = 'html';
      }
      if (contentType.indexOf('application/json') !== -1) {
        customResponseType = 'json';
      }

      setRequests((prev) => {
        const newRequests = prev.map((r) => {
          if (r.id === xhr._index) {
            return {
              ...r,
              status,
              timeout,
              response: !excludeTypes.includes(responseType) ? data : undefined,
              finishedAt: Date.now(),
              responseType: customResponseType,
            };
          }
          return r;
        });
        return newRequests;
      });
    },
    []
  );

  useEffect(() => {
    XHRInterceptor.setOpenCallback(_setOpenCallBack);
    XHRInterceptor.setRequestHeaderCallback(_setHeaderCallback);
    XHRInterceptor.setHeaderReceivedCallback(_setHeaderReceivedCallback);
    XHRInterceptor.setSendCallback(_setSendCallback);
    XHRInterceptor.setResponseCallback(_setResponseCallback);
    XHRInterceptor.enableInterception();
    return () => {
      XHRInterceptor.disableInterception();
    };
  }, [
    _setOpenCallBack,
    _setResponseCallback,
    _setHeaderCallback,
    _setSendCallback,
    _setHeaderReceivedCallback,
  ]);

  const clearRequests = useCallback(() => {
    setRequests([]);
  }, []);

  return { requests, clearRequests };
};

export default useApiDebugger;

const extractUrl = (url: string) => {
  const regex =
    /^(([^@:/\s]+):\/?)?\/?(([^@:/\s]+)(:([^@:/\s]+))?@)?([^@:/\s]+)(:(\d+))?(((\/\w+)*\/)([\w\-.]+[^#?\s]*)?(.*)?(#[\w-]+)?)?$/;

  const host = url.match(regex)?.[7];
  const query = url.match(regex)?.[14];
  const path = url.match(regex)?.[10]?.replace(query || '', '');
  return { host, path, query };
};
