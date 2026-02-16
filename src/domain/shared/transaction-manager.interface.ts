export const TRANSACTION_MANAGER = 'TRANSACTION_MANAGER';

export interface TransactionManager {
  executeInTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T>;
}

export interface TransactionContext {
  // Contexto opaco que será usado por los repositorios
  // En MongoDB será ClientSession, en otras DB será otra cosa
  getContext(): unknown;
}
