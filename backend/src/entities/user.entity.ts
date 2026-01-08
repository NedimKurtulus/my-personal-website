import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, CreateDateColumn } from 'typeorm';
import { Project } from './project.entity';


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Index({ unique: true })
    email: string;

    @Column({ select: false }) password: string;

    @Column({ default: 'user' })
    role: string;

    @Column({ nullable: true })
    profilePhoto: string;

    @OneToMany(() => Project, (project) => project.owner)
    projects: Project[];
    @CreateDateColumn()  // BU SATIRI EKLE
    createdAt: Date;
}