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
  }
}

export default HolidayRoute