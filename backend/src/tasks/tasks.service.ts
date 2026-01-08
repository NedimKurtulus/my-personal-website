import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { Tag } from '../entities/tag.entity';
import { CreateTaskDto } from '../dto/create-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
        @InjectRepository(Tag)
        private tagRepository: Repository<Tag>,
    ) { }

    async findAll(): Promise<Task[]> {
        return this.taskRepository.find({ relations: ['project', 'assignedUser', 'tags'] });
    }

    async findOne(id: number): Promise<Task> {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['project', 'assignedUser', 'tags']
        });
        if (!task) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const { tagIds, ...taskData } = createTaskDto;
        const task = this.taskRepository.create(taskData);

        if (tagIds && tagIds.length > 0) {
            const tags = await this.tagRepository.findBy({ id: In(tagIds) });
            task.tags = tags;
        }

        return this.taskRepository.save(task);
    }

    async update(id: number, updateData: any): Promise<Task> {
        await this.taskRepository.update(id, updateData);
        const updated = await this.taskRepository.findOne({
            where: { id },
            relations: ['tags']
        });
        if (!updated) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }
        return updated;
    }

    async remove(id: number): Promise<void> {
        await this.taskRepository.delete(id);
    }
}