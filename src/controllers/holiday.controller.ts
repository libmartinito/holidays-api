import { Request, Response, NextFunction } from 'express';
import HolidayService from '../services/holiday.service';
import { HolidayData } from '../interfaces/holiday.interface';
import { User } from '@prisma/client';

class HolidayController {
    public holidayService = new HolidayService();

    public listHolidays = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const country = String(req.params.country);
            const limit = Number(req.query.limit);
            const page = Number(req.query.page);

            const holidays = this.holidayService.listHolidays(country, limit, page);

            res.status(200).json(holidays);
        } catch (error) {
            next(error);
        }
    };

    public showHoliday = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const country = String(req.params.country);
            const holidayId = String(req.params.holiday_id);

            const holiday = this.holidayService.showHoliday(country, holidayId);

            res.status(200).json(holiday);
        } catch (error) {
            next(error);
        }
    };

    public saveHoliday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = res.locals.user;
            const holidayData: HolidayData = req.body;

            const savedHoliday = await this.holidayService.saveHoliday(user, holidayData);

            res.status(200).json(savedHoliday);
        } catch (error) {
            next(error);
        }
    };

    public unsaveHoliday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = res.locals.user;
            const holidayData: HolidayData = req.body;

            const count = await this.holidayService.unsaveHoliday(user, holidayData);

            res.status(200).json({ message: `${count} entry deleted.` });
        } catch (error) {
            next(error);
        }
    };

    public listUserHolidays = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user: User = res.locals.user;
            const userId = Number(req.query.user_id);
            const limit = Number(req.query.limit);
            const page = Number(req.query.page);

            const userHolidays = await this.holidayService.listUserHolidays(user, limit, page, userId);

            res.status(200).json(userHolidays);
        } catch (error) {
            next(error);
        }
    };
}

export default HolidayController;
