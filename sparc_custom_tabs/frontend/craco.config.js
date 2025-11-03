// craco.config.js
// Ensures .mjs files under node_modules are treated as JS and that fullySpecified is disabled
// so packages like apache-arrow with extension-less ESM imports are resolved by webpack.
//
// Usage:
// 1) npm install @craco/craco --save-dev
// 2) replace react-scripts with craco in package.json scripts (see below)
// 3) rm -rf node_modules package-lock.json && npm install
// 4) npm run start / npm run build
module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.resolve = webpackConfig.resolve || {}
  
        // Ensure .mjs is resolved
        webpackConfig.resolve.extensions = webpackConfig.resolve.extensions || ['.js', '.json']
        if (!webpackConfig.resolve.extensions.includes('.mjs')) {
          webpackConfig.resolve.extensions.push('.mjs')
        }
  
        // Ensure module.rules exists
        webpackConfig.module = webpackConfig.module || { rules: [] }
  
        // Add a rule for .mjs and .js files within node_modules:
        // - treat them as javascript/auto so webpack can parse them
        // - set resolve.fullySpecified = false to allow extension-less imports in ESM files
        // (this addresses "Add the extension to the request" / fully-specified import errors)
        webpackConfig.module.rules.push({
          test: /\.m?js$/,
          include: /node_modules/,
          type: 'javascript/auto',
          resolve: {
            fullySpecified: false
          }
        })
  
        return webpackConfig
      }
    }
  }