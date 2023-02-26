import { PrismaClient, User } from '@prisma/client';
import { SignUpData, LogInData, TokenData, DataStoredInToken } from '@/interfaces/auth.interface';
import { HttpException } from '@/exceptions/HttpException';
import { hash, compare } from 'bcrypt';
import { SECRET_KEY } from '@/config';
import { sign } from 'jsonwebtoken';

class AuthService {
    public users = new PrismaClient().user;

    public async signUp(userData: SignUpData): Promise<User> {
        if (!userData) throw new HttpException(400, 'User data is empty.');

        const user: User | null = await this.users.findUnique({ where: { email: userData.email } });
        if (user) throw new HttpException(400, `This email ${userData.email} already exists.`);

        const hashedPassword = await hash(userData.password, 10);
        const createdUserData: Promise<User> = this.users.create({ data: { ...userData, password: hashedPassword } });

        return createdUserData;
    }

    public async logIn(userData: LogInData): Promise<{ user: User; cookie: string }> {
        if (!userData) throw new HttpException(400, 'User data is empty.');

        const user: User | null = await this.users.findUnique({ where: { email: userData.email } });
        if (!user) throw new HttpException(400, `This email ${userData.email} was not found.`);

        const isPasswordMatching: boolean = await compare(userData.password, user.password);
        if (!isPasswordMatching) throw new HttpException(400, 'Password does not match email.');

        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);

        return { user, cookie };
    }

    public createToken(user: User): TokenData {
        const dataStoredInToken: DataStoredInToken = { id: user.id };
        const secretKey: string = SECRET_KEY as string;
        const expiresIn: number = 60 * 60;

        return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
    }

    public createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
    }
}

export default AuthService;
