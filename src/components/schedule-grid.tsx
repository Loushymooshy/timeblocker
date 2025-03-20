"use client"

import { DndContext, useDroppable, closestCenter } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { Block, ScheduleBlock } from "@/lib/types"
import { ActivityBlock } from "./activity-block"
import { CSS } from "@dnd-kit/utilities"

interface ScheduleGridProps {
  day: string
  scheduleBlocks: ScheduleBlock[]
  blocks: Block[]
  onResizeBlock: (id: string, newDuration: number) => void
  onDragEnd: ({ active, over }: { active: any; over: any }) => void // Updated type
}

export const ScheduleGrid = ({ day, scheduleBlocks, blocks, onResizeBlock, onDragEnd }: ScheduleGridProps) => {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={scheduleBlocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold">{day}</h2>
          </div>

          <div className="relative" style={{ height: "calc(24 * 120px)" }}>
            {/* Time markers */}
            {Array.from({ length: 24 }).map((_, index) => {
              const hour = (index + 6) % 24
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-border"
                  style={{ top: `${index * 120}px` }}
                >
                  <div className="absolute -top-3 left-2 text-xs text-muted-foreground bg-card px-1">
                    {formatHour(hour)}
                  </div>
                </div>
              )
            })}

            {/* 30-minute markers */}
            {Array.from({ length: 24 }).map((_, index) => (
              <div
                key={`half-${index}`}
                className="absolute left-0 right-0 border-t border-border/30"
                style={{ top: `${index * 120 + 60}px` }}
              />
            ))}

            {/* Drop zones */}
            {Array.from({ length: 24 * 2 }).map((_, index) => {
              const hour = index / 2
              return <GridDropZone key={index} day={day} hour={hour} />
            })}

            {/* Schedule blocks */}
            <div className="absolute inset-0 pointer-events-none">
              {scheduleBlocks.map((scheduleBlock) => {
                const block = blocks.find((b) => b.id === scheduleBlock.blockId)
                if (!block) return null

                return (
                  <SortableBlock
                    key={scheduleBlock.id}
                    scheduleBlock={scheduleBlock}
                    block={block}
                    onResizeBlock={onResizeBlock}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </SortableContext>
    </DndContext>
  )
}

const GridDropZone = ({ day, hour }: { day: string; hour: number }) => {
  const { setNodeRef } = useDroppable({
    id: `grid-${day}-${hour}`,
  });

  return (
    <div
      ref={setNodeRef}
      className="absolute left-0 right-0"
      style={{
        top: `${Math.floor(hour * 120)}px`,
        height: "60px",
      }}
    />
  );
};

const SortableBlock = ({
  scheduleBlock,
  block,
  onResizeBlock,
}: {
  scheduleBlock: ScheduleBlock
  block: Block
  onResizeBlock: (id: string, newDuration: number) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: scheduleBlock.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <ActivityBlock
        block={block}
        scheduleBlock={scheduleBlock}
        onResize={onResizeBlock}
        {...attributes}
        {...listeners}
      />
    </div>
  )
}

function formatHour(hour: number): string {
  return hour.toString().padStart(2, "0") + ":00"
}