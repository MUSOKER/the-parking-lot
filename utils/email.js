//NB DOWNLOAD ALL THE PACKAGES INVOLVED
const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");
const AppError = require("./appError");

module.exports = class Email {
  constructor(recipient, subject, text_message) {
    //NB the receipt could be a user
    //you could still use the if else for production and deveopment differentiation bt fot this case do not use this.transport object but raher define it as a method still inside this Email class ie newTransport(){}

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME, // the email created
        pass: process.env.EMAIL_PASSWORD, //Password generated
      },
    });
    (this.to = recipient.email),
      (this.firstName = recipient.firstName),
      (this.from = `Rogers Musoke <${process.env.EMAIL_FROM}>`), //This could still be defined in the configenv
      (this.subject = subject),
      (this.text = text_message);
  }
  //For the pug html rendering
  async send(html, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
      html,
    };
    try {
      //The send picks both the transporter and the mail options
      await this.transporter.sendMail(mailOptions);
    } catch (err) {
      console.log("error sending email", err);
      new AppError("failed to send email", 403);
    }
  }
  async sendEmail() {
    try {
      await this.transporter.sendMail(this.mailOptions);
    } catch (err) {
      console.log("error sending email", err);
      new AppError("failed to send email", 403);
    }
  }
  async sendWelcome() {
    console.log("your welcome");
    const html = pug.renderFile(`${__dirname}/../views/welcome.pug`, {
      firstName: this.firstName,
      subject: this.subject,
    });
    await this.send(html, "Welcome to Roger property");
  }
  async sendUpdates() {
    console.log("new things have been added to our service");
    const html = pug.renderFile(`${__dirname}/../views/welcome.pug`, {
      firstName: this.firstName,
      subject: this.subject,
    });
    await this.send(
      html,
      "There has been an increase in the number of our workers to ease your quick service. thank you"
    );
  }
  async notifySales() {
    console.log("we have gotten a  customer");
    const html = pug.renderFile(`${__dirname}/../views/notification.pug`, {
      firstName: this.firstName,
      subject: this.subject,
    });
    await this.send(html, "We have received a customer");
  }
  async sendPasswordReset(url) {
    const html = pug.renderFile(`${__dirname}/../views/passwordReset.pug`, {
      firstName: this.firstName,
      subject: this.subject,
      url,
    });
    await this.send(html, "Reset Password");
  }
  async sendNotification(object, objName) {
    const html = pug.renderFile(`${__dirname}/../views/notification.pug`, {
      object,
      objName,
    });
    await this.send(html, "Notification");
  }
  async sendVerifyAccount(url) {
    const html = pug.renderFile(`${__dirname}/../views/verifyAccount.pug`, {
      firstName: this.firstName,
      subject: this.subject,
      url,
    });
    await this.send(html, "Verify Account");
  }
};
