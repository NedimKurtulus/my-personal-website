import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
    ) { }

    async findAll(): Promise<Tag[]> {
        return this.tagRepository.find({ relations: ['tasks'] });
    }

    async create(createTagDto: { name: string }): Promise<Tag> {
        // Aynı isimde tag var mı kontrol et
        const existingTag = await this.tagRepository.findOne({
            where: { name: createTagDto.name }
        });

        if (existingTag) {
            throw new ConflictException('Tag with this name already exists');
        }

        const tag = this.tagRepository.create(createTagDto);
        return this.tagRepository.save(tag);
    }

    async update(id: number, updateData: { name: string }): Promise<Tag> {
        // İsim değişiyorsa unique kontrolü
        if (updateData.name) {
            const existingTag = await this.tagRepository.findOne({
                where: { name: updateData.name }
            });

            if (existingTag && existingTag.id !== id) {
                throw new ConflictException('Another tag with this name already exists');
            }
        }

        await this.tagRepository.update(id, updateData);
        const updated = await this.tagRepository.findOne({
            where: { id },
            relations: ['tasks']
        });

        if (!updated) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }

        return updated;
    }

    async remove(id: number): Promise<void> {
        await this.tagRepository.delete(id);
    }
}