import path from "path"

export default {
  test: {
    setupFiles: ['dotenv/config']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@controllers': path.resolve(__dirname, 'src/controllers'),
      '@exceptions': path.resolve(__dirname, 'src/exceptions'),
      '@interfaces': path.resolve(__dirname, 'src/interfaces'),
      '@middlewares': path.resolve(__dirname, 'src/middlewares'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@validators': path.resolve(__dirname, 'src/validators')
    }
  }
}