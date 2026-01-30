import { InjectModel } from '@nestjs/mongoose';
import { IColaboratorRepository } from 'src/domain/repositories/colaborator.repository';
import { ColaboratorDocument } from '../colaborator.schema';
import { Model } from 'mongoose';

export class ColaboratorRepository implements IColaboratorRepository {
  constructor(
    @InjectModel('Colaborator')
    private readonly colaboratorModel: Model<ColaboratorDocument>,
  ) {}

  async save(colaborator: any): Promise<any> {
    const createdColaborator = new this.colaboratorModel(colaborator);
    const created = await createdColaborator.save();
    return await created.save();
  }

  async findByEmail(email: string): Promise<any> {
    return await this.colaboratorModel.findOne({ email: email }).exec();
  }
}
