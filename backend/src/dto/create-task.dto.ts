import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    projectId: number;

    @IsNumber()
    @IsOptional()
    assignedUserId: number;

    @IsArray()
    @IsOptional()
    tagIds: number[];
}