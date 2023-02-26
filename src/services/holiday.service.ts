import { HolidayResult, PaginatedHolidayList, HolidayData, PaginatedUserHolidayList } from '../interfaces/holiday.interface';
import { HttpException } from '../exceptions/HttpException';
import Holidays from 'date-holidays';
import { PrismaClient, Holiday, User } from '@prisma/client';

class HolidayService {
    public holidays = new PrismaClient().holiday;

    public listHolidays(country: string, limit: number, page: number): PaginatedHolidayList {
        if (!country) throw new HttpException(400, 'Country is not defined.');

        const hd = new Holidays(country);
        const holidayList: HolidayResult[] = hd.getHolidays();
        const totalHolidays: number = holidayList.length;

        const listStart = limit * (page - 1);
        const listEnd = limit * page;

        const results: PaginatedHolidayList = {};

        if (listEnd < totalHolidays) {
            results.next = {
                page: page + 1,
                limit,
            };
        }
        if (listStart > 0) {
            results.prev = {
                page: page - 1,
                limit,
            };
        }
        results.current = holidayList.slice(listStart, listEnd);

        return results;
    }

    public showHoliday(country: string, holidayId: string): HolidayResult {
        const hd = new Holidays(country);
        const holidayList: HolidayResult[] = hd.getHolidays();

        const holiday = holidayList.find(holiday => holiday.date.includes(holidayId));
        if (!holiday) throw new HttpException(404, 'The resource is not available.');

        return holiday;
    }

    public async saveHoliday(user: User, holidayData: HolidayData): Promise<Holiday> {
        if (!holidayData) throw new HttpException(400, 'Holiday data is empty');

        const isAuthorized = this.isAuthorized(user, holidayData.user_id);
        if (!isAuthorized) throw new HttpException(403, 'Access is forbidden.');

        const holiday: Holiday | null = await this.holidays.findFirst({
            where: { user_id: holidayData.user_id, country: holidayData.country, holiday_id: holidayData.holiday_id },
        });
        if (holiday) throw new HttpException(400, 'The holiday is already saved for the user.');

        const savedHoliday: Holiday = await this.holidays.create({ data: { ...holidayData } });

        return savedHoliday;
    }

    public async unsaveHoliday(user: User, holidayData: HolidayData): Promise<number> {
        if (!holidayData) throw new HttpException(400, 'Holiday data is empty');

        const isAuthorized = this.isAuthorized(user, holidayData.user_id);
        if (!isAuthorized) throw new HttpException(403, 'Access is forbidden.');

        const holiday: Holiday | null = await this.holidays.findFirst({
            where: { user_id: holidayData.user_id, country: holidayData.country, holiday_id: holidayData.holiday_id },
        });
        if (!holiday) throw new HttpException(400, 'Holiday already does not exist for user.');

        const { count } = await this.holidays.deleteMany({
            where: { user_id: holidayData.user_id, country: holidayData.country, holiday_id: holidayData.holiday_id },
        });

        return count;
    }

    public async listUserHolidays(user: User, limit: number, page: number, userId?: number): Promise<PaginatedUserHolidayList> {
        const reqUserId = userId ? userId : user.id;

        const isAuthorized = this.isAuthorized(user, reqUserId);
        if (!isAuthorized) throw new HttpException(403, 'Access is forbidden.');

        const totalUserHolidays: number = await this.holidays.count({ where: { user_id: reqUserId } });
        const listStart = limit * (page - 1);
        const listEnd = limit * page;

        const results: PaginatedUserHolidayList = {};

        if (listEnd < totalUserHolidays && totalUserHolidays !== 0) {
            results.next = {
                page: page + 1,
                limit,
            };
        }
        if (listStart > 0 && totalUserHolidays !== 0) {
            results.prev = {
                page: page - 1,
                limit,
            };
        }
        results.current = await this.holidays.findMany({ where: { user_id: reqUserId }, take: limit, skip: listStart });

        return results;
    }

    public isAuthorized(user: User, userId: number): boolean {
        if (user.role === 'ADMIN') return true;
        if (user.role === 'SUBSCRIBER' && user.id !== userId) return false;
        return true;
    }
}

export default HolidayService;
