import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import App from '@/app';
import AuthRoute from '@/routes/auth.route';
import HolidayRoute from '@/routes/holiday.route';
import bcrypt from 'bcrypt';

let authRoute: AuthRoute, holidayRoute: HolidayRoute, app: App, users: any, holidays: any;

beforeEach(() => {
    authRoute = new AuthRoute();
    holidayRoute = new HolidayRoute();
    users = authRoute.authController.authService.users;
    holidays = holidayRoute.holidayController.holidayService.holidays;
    app = new App([authRoute, holidayRoute]);
});

afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
});

describe('Holiday', () => {
    describe('[GET] /holidays/:country', () => {
        test('should return a list of holidays when request is valid', async () => {
            const country = 'PH';
            const limit = 3;
            const page = 2;

            const res = await request(app.getServer()).get(`${holidayRoute.path}holidays/${country}?limit=${limit}&page=${page}`);

            expect(res.status).toBe(200);
            expect(Object.keys(res.body)).toEqual(['next', 'prev', 'current']);
            expect(Object.keys(res.body.next)).toEqual(['page', 'limit']);
            expect(res.body.next.page).toBe(page + 1);
            expect(Object.keys(res.body.prev)).toEqual(['page', 'limit']);
            expect(res.body.prev.page).toBe(page - 1);
            expect(Object.keys(res.body.current[0])).toEqual(['date', 'start', 'end', 'name', 'type', 'rule']);
        });
        test('should return an empty array when no limit or page is provided', async () => {
            const country = 'PH';

            const res = await request(app.getServer()).get(`${holidayRoute.path}holidays/${country}`);

            expect(res.status).toBe(200);
            expect(res.body.current).toEqual([]);
        });
    });
    describe('[GET] /holidays/:country/:holiday_id', () => {
        test('should return a holiday when request params are valid', async () => {
            const country = 'PH';
            const holidayId = '2023-12-31';

            const res = await request(app.getServer()).get(`${holidayRoute.path}holidays/${country}/${holidayId}`);

            expect(res.status).toBe(200);
            expect(Object.keys(res.body)).toEqual(['date', 'start', 'end', 'name', 'type', 'note', 'rule']);
        });
        test('should return an error when request params are not valid', async () => {
            const country = 'PH';
            const holidayId = '2023-12-20';

            const res = await request(app.getServer()).get(`${holidayRoute.path}holidays/${country}/${holidayId}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('The resource is not available.');
        });
    });
    describe('[POST] /save-holiday', () => {
        test('should return saved holiday when request is authenticated and valid', async () => {
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
            const holidayData = {
                user_id: 1,
                country: 'PH',
                holiday_id: '2023-01-01',
            };
            const holiday = {
                date: '2023-01-01 00:00:00',
                start: '2022-12-31T16:00.00.000Z',
                end: '2023-01-01T16:00.00.000Z',
                name: "New Year's Day",
                type: 'public',
                rule: '01-01',
            };

            users.findUnique = vi.fn().mockReturnValue(user);
            holidays.findFirst = vi.fn().mockReturnValue(null);
            holidays.create = vi.fn().mockReturnValue(holiday);
            holidayRoute.holidayController.holidayService.isAuthorized = vi.fn().mockReturnValue(true);

            const authRes = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            const authToken = authRes.header['set-cookie'][0].split(';')[0].split('Authorization=')[1];
            const holidayRes = await request(app.getServer())
                .post(`${holidayRoute.path}save-holiday`)
                .set({ authorization: 'Bearer ' + authToken })
                .send(holidayData);
            expect(holidayRes.status).toBe(200);
            expect(holidayRes.body).toEqual(holiday);
        });
        test('should return an error when no holiday data is provided', async () => {
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
            const holidayData = {};

            const expected = {
                errors: [{ user_id: 'Invalid value' }, { country: 'Invalid value' }, { holiday_id: 'Invalid value' }],
            };

            users.findUnique = vi.fn().mockReturnValue(user);
            holidays.create = vi.fn();

            const authRes = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            const authToken = authRes.header['set-cookie'][0].split(';')[0].split('Authorization=')[1];
            const holidayRes = await request(app.getServer())
                .post(`${holidayRoute.path}save-holiday`)
                .set({ authorization: 'Bearer ' + authToken })
                .send(holidayData);

            expect(holidayRes.status).toBe(400);
            expect(holidayRes.body).toEqual(expected);
        });
        test('should return an error when the holiday is already saved', async () => {
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
            const holidayData = {
                user_id: 1,
                country: 'PH',
                holiday_id: '2023-01-01',
            };
            const holiday = {
                date: '2023-01-01 00:00:00',
                start: '2022-12-31T16:00.00.000Z',
                end: '2023-01-01T16:00.00.000Z',
                name: "New Year's Day",
                type: 'public',
                rule: '01-01',
            };

            users.findUnique = vi.fn().mockReturnValue(user);
            holidays.findFirst = vi.fn().mockReturnValue(holiday);
            holidays.create = vi.fn();

            const authRes = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            const authToken = authRes.header['set-cookie'][0].split(';')[0].split('Authorization=')[1];
            const holidayRes = await request(app.getServer())
                .post(`${holidayRoute.path}save-holiday`)
                .set({ authorization: 'Bearer ' + authToken })
                .send(holidayData);

            expect(holidayRes.status).toBe(400);
            expect(holidayRes.body.message).toEqual('The holiday is already saved for the user.');
        });
        test('should return an error when one user tries to save to another profile', async () => {
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
            const holidayData = {
                user_id: 2,
                country: 'PH',
                holiday_id: '2023-01-01',
            };

            users.findUnique = vi.fn().mockReturnValue(user);
            holidays.findFirst = vi.fn().mockReturnValue(null);
            holidayRoute.holidayController.holidayService.isAuthorized = vi.fn().mockReturnValue(false);

            const authRes = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            const authToken = authRes.header['set-cookie'][0].split(';')[0].split('Authorization=')[1];
            const holidayRes = await request(app.getServer())
                .post(`${holidayRoute.path}save-holiday`)
                .set({ authorization: 'Bearer ' + authToken })
                .send(holidayData);

            expect(holidayRes.status).toBe(403);
            expect(holidayRes.body.message).toEqual('Access is forbidden.');
        });
        test('should return an error when user is not authenticated', async () => {
            const holidayData = {
                user_id: 2,
                country: 'PH',
                holiday_id: '2023-01-01',
            };

            const holidayRes = await request(app.getServer()).post(`${holidayRoute.path}save-holiday`).send(holidayData);

            expect(holidayRes.status).toBe(401);
            expect(holidayRes.body.message).toEqual('User is not authenticated. Please sign-up or login.');
        });
    });
    describe('[DELETE] /unsave-holiday', () => {
        test('should return delete successful message when authenticated and request is valid', async () => {
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
            const holidayData = {
                user_id: 1,
                country: 'PH',
                holiday_id: '2023-01-01',
            };

            users.findUnique = vi.fn().mockReturnValue(user);
            holidays.deleteMany = vi.fn().mockReturnValue({ count: 1 });
            holidayRoute.holidayController.holidayService.isAuthorized = vi.fn().mockReturnValue(true);

            const authRes = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            const authToken = authRes.header['set-cookie'][0].split(';')[0].split('Authorization=')[1];
            const holidayRes = await request(app.getServer())
                .delete(`${holidayRoute.path}unsave-holiday`)
                .set({ authorization: 'Bearer ' + authToken })
                .send(holidayData);

            expect(holidayRes.status).toBe(200);
            expect(holidayRes.body.message).toEqual('1 entry deleted.');
        });
        test('should return an error when no holiday data is provided', async () => {
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
            const holidayData = {};
            const expected = {
                errors: [{ user_id: 'Invalid value' }, { country: 'Invalid value' }, { holiday_id: 'Invalid value' }],
            };

            users.findUnique = vi.fn().mockReturnValue(user);

            const authRes = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            const authToken = authRes.header['set-cookie'][0].split(';')[0].split('Authorization=')[1];
            const holidayRes = await request(app.getServer())
                .delete(`${holidayRoute.path}unsave-holiday`)
                .set({ authorization: 'Bearer ' + authToken })
                .send(holidayData);

            expect(holidayRes.status).toBe(400);
            expect(holidayRes.body).toEqual(expected);
        });
        test('should return an error when the holiday already does not exist for user', async () => {
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
            const holidayData = {
                user_id: 1,
                country: 'PH',
                holiday_id: '2023-01-01',
            };

            users.findUnique = vi.fn().mockReturnValue(user);
            holidayRoute.holidayController.holidayService.isAuthorized = vi.fn().mockReturnValue(true);
            holidays.findFirst = vi.fn().mockReturnValue(null);

            const authRes = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            const authToken = authRes.header['set-cookie'][0].split(';')[0].split('Authorization=')[1];
            const holidayRes = await request(app.getServer())
                .delete(`${holidayRoute.path}unsave-holiday`)
                .set({ authorization: 'Bearer ' + authToken })
                .send(holidayData);

            expect(holidayRes.status).toBe(400);
            expect(holidayRes.body.message).toEqual('Holiday already does not exist for user.');
        });
        test('should return an error when one user tries to delete the holiday of another user', async () => {
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
            const holidayData = {
                user_id: 1,
                country: 'PH',
                holiday_id: '2023-01-01',
            };

            users.findUnique = vi.fn().mockReturnValue(user);
            holidayRoute.holidayController.holidayService.isAuthorized = vi.fn().mockReturnValue(false);
            holidays.findFirst = vi.fn().mockReturnValue(null);

            const authRes = await request(app.getServer()).post(`${authRoute.path}login`).send(userData);
            const authToken = authRes.header['set-cookie'][0].split(';')[0].split('Authorization=')[1];
            const holidayRes = await request(app.getServer())
                .delete(`${holidayRoute.path}unsave-holiday`)
                .set({ authorization: 'Bearer ' + authToken })
                .send(holidayData);

            expect(holidayRes.status).toBe(403);
            expect(holidayRes.body.message).toEqual('Access is forbidden.');
        });
        test('should return an error when user is not authenticated', async () => {
            const holidayData = {
                user_id: 1,
                country: 'PH',
                holiday_id: '2023-01-01',
            };

            const holidayRes = await request(app.getServer()).delete(`${holidayRoute.path}unsave-holiday`).send(holidayData);

            expect(holidayRes.status).toBe(401);
            expect(holidayRes.body.message).toEqual('User is not authenticated. Please sign-up or login.');
        });
    });
});
