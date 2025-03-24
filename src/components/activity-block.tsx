"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import type { Block, ScheduleBlock } from "@/lib/types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Props interface for the ActivityBlock component
interface ActivityBlockProps {
  scheduleBlock: ScheduleBlock 
  block: Block 
  style: React.CSSProperties // Inline styles for the block
  onResize: (id: string, newDuration: number) => void // Callback for resizing
  onDelete: (id: string) => void // Callback for deleting the block
}

// ActivityBlock component
export function ActivityBlock({ scheduleBlock, block, style, onResize, onDelete }: ActivityBlockProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startHeight, setStartHeight] = useState(0)
  const [currentHeight, setCurrentHeight] = useState(parseInt(style.height as string) || 0)
  const blockRef = useRef<HTMLDivElement>(null)

  // Add sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: scheduleBlock.id })

  // Handle the start of resizing
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setStartY(e.clientY)
    setStartHeight(currentHeight)

    document.addEventListener("mousemove", handleResizeMove)
    document.addEventListener("mouseup", handleResizeEnd)
  }

  // Handle the resizing movement
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaY = e.clientY - startY
    const newHeight = Math.max(60, startHeight + deltaY)
    const snappedHeight = Math.round(newHeight / 60) * 60
    setCurrentHeight(snappedHeight)
  }

  // Handle the end of resizing
  const handleResizeEnd = () => {
    setIsResizing(false)
    const newDuration = currentHeight / 60
    onResize(scheduleBlock.id, newDuration)

    document.removeEventListener("mousemove", handleResizeMove)
    document.removeEventListener("mouseup", handleResizeEnd)
  }

  // Clean up event listeners when the component unmounts
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove)
      document.removeEventListener("mouseup", handleResizeEnd)
    }
  }, [isResizing])

  // Apply transform for dragging
  const dragStyle = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    height: `${currentHeight}px`
  }

  return (
    <div
      ref={setNodeRef}
      className={`${block.color} text-gray-900 absolute left-0 right-0 rounded ${
        isDragging ? 'ring-2 ring-blue-500 opacity-80' : ''
      }`}
      style={dragStyle}
    >
      {/* Block content */}
      <div className="p-2 h-full flex flex-col">
        {/* Header with block name and delete button - this is the draggable area */}
        <div 
          className="flex justify-between items-start cursor-grab active:cursor-grabbing relative"
          {...attributes}
          {...listeners}
        >
          <div className="font-medium truncate">{block.name}</div>
          <button 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete(scheduleBlock.id)
            }} 
            className="p-1 hover:bg-gray-800/30 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Block description */}
        <div className="text-xs truncate">{block.description}</div>

        {/* Time display on the block, which can change when moved or resized */}
        <div className="text-xs mt-auto">
          {`${Math.floor(scheduleBlock.startHour)}:${scheduleBlock.startHour % 1 ? "30" : "00"} - ${Math.floor(
            scheduleBlock.startHour + scheduleBlock.duration,
          )}:${(scheduleBlock.startHour + scheduleBlock.duration) % 1 ? "30" : "00"}`}
        </div>
      </div>

      {/* Resize handle on the bottom of the block */}
      <div
        className="absolute bottom-0 left-0 right-0 h-6 bg-gray-800/30 hover:bg-gray-800/50 cursor-ns-resize rounded-b flex items-center justify-center group"
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleResizeStart(e)
        }}
      >
        <div className="w-12 h-1 bg-gray-600 rounded-full group-hover:bg-gray-400 transition-colors" />
      </div>
    </div>
  )
}