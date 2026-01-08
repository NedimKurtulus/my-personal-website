import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @ManyToMany(() => Task, (task) => task.tags)
    tasks: Task[];
    @CreateDateColumn()  // BU SATIRI EKLE
    createdAt: Date;
}