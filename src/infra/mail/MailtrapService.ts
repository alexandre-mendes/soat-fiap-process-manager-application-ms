import nodemailer from 'nodemailer';

export interface MailtrapServiceOptions {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export class MailtrapService {
  private transporter: nodemailer.Transporter;

  constructor(options: MailtrapServiceOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      auth: {
        user: options.user,
        pass: options.pass,
      },
    });
  }

  async sendMail({
    to,
    subject,
    html,
    from,
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: from || 'notificacoes@fiapx.com.br',
      to,
      subject,
      html,
    });
  }
}
