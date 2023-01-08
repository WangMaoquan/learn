import { snabbdomSideBar } from './snabbdom.js';
import { vueSideBar } from './vue.js';
import { typescriptSideBar } from './typesciprt.js';
import { sidebar } from 'vuepress-theme-hope';

export const customSideBar = sidebar({
  '/learn-vue/': vueSideBar,
  '/learn-snabbdom': snabbdomSideBar,
  '/learn-typescript': typescriptSideBar,
});
