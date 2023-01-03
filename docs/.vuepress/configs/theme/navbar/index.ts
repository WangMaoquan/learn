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
    ],
  },
  {
    text: '关于我',
    link: '/about/',
  },
];

export default navbar;
