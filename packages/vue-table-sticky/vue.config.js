
module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.csv$/,
          loader: 'csv-loader',
          options: {
            dynamicTyping: true,
            header: true,
            skipEmptyLines: true
          }
        }
        // {
        //   test: /\.ya?ml$/,
        //   type: 'json', // Required by Webpack v4
        //   use: 'yaml-loader'
        // }
      ]
    }
  }
}