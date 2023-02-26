import { HolidayResult, PaginatedHolidayList, HolidayData } from '@interfaces/holiday.interface'
import { HttpException } from '@/exceptions/HttpException'
import Holidays from 'date-holidays'
import { PrismaClient, Holiday } from '@prisma/client'
import { SECRET_KEY } from '@/config'
import { verify } from 'jsonwebtoken'
import { DataStoredInToken } from '@/interfaces/auth.interface'

class HolidayService {
  public users = new PrismaClient().user
  public holidays = new PrismaClient().holiday

  public async listHolidays(country: string, limit: number, page: number): Promise<PaginatedHolidayList> {
    if (!country) throw new HttpException(400, "Country is not defined.")

    const hd = new Holidays(country)
    const holidayList: HolidayResult[] = hd.getHolidays()
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

  public async showHoliday(country: string, holidayId: string): Promise<HolidayResult> {
    const hd = new Holidays(country)
    const holidayList: HolidayResult[] = hd.getHolidays()

    const holiday = holidayList.find(holiday => holiday.date.includes(holidayId))
    if (!holiday) throw new HttpException(404, "The resource is not available.")

    return holiday
  }

  public async saveHoliday(authorization: string, holidayData: HolidayData): Promise<Holiday> {
    if (!holidayData) throw new HttpException(400, "Holiday data is empty")
    
    const isAuthorized = await this.isAuthorized(authorization, holidayData.user_id)
    if (!isAuthorized) throw new HttpException(403, "Access is forbidden")

    const holiday: Holiday | null = await this.holidays.findFirst({ where: { user_id: holidayData.user_id, country: holidayData.country, holiday_id: holidayData.holiday_id } })
    if (holiday) throw new HttpException(400, "The holiday is already saved for user.")

    const savedHoliday: Holiday = await this.holidays.create({ data: { ...holidayData } })

    return savedHoliday
  }

  public async isAuthorized(authorization: string, userId: number): Promise<boolean> {
    if (!authorization) throw new HttpException(401, "User is not authenticated. Please login or signup.")
    const secretKey: string = SECRET_KEY as string
    const verificationResult = verify(authorization, secretKey) as DataStoredInToken

    const authUserId = verificationResult.id
    const authRoleData = await this.users.findUnique({ where: { id: authUserId }, select: { role: true } })

    if (!authRoleData) throw new HttpException(400, "User does not exist in database.")
    if (authRoleData.role === 'ADMIN') return true
    if (authRoleData.role === 'SUBSCRIBER' && authUserId !== userId) return false
    return true
  }
}

export default HolidayService