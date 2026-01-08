import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            relations: ['projects'],

        });
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['projects'],

        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async update(id: number, updateData: Partial<User>): Promise<User> {
        // Password güncellemesi için özel kontrol
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        await this.userRepository.update(id, updateData);
        const updated = await this.findOne(id);
        if (!updated) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return updated;
    }

    async remove(id: number): Promise<void> {
        await this.userRepository.delete(id);
    }
}