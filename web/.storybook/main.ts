import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  framework: '@storybook/react-vite',

  async viteFinal(viteConfig) {
    const { default: tailwindcss } = await import('@tailwindcss/vite');
    viteConfig.plugins = [
      ...(viteConfig.plugins ?? []).filter(
        (plugin) =>
          plugin &&
          typeof plugin === 'object' &&
          'name' in plugin &&
          plugin.name !== 'vite:storybook-inject-mocker-runtime',
      ),
      tailwindcss(),
    ];
    return viteConfig;
  },

  addons: ['@chromatic-com/storybook']
};

export default config;
