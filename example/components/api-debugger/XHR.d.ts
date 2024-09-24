declare module 'react-native/Libraries/Network/XHRInterceptor' {
  type RequestMethod = 'GET' | 'POST' | 'UPDATE' | 'DELETE';
  function setOpenCallback(
    callback: (method: RequestMethod, url: string, xhr: any) => void
  ): void;
  function setRequestHeaderCallback(
    callback: (header: string, value: any, xhr: any) => void
  ): void;
  function setHeaderReceivedCallback(
    callback: (
      responseContentType: string,
      responseSize: number,
      allResponseHeaders: string,
      xhr: any
    ) => void
  ): void;
  function setSendCallback(callback: (data: any, xhr: any) => void): void;
  function setResponseCallback(
    callback: (
      status: number,
      timeout: number,
      response: any,
      responseURL: string,
      responseType: any,
      xhr: any
    ) => void
  ): void;
  function enableInterception(): void;
  function disableInterception(): void;
  export {
    setOpenCallback,
    setRequestHeaderCallback,
    setHeaderReceivedCallback,
    setSendCallback,
    setResponseCallback,
    enableInterception,
    disableInterception,
  };
}
