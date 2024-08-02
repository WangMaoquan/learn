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
        text: 'Proxy',
      },
      {
        prefix: 'reactivity',
        text: 'ReactiveEffect',
        link: 'reactivity/reactiveEffect',
      },
    ],
  },
  {
    text: 'Pinia',
    link: 'pinia',
  },
  {
    text: '调试源码',
    link: 'debugger-source-code',
  },
  {
    text: '组件的挂载与渲染',
    link: 'render-flow',
  },
  {
    text: 'props的初始化',
    link: 'init-props',
  },
  {
    text: 'scheduler调度器',
    link: 'scheduler',
  },
  {
    text: 'directive',
    link: 'directive',
  },
]);
