import { DefaultProcessGateway } from '../../../src/infra/queue/DefaultProcessGateway';
import { Process } from '../../../src/domain/entity/Process';

describe('DefaultProcessGateway', () => {
  let messageProducerMock: any;
  let gateway: DefaultProcessGateway;

  beforeEach(() => {
    messageProducerMock = { send: jest.fn() };
    gateway = new DefaultProcessGateway(messageProducerMock);
  });

  test('send deve enviar mensagem com processId e fileId', async () => {
    const process = new Process({ id: 'u1', name: 'User' }, 'file', 'fileId');
    process.id = 'p1';
    await gateway.send(process);
    expect(messageProducerMock.send).toHaveBeenCalledWith({ processId: 'p1', fileId: 'fileId' });
  });
});
