import { Router } from 'express'
import { Routes } from '@interfaces/routes.interface'
import HolidayController from '@/controllers/holiday.controller'
import authMiddleware from '@/middlewares/auth.middleware'

class HolidayRoute implements Routes {
  public path = '/v1/'
  public router = Router()
  public holidayController = new HolidayController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(`${this.path}holidays/:country`, this.holidayController.listHolidays)
    this.router.get(`${this.path}holidays/:country/:holiday_id`, this.holidayController.showHoliday)
    this.router.post(`${this.path}save-holiday`, authMiddleware, this.holidayController.saveHoliday)
    this.router.delete(`${this.path}unsave-holiday`, authMiddleware, this.holidayController.unsaveHoliday)
  }
}

export default HolidayRoute