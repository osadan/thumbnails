const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { copyFileToGCS } = require('./lib/upload.js');
const logger = require('loglevel');
const { fileExistsMiddleware, createThumbnail } = require('./lib/file.middlewares')




const app = express();

// default options
app.use(cors())
app.use(fileUpload());
app.use('/files', express.static(path.join(__dirname, 'files/thumbnail')))


// todo add option to set up the resolution (width , height quality)
app.post('/upload', [fileExistsMiddleware], async (req, res) => {
  const sampleFile = req.files.File;
  const { data, ...rest } = sampleFile;
  try {
    const { thumbnailPath, tmpFileName } = await createThumbnail(sampleFile);
    logger.log('before copy file to gcs', tmpFileName, thumbnailPath)
    const publicUrl = await copyFileToGCS(thumbnailPath, 'lh-thumbnails', { publicRead: true })
    logger.log('copy file to gcs callback', publicUrl)
    res.status(200).json({
      message: 'fileuploaded',
      data: {
        ...rest,
        internalPath: `/files/${tmpFileName}`,
        externalPath: publicUrl
      }
    });
  }
  catch (err) {
    logger.error(err);
    res.status(500).send(err);
  }
});

app.post('/generate', [fileExistsMiddleware], async (req, res) => {
  try {
    const { thumbnailPath, tmpFileName } = await createThumbnail(req.files.File);
    logger.log('create thumbnail result', thumbnailPath)
    const { data, ...rest } = req.files.File;

    const imageAsBase64 = fs.readFileSync(thumbnailPath, 'base64');

    res.status(201).send({ data: { ...rest, base64: 'data:image/png;base64, ' + imageAsBase64 } })
  } catch (err) {
    logger.error(err);
    res.status(500).send(err)
  }
})

app.use(function (req, res, next) {
  logger.log('%s %s %s', req.method, req.url, req.path)
  next()
})

app.listen(3001, () => {
  logger.setLevel(logger.levels.DEBUG);
  logger.log('server up and running')
})