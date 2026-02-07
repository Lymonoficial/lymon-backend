import { Colaborator } from '../entities/colaborator.entity';

export interface IColaboratorRepository {
  save(
    colaborator: Omit<Colaborator, 'id'> | Colaborator,
  ): Promise<Colaborator>;
  findByEmail(email: string): Promise<Colaborator | null>;
}
