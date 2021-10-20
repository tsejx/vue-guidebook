const config = {
  mode: 'site',
  title: 'Vue Guidebook',
  description: 'Vue 完全知识体系',
  base: '/vue-guidebook/',
  publicPath: '/vue-guidebook/',
  favicon: './favicon.ico',
  logo: 'https://img.mrsingsing.com/vue-guidebook-logo.png',
  hash: true,
  exportStatic: {},
  theme: {
    '@c-primary': '#42b983',
  },
  navs: [
    null,
    {
      title: 'Github',
      path: 'https://github.com/tsejx/vue-guidebook',
    },
  ],
};

if (process.env.NODE_ENV !== 'development') {
  config.ssr = {};
}

export default config;
