// craco.config.js
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        // Ensure .mjs is resolved
        if (!webpackConfig.resolve) webpackConfig.resolve = {}
        webpackConfig.resolve.extensions = webpackConfig.resolve.extensions || ['.js', '.json']
        if (!webpackConfig.resolve.extensions.includes('.mjs')) {
          webpackConfig.resolve.extensions.push('.mjs')
        }
  
        // Add rule so that .mjs in node_modules is handled as javascript/auto (resolves fullySpecified imports)
        const hasMjsRule = (webpackConfig.module.rules || []).some(
          (r) => r.test && r.test.toString().includes('\\.mjs')
        )
        if (!hasMjsRule) {
          webpackConfig.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto'
          })
        }
  
        return webpackConfig
      }
    }
  }