const cron = require('node-cron');
const moment = require('moment');
const { Exam, User } = require('../models');
const nodemailerHelpers = require('../helpers/nodemailer.helper');
const { Op } = require('sequelize');
const { calculateUserScore } = require('../helpers/users-exams.helper');

// Helper function to send email
const sendExamResultEmail = async (userEmail, examDetails, score) => {
  const mailOptions = {
    to: userEmail,
    subject: 'Your Exam Result is Here!',
    message: `Dear user,
    Your score for the exam "${examDetails.title}" is: \n
    Total Marks: ${score}`
  };

  await nodemailerHelpers.sendEmail(mailOptions);
};

// Cron job to check for exams ending soon
cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Checking for exams that have ended and sending results');

    const currentTime = moment.utc();
    const rangeTime = currentTime.clone().subtract(5, 'minutes');

    const endingExams = await Exam.findAll({
      where: {
        end_time: {
          [Op.between]: [rangeTime.toDate(), currentTime.toDate()]
        }
      }
    });

    for (const exam of endingExams) {
      const users = await User.findAll({
        where: {},
        include: [
          {
            model: Exam,
            where: { id: exam.id },
            through: {
              where: { status: 'completed', deleted_at: null },
              attributes: ['id']
            },
            required: true,
            plain: true
          }
        ]
      });

      for (const user of users) {
        const userEmail = user.email;

        const score = await calculateUserScore(user.Exams[0].users_exams);

        await sendExamResultEmail(userEmail, exam, score);
      }
    }
  } catch (error) {
    console.error('Error sending exam results:', error);
  }
});
