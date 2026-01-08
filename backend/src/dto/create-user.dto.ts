import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+/, {
        message: 'Password must contain at least one uppercase, one lowercase, one number and one special character',
    })
    password: string;

    @IsString()
    @IsNotEmpty()
    confirmPassword: string;

    @IsString()
    @IsIn(['user', 'admin'])
    role: string;

    @IsString()
    @IsOptional()
    adminCode?: string;
}