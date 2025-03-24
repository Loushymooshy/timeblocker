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
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  // Add sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: scheduleBlock.id })

  // Handle mouse move during resize
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaY = e.clientY - startY
    const newHeight = Math.max(60, startHeight + deltaY)
    const snappedHeight = Math.round(newHeight / 60) * 60
    setCurrentHeight(snappedHeight)
  }

  // Handle mouse up during resize
  const handleMouseUp = () => {
    if (!isResizing) return
    
    setIsResizing(false)
    const newDuration = currentHeight / 60
    onResize(scheduleBlock.id, newDuration)
  }

  // Handle the start of resizing
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setStartY(e.clientY)
    setStartHeight(currentHeight)
  }

  // Handle delete click
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(scheduleBlock.id)
  }

  // Add and remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, startY, startHeight, currentHeight])

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
      {/* Delete button - outside of draggable area */}
      <button 
        onClick={handleDelete}
        className="absolute top-1 right-1 p-1 hover:bg-gray-800/30 rounded-full transition-colors z-20"
      >
        <X size={16} />
      </button>

      {/* Block content */}
      <div className="p-2 h-full flex flex-col">
        {/* Header with block name - this is the draggable area */}
        <div 
          className="flex justify-between items-start cursor-grab active:cursor-grabbing relative"
          {...attributes}
          {...listeners}
        >
          <div className="font-medium truncate">{block.name}</div>
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
        ref={resizeHandleRef}
        className="absolute bottom-0 left-0 right-0 h-6 bg-gray-800/30 hover:bg-gray-800/50 cursor-ns-resize rounded-b flex items-center justify-center group z-10"
        onMouseDown={handleResizeStart}
      >
        <div className="w-12 h-1 bg-gray-600 rounded-full group-hover:bg-gray-400 transition-colors" />
      </div>
    </div>
  )
}