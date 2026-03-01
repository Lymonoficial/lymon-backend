import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  ValidationArguments,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRoleEnum } from '@/domain/user/entities/user.entity';

export enum ScopeTypeDto {
  TENANT = 'TENANT',
  PROPERTY = 'PROPERTY',
  UNIT = 'UNIT',
}

@ValidatorConstraint({ name: 'ScopeResourceIds', async: false })
class ScopeResourceIdsConstraint implements ValidatorConstraintInterface {
  validate(resourceIds: unknown, args: ValidationArguments): boolean {
    const scope = args.object as ScopeDto;
    if (scope.type === ScopeTypeDto.TENANT) {
      return resourceIds === undefined || resourceIds === null;
    }
    return (
      Array.isArray(resourceIds) &&
      resourceIds.length > 0 &&
      resourceIds.every((id) => typeof id === 'string')
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const scope = args.object as ScopeDto;
    if (scope.type === ScopeTypeDto.TENANT) {
      return 'resourceIds must not be provided when scope type is TENANT';
    }
    return 'resourceIds must be a non-empty array of strings when scope type is PROPERTY or UNIT';
  }
}

export class ScopeDto {
  @ApiProperty({ enum: ScopeTypeDto, example: 'TENANT' })
  @IsEnum(ScopeTypeDto)
  type: ScopeTypeDto;

  @ApiProperty({
    type: [String],
    required: false,
    example: ['propertyId1', 'propertyId2'],
    description:
      'Required when type is PROPERTY or UNIT. Must be omitted when type is TENANT.',
  })
  @Validate(ScopeResourceIdsConstraint)
  @ValidateIf(
    (scope: ScopeDto) =>
      scope.type !== ScopeTypeDto.TENANT || scope.resourceIds !== undefined,
  )
  resourceIds?: string[];
}

export class InviteStaffDto {
  @ApiProperty({ example: 'staff@hotel.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ enum: UserRoleEnum, example: UserRoleEnum.ADMIN })
  @IsEnum(UserRoleEnum)
  role: UserRoleEnum;

  @ApiProperty({ type: ScopeDto })
  @ValidateNested()
  @Type(() => ScopeDto)
  scope: ScopeDto;
}
