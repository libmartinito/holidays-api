import { Holiday, PaginatedHolidayList } from '@interfaces/holiday.interface'
import { HttpException } from '@/exceptions/HttpException'
import Holidays from 'date-holidays'

class HolidayService {
  public async listHolidays(country: string, limit: number, page: number): Promise<PaginatedHolidayList> {
    if (!country) throw new HttpException(400, "Country is not defined.")

    const hd = new Holidays(country)
    const holidayList: Holiday[] = hd.getHolidays()
    const totalHolidays: number = holidayList.length

    const listStart = limit * (page - 1)
    const listEnd = limit * page

    const results: PaginatedHolidayList = {}

    if (listEnd < totalHolidays) {
      results.next = {
        page: page + 1,
        limit
      }
    }
    if (listStart > 0) {
      results.prev = {
        page: page - 1,
        limit
      }
    }
    results.current = holidayList.slice(listStart, listEnd)

    return results
  }

  public async showHoliday(country: string, holidayId: string): Promise<Holiday> {
    const hd = new Holidays(country)
    const holidayList: Holiday[] = hd.getHolidays()

    const holiday = holidayList.find(holiday => holiday.date.includes(holidayId))
    if (!holiday) throw new HttpException(404, "The resource is not available.")

    return holiday
  }
}

export default HolidayService