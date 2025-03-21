import { useDroppable } from "@dnd-kit/core"
import { ActivityBlock } from "./activity-block"
import type { Block, ScheduleBlock } from "./time-blocking-planner"

interface ScheduleGridProps {
  day: string
  blocks: Block[]
  scheduleBlocks: ScheduleBlock[]
  onBlockResize: (id: string, newDuration: number) => void
  onDeleteBlock: (id: string) => void
}

export function ScheduleGrid({ day, blocks, scheduleBlocks, onBlockResize, onDeleteBlock }: ScheduleGridProps) {
  // Generate 24 hours (48 half-hour slots)
  const hours = Array.from({ length: 48 }, (_, i) => i / 2)

  return (
    <div className="bg-gray-900 rounded-lg p-2 relative">
      <div className="grid grid-cols-1 gap-[1px]">
        {hours.map((hour) => (
          <DroppableHour key={hour} day={day} hour={hour} />
        ))}
      </div>

      {/* Render the blocks on top of the grid */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        {scheduleBlocks.map((scheduleBlock) => {
          const block = blocks.find((b) => b.id === scheduleBlock.blockId)
          if (!block) return null

          // Calculate position and height
          const topPosition = scheduleBlock.startHour * 60 // 60px per hour
          const height = scheduleBlock.duration * 60

          return (
            <ActivityBlock
              key={scheduleBlock.id}
              scheduleBlock={scheduleBlock}
              block={block}
              style={{
                top: `${topPosition}px`,
                height: `${height}px`,
              }}
              onResize={onBlockResize}
              onDelete={onDeleteBlock}
            />
          )
        })}
      </div>
    </div>
  )
}

function DroppableHour({ day, hour }: { day: string; hour: number }) {
  const isHalfHour = hour % 1 !== 0
  const hourLabel = isHalfHour ? "" : `${Math.floor(hour)}:00`

  const { setNodeRef } = useDroppable({
    id: `droppable-${day}-${hour}`,
  })

  return (
    <div
      ref={setNodeRef}
      className={`h-[30px] relative ${isHalfHour ? "border-t border-gray-800" : "border-t border-gray-700"}`}
    >
      {!isHalfHour && <div className="absolute -top-2.5 -left-2 text-xs text-gray-500">{hourLabel}</div>}
    </div>
  )
}

