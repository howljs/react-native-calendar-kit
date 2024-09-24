import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import WebView, { type WebViewProps } from 'react-native-webview';

interface PreviewDataProps extends WebViewProps {
  data: string;
  type?: 'json' | 'html';
}

const PreviewData = ({ data, style, type, ...props }: PreviewDataProps) => {
  const webViewRef = useRef<WebView>(null);

  const [isLoading, setIsLoading] = useState(false);

  if (!type && typeof data !== 'string') {
    return null;
  }

  return (
    <View style={styles.container}>
      <WebView
        {...props}
        ref={webViewRef}
        style={StyleSheet.flatten([styles.container, style])}
        javaScriptEnabled
        source={{
          html: type === 'html' ? data : buildHtml(data),
        }}
        startInLoadingState
        onLoadStart={() => {
          setIsLoading(true);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <View style={styles.loading}>
          <ActivityIndicator color="#FFF" size="large" />
        </View>
      )}
    </View>
  );
};

export default PreviewData;

const backgroundColor = '#282a36';
const color = '#FFF';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const colors = JSON.stringify({
  keyColor: '#50fa7b',
  numberColor: '#67b9fb',
  stringColor: '#f1fa8c',
  trueColor: '#bd93f9',
  falseColor: '#f993c6',
  nullColor: '#fff',
});

const jsonRegex =
  /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

function isJSONStr(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const buildHtml = (data: string) => {
  if (!isJSONStr(data)) {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>JSON Viewer</title>
        <style>
          body {
            background-color: ${backgroundColor};
            color: ${color};
            font-size: 12px;
            padding: 16px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        ${data}
      </body>
    </html>`;
  }

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>JSON Viewer</title>
      <style>
        body {
          background-color: ${backgroundColor};
          color: ${color};
          font-size: 12px;
          padding: 0 8px;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <pre id="jsonData"></pre>
    </body>
    <script>
      let entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "\`": "&#x60;",
        "=": "&#x3D;",
      };
  
      function escapeHtml(html) {
        return String(html).replace(/[&<>"'\`=]/g, function (s) {
          return entityMap[s];
        });
      }
  
      function syntaxHighlight(json) {
        let colors = ${colors};
        json = json.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
        return json.replace(
          ${jsonRegex},
          (match) => {
            let color = colors.numberColor;
            let style = "";
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                color = colors.keyColor;
              } else {
                color = colors.stringColor;
                match = '"' + escapeHtml(match.substr(1, match.length - 2)) + '"';
                style = "word-wrap:break-word;white-space:pre-wrap;";
              }
            } else {
              color = /true/.test(match)
                ? colors.trueColor
                : /false/.test(match)
                ? colors.falseColor
                : /null/.test(match)
                ? colors.nullColor
                : color;
            }
            return (
              '<span style="' +
              style +
              "color:" +
              color +
              '">' +
              match +
              "</span>"
            );
          }
        );
      }
      function output(inp) {
        let innerHTML = syntaxHighlight(JSON.stringify(inp, null, 2));
        document.querySelector("#jsonData").innerHTML = innerHTML;
      }
      output(${data});
    </script>
  </html>
  `;
};
