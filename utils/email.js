const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlTotext = require('html-to-text');

module.exports= class Email {
  constructor(user, url){
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Suman <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    if(process.env.NODE_ENV === 'production'){
      //sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      secure:false,
      logger: true,
      tls :{
        rejectUnauthorized: true,
      }
    });
  }

  async send(template, subject){
    //sending actual email
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
      firstName: this.firstName,
      url: this.url,
      subject
    });
    //define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlTotext.convert(html)
    
    };

    await this.newTransport().sendMail(mailOptions);

  }

  async sendWelcome(){
    await this.send('welcome', 'welcome to the moktan family');
  }

  async sendPasswordReset(){
    await this.send('passwordReset', 'your password reset token (valid for only 10 min)');
  }
};

// const sendEmail = async option => {
  // 1) Create a transporter
  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD
  //   },
  //   secure:false,
  //   logger: true,
  //   tls :{
  //     rejectUnauthorized: true,
  //   }
  // });

  // 2) Define the email options
  // const mailOptions = {
  //   from: 'Suman <hello@suman.io>',
  //   to: option.email,
  //   subject: option.subject,
  //   text: option.message
  //   // html:
  // };

  // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };


