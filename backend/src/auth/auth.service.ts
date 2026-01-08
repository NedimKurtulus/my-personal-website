import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, role: user.role, profilePhoto: user.profilePhoto },
        };
    }

    async register(createUserDto: any) {
        const { email, password, confirmPassword, role, adminCode } = createUserDto;

        // 1. Password match kontrolü
        if (password !== confirmPassword) {
            throw new BadRequestException('Passwords do not match');
        }

        // 2. Email kontrolü
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        // 3. Admin rolü için kod kontrolü
        let finalRole = 'user';

        if (role === 'admin') {
            // ADMIN KODU KONTROLÜ
            const correctAdminCode = 'NeMutluTürkümDiyene'; // Sabit kod

            if (!adminCode || adminCode !== correctAdminCode) {
                throw new UnauthorizedException('Invalid admin activation code');
            }

            finalRole = 'admin';
            console.log(`✅ New admin registered: ${email}`);
        }

        // 4. Password hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Kullanıcı oluştur
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            role: finalRole, // Kontrollü rol ataması
        });

        // 6. Kaydet
        await this.userRepository.save(user);

        // 7. Login token döndür
        return this.login(user);
    }
}