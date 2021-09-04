import type { AWS } from '@serverless/typescript';
import { getProductsById, getProductsList, postProduct } from '@functions/index';

const serverlessConfiguration: AWS = {
  useDotenv: true,
  service: 'product-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    stage: 'dev',
    profile: 'default',
    region: 'eu-west-1',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      EXCHANGE_RATE_API_KEY: '${env:EXCHANGE_RATE_API_KEY}',
      BUCKET_URI: '${env:BUCKET_URI}',
      CORS_ORIGIN: '${env:CORS_ORIGIN}',
      PGUSER:'${env:PGUSER}',
      PGHOST:'${env:PGHOST}',
      PGPASSWORD:'${env:PGPASSWORD}',
      PGDATABASE:'${env:PGDATABASE}',
      PGPORT:'${env:PGPORT}',
    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { getProductsList, getProductsById, postProduct },
};

module.exports = serverlessConfiguration;
