const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split('/')[0];
    this.url = url;
    this.from = `Jose Furtado <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   return sgMail.setApiKey(process.env.SEND_GRID_PASSWORD);

    //   // nodemailer.createTransport({
    //   //   service: 'SendGrid',
    //   //   auth: {
    //   //     user: process.env.SEND_GRID_USERNAME,
    //   //     pass: process.env.SEND_GRID_PASSWORD,
    //   //   },
    //   // });
    // }

    // if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // }
  }

  // SEND THE ACTUAL EMAIL
  async send(template, subject) {
    // RENDER THE HTML BASED ON A PUG TEMPLATE
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName.split(' ')[0],
      url: this.url,
      subject,
    });

    // DEFINE THE EMAIL OPTIONS
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html, { wordwrap: false }),
    };

    // CREATE A TRANSPORT AND SEND EMAIL
    if (process.env.NODE_ENV === 'production') {
      try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        await sgMail.send(mailOptions);
      } catch (err) {
        console.log('SendGrid Error:', err.response);
      }
    } else if (process.env.NODE_ENV === 'development') {
      await this.newTransport().sendMail(mailOptions);
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token! Valid for 10 min.');
  }
};
