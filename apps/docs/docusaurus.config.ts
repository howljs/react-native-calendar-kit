import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import SearchLocal from '@easyops-cn/docusaurus-search-local';
import webpack from 'webpack';
import raf from 'raf';

const config: Config = {
  title: 'Calendar Kit',
  tagline: 'A calendar component for React Native',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://howljs.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/react-native-calendar-kit/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'howljs', // Usually your GitHub org/user name.
  projectName: 'react-native-calendar-kit', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          lastVersion: 'current',
          versions: {
            current: {
              label: '2.x',
            },
          },
          sidebarPath: './sidebars.ts',
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Calendar Kit',
      logo: {
        alt: 'Calendar Kit Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docsVersionDropdown',
        },
        {
          href: 'https://github.com/howljs/react-native-calendar-kit',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} howljs. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      } satisfies SearchLocal.PluginOptions,
    ],
  ],
  plugins: [
    function docusaurusPlugin(_context, _options) {
      return {
        name: 'docusaurus-plugin',
        configureWebpack(_config, isServer, _utils) {
          const processMock = !isServer ? { process: { env: {} } } : {};

          raf.polyfill();

          return {
            mergeStrategy: {
              'resolve.extensions': 'prepend',
            },
            plugins: [
              new webpack.DefinePlugin({
                ...processMock,
                __DEV__: 'false',
              }),
              new webpack.EnvironmentPlugin({ JEST_WORKER_ID: null }),
              new webpack.DefinePlugin({ process: { env: {} } }),
            ],
            module: {
              rules: [
                {
                  test: /\.(js|jsx)$/,
                  use: {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        '@babel/preset-react',
                        {
                          plugins: ['@babel/plugin-proposal-class-properties'],
                        },
                      ],
                    },
                  },
                },
              ],
            },
            resolve: {
              alias: {
                'react-native$': 'react-native-web',
              },
              extensions: ['.web.js', '...'],
              fallback: {
                crypto: false,
              },
            },
          };
        },
      };
    },
  ],
};

export default config;
