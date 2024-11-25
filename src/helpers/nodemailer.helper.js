const nodeMailer = require('nodemailer');

// send mail for the given options
async function sendEmail(options) {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_APP_PASS
    },
    authMethod: 'LOGIN'
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.to,
    subject: options.subject,
    html: options.message
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
