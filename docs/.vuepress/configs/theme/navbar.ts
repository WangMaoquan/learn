import { ThemeOptions } from 'vuepress-theme-hope';
const navbar: ThemeOptions['navbar'] = [
  {
    text: '首页',
    link: '/',
  },
  {
    text: '关于我',
    link: '/about/',
  },
  {
    text: 'vue',
    link: '/learn-vue/',
  },
  {
    text: 'snabbdom',
    link: '/learn-snabbdom/',
  },
];

export default navbar;
