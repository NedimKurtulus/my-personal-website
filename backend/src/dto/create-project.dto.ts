import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    ownerId: number;
}