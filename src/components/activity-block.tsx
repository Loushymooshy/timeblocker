"use client"

import type React from "react"

import { useDraggable } from "@dnd-kit/core"
import type { Block, ScheduleBlock } from "../app/page"

interface ActivityBlockProps {
  block: Block
  scheduleBlock?: ScheduleBlock | null
  isOverlay?: boolean
  onResize?: (id: string, newDuration: number) => void
}

export const ActivityBlock = ({ block, scheduleBlock, isOverlay = false, onResize }: ActivityBlockProps) => {
  const id = scheduleBlock ? `schedule-${scheduleBlock.id}` : block.id
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    disabled: isOverlay,
  })

  const handleResize = (e: React.MouseEvent<HTMLDivElement>, direction: "bottom") => {
    e.stopPropagation()

    if (!scheduleBlock || !onResize) return

    const startY = e.clientY
    const startHeight = scheduleBlock.duration * 120 // 120px per hour

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY
      const newHeight = startHeight + deltaY
      const newDuration = Math.round((newHeight / 120) * 6) / 6 // Round to nearest 10 minutes (1/6 of an hour)
      onResize(scheduleBlock.id, newDuration)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  if (!scheduleBlock) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`${block.color} p-3 rounded-md cursor-grab shadow-sm ${isDragging ? "opacity-50" : ""}`}
        style={{
          touchAction: "none",
        }}
      >
        <div className="font-medium">{block.name}</div>
        {block.description && <div className="text-xs mt-1 text-gray-700">{block.description}</div>}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${block.color} absolute rounded-md cursor-grab shadow-sm ${isDragging ? "opacity-50" : ""}`}
      style={{
        top: `${scheduleBlock.startHour * 120}px`,
        height: `${scheduleBlock.duration * 120}px`,
        left: "0",
        right: "0",
        touchAction: "none",
      }}
    >
      <div className="p-2 h-full flex flex-col">
        <div className="font-medium truncate">{block.name}</div>
        {scheduleBlock.duration >= 0.5 && block.description && (
          <div className="text-xs mt-1 text-gray-700 line-clamp-2">{block.description}</div>
        )}
        <div className="text-xs mt-auto">
          {formatTime(scheduleBlock.startHour)} - {formatTime(scheduleBlock.startHour + scheduleBlock.duration)}
        </div>
      </div>

      {onResize && (
        <div
          className="absolute bottom-0 left-0 right-0 h-2 bg-black/10 cursor-ns-resize"
          onMouseDown={(e) => handleResize(e, "bottom")}
        />
      )}
    </div>
  )
}

function formatTime(hour: number): string {
  const hours = Math.floor(hour)
  const minutes = Math.round((hour - hours) * 60)

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

