require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { copyFileToGCS } = require('./lib/upload.js');
const logger = require('loglevel');
const { fileExistsMiddleware, createThumbnail, clearFiles } = require('./lib/file.middlewares')




const app = express();

// default options
app.use(cors())
app.use(fileUpload());
app.use(express.json()); // Used to parse JSON bodies
app.use('/files', express.static(path.join(__dirname, 'files/thumbnail')))

app.use(function (req, res, next) {
  logger.log('%s %s %s', req.method, req.url, req.path, req.body)
  next()
})

cron.schedule('* * */12 * * *', () => {
  clearFiles(path.resolve("files"))
})

// todo add option to set up the resolution (width , height quality)
app.post('/upload', [fileExistsMiddleware], async (req, res) => {
  const sampleFile = req.files.File;
  const { data, ...rest } = sampleFile;
  try {
    const { thumbnailPath, tmpFileName } = await createThumbnail(sampleFile, { width: req.body.width, height: req.body.height });
    logger.log('before copy file to gcs', tmpFileName, thumbnailPath)
    const publicUrl = await copyFileToGCS(thumbnailPath, process.env.BUCKET_NAME, { publicRead: true })
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
    const { thumbnailPath } = await createThumbnail(req.files.File, { width: req.body.width, height: req.body.height });
    logger.log('create thumbnail result', thumbnailPath)
    const { data, ...rest } = req.files.File;
    const imageAsBase64 = fs.readFileSync(thumbnailPath, 'base64');

    res.status(201).send({ data: { ...rest, base64: 'data:image/png;base64, ' + imageAsBase64 } })
  } catch (err) {
    logger.error(err);
    res.status(500).send(err)
  }
})

app.post('/generate-stream', [fileExistsMiddleware], async (req, res) => {
  try {
    const { thumbnailPath } = await createThumbnail(req.files.File, { width: req.body.width, height: req.body.height });
    logger.log('create thumbnail result', thumbnailPath)
    const readStream = fs.createReadStream(thumbnailPath);

    readStream.on('open', function () {
      readStream.pipe(res);
    });

    readStream.on('error', function (err) {
      res.end(err);
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send(err)
  }
})



app.listen(3001, async () => {
  logger.setLevel(logger.levels.DEBUG);
  logger.log('server up and running');
  const filesPath = path.resolve("files")
  clearFiles(filesPath);
})