
const { Storage } = require('@google-cloud/storage')
const path = require('path');
const logger = require('loglevel');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE
});

exports.getPublicUrl = (bucketName, fileName) => `${process.env.PUBLIC_URL}/${bucketName}/${fileName}`;


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
      console.error(error, 'copyFileToGCS');
      throw error;
    })
    ;
};