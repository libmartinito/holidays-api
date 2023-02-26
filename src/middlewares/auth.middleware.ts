import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@/config';
import { HttpException } from '@/exceptions/HttpException';
import { DataStoredInToken } from '@/interfaces/auth.interface';
import { PrismaClient } from '@prisma/client';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorization =
            (req.header('cookie') ? req.header('cookie')?.split('Authorization=')[1] : null) ||
            (req.header('authorization') ? req.header('authorization')?.split('Bearer ')[1] : null);

        if (!authorization) throw new HttpException(401, 'User is not authenticated. Please sign-up or login.');

        const secretKey: string = SECRET_KEY as string;
        const verificationRes = verify(authorization, secretKey) as DataStoredInToken;
        const userId = verificationRes.id;

        const users = new PrismaClient().user;
        const user = await users.findUnique({ where: { id: Number(userId) } });

        if (!user) throw new HttpException(401, 'Wrong authentication token.');
        res.locals.user = user;

        next();
    } catch (error) {
        next(error);
    }
};

export default authMiddleware;
