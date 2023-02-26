import { describe, expect, test, vi, beforeEach } from 'vitest';
import request from 'supertest';
import App from '../app';
import AuthRoute from '../routes/auth.route';
import bcrypt from 'bcrypt';

let authRoute: AuthRoute, users: any, app: App;

beforeEach(() => {
    authRoute = new AuthRoute();
    users = authRoute.authController.authService.users;
    app = new App([authRoute]);
});

describe('Authentication', () => {
    describe('[POST] /signup', () => {
        test('should return created user when request valid', async () => {
            const userData = {
                email: 'test@mail.com',
                password: 'password',
                role: 'SUBSCRIBER',
            };

            users.findUnique = vi.fn().mockReturnValue(null);
            users.create = vi.fn().mockReturnValue({
                id: 1,
                email: userData.email,
                password: await bcrypt.hash(userData.password, 10),
                role: userData.role,
            });

            const res = await request(app.getServer()).post(`${authRoute.path}signup`).send(userData);

            expect(res.status).toBe(200);
            expect(res.body.email).toBeDefined();
            expect(res.body.password).toBeDefined();
            expect(res.body.role).toBeDefined();
        });
        test('should return an error when request body is empty', async () => {
            const userData = {};
            const expectedResBody = {
                errors: [{ email: 'Invalid value' }, { password: 'Invalid value' }, { role: 'Invalid value' }],
            };

            const res = await request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
            expect(res.status).toBe(400);
            expect(res.body).toEqual(expectedResBody);
        });
        test('should return an error when email already exists', async () => {
            const userData = {
                email: 'test@mail.com',
                password: 'password',
                role: 'SUBSCRIBER',
            };
            const user = {
                id: 1,
                email: 'test@mail.com',
                password: await bcrypt.hash('password', 10),
                role: 'SUBSCRIBER',
                created_at: new Date(),
                updated_at: new Date(),
            };
            users.findMany = vi.fn().mockReturnValue(user);
            const res = await request(app.getServer()).post(`${authRoute.path}signup`).send(userData);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('This email test@mail.com already exists.');
        });
    });
    describe('[POST] /login', () => {
        test('should created user when request valid', async () => {
            const userData = {
                email: 'test@mail.com',
                password: 'password',
                role: 'SUBSCRIBER',
            };
            const user = {
                id: 1,
                email: 'test@mail.com',
                password: await bcrypt.hash('password', 10),
                role: 'SUBSCRIBER',
                created_at: new Date(),
                updated_at: new Date(),
            };
            users.findUnique = vi.fn().mockReturnValue(user);
            const res = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            expect(res.status).toBe(200);
            expect(res.headers['set-cookie'][0]).toBeDefined();
        });
        test('should return an error when a user is not found', async () => {
            const userData = {
                email: 'test@mail.com',
                password: 'password',
                role: 'SUBSCRIBER',
            };
            users.findUnique = vi.fn().mockReturnValue(null);
            const res = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('This email test@mail.com was not found.');
        });
        test('should return an error when the wrong password is used', async () => {
            const userData = {
                email: 'test@mail.com',
                password: 'wrong password',
                role: 'SUBSCRIBER',
            };
            const user = {
                id: 1,
                email: 'test@mail.com',
                password: await bcrypt.hash('password', 10),
                role: 'SUBSCRIBER',
                created_at: new Date(),
                updated_at: new Date(),
            };
            users.findUnique = vi.fn().mockReturnValue(user);
            const res = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Password does not match email.');
        });
    });
});
