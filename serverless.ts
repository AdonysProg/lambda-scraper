import type { AWS } from '@serverless/typescript'

import georgiaScraper from '@functions/georgiaScraper'
import newJerseyScraper from '@functions/newJerseyScraper'

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
      // layers: [
      //   {
      //     'Fn::Sub': [
      //       'arn:aws:lambda:us-east-1:764866452798:layer:chrome-aws-lambda:24',
      //     ],
      //   },
      // ],
      timeout: 60,
      events: georgiaScraper.events,
    },
    newJerseyScraper: {
      handler: newJerseyScraper.handler,
      memorySize: 1600,
      timeout: 60,
      events: newJerseyScraper.events,
    },
  },
}

module.exports = serverlessConfiguration
