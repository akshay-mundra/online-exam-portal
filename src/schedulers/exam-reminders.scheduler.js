const cron = require('node-cron');
const moment = require('moment');
const { Exam, User } = require('../models');
const nodemailerHelpers = require('../helpers/nodemailer.helper');
const { Op } = require('sequelize');

const sendExamReminderEmail = async (userEmail, examDetails) => {
  const mailOptions = {
    to: userEmail,
    subject: 'Reminder: Your Exam is Starting Soon!',
    message: `Dear user,
      This is a reminder that your exam titled "${examDetails.title}" is starting in 10 minutes.`
  };

  await nodemailerHelpers.sendEmail(mailOptions);
};

cron.schedule('* * * * *', async () => {
  try {
    console.log('Finding upcoming exams and sending mails');

    const currentTime = moment.utc();
    const reminderTime = currentTime.add(10, 'minutes');

    const upcomingExams = await Exam.findAll({
      where: {
        start_time: {
          [Op.between]: [reminderTime.toDate(), reminderTime.clone().add(1, 'minutes').toDate()]
        }
      }
    });

    for (const exam of upcomingExams) {
      const users = await User.findAll({
        attributes: ['email'],
        include: [
          {
            model: Exam,
            attributes: [],
            where: { id: exam.id },
            required: true,
            through: {
              where: { deleted_at: null }
            }
          }
        ]
      });

      for (const user of users) {
        const userEmail = user.email;
        await sendExamReminderEmail(userEmail, exam);
      }
    }
  } catch (error) {
    console.error('Error checking for exams:', error);
  }
});
