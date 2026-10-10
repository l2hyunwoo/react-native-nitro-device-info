import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'React Native Nitro Device Info',
  description:
    'Get comprehensive device information for React Native using Nitro Modules',
  base: '/react-native-nitro-device-info/',
  llms: true,
  lang: 'en',
  locales: [
    { lang: 'en', label: 'English' },
    {
      lang: 'ko',
      label: '한국어',
      description:
        'Nitro Modules로 React Native 기기 정보를 읽는 방법과 API 레퍼런스',
    },
  ],
  route: { localeRedirect: 'never' },
  icon: '/logo.png',
  logo: {
    light: '/logo.png',
    dark: '/logo.png',
  },

  themeConfig: {
    nav: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Why Nitro Module', link: '/guide/why-nitro-module' },
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Expo Setup', link: '/guide/expo-setup' },
          { text: 'Quick Start', link: '/guide/quick-start' },
          { text: 'React Hooks', link: '/guide/react-hooks' },
          { text: 'Web Support', link: '/guide/web-support' },
          { text: 'MCP Integration', link: '/guide/mcp-integration' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'DeviceInfo Module', link: '/api/device-info' },
          { text: 'Device Integrity (local)', link: '/api/device-integrity' },
          { text: 'Device Attestation', link: '/api/device-attestation' },
          { text: 'React Hooks', link: '/api/hooks' },
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
        items: [{ text: 'Documentation', link: '/contributing/documentation' }],
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
            { text: 'Expo Setup', link: '/guide/expo-setup' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'React Hooks', link: '/guide/react-hooks' },
            { text: 'Web Support', link: '/guide/web-support' },
            { text: 'MCP Integration', link: '/guide/mcp-integration' },
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
            { text: 'Device Integrity (local)', link: '/api/device-integrity' },
            { text: 'Device Attestation', link: '/api/device-attestation' },
            { text: 'React Hooks', link: '/api/hooks' },
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

    locales: [
      {
        lang: 'ko',
        label: '한국어',
        nav: [
          {
            text: '가이드',
            items: [
              { text: '소개', link: '/guide/introduction' },
              {
                text: 'Nitro Module을 사용하는 이유',
                link: '/guide/why-nitro-module',
              },
              { text: '시작하기', link: '/guide/getting-started' },
              { text: 'Expo 설정', link: '/guide/expo-setup' },
              { text: '빠른 시작', link: '/guide/quick-start' },
              { text: 'React 훅', link: '/guide/react-hooks' },
              { text: '웹 지원', link: '/guide/web-support' },
              { text: 'MCP 연동', link: '/guide/mcp-integration' },
            ],
          },
          {
            text: 'API 레퍼런스',
            items: [
              { text: '개요', link: '/api/' },
              { text: 'DeviceInfo 모듈', link: '/api/device-info' },
              { text: '기기 무결성(로컬)', link: '/api/device-integrity' },
              { text: 'Device Attestation', link: '/api/device-attestation' },
              { text: 'React 훅', link: '/api/hooks' },
              { text: '타입 정의', link: '/api/types' },
              { text: '마이그레이션 가이드', link: '/api/migration' },
            ],
          },
          {
            text: '예제',
            items: [
              { text: '기본 사용법', link: '/examples/basic-usage' },
              { text: '고급 사용법', link: '/examples/advanced-usage' },
            ],
          },
          {
            text: '기여하기',
            items: [{ text: '문서', link: '/contributing/documentation' }],
          },
          {
            text: 'GitHub',
            link: 'https://github.com/l2hyunwoo/react-native-nitro-device-info',
          },
        ],

        sidebar: {
          '/ko/guide/': [
            {
              text: '가이드',
              collapsible: false,
              items: [
                { text: '소개', link: '/guide/introduction' },
                {
                  text: 'Nitro Module을 사용하는 이유',
                  link: '/guide/why-nitro-module',
                },
                { text: '시작하기', link: '/guide/getting-started' },
                { text: 'Expo 설정', link: '/guide/expo-setup' },
                { text: '빠른 시작', link: '/guide/quick-start' },
                { text: 'React 훅', link: '/guide/react-hooks' },
                { text: '웹 지원', link: '/guide/web-support' },
                { text: 'MCP 연동', link: '/guide/mcp-integration' },
              ],
            },
          ],
          '/ko/api/': [
            {
              text: 'API 레퍼런스',
              collapsible: false,
              items: [
                { text: '개요', link: '/api/' },
                { text: 'DeviceInfo 모듈', link: '/api/device-info' },
                { text: '기기 무결성(로컬)', link: '/api/device-integrity' },
                { text: 'Device Attestation', link: '/api/device-attestation' },
                { text: 'React 훅', link: '/api/hooks' },
                { text: '타입 정의', link: '/api/types' },
                { text: '마이그레이션 가이드', link: '/api/migration' },
              ],
            },
          ],
          '/ko/examples/': [
            {
              text: '예제',
              collapsible: false,
              items: [
                { text: '기본 사용법', link: '/examples/basic-usage' },
                { text: '고급 사용법', link: '/examples/advanced-usage' },
              ],
            },
          ],
          '/ko/contributing/': [
            {
              text: '기여하기',
              collapsible: false,
              items: [{ text: '문서', link: '/contributing/documentation' }],
            },
          ],
        },
      },
    ],

    search: true,
    lastUpdated: true,
  },
});
