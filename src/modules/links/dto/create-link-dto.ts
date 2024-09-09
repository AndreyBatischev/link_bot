import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({
    title: 'Ссылка',
    example: 'https://best-app.com',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    title: 'Имя ссылки',
    example: 'Важная ссылка',
  })
  @IsNotEmpty()
  @IsString()
  linkName: string;
}
