import { Request, Response, NextFunction } from "express"
import HolidayService from "@/services/holiday.service"
import { HolidayData } from "@/interfaces/holiday.interface"
import { HttpException } from "@/exceptions/HttpException"

class HolidayController {
  public holidayService = new HolidayService()

  public listHolidays = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const country = String(req.params.country)
      const limit = Number(req.query.limit)
      const page = Number(req.query.page)

      const holidays = this.holidayService.listHolidays(country, limit, page)

      res.status(200).json(holidays)
    } catch (error) {
      next(error)
    }
  }

  public showHoliday = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const country = String(req.params.country)
      const holidayId = String(req.params.holiday_id)

      const holiday = this.holidayService.showHoliday(country, holidayId)

      res.status(200).json(holiday)
    } catch (error) {
      next(error)
    }
  }

  public saveHoliday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorization = req.cookies?.authorization || (req.header('authorization') ? req.header('authorization')?.split('Bearer ')[1] : null)
      const holidayData: HolidayData = req.body

      const savedHoliday = await this.holidayService.saveHoliday(authorization, holidayData)

      res.status(200).json(savedHoliday)
    } catch (error) {
      next(error)
    }
  }

  public unsaveHoliday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const holidayData: HolidayData = req.body
      const authorization = (req.header('cookie') ? req.header('cookie')?.split('Authorization=')[1] : null) || (req.header('authorization') ? req.header('authorization')?.split('Bearer ')[1] : null)
      if (!authorization) throw new HttpException(401, 'User is not authenticated. Please register or login.')

      const count = await this.holidayService.unsaveHoliday(authorization, holidayData)

      res.status(200).json({ message: `${count} entry deleted.` })
    } catch (error) {
      next(error)
    }
  }
}

export default HolidayController