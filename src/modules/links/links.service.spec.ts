import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from './links.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Link } from './entities/links.entity';
import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

const mockLinkRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

describe('LinksService', () => {
  let service: LinksService;
  let repository: Repository<Link>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: getRepositoryToken(Link),
          useValue: mockLinkRepository,
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    repository = module.get<Repository<Link>>(getRepositoryToken(Link));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveLink', () => {
    it('should create and save a new link, returning unique code', async () => {
      const mockData = { url: 'https://example.com', linkName: 'link 1' };
      const mockUniqueCode = uuidv4();

      jest.spyOn(uuidv4, 'bind').mockReturnValue(mockUniqueCode);
      mockLinkRepository.create.mockReturnValue({
        ...mockData,
        uniqueCode: mockUniqueCode,
      });
      mockLinkRepository.save.mockResolvedValue({
        ...mockData,
        uniqueCode: mockUniqueCode,
      });

      const result = await service.saveLink(mockData);

      expect(repository.create).toHaveBeenCalledWith({
        ...mockData,
        uniqueCode: mockUniqueCode,
      });
      expect(repository.save).toHaveBeenCalledWith({
        ...mockData,
        uniqueCode: mockUniqueCode,
      });

      expect(result).toEqual(mockUniqueCode);
    });
  });

  describe('getAllLinks', () => {
    it('should return an array of links', async () => {
      const mockLinks = [
        {
          url: 'https://example.com',
          internalName: 'link 1',
          uniqueCode: 'e660eff5-36e0-4afc-9df5-de4517699f16',
        },
        {
          url: 'https://example2.com',
          internalName: 'link 2',
          uniqueCode: '44fbef85-d536-4aa7-9a1a-3b77df608074',
        },
      ];

      mockLinkRepository.find.mockResolvedValue(mockLinks);

      const result = await service.getAllLinks();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockLinks);
    });
  });

  describe('getLinkByCode', () => {
    it('should return a link when found by uniqueCode', async () => {
      const mockLink = {
        url: 'https://example.com',
        internalName: 'link 1',
        uniqueCode: 'e660eff5-36e0-4afc-9df5-de4517699f16',
      };

      mockLinkRepository.findOne.mockResolvedValue(mockLink);

      const result = await service.getLinkByCode(
        'e660eff5-36e0-4afc-9df5-de4517699f16',
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { uniqueCode: 'e660eff5-36e0-4afc-9df5-de4517699f16' },
      });
      expect(result).toEqual(mockLink);
    });

    it('should throw NotFoundException when link is not found', async () => {
      mockLinkRepository.findOne.mockResolvedValue(null);

      await expect(service.getLinkByCode('invalid-code')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteLink', () => {
    it('should delete a link by uniqueCode', async () => {
      mockLinkRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteLink('e660eff5-36e0-4afc-9df5-de4517699f16');

      expect(repository.delete).toHaveBeenCalledWith({
        uniqueCode: 'e660eff5-36e0-4afc-9df5-de4517699f16',
      });
    });

    it('should throw NotFoundException when link is not found', async () => {
      mockLinkRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteLink('invalid-code')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
