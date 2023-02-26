import { Request, Response, NextFunction } from 'express';
import { SignUpData, LogInData } from '../interfaces/auth.interface';
import { User } from '@prisma/client';
import AuthService from '../services/auth.service';

class AuthController {
    public authService = new AuthService();

    public signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: SignUpData = req.body;
            const user: User = await this.authService.signUp(userData);

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };

    public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: LogInData = req.body;
            const { user, cookie } = await this.authService.logIn(userData);

            res.setHeader('Set-Cookie', [cookie]);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
