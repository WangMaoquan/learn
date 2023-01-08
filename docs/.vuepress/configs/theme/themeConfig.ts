import { hopeTheme } from 'vuepress-theme-hope';
import { baseConfig } from './baseConfig.js';
import author from './author.js';
import navbar from './navbar/index.js';
import plugins from './plugins.js';
import blog from './blog.js';
import { customSideBar as sidebar } from './sidebar/index.js';
export default hopeTheme({
  ...baseConfig,
  navbar,
  author,
  plugins,
  blog,
  sidebar,
});
