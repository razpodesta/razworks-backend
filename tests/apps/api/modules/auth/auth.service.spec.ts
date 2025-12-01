// tests/apps/api/modules/auth/auth.service.spec.ts
/**
 * @fileoverview Testes Unitários de Autenticação (Hexagonal)
 * @module Tests/API/Auth
 * @language pt-BR
 */
import { Test, TestingModule } from '@nestjs/testing';
// CORRECCIÓN DE RUTA: 5 niveles hacia arriba para llegar a la raíz desde tests/apps/api/modules/auth
import { AuthService } from '../../../../../apps/api/src/app/modules/auth/auth.service';
import { UserRepositoryPort, User } from '@razworks/core';
import { BadRequestException } from '@nestjs/common';

// Mock del Puerto
const mockUserRepository = {
  exists: jest.fn(),
  save: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
};

describe('AuthService (Integration Suite)', () => {
  let service: AuthService;
  let repository: typeof mockUserRepository;

  beforeAll(() => {
    process.env.SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_KEY = 'mock-key';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepositoryPort,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get(UserRepositoryPort);

    // Mockeamos la instancia privada de supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service as any).supabase = {
      auth: {
        signUp: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-hexagonal-123' } },
          error: null,
        }),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve rejeitar o registro se o email já existir no domínio', async () => {
    repository.exists.mockResolvedValue(true);
    const dto = {
      email: 'duplicate@razworks.com',
      password: 'password123',
      fullName: 'Duplicated User',
      role: 'FREELANCER' as const,
    };

    await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    expect(repository.exists).toHaveBeenCalledWith(dto.email);
  });

  it('deve orquestrar o registro corretamente', async () => {
    repository.exists.mockResolvedValue(false);
    repository.save.mockResolvedValue(undefined);

    const dto = {
      email: 'architect@razworks.com',
      password: 'securePassword!',
      fullName: 'Architect Raz',
      role: 'CLIENT' as const,
    };

    const result = await service.register(dto);

    expect(result.success).toBe(true);
    expect(result.userId).toBe('user-hexagonal-123');
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
