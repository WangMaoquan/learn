import { ThemeOptions } from 'vuepress-theme-hope';
const navbar: ThemeOptions['navbar'] = [
  {
    text: '首页',
    link: '/',
  },
  {
    text: '学习',
    children: [
      {
        text: 'vue',
        link: '/learn-vue/',
      },
      {
        text: 'snabbdom',
        link: '/learn-snabbdom/',
      },
      {
        text: 'ts',
        link: '/learn-typescript',
      },
      {
        text: 'webpack',
        link: '/learn-webpack',
      },
    ],
  },
  {
    text: '面试',
    link: '/interview/',
  },
  {
    text: '关于我',
    link: '/about/',
  },
];

export default navbar;
