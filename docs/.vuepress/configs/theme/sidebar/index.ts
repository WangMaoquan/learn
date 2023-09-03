import { snabbdomSideBar } from './snabbdom.js';
import { vueSideBar } from './vue.js';
import { typescriptSideBar } from './typesciprt.js';
import { sidebar } from 'vuepress-theme-hope';
import { interviewSidebar } from './interview.js';
import { webpackSideBar } from './webpack.js';

export const customSideBar = sidebar({
  '/learn-vue/': vueSideBar,
  '/learn-snabbdom': snabbdomSideBar,
  '/learn-typescript': typescriptSideBar,
  '/interview': interviewSidebar,
  '/webpack': webpackSideBar,
});
