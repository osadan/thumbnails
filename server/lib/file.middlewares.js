
const path = require('path');
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
  console.log("INIT_CWD", INIT_CWD)
  const naturalNameGenerator = new NaturalNameGenerator();
  const extName = path.extname(file.name).toLowerCase().replace('.', '');
  const tmpFileName = naturalNameGenerator.generate(extName); //to avoid collisions 
  logger.log('tmp file name created', tmpFileName);
  const uploadPath = INIT_CWD + '/files/' + tmpFileName;
  const tmp = await file.mv(uploadPath);

  //logger.log('return of file.mv', tmp)
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
    throw new Error('file was not generated')
  }
  return { thumbnailPath: outPath, tmpFileName };
}


module.exports = {
  fileExistsMiddleware,
  createThumbnail
}