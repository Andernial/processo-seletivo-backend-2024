import { DataSourceError } from '@core/error';
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });
import { Resend } from 'resend';
import { Service } from 'typedi';

const apiKey = process.env.RESEND_KEY;

@Service()
export class EmailService {
  private readonly resend: Resend;
  constructor() {
    this.resend = new Resend(apiKey);
  }

  async sendEmail(user: string, email: string, password: string): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your new account password',
      html: `<h1>Congratulations ${user}, your new account is registered!</h1><br><p>Your Account password: ${password}</p>`,
    });

    if (error) {
      throw new DataSourceError('DATA_SOURCE_ERROR: Something went wrong while sending the email!');
    }
  }
}
