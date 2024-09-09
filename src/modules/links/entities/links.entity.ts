import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('link')
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @ApiProperty({
    title: 'Ссылка',
    example: 'https://best-app.com',
  })
  url: string;

  @Column()
  @ApiProperty({
    title: 'Имя ссылки',
    example: 'Самая крутая ссылка',
  })
  linkName: string;

  @Column()
  @ApiProperty({
    title: 'Уникальный код ссылки',
    example: 'e660eff5-36e0-4afc-9df5-de4517699f16',
  })
  uniqueCode: string;
}
