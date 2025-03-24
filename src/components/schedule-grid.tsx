import { useDroppable, DndContext } from "@dnd-kit/core" // Hook for making elements droppable
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ActivityBlock } from "./activity-block" 
import type { Block, ScheduleBlock } from "@/lib/types"

// Props interface for the ScheduleGrid component
interface ScheduleGridProps {
  day: string 
  blocks: Block[] 
  scheduleBlocks: ScheduleBlock[] 
  onBlockResize: (id: string, newDuration: number) => void // Callback for resizing a block
  onDeleteBlock: (id: string) => void // Callback for deleting a block
  onBlockReorder: (day: string, blocks: ScheduleBlock[]) => void // Callback for reordering blocks
  isWeekView?: boolean // Whether this grid is being used in week view
}

// ScheduleGrid component: Displays a grid for scheduling blocks
export function ScheduleGrid({ day, blocks, scheduleBlocks, onBlockResize, onDeleteBlock, onBlockReorder, isWeekView = false }: ScheduleGridProps) {
  // Generate 24 hours (48 half-hour slots)
  const hours = Array.from({ length: 48 }, (_, i) => i / 2)

  // Create sortable items from schedule blocks
  const sortableItems = scheduleBlocks.map(block => ({
    ...block,
    id: block.id
  }))

  // Handle drag end for sorting
  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      const oldIndex = sortableItems.findIndex(item => item.id === active.id)
      const newIndex = sortableItems.findIndex(item => item.id === over.id)

      const newBlocks = [...scheduleBlocks]
      const [movedBlock] = newBlocks.splice(oldIndex, 1)
      
      // Calculate the new start hour based on the target position
      const targetBlock = newBlocks[newIndex]
      if (targetBlock) {
        // If moving down, place after the target block
        if (oldIndex < newIndex) {
          movedBlock.startHour = targetBlock.startHour + targetBlock.duration
        } else {
          // If moving up, place before the target block
          movedBlock.startHour = targetBlock.startHour
        }
      } else {
        // If moving to the end, place after the last block
        const lastBlock = newBlocks[newBlocks.length - 1]
        movedBlock.startHour = lastBlock ? lastBlock.startHour + lastBlock.duration : 0
      }

      // Insert the block at the new position
      newBlocks.splice(newIndex, 0, movedBlock)

      // Adjust start times of all blocks to prevent overlapping
      for (let i = 0; i < newBlocks.length; i++) {
        if (i === 0) {
          // First block starts at 0
          newBlocks[i].startHour = 0
        } else {
          // Each subsequent block starts after the previous block ends
          newBlocks[i].startHour = newBlocks[i - 1].startHour + newBlocks[i - 1].duration
        }
      }

      onBlockReorder(day, newBlocks)
    }
  }

  return (
    <div className="bg-gray-800 rounded-b-lg m-2 border-10 border-solid border-gray-800 relative">
      {/* Day label */}
      <div className={`absolute -top-13 -mx-2.5 left-0 right-0 ${isWeekView ? 'text-center pl-0' : 'text-left pl-14'} text-sm sm:text-base font-semibold text-gray-300 bg-gray-800 rounded-t-lg pb-3 pt-2 truncate`}>
        {day}
      </div>
     
      <div className="bg-gray-800 rounded-b-md"> 
        {/* Render the grid with droppable slots */}
        <div className="grid grid-cols-1">
          {hours.map((hour) => (
            <DroppableHour key={hour} day={day} hour={hour} />
          ))}
        </div>

        {/* Render the scheduled blocks on top of the grid */}
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            <div className="absolute top-0 left-0 right-0">
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
                      margin: '0 4px', 
                    }}
                    onResize={onBlockResize}
                    onDelete={onDeleteBlock}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

function DroppableHour({ day, hour }: { day: string; hour: number }) {
  const isHalfHour = hour % 1 !== 0 // Check if the slot is a half-hour
  const hourLabel = isHalfHour ? "" : formatHour(Math.floor(hour)) // Label for full hours

  // useDroppable hook provides droppable functionality
  const { setNodeRef } = useDroppable({
    id: `droppable-${day}-${hour}`, // Unique ID for the droppable slot
  })

  return (
    <div
      ref={setNodeRef}
      className={`h-[30px] relative border-t border-gray-700`}
    >
      {/* Hour label */}
      {!isHalfHour && (
        <div className="absolute -top-3 left-2 text-xs text-gray-400 bg-gray-800 px-1">
          {hourLabel}
        </div>
      )}
    </div>
  )
}

function formatHour(hour: number): string {
  return hour.toString().padStart(2, "0") + ":00"
}