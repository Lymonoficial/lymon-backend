import {
  TransactionContext,
  TransactionManager,
} from '@/domain/shared/transaction-manager.interface';

const mockTransactionContext: TransactionContext = {
  getContext: jest.fn().mockReturnValue({}),
};

export function createTransactionManagerMock(): jest.Mocked<TransactionManager> {
  return {
    executeInTransaction: jest
      .fn()
      .mockImplementation(
        async (operation: (ctx: TransactionContext) => Promise<unknown>) =>
          operation(mockTransactionContext),
      ),
  };
}
