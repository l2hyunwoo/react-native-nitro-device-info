import * as path from "node:path";
import { defineConfig } from "rspress/config";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: 'React Native Nitro Device Info',
  description: 'Get comprehensive device information for React Native using Nitro Modules',
  base: '/react-native-nitro-device-info/',
  icon: '/logo.svg',
  logo: {
    light: '/logo.svg',
    dark: '/logo.svg',
  },

  locales: [
    {
      lang: 'en',
      label: 'English',
      title: 'React Native Nitro Device Info',
      description: 'Get comprehensive device information for React Native using Nitro Modules',
    },
    {
      lang: 'ko',
      label: '한국어',
      title: 'React Native Nitro Device Info',
      description: 'Nitro 모듈을 활용한 포괄적인 React Native 기기 정보 라이브러리',
    },
  ],

  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/l2hyunwoo/react-native-nitro-device-info',
      },
    ],

    nav: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Why Nitro Module', link: '/guide/why-nitro-module' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Quick Start', link: '/guide/quick-start' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'DeviceInfo Module', link: '/api/device-info' },
          { text: 'Type Definitions', link: '/api/types' },
          { text: 'Migration Guide', link: '/api/migration' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Basic Usage', link: '/examples/basic-usage' },
          { text: 'Advanced Patterns', link: '/examples/advanced-usage' },
        ],
      },
      {
        text: 'Contributing',
        items: [
          { text: 'Documentation', link: '/contributing/documentation' },
        ],
      },
      {
        text: 'GitHub',
        link: 'https://github.com/l2hyunwoo/react-native-nitro-device-info',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          collapsible: false,
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Why Nitro Module', link: '/guide/why-nitro-module' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          collapsible: false,
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'DeviceInfo Module', link: '/api/device-info' },
            { text: 'Type Definitions', link: '/api/types' },
            { text: 'Migration Guide', link: '/api/migration' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          collapsible: false,
          items: [
            { text: 'Basic Usage', link: '/examples/basic-usage' },
            { text: 'Advanced Patterns', link: '/examples/advanced-usage' },
          ],
        },
      ],
      '/contributing/': [
        {
          text: 'Contributing',
          collapsible: false,
          items: [
            { text: 'Documentation', link: '/contributing/documentation' },
          ],
        },
      ],
    },

    search: true,
    lastUpdated: true,
    outlineTitle: 'On this page',
  },
});
