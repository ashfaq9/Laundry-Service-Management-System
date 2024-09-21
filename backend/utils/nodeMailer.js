require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true,
  debug: true,
});

const sendEmail = (mailOptions) => {
  return new Promise((resolve, reject) => {
    console.log('Sending email with options:', mailOptions);
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent:', info.response);
        resolve(info);
      }
    });
  });
};


const welcomeEmail = (email) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to our service',
    text: 'Thank you for registering!',
  };

  sendEmail(mailOptions).catch(console.error);
};

const forgetPasswordEmail = (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the link to reset your password: ${process.env.FRONTEND_URL}/reset-password/${token}`,
  };

  sendEmail(mailOptions).catch(console.error);
};

module.exports = {
  sendEmail,
  welcomeEmail,
  forgetPasswordEmail,
};
