export interface HolidayResult {
  date: string,
  start: Date,
  end: Date,
  name: string,
  type: string,
  substitute?: boolean,
  note?: string
}

export interface PaginatedHolidayList {
  next?: {
    page: number,
    limit: number
  },
  prev?: {
    page: number,
    limit: number
  },
  current?: HolidayResult[]
}

export interface HolidayData {
  user_id: number,
  country: string,
  holiday_id: string
}