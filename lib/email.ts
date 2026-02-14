import nodemailer from 'nodemailer';

interface Attachment {
  filename: string;
  path: string;
  encoding?: string;
  contentType?: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}

export async function sendEmail({ to, subject, html, attachments }: EmailOptions): Promise<void> {
  const {
    EMAIL_SERVER,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASSWORD,
    EMAIL_FROM,
  } = process.env;

  if (!EMAIL_SERVER || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_FROM) {
    console.error('Missing email configuration. Please check environment variables.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_SERVER,
      port: Number(EMAIL_PORT),
      secure: Number(EMAIL_PORT) === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
      connectionTimeout: 10000,
      socketTimeout: 20000,
      debug: false, // Turn off debug in production to avoid logging sensitive info
    });

    await transporter.sendMail({
      from: `"Siemka Design Tool" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments,
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
