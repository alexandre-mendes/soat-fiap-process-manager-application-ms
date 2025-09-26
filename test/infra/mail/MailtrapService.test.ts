import { MailtrapService, MailtrapServiceOptions } from '../../../src/infra/mail/MailtrapService';
import nodemailer from 'nodemailer';

describe('MailtrapService', () => {
  const options: MailtrapServiceOptions = {
    host: 'smtp.mailtrap.io',
    port: 2525,
    user: 'user',
    pass: 'pass',
  };

  let mailtrapService: MailtrapService;

  beforeEach(() => {
    mailtrapService = new MailtrapService(options);
  });

  it('deve criar o transporter corretamente', () => {
    expect(mailtrapService).toBeDefined();
    // O transporter deve estar definido
    // @ts-ignore
    expect(mailtrapService.transporter).toBeDefined();
  });

  it('deve enviar email usando nodemailer', async () => {
    const sendMailMock = jest.fn().mockResolvedValueOnce({});
    // @ts-ignore
    mailtrapService.transporter.sendMail = sendMailMock;

    await mailtrapService.sendMail({
      to: 'destinatario@teste.com',
      subject: 'Assunto do Teste',
      html: '<b>Mensagem</b>',
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'notificacoes@fiapx.com.br',
      to: 'destinatario@teste.com',
      subject: 'Assunto do Teste',
      html: '<b>Mensagem</b>',
    });
  });

  it('deve permitir sobrescrever o campo from', async () => {
    const sendMailMock = jest.fn().mockResolvedValueOnce({});
    // @ts-ignore
    mailtrapService.transporter.sendMail = sendMailMock;

    await mailtrapService.sendMail({
      to: 'destinatario@teste.com',
      subject: 'Assunto do Teste',
      html: '<b>Mensagem</b>',
      from: 'custom@fiapx.com.br',
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'custom@fiapx.com.br',
      to: 'destinatario@teste.com',
      subject: 'Assunto do Teste',
      html: '<b>Mensagem</b>',
    });
  });
});
