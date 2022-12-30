import { defineUserConfig, defaultTheme } from 'vuepress';
import { viteBundler } from '@vuepress/bundler-vite';
import { baseConfig, navbar } from './configs';

export default defineUserConfig({
  base: '/', // 部署站点的基础路径
  lang: 'zh', // 站点的语言
  title: 'decade', // 站点title
  description: '王小明的vuepress', // 站点的描述
  head: [], // 在最终渲染出的 HTML 的 <head> 标签内加入的额外标签
  // locales: {}, // 多语言支持的各个语言 locales
  bundler: viteBundler(),
  theme: defaultTheme({
    ...baseConfig,
    navbar,
  }),
});
