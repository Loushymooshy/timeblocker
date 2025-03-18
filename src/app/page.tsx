"use client"

import { useState } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import { BlockPalette } from "../components/block-palette"
import { ScheduleGrid } from "../components/schedule-grid"

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

export const PlannerApp = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "work", name: "Work", description: "Work time", color: "bg-blue-300" },
    { id: "eat", name: "Eat", description: "Meal time", color: "bg-green-300" },
    { id: "sleep", name: "Sleep", description: "Sleep time", color: "bg-purple-300" },
  ])

  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([])
  const [activeDay, setActiveDay] = useState("Monday")

  const handleResizeBlock = (id: string, newDuration: number) => {
    // Ensure minimum duration of 10 minutes (1/6 hour)
    const duration = Math.max(newDuration, 1 / 6)

    const updatedBlocks = scheduleBlocks.map((block) => {
      if (block.id === id) {
        // Check for overlaps with other blocks
        const hasOverlap = scheduleBlocks.some(
          (otherBlock) =>
            otherBlock.id !== id &&
            otherBlock.day === block.day &&
            block.startHour < otherBlock.startHour + otherBlock.duration &&
            block.startHour + duration > otherBlock.startHour,
        )

        if (!hasOverlap) {
          return { ...block, duration }
        }
      }
      return block
    })

    setScheduleBlocks(updatedBlocks)
  }

  const handleDragEnd = (activeId: string, overId: string | null) => {
    if (overId && activeId !== overId) {
      setScheduleBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === activeId)
        const newIndex = items.findIndex((item) => item.id === overId)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const addNewBlock = (block: Block) => {
    setBlocks([...blocks, block])
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Time Blocking Planner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <BlockPalette blocks={blocks} addNewBlock={addNewBlock} />
        </div>

        <div className="lg:col-span-3">
          <div>
            <div className="flex mb-4 space-x-2 overflow-x-auto pb-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <button
                  key={day}
                  className={`px-4 py-2 rounded-md ${
                    activeDay === day ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                  onClick={() => setActiveDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
            <ScheduleGrid
              day={activeDay}
              scheduleBlocks={scheduleBlocks.filter((block) => block.day === activeDay)}
              blocks={blocks}
              onResizeBlock={handleResizeBlock}
              onDragEnd={handleDragEnd}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlannerApp