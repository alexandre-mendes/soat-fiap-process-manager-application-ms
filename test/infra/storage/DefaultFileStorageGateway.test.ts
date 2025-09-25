import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DefaultFileStorageGateway } from '../../../src/infra/storage/DefaultFileStorageGateway';
import { DomainError } from '../../../src/domain/error/DomainError';
import { Readable } from 'stream';

jest.mock('@aws-sdk/client-s3');

const mockSend = jest.fn();
(S3Client as jest.Mock).mockImplementation(() => ({ send: mockSend }));

describe('DefaultFileStorageGateway', () => {
  let gateway: DefaultFileStorageGateway;
  beforeEach(() => {
    jest.clearAllMocks();
    gateway = new DefaultFileStorageGateway();
  });

  it('deve fazer upload de arquivo com sucesso', async () => {
    mockSend.mockResolvedValueOnce({});
    const file = { buffer: Buffer.from('conteudo'), mimetype: 'application/zip' } as Express.Multer.File;
    const key = await gateway.uploadFile(file);
    expect(typeof key).toBe('string');
    expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
  });

  it('deve lançar erro ao falhar no upload', async () => {
    mockSend.mockRejectedValueOnce(new Error('erro upload'));
    const file = { buffer: Buffer.from('conteudo'), mimetype: 'application/zip' } as Express.Multer.File;
    await expect(gateway.uploadFile(file)).rejects.toThrow('Erro ao enviar para o S3');
  });

  it('deve fazer download de arquivo com sucesso', async () => {
    const stream = new Readable();
    stream.push('conteudo');
    stream.push(null);
    mockSend.mockResolvedValueOnce({
      Body: stream,
      ContentType: 'application/zip',
      ContentLength: 123
    });
    const result = await gateway.downloadFile('zip-key-123');
    expect(result.stream).toBe(stream);
    expect(result.contentType).toBe('application/zip');
    expect(result.contentLength).toBe(123);
    expect(mockSend).toHaveBeenCalledWith(expect.any(GetObjectCommand));
  });

  it('deve lançar DomainError se arquivo não encontrado no download', async () => {
    mockSend.mockResolvedValueOnce({ Body: undefined });
    await expect(gateway.downloadFile('zip-key-404')).rejects.toThrow(DomainError);
  });

  it('deve lançar DomainError se S3 retorna 404', async () => {
    const error: any = new Error('not found');
    error.$metadata = { httpStatusCode: 404 };
    mockSend.mockRejectedValueOnce(error);
    await expect(gateway.downloadFile('zip-key-404')).rejects.toThrow(DomainError);
  });

  it('deve lançar erro genérico se S3 falha no download', async () => {
    mockSend.mockRejectedValueOnce(new Error('erro download'));
    await expect(gateway.downloadFile('zip-key-err')).rejects.toThrow('Erro ao baixar o arquivo zip-key-err do S3: erro download');
  });

  it('deve deletar arquivo com sucesso', async () => {
    mockSend.mockResolvedValueOnce({});
    await gateway.deleteFile('zip-key-del');
    expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
  });

  it('deve lançar erro ao falhar na deleção', async () => {
    mockSend.mockRejectedValueOnce(new Error('erro delete'));
    await expect(gateway.deleteFile('zip-key-del')).rejects.toThrow('Erro ao deletar o arquivo ZIP do S3');
  });
});
