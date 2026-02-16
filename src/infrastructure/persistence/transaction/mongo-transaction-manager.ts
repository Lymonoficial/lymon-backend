import {
  TransactionContext,
  TransactionManager,
} from '@/domain/shared/transaction-manager.interface';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ClientSession, Connection } from 'mongoose';

class MongoTransactionContext implements TransactionContext {
  constructor(private readonly session: ClientSession) {}

  getContext(): ClientSession {
    return this.session;
  }
}

@Injectable()
export class MongoTransactionManager implements TransactionManager {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async executeInTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const context = new MongoTransactionContext(session);
      const result = await operation(context);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
