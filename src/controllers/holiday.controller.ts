import { Request, Response, NextFunction } from "express"
import HolidayService from "@/services/holiday.service"

class HolidayController {
  public holidayService = new HolidayService()

  public listHolidays = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const country = String(req.params.country)
      const limit = Number(req.query.limit)
      const page = Number(req.query.page)

      const holidays = await this.holidayService.listHolidays(country, limit, page)

      res.status(200).json(holidays)
    } catch (error) {
      next(error)
    }
  }

  public showHoliday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const country = String(req.params.country)
      const holidayId = String(req.params.holiday_id)

      const holiday = await this.holidayService.showHoliday(country, holidayId)

      res.status(200).json(holiday)
    } catch (error) {
      next(error)
    }
  }
}

export default HolidayController