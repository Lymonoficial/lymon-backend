import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsString, MaxLength } from 'class-validator';
import { MediaCategory } from '@/application/storage/media-category.enum';

export class GeneratePresignedUrlDto {
  @ApiProperty({ example: 'photo.jpg' })
  @IsString()
  @MaxLength(255)
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsIn([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ])
  contentType: string;

  @ApiProperty({ enum: MediaCategory, example: MediaCategory.Experiences })
  @IsEnum(MediaCategory)
  category: MediaCategory;
}
