/**
 * @fileoverview Testes Unitários de Serviço de Notificações (Ruta Espelho)
 * @module Tests/Libs/Notifications
 * @description Validação isolada da lógica de despacho e sinalização Redis.
 * @language pt-BR
 */
import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
// Importación relativa profunda para acceder al archivo fuente desde la raíz de tests
import { NotificationsService } from '../../../../../../libs/notifications/src/lib/notifications.service';

// --- MOCKS DE INFRAESTRUTURA ---

// Mock para Drizzle ORM (Encadeamento fluido)
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  $count: jest.fn(),
};

// Mock para as Tabelas (Objetos simples para referência)
const mockTables = {
  notificationsTable: {
    id: 'id',
    userId: 'userId',
    status: 'status',
    createdAt: 'createdAt',
    isDeleted: 'isDeleted',
    actionId: 'actionId',
    metadata: 'metadata'
  },
  actionCodesTable: {
    id: 'id',
    code: 'code'
  },
};

// Mock para Redis (Upstash)
const mockRedis = {
  incr: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
};

// Interceptação das importações externas
jest.mock('@razworks/database', () => ({
  db: mockDb,
  notificationsTable: mockTables.notificationsTable,
  actionCodesTable: mockTables.actionCodesTable,
}));

jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue(mockRedis),
  },
}));

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('dispatch', () => {
    it('deve salvar a notificação no banco e incrementar o contador no Redis', async () => {
      // Arrange
      const params = {
        userId: 'user-uuid-123',
        actionCode: 'PROJ_CREATED',
        metadata: { title: 'Novo Projeto' },
      };

      // Simulamos que encontramos o código de ação no DB
      mockDb.limit.mockResolvedValueOnce([{ id: 10 }]);

      // Act
      await service.dispatch(params);

      // Assert
      // 1. Verificamos busca do Action ID
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();

      // 2. Verificamos Insert
      expect(mockDb.insert).toHaveBeenCalledWith(mockTables.notificationsTable);
      expect(mockDb.values).toHaveBeenCalledWith(expect.objectContaining({
        userId: params.userId,
        actionId: 10,
        status: 'UNREAD'
      }));

      // 3. Verificamos Redis Incr
      expect(mockRedis.incr).toHaveBeenCalledWith(`user:${params.userId}:unread_count`);
    });

    it('deve abortar silenciosamente se o código de ação não existir', async () => {
      // Arrange
      const params = { userId: '123', actionCode: 'INVALID_CODE', metadata: {} };

      // Simulamos retorno vazio do DB
      mockDb.limit.mockResolvedValueOnce([]);

      // Act
      await service.dispatch(params);

      // Assert
      expect(mockDb.insert).not.toHaveBeenCalled();
      expect(mockRedis.incr).not.toHaveBeenCalled();
    });
  });

  describe('getUserFeed', () => {
    it('deve retornar o feed e o contador do Redis', async () => {
      // Arrange
      const userId = 'user-123';
      const mockItems = [
        {
          id: 'notif-1',
          action: 'PROJ_CREATED',
          metadata: {},
          status: 'UNREAD',
          createdAt: new Date('2025-01-01')
        }
      ];

      // Mock DB Feed Query
      mockDb.offset.mockResolvedValueOnce(mockItems);

      // Mock Redis Count
      mockRedis.get.mockResolvedValueOnce('5');

      // Act
      const result = await service.getUserFeed(userId);

      // Assert
      expect(result.unreadCount).toBe(5);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].action).toBe('PROJ_CREATED');
      expect(result.items[0].createdAt).toBe(mockItems[0].createdAt.toISOString());
    });

    it('deve tratar erros de banco de dados lançando exceção HTTP segura', async () => {
      // Arrange
      mockDb.offset.mockRejectedValueOnce(new Error('DB Connection Failed'));

      // Act & Assert
      await expect(service.getUserFeed('user-123')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('markAsRead', () => {
    it('deve atualizar o status no banco e recalcular o Redis', async () => {
      // Arrange
      const userId = 'user-123';
      const ids = ['notif-1', 'notif-2'];

      // Mock Update
      mockDb.where.mockResolvedValueOnce(undefined);

      // Mock Count (Simulando que sobraram 2 não lidas)
      mockDb.$count.mockResolvedValueOnce(2);

      // Act
      await service.markAsRead(userId, ids);

      // Assert
      expect(mockDb.update).toHaveBeenCalledWith(mockTables.notificationsTable);
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'READ' }));
      expect(mockDb.$count).toHaveBeenCalled();
      expect(mockRedis.set).toHaveBeenCalledWith(`user:${userId}:unread_count`, 2);
    });

    it('não deve fazer nada se a lista de IDs estiver vazia', async () => {
      // Act
      await service.markAsRead('user-123', []);

      // Assert
      expect(mockDb.update).not.toHaveBeenCalled();
      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });
});
