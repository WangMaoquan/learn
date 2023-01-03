import { snabbdomSideBar } from './snabbdom';
import { vueSideBar } from './vue';
import { sidebar } from 'vuepress-theme-hope';

export const customSideBar = sidebar({
  '/learn-vue/': vueSideBar,
  '/learn-snabbdom': snabbdomSideBar,
});
