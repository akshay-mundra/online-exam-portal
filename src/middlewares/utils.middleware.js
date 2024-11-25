const readXlsxFile = require('read-excel-file/node');
const csvParser = require('csv-parser');
const fs = require('fs');
const commonHelpers = require('../helpers/common.helper');

const convertUserFileToObject = async (req, res, next) => {
  const userObjArray = [];
  const path = 'src/uploads/' + req?.file?.originalname;
  const fileExtension = req?.file?.originalname?.split('.').pop();

  try {
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      await readXlsxFile(fs.createReadStream(path)).then(rows => {
        rows.shift();

        rows.forEach(row => {
          const tempObj = {
            id: row[0],
            firstName: row[1],
            lastName: row[2],
            email: row[3],
            password: row[4]
          };
          userObjArray.push(tempObj);
        });
      });

      req.body = { users: userObjArray };
      return next();
    } else if (fileExtension === 'csv') {
      fs.createReadStream(path)
        .pipe(csvParser())
        .on('data', row => {
          const tempObj = {
            id: row?.id ? row.id : null,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            password: row.password
          };
          userObjArray.push(tempObj);
        })
        .on('end', () => {
          req.body = { users: userObjArray };
          return next();
        });
    } else {
      commonHelpers.throwCustomError('Invalid file format. Only .xlsx, .xls, or .csv files are allowed', 422);
    }
  } catch (error) {
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
};

const convertQuestionFileToObject = async (req, res, next) => {
  const questionsObjArray = [];
  const path = 'src/uploads/' + req?.file?.originalname;
  const fileExtension = req?.file?.originalname?.split('.').pop();

  try {
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      await readXlsxFile(fs.createReadStream(path)).then(rows => {
        rows.shift();

        rows.forEach(row => {
          const tempObj = {
            question: row[0],
            type: row[1],
            negativeMarks: row[2]
          };

          const optionsCount = row[3];
          const options = [];
          for (let i = 0; i < optionsCount; i++) {
            const col = i * 3 + 4;
            options.push({
              option: row[col],
              isCorrect: row[col + 1],
              marks: row[col + 2]
            });
          }
          tempObj.options = options;

          questionsObjArray.push(tempObj);
        });
      });

      req.body.questions = questionsObjArray;

      return next();
    } else if (fileExtension === 'csv') {
      fs.createReadStream(path)
        .pipe(csvParser({ headers: false, skipLines: 1 }))
        .on('data', row => {
          const tempObj = {
            question: row[0],
            type: row[1],
            negativeMarks: row[2]
          };

          const optionsCount = row[3];
          const options = [];
          for (let i = 0; i < optionsCount; i++) {
            const col = i * 3 + 4;
            options.push({
              option: row[col],
              isCorrect: row[col + 1],
              marks: row[col + 2]
            });
          }
          tempObj.options = options;

          questionsObjArray.push(tempObj);
        })
        .on('end', () => {
          req.body.questions = questionsObjArray;
          return next();
        });
    } else {
      commonHelpers.throwCustomError('Invalid file format. Only .xlsx, .xls, or .csv files are allowed', 422);
    }
  } catch (error) {
    commonHelpers.errorHandler(req, res, error.message, error.statusCode);
  }
};

module.exports = { convertUserFileToObject, convertQuestionFileToObject };
