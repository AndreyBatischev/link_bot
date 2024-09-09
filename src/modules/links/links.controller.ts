import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link-dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Link } from './entities/links.entity';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @ApiOperation({ summary: 'Сохранить ссылку' })
  @ApiResponse({
    status: 201,
    description: 'Ссылка успешно сохранена',
    schema: { example: { uniqueCode: 'cf0f0870-1bde-481e-aafd-f19cb32a4d71' } },
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @Post()
  async saveLink(@Body() data: CreateLinkDto) {
    const uniqueCode = await this.linksService.saveLink(data);
    return uniqueCode;
  }

  @ApiOperation({ summary: 'Получить все ссылки' })
  @ApiResponse({ status: 200, description: 'Список всех ссылок', type: [Link] })
  @Get()
  async getAllLinks() {
    const links = await this.linksService.getAllLinks();
    return links;
  }

  @ApiOperation({ summary: 'Получить ссылку по уникальному коду' })
  @ApiParam({
    name: 'code',
    description: 'Уникальный код ссылки',
    example: 'cf0f0870-1bde-481e-aafd-f19cb32a4d71',
  })
  @ApiResponse({ status: 200, description: 'Ссылка найдена', type: Link })
  @ApiResponse({ status: 404, description: 'Ссылка не найдена' })
  @Get(':code')
  async getLinkByCode(@Param('code') code: string) {
    const link = await this.linksService.getLinkByCode(code);
    return link;
  }

  @ApiOperation({ summary: 'Удалить ссылку по уникальному коду' })
  @ApiParam({
    name: 'code',
    description: 'Уникальный код ссылки',
    example: 'cf0f0870-1bde-481e-aafd-f19cb32a4d71',
  })
  @ApiResponse({
    status: 200,
    description: 'Ссылка удалена',
    schema: { example: { message: 'Link deleted' } },
  })
  @ApiResponse({ status: 404, description: 'Ссылка не найдена' })
  @Delete(':code')
  async deleteLink(@Param('code') code: string) {
    await this.linksService.deleteLink(code);
    return { message: 'Link deleted' };
  }
}
