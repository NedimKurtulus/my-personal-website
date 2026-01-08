import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => User, (user) => user.projects, { onDelete: 'CASCADE' })
    owner: User;

    @Column()
    ownerId: number;

    @OneToMany(() => Task, (task) => task.project)
    tasks: Task[];
    @CreateDateColumn()  // BU SATIRI EKLE
    createdAt: Date;
}