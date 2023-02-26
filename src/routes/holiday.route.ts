import { Router } from 'express'
import { Routes } from '@interfaces/routes.interface'
import HolidayController from '@/controllers/holiday.controller'

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
    this.router.post(`${this.path}save-holiday`, this.holidayController.saveHoliday)
  }
}

export default HolidayRoute