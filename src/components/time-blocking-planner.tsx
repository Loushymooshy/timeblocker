"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core"
import { BlockPalette } from "./block-palette"
import { ScheduleGrid } from "./schedule-grid"
import { CreateBlockModal } from "./create-block-modal"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Block, ScheduleBlock } from "@/lib/types"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { createSnapModifier } from "@dnd-kit/modifiers"
import { supabase } from "@/lib/supabase"
import { useUser } from "@clerk/nextjs"

const gridSize = 30; // Each grid cell is 30px tall
const snapToGridModifier = createSnapModifier(gridSize);

export default function TimeBlockingPlanner() {
  const { user } = useUser()
  // State variables
  const [activeId, setActiveId] = useState<string | null>(null) // ID of the currently dragged block
  const [blocks, setBlocks] = useState<Block[]>([])
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]) // Scheduled blocks
  const [isWeekView, setIsWeekView] = useState(false) // Toggle between week and day view
  const [activeDay, setActiveDay] = useState("Monday") // Currently active day in day view
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false) // Modal visibility state
  const [activeBlock, setActiveBlock] = useState<Block | null>(null) // Currently dragged block
  const [isLoading, setIsLoading] = useState(true)

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] // Days of the week

  // Load user's blocks and schedule blocks
  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        console.log('No user found')
        return
      }

      console.log('Loading data for user:', user.id)
      setIsLoading(true)
      try {
        // Load blocks
        const { data: initialBlocksData, error: blocksError } = await supabase
          .from('blocks')
          .select('*')
          .eq('user_id', user.id)

        if (blocksError) {
          console.error('Error loading blocks:', blocksError)
          throw blocksError
        }

        console.log('Loaded blocks:', initialBlocksData)
        let blocksData = initialBlocksData

        // If user has no blocks, add default blocks
        if (!blocksData || blocksData.length === 0) {
          console.log('No blocks found, adding default blocks')
          const defaultBlocks = [
            {
              id: `work-${user.id}`,
              user_id: user.id,
              name: 'Work',
              description: 'Work time',
              color: 'bg-blue-300'
            },
            {
              id: `eat-${user.id}`,
              user_id: user.id,
              name: 'Eat',
              description: 'Meal time',
              color: 'bg-green-300'
            },
            {
              id: `sleep-${user.id}`,
              user_id: user.id,
              name: 'Sleep',
              description: 'Sleep time',
              color: 'bg-purple-300'
            }
          ]

          const { error: insertError } = await supabase
            .from('blocks')
            .insert(defaultBlocks)

          if (insertError) {
            console.error('Error inserting default blocks:', insertError)
            throw insertError
          }

          console.log('Successfully inserted default blocks')
          blocksData = defaultBlocks
        }

        // Load schedule blocks
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedule_blocks')
          .select('*')
          .eq('user_id', user.id)

        if (scheduleError) {
          console.error('Error loading schedule blocks:', scheduleError)
          throw scheduleError
        }

        console.log('Loaded schedule blocks:', scheduleData)

        // Transform the data to match our frontend types
        const transformedBlocks = blocksData.map(block => ({
          id: block.id,
          name: block.name,
          description: block.description,
          color: block.color
        }))

        const transformedSchedules = scheduleData.map(schedule => ({
          id: schedule.id,
          blockId: schedule.block_id,
          day: schedule.day,
          startHour: schedule.start_hour,
          duration: schedule.duration
        }))

        console.log('Transformed blocks:', transformedBlocks)
        console.log('Transformed schedules:', transformedSchedules)

        setBlocks(transformedBlocks)
        setScheduleBlocks(transformedSchedules)
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [user])

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
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setActiveBlock(null)
  
    if (over && over.id.toString().startsWith("droppable-") && typeof active.id === "string" && user) {
      console.log('Handling drag end:', { active, over, user: user.id })
      const [_, day, hourStr] = over.id.toString().split("-")
      let hour = Number.parseFloat(hourStr)
      hour = Math.round(hour * 2) / 2
  
      if (!active.id.includes("-schedule-")) {
        const blockId = active.id
        const newScheduleBlock: ScheduleBlock = {
          id: `${blockId}-schedule-${Date.now()}`,
          blockId,
          day,
          startHour: hour,
          duration: 1,
        }
  
        console.log('New schedule block:', newScheduleBlock)
  
        const hasOverlap = scheduleBlocks.some(
          (sb) =>
            sb.day === day &&
            ((sb.startHour <= hour && sb.startHour + sb.duration > hour) ||
              (sb.startHour < hour + 1 && sb.startHour + sb.duration >= hour + 1)),
        )
  
        if (!hasOverlap) {
          // Save to Supabase
          const { error } = await supabase
            .from('schedule_blocks')
            .insert({
              id: newScheduleBlock.id,
              user_id: user.id,
              block_id: newScheduleBlock.blockId,
              day: newScheduleBlock.day,
              start_hour: newScheduleBlock.startHour,
              duration: newScheduleBlock.duration
            })

          if (error) {
            console.error('Error creating schedule block:', error)
            return
          }

          console.log('Successfully created schedule block')
          setScheduleBlocks([...scheduleBlocks, newScheduleBlock])
        }
      }
    }
  }

  // Handle block resizing
  async function handleBlockResize(id: string, newDuration: number) {
    if (!user) return

    const hasOverlap = scheduleBlocks.some(
      (sb) =>
        sb.id !== id &&
        sb.day === scheduleBlocks.find(b => b.id === id)?.day &&
        ((sb.startHour <= scheduleBlocks.find(b => b.id === id)?.startHour! && 
          sb.startHour + sb.duration > scheduleBlocks.find(b => b.id === id)?.startHour!) ||
          (sb.startHour < scheduleBlocks.find(b => b.id === id)?.startHour! + newDuration &&
            sb.startHour + sb.duration >= scheduleBlocks.find(b => b.id === id)?.startHour! + newDuration) ||
            (scheduleBlocks.find(b => b.id === id)?.startHour! <= sb.startHour && 
              scheduleBlocks.find(b => b.id === id)?.startHour! + newDuration > sb.startHour)),
    )

    if (!hasOverlap) {
      // Update in Supabase
      const { error } = await supabase
        .from('schedule_blocks')
        .update({ duration: newDuration })
        .eq('id', id)
        .eq('user_id', user.id)

      if (!error) {
        setScheduleBlocks(
          scheduleBlocks.map((block) => {
            if (block.id === id) {
              return { ...block, duration: newDuration }
            }
            return block
          }),
        )
      }
    }
  }

  // Handle creating a new block
  async function handleCreateBlock(newBlock: Block) {
    if (!user) {
      console.log('No user found when creating block')
      return
    }

    console.log('Creating new block:', newBlock)
    const blockId = `custom-${Date.now()}`
    const blockToSave = {
      id: blockId,
      user_id: user.id,
      name: newBlock.name,
      description: newBlock.description,
      color: newBlock.color
    }

    // Save to Supabase
    const { error } = await supabase
      .from('blocks')
      .insert(blockToSave)

    if (error) {
      console.error('Error creating block:', error)
      return
    }

    console.log('Successfully created block')
    setBlocks([...blocks, { ...newBlock, id: blockId }])
    setIsCreateModalOpen(false)
  }

  // Handle deleting a block
  async function handleDeleteBlock(id: string) {
    if (!user) return

    // Check if this is a palette block or a scheduled block
    const isPaletteBlock = blocks.some(block => block.id === id)
    
    if (isPaletteBlock) {
      // Delete from Supabase blocks table
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (!error) {
        // Remove from local state
        setBlocks(blocks.filter(block => block.id !== id))
        
        // Also delete any scheduled blocks that use this block
        const { error: scheduleError } = await supabase
          .from('schedule_blocks')
          .delete()
          .eq('block_id', id)
          .eq('user_id', user.id)

        if (!scheduleError) {
          setScheduleBlocks(scheduleBlocks.filter(block => block.blockId !== id))
        }
      }
    } else {
      // Delete from Supabase schedule_blocks table
      const { error } = await supabase
        .from('schedule_blocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (!error) {
        setScheduleBlocks(scheduleBlocks.filter(block => block.id !== id))
      }
    }
  }

  // Handle reordering blocks within a day
  const handleBlockReorder = (day: string, newBlocks: ScheduleBlock[]) => {
    setScheduleBlocks(prevBlocks => {
      const otherDays = prevBlocks.filter(block => block.day !== day)
      return [...otherDays, ...newBlocks]
    })
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 max-w-[2000px]">
      {/* Header with title and view toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img src="/timeblock.svg" alt="TimeBlock Logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Righteous, cursive' }}>Time Blocking Planner</h1>
        </div>
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
        modifiers={[restrictToWindowEdges, snapToGridModifier]}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Block palette */}
          <div className="lg:w-64 lg:sticky lg:top-6 lg:self-start lg:h-[calc(100vh-8rem)] overflow-y-auto">
            <BlockPalette 
              blocks={blocks} 
              onCreateClick={() => setIsCreateModalOpen(true)} 
              onDeleteBlock={handleDeleteBlock}
            />
          </div>
          {/* Schedule grid */}
          <div className="flex-1">
            {isWeekView ? (
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => (
                  <div key={day} className="min-w-0">
                    <h3 className="text-center text-sm sm:text-base font-medium mb-2 px-1 truncate">{day}</h3>
                    <ScheduleGrid
                      day={day}
                      blocks={blocks}
                      scheduleBlocks={scheduleBlocks.filter((sb) => sb.day === day)}
                      onBlockResize={handleBlockResize}
                      onDeleteBlock={handleDeleteBlock}
                      onBlockReorder={handleBlockReorder}
                      isWeekView={isWeekView}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Day view navigation */}
                <div className="flex justify-center mb-4 space-x-4 overflow-x-auto pb-8">
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
                  onBlockReorder={handleBlockReorder}
                  isWeekView={isWeekView}
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
