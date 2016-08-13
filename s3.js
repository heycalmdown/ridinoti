const AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

exports.read = (name, def) => {
  return s3.getObject({Bucket: 'ridinoti', Key: name}).promise()
    .then(o => JSON.parse(o.Body))
    .catch(e => {
      if (e.statusCode === 404) return def;
      throw e;
    });
};

exports.write = (name, data) => {
  return s3.putObject({Bucket: 'ridinoti', Key: name, Body: JSON.stringify(data)}).promise();
};
