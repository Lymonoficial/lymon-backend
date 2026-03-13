export const TRANSACTION_MANAGER = 'TRANSACTION_MANAGER';

export interface TransactionManager {
  executeInTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T>;
}

export interface TransactionContext {
  getContext(): TransactionContextData;
}
