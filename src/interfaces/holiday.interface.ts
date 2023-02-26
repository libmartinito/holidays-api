export interface Holiday {
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
  current?: Holiday[]
}