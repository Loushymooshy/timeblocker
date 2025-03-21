"use client"

import { useState } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { BlockPalette } from "./block-palette"
import { ScheduleGrid } from "./schedule-grid"
import { CreateBlockModal } from "./create-block-modal"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Block, ScheduleBlock } from "@/lib/types"

export default function TimeBlockingPlanner() {
  // State variables
  const [activeId, setActiveId] = useState<string | null>(null) // ID of the currently dragged block
  const [blocks, setBlocks] = useState<Block[]>([ // The initial starter blocks
    { id: "work", name: "Work", description: "Work time", color: "bg-blue-300" },
    { id: "eat", name: "Eat", description: "Meal time", color: "bg-green-300" },
    { id: "sleep", name: "Sleep", description: "Sleep time", color: "bg-purple-300" },
  ])
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]) // Scheduled blocks
  const [isWeekView, setIsWeekView] = useState(false) // Toggle between week and day view
  const [activeDay, setActiveDay] = useState("Monday") // Currently active day in day view
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false) // Modal visibility state
  const [activeBlock, setActiveBlock] = useState<Block | null>(null) // Currently dragged block

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] // Days of the week

  // Configure drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start dragging
      },
    }),
  )

  // Handle drag start event
  function handleDragStart(event: DragStartEvent) {
    const { active } = event
    setActiveId(active.id as string)

    // If dragging from the palette, set the active block
    if (typeof active.id === "string" && !active.id.includes("-schedule-")) {
      const block = blocks.find((b) => b.id === active.id)
      if (block) {
        setActiveBlock(block)
      }
    }
  }

  // Handle drag end event
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setActiveBlock(null)

    if (over && over.id.toString().startsWith("droppable-") && typeof active.id === "string") {
      // Extract day and hour from the droppable ID (format: droppable-day-hour)
      const [_, day, hourStr] = over.id.toString().split("-")
      const hour = Number.parseFloat(hourStr)

      // If dragging from the palette
      if (!active.id.includes("-schedule-")) {
        const blockId = active.id
        const newScheduleBlock: ScheduleBlock = {
          id: `${blockId}-schedule-${Date.now()}`,
          blockId,
          day,
          startHour: hour,
          duration: 1, // Default duration: 1 hour
        }

        // Check for overlaps with existing blocks
        const hasOverlap = scheduleBlocks.some(
          (sb) =>
            sb.day === day &&
            ((sb.startHour <= hour && sb.startHour + sb.duration > hour) ||
              (sb.startHour < hour + 1 && sb.startHour + sb.duration >= hour + 1)),
        )

        if (!hasOverlap) {
          setScheduleBlocks([...scheduleBlocks, newScheduleBlock])
        }
      }
    }
  }

  // Handle block resizing
  function handleBlockResize(id: string, newDuration: number) {
    setScheduleBlocks(
      scheduleBlocks.map((block) => {
        if (block.id === id) {
          // Check for overlaps with other blocks
          const hasOverlap = scheduleBlocks.some(
            (sb) =>
              sb.id !== id &&
              sb.day === block.day &&
              ((sb.startHour <= block.startHour && sb.startHour + sb.duration > block.startHour) ||
                (sb.startHour < block.startHour + newDuration &&
                  sb.startHour + sb.duration >= block.startHour + newDuration) ||
                (block.startHour <= sb.startHour && block.startHour + newDuration > sb.startHour)),
          )

          if (!hasOverlap) {
            return { ...block, duration: newDuration }
          }
        }
        return block
      }),
    )
  }

  // Handle creating a new block
  function handleCreateBlock(newBlock: Block) {
    setBlocks([...blocks, { ...newBlock, id: `custom-${Date.now()}` }])
    setIsCreateModalOpen(false)
  }

  // Handle deleting a block
  function handleDeleteBlock(id: string) {
    setScheduleBlocks(scheduleBlocks.filter((block) => block.id !== id))
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header with title and view toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Time Blocking Planner</h1>
        <div className="flex items-center space-x-2">
          <Switch id="view-mode" checked={isWeekView} onCheckedChange={setIsWeekView} />
          <Label htmlFor="view-mode">{isWeekView ? "Week View" : "Day View"}</Label>
        </div>
      </div>

      {/* Drag-and-drop context */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Block palette */}
          <div className="lg:w-64 max-h-[400px] overflow-y-auto sticky top-4">
            <BlockPalette blocks={blocks} onCreateClick={() => setIsCreateModalOpen(true)} />
          </div>

          {/* Schedule grid */}
          <div className="flex-1 overflow-x-auto">
            {isWeekView ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-2">
                {days.map((day) => (
                  <div key={day} className="min-w-[200px]">
                    <h3 className="text-center font-medium mb-2">{day}</h3>
                    <ScheduleGrid
                      day={day}
                      blocks={blocks}
                      scheduleBlocks={scheduleBlocks.filter((sb) => sb.day === day)}
                      onBlockResize={handleBlockResize}
                      onDeleteBlock={handleDeleteBlock}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Day view navigation */}
                <div className="flex justify-center mb-4 space-x-4 overflow-x-auto py-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      className={`px-4 py-2 rounded-md ${
                        activeDay === day ? "bg-primary text-primary-foreground" : "bg-gray-800 text-gray-300"
                      }`}
                      onClick={() => setActiveDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <ScheduleGrid
                  day={activeDay}
                  blocks={blocks}
                  scheduleBlocks={scheduleBlocks.filter((sb) => sb.day === activeDay)}
                  onBlockResize={handleBlockResize}
                  onDeleteBlock={handleDeleteBlock}
                />
              </div>
            )}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeId && activeBlock && (
            <div className={`${activeBlock.color} text-gray-900 p-2 rounded shadow-lg w-40`}>{activeBlock.name}</div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Create block modal */}
      <CreateBlockModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBlock={handleCreateBlock}
      />
    </div>
  )
}
