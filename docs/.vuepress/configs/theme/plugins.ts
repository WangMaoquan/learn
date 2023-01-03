import { ThemeOptions } from 'vuepress-theme-hope';

const plugins: ThemeOptions['plugins'] = {
  // 开启博客功能
  blog: true,
  mdEnhance: {
    tasklist: true, // 开启任务列表
    tabs: true, // 开启选项卡
    mermaid: true,
    codetabs: true,
    // 启用 figure
    figure: true,
    // 启用图片懒加载
    imgLazyload: true,
    // 启用图片标记
    imgMark: true,
    // 启用图片大小
    imgSize: true,
    include: true,
    mark: true,
    flowchart: true,
  },
};

export default plugins;
