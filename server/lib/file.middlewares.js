
const path = require('path');
const { promises: fs } = require('fs');
const logger = require('loglevel');
const filepreview = require('./filepreview.js')
const NaturalNameGenerator = require('natural-filename-generator');




const fileExistsMiddleware = (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    logger.warn('no files were uploaded');
    return res.status(400).send('No files were uploaded.');
  } else {
    next();
  }
}



const createThumbnail = async (file, thumbnailOptions = {}) => {
  const { INIT_CWD } = process.env;
  const naturalNameGenerator = new NaturalNameGenerator();
  const extName = path.extname(file.name).toLowerCase().replace('.', '');
  const tmpFileName = naturalNameGenerator.generate(extName); //to avoid collisions 
  logger.log('tmp file name created', tmpFileName);
  const uploadPath = INIT_CWD + '/files/' + tmpFileName;
  logger.log("uploadPathName", uploadPath)
  await file.mv(uploadPath);



  const options = {
    width: 300,
    height: 200,
    quality: 100,
    background: '#fff',
    pdf: false,
    keepAspect: true,
    pdf_path: path.resolve("files", "pdfs"),
    ...thumbnailOptions
  }
  const outPath = path.resolve("files", "thumbnail", "", `${tmpFileName.replace(/\.[^/.]+$/, "")}.png`);

  const result = filepreview.generateSync(uploadPath, outPath, options)
  logger.log('file is generated', uploadPath)
  if (!result) {
    throw new Error('file was not generated ' + uploadPath)
  }
  return { thumbnailPath: outPath, tmpFileName };
}

const clearFiles = async (filesPath) => {
  const files = await fs.readdir(filesPath, {})
  for (const file of files) {
    const filePath = path.join(filesPath, file);
    const fileStat = await fs.stat(filePath);
    if (!fileStat.isDirectory()) {
      await fs.unlink(filePath);
    } else {
      await clearFiles(filePath)
    }
  }
}



module.exports = {
  fileExistsMiddleware,
  createThumbnail,
  clearFiles
}