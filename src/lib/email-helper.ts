import nodemailer from 'nodemailer';

const { MAILER_AUTH_USER, MAILER_AUTH_PASS, MAILER_HOST, MAILER_PORT } =
  process.env;

const transporter = nodemailer.createTransport({
  auth: {
    user: MAILER_AUTH_USER,
    pass: MAILER_AUTH_PASS,
  },
  host: MAILER_HOST,
  port: Number(MAILER_PORT),
});

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  from,
  to,
  subject,
  html,
}: SendEmailParams) => {
  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.info('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};