import type { AWS } from '@serverless/typescript'

import georgiaScraper from '@functions/georgiaScraper'

const serverlessConfiguration: AWS = {
  service: 'lambda-scraper',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
  },
  functions: {
    georgiaScraper: {
      handler: georgiaScraper.handler,
      memorySize: 1600,
      timeout: 60,
      events: [
        {
          http: {
            method: 'get',
            path: 'georgiaScrapper/{drawDate}/{drawName}/{drawType}',
          },
        },
      ],
    },
  },
}

module.exports = serverlessConfiguration
