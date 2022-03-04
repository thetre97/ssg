import WindiCSS from 'vite-plugin-windicss'

export default {
  vitePlugins: [WindiCSS({
    scan: {
      runOnStartup: true,
      include: ['**/*.vue']
    }
  })]
}
