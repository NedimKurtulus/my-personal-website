import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';
import { Tag } from './tag.entity';

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ default: 'pending' })
    status: string;

    @ManyToOne(() => Project, (project) => project.tasks, { onDelete: 'CASCADE' })
    project: Project;

    @Column()
    projectId: number;

    @ManyToOne(() => User, { nullable: true })
    assignedUser: User;

    @Column({ nullable: true })
    assignedUserId: number;

    @ManyToMany(() => Tag, (tag) => tag.tasks)
    @JoinTable()
    tags: Tag[];
    @CreateDateColumn()  // BU SATIRI EKLE
    createdAt: Date;
}