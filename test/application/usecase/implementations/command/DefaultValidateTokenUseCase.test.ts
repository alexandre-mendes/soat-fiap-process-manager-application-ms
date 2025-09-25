import { DefaultValidateTokenUseCase } from "../../../../../src/application/usecase/implementations/command/DefaultValidateTokenUseCase";
import { UserGateway } from "../../../../../src/application/gateway/UserGateway";
import { Output } from "../../../../../src/application/usecase/ValidateTokenUseCase";

describe('DefaultValidateTokenUseCase', () => {
  let useCase: DefaultValidateTokenUseCase;
  let mockUserGateway: jest.Mocked<UserGateway>;

  beforeEach(() => {
    mockUserGateway = {
      validateToken: jest.fn(),
      findById: jest.fn()
    };
    useCase = new DefaultValidateTokenUseCase(mockUserGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Deve retornar resposta válida do gateway', async () => {
  const output: Output = { valid: true, decoded: { userId: 'user-1' } };
    mockUserGateway.validateToken.mockResolvedValue(output);
    const result = await useCase.execute('token-123');
    expect(mockUserGateway.validateToken).toHaveBeenCalledWith('token-123');
    expect(result).toEqual(output);
  });

  test('Deve retornar { valid: false } em caso de erro', async () => {
    mockUserGateway.validateToken.mockRejectedValue(new Error('Falha'));
    const result = await useCase.execute('token-err');
    expect(result).toEqual({ valid: false });
  });
});
