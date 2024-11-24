const nodemailer = require('nodemailer');
const { sendEmail } = require('../../src/helpers/nodemailer.helper');

jest.mock('nodemailer');

describe('Nodemailer Helper Functions', () => {
  describe('sendEmail', () => {
    it('should send an email with the given options', async () => {
      const options = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        message: '<h1>Hello World</h1>',
      };

      const sendMailMock = jest.fn().mockResolvedValue('Email sent');
      nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

      await sendEmail(options);

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        auth: {
          user: process.env.SMPT_MAIL,
          pass: process.env.SMPT_APP_PASS,
        },
        authMethod: 'LOGIN',
      });

      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.SMPT_MAIL,
        to: options.to,
        subject: options.subject,
        html: options.message,
      });
    });

    it('should throw an error if sending the email fails', async () => {
      const options = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        message: '<h1>Hello World</h1>',
      };

      const sendMailMock = jest
        .fn()
        .mockRejectedValue(new Error('Failed to send email'));
      nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

      await expect(sendEmail(options)).rejects.toThrow('Failed to send email');
    });
  });
});
