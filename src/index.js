import hotMiddleware from 'webpack-hot-middleware';
import webpack from 'atool-build/lib/webpack';
import { join } from 'path';

export default {

  'middleware'() {
    const compiler = this.get('compiler');
    if (!compiler) {
      throw new Error('[error] must used together with dora-plugin-webpack');
    }

    return function* (next) {
      const middleware = hotMiddleware(compiler);
      yield middleware.bind(null, this.req, this.res);
      yield next;
    };
  },

  'webpack.updateConfig.finally'(webpackConfig) {
    const { port } = this;
    const hotEntry = `webpack-hot-middleware/client?path=http://127.0.0.1:${port}/__webpack_hmr`;

    function updateWebpackConfig(config) {
      config.entry = Object.keys(config.entry).reduce((memo, key) => {
        memo[key] = [hotEntry].concat(config.entry[key]);
        return memo;
      }, {});
      return config;
    }

    // 修改 entry, 加上 webpack-hot-middleware/client
    if (Array.isArray(webpackConfig)) {
      webpackConfig = webpackConfig.map(updateWebpackConfig);
    } else {
      webpackConfig = updateWebpackConfig(webpackConfig);
    }

    // Hot reload plugin
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

    // Fallback resolve path for npm2
    webpackConfig.resolve.fallback = webpackConfig.resolve.fallback || [];
    webpackConfig.resolve.fallback.push(join(__dirname, '../node_modules'));

    return webpackConfig;
  },

};
