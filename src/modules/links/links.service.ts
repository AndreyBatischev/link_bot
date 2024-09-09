import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './entities/links.entity';
import { v4 as uuidv4 } from 'uuid';
import { CreateLinkDto } from './dto/create-link-dto';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private linksRepository: Repository<Link>,
  ) {}

  async saveLink(data: CreateLinkDto): Promise<string> {
    const uniqueCode = uuidv4();
    const link = this.linksRepository.create({ ...data, uniqueCode });
    await this.linksRepository.save(link);
    return uniqueCode;
  }

  async getAllLinks() {
    return this.linksRepository.find();
  }
  async getLinkByCode(uniqueCode: string): Promise<Link> {
    const link = await this.linksRepository.findOne({ where: { uniqueCode } });
    if (!link) {
      throw new NotFoundException('Link not found');
    }
    return link;
  }

  async deleteLink(uniqueCode: string): Promise<void> {
    const result = await this.linksRepository.delete({ uniqueCode });

    if (!result.affected) {
      throw new NotFoundException('Link not found');
    }
  }
}
