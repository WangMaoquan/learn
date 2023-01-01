import { hopeTheme } from 'vuepress-theme-hope';
import { baseConfig } from '../baseConfig';
import author from './author';
import navbar from './navbar';
export default hopeTheme({
  ...baseConfig,
  navbar,
  author,
});
