import { useDroppable } from "@dnd-kit/core" // Hook for making elements droppable
import { ActivityBlock } from "./activity-block" 
import type { Block, ScheduleBlock } from "@/lib/types"

// Props interface for the ScheduleGrid component
interface ScheduleGridProps {
  day: string 
  blocks: Block[] 
  scheduleBlocks: ScheduleBlock[] 
  onBlockResize: (id: string, newDuration: number) => void // Callback for resizing a block
  onDeleteBlock: (id: string) => void // Callback for deleting a block
}

// ScheduleGrid component: Displays a grid for scheduling blocks
export function ScheduleGrid({ day, blocks, scheduleBlocks, onBlockResize, onDeleteBlock }: ScheduleGridProps) {
  // Generate 24 hours (48 half-hour slots)
  const hours = Array.from({ length: 48 }, (_, i) => i / 2)

  return (
    <div className="bg-gray-900 rounded-lg p-2 relative">
      {/* Render the grid with droppable slots */}
      <div className="grid grid-cols-1 gap-[1px]">
        {hours.map((hour) => (
          <DroppableHour key={hour} day={day} hour={hour} />
        ))}
      </div>

      {/* Render the scheduled blocks on top of the grid */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none">
        {scheduleBlocks.map((scheduleBlock) => {
          // Find the corresponding block data
          const block = blocks.find((b) => b.id === scheduleBlock.blockId)
          if (!block) return null

          // Calculate the position and height of the block
          const topPosition = scheduleBlock.startHour * 60 // 60px per hour
          const height = scheduleBlock.duration * 60 // Height based on duration

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

// DroppableHour component: Represents a single time slot in the grid
function DroppableHour({ day, hour }: { day: string; hour: number }) {
  const isHalfHour = hour % 1 !== 0 // Check if the slot is a half-hour
  const hourLabel = isHalfHour ? "" : `${Math.floor(hour)}:00` // Label for full hours

  // useDroppable hook provides droppable functionality
  const { setNodeRef } = useDroppable({
    id: `droppable-${day}-${hour}`, // Unique ID for the droppable slot
  })

  return (
    <div
      ref={setNodeRef} // Reference to the DOM element for drag-and-drop
      className={`h-[30px] relative ${isHalfHour ? "border-t border-gray-800" : "border-t border-gray-700"}`}
    >
      {/* Display the hour label for full-hour slots */}
      {!isHalfHour && <div className="absolute -top-2.5 -left-2 text-xs text-gray-500">{hourLabel}</div>}
    </div>
  )
}