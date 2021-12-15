
const { Storage } = require('@google-cloud/storage')
const GOOGLE_CLOUD_PROJECT_ID = 'freightos-lh-test'; // Replace with your project ID
const GOOGLE_CLOUD_KEYFILE = './freightos-lh-test-25fa963b1586.json'; // Replace with the path to the downloaded private key
const path = require('path');
const logger = require('loglevel');

const storage = new Storage({
  projectId: GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: GOOGLE_CLOUD_KEYFILE,
});

exports.getPublicUrl = (bucketName, fileName) => `https://storage.googleapis.com/${bucketName}/${fileName}`;


/**
   * Copy file from local to a GCS bucket.
   * Uploaded file will be made publicly accessible.
   *
   * @param {string} localFilePath
   * @param {string} bucketName
   * @param {Object} [options]
   * @return {Promise.<string>} - The public URL of the uploaded file.
   */
exports.copyFileToGCS = (localFilePath, bucketName, options) => {
  options = options || {};
  const bucket = storage.bucket(bucketName);
  const fileName = path.basename(localFilePath);
  const file = bucket.file(fileName);
  return bucket.upload(localFilePath, options)
    .then(() => new Promise(resolve => {
      logger.log('bucket upload success', localFilePath, bucketName);
      resolve();
    }))
    .then(() => file.makePublic())
    .then(() => file.setMetadata({
      cacheControl: 'public, max-age=4200',
    }))
    .then(() => exports.getPublicUrl(bucketName, fileName))
    .catch(error => {
      console.log(error, 'copyFileToGCS');
      throw error;
    })
    ;
};