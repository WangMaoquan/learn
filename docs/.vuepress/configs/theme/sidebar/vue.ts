import { arraySidebar } from 'vuepress-theme-hope';

export const vueSideBar = arraySidebar([
  '',
  '1',
  {
    text: 'Reactivity',
    link: 'reactivity',
    collapsible: true,
    children: [
      {
        prefix: 'reactivity',
        link: 'reactivity/proxy',
        text: 'proxy',
      },
    ],
  },
  {
    text: '调试源码',
    link: 'debugger-source-code',
  },
  {
    text: '挂载与渲染',
    link: 'render-flow',
  },
]);
