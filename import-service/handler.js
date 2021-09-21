'use strict';
const AWS = require('aws-sdk');
const csv = require('csv-parser');
const util = require('util');
const stream = require('stream');

const BUCKET = 'rss-task-5';

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

      const fn = async (record) => {
        const s3Stream = s3.getObject({
          Bucket: BUCKET,
          Key: record.s3.object.key
        }).createReadStream();

        await finished(
          s3Stream.pipe(csv())
            .on('data', (data) => {
              console.log(data);
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
      };
      event.Records.forEach(fn);
    });
  }

  await handle();
  console.log('finish');
};
