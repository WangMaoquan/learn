import { defineUserConfig } from 'vuepress';
import { theme, userConfig } from './configs/index.js';

export default defineUserConfig({
  ...userConfig,
  theme,
});
