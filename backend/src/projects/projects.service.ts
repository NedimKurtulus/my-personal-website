import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
    ) { }

    async findAll(): Promise<Project[]> {
        return this.projectRepository.find({ relations: ['owner', 'tasks'] });
    }

    async findOne(id: number): Promise<Project> {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['owner', 'tasks']
        });
        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }

    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        const project = this.projectRepository.create(createProjectDto);
        return this.projectRepository.save(project);
    }

    async update(id: number, updateData: Partial<Project>): Promise<Project> {
        await this.projectRepository.update(id, updateData);
        const updated = await this.projectRepository.findOne({ where: { id } });
        if (!updated) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }
        return updated;
    }

    async remove(id: number): Promise<void> {
        await this.projectRepository.delete(id);
    }
}