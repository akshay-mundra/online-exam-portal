const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter(req, file, callback) {
    const fileTypes = /\.(xlsx|csv|xls)$/i;
    if (!file.originalname.match(fileTypes)) {
      return callback(
        new Error('Only .xlsx or .csv files are allowed!'),
        false,
      );
    }
    callback(null, true);
  },
});

module.exports = { upload };
