import { hopeTheme } from 'vuepress-theme-hope';
import { baseConfig } from './baseConfig';
import author from './author';
import navbar from './navbar';
import plugins from './plugins';
import blog from './blog';
import { customSideBar as sidebar } from './sidebar';
export default hopeTheme({
  ...baseConfig,
  navbar,
  author,
  plugins,
  blog,
  sidebar,
});
