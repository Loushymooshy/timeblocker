export type Block = {
  id: string
  name: string
  description: string
  color: string
}

export type ScheduleBlock = {
  id: string
  blockId: string
  day: string
  startHour: number
  duration: number
}