import { defineUserConfig } from 'vuepress';
import { theme, userConfig } from './configs';

export default defineUserConfig({
  ...userConfig,
  theme,
});
