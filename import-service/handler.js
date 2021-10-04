'use strict';
const AWS = require('aws-sdk');
const csv = require('csv-parser');
const util = require('util');
const stream = require('stream');
const pg = require('pg');

const BUCKET = 'rss-task-5';
const DB_CONFIG = {
  ssl: {rejectUnauthorized: false},
  connectionTimeoutMillis: 5000
};
const CREATE_PRODUCT = 'select new_product($1, $2, $3, $4, $5)';

const finished = util.promisify(stream.finished);

module.exports.importProductsFile = async (event) => {
  console.log(event);
  let signedUrl;
  try {
    const filename = event.queryStringParameters.name;
    const s3 = new AWS.S3({region: 'eu-west-1'});
    signedUrl = await s3.getSignedUrlPromise('putObject', {
      Bucket: BUCKET,
      Key: `uploaded/${filename}`,
      Expires: 60,
      ContentType: 'text/csv'
    });
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: String(e)
      })
    };
  }

  return {
    statusCode: 202,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: signedUrl
  };
};

module.exports.importFileParser = async (event) => {
  console.log(event);
  const handle = () => {
    return new Promise(() => {
      const s3 = new AWS.S3({region: 'eu-west-1'});
      const sqs = new AWS.SQS({region: 'eu-west-1'});

      const fn = async (record) => {
        const results = [];
        const s3Stream = s3.getObject({
          Bucket: BUCKET,
          Key: record.s3.object.key
        }).createReadStream();

        await finished(
          s3Stream.pipe(csv())
            .on('data', (data) => {
              console.log(data);
              results.push({...data, price: +data.price, count: +data.count});
            })
            .on('end', async () => {
              console.log(`Copy from ${BUCKET}/${record.s3.object.key}`);

              await s3.copyObject({
                Bucket: BUCKET,
                CopySource: `${BUCKET}/${record.s3.object.key}`,
                Key: record.s3.object.key.replace('uploaded', 'parsed')
              }).promise();

              console.log(`Copied into ${BUCKET}/${record.s3.object.key.replace('uploaded', 'parsed')}`);

              await s3.deleteObject({
                Bucket: BUCKET,
                Key: record.s3.object.key
              }).promise();

              console.log(`Deleted ${BUCKET}/${record.s3.object.key}`);
            })
        );
        results.forEach(item => {
          sqs.sendMessage({
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify(item)
          }, (error, data) => {
            if (error) {
              console.log(`Error for send to SQS: ${error}`);
            } else {
              console.log(`Message was sent to SQS: ${data}`);
            }
          });
        });

      };
      event.Records.forEach(fn);
    });
  };

  await handle();
  console.log('finish');
};

module.exports.catalogBatchProcess = (event) => {

  const sns = new AWS.SNS({region: 'eu-west-1'});
  const client = new pg.Client(DB_CONFIG);

  const fn = async (event) => {
    try {
      console.log(event);
      const item = JSON.parse(event.body);
      await client.connect();
      await client.query(CREATE_PRODUCT, [item.title, item.description || '', item.price, item.img || '', item.count || 0]);
      sns.publish({
        Subject: 'A new product was added',
        Message: JSON.stringify(item),
        TopicArn: process.env.SNS_ARN
      }, (err, data) => {
        console.log('Publish result: ' + (err || JSON.stringify(data)));
      });
    } catch (e) {
      console.log('Creating product error: ' + e);
    }
  };

  event.Records.forEach(fn);
};
