"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import type { Block, ScheduleBlock } from "@/lib/types"

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
  const [isResizing, setIsResizing] = useState(false) // Tracks if the block is being resized
  const [startY, setStartY] = useState(0) // Initial Y position of the mouse during resize
  const [startHeight, setStartHeight] = useState(0) // Initial height of the block during resize
  const blockRef = useRef<HTMLDivElement>(null) // Reference to the block DOM element

  // Handle the start of resizing
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event from bubbling up
    setIsResizing(true)
    setStartY(e.clientY)
    setStartHeight(blockRef.current?.offsetHeight || 0)

    // Add event listeners for mouse move and mouse up
    document.addEventListener("mousemove", handleResizeMove)
    document.addEventListener("mouseup", handleResizeEnd)
  }

  // Handle the resizing movement
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaY = e.clientY - startY
    const newHeight = Math.max(30, startHeight + deltaY)
    const snappedHeight = Math.round(newHeight / 30) * 30

    // Update the block's height in real-time
    if (blockRef.current) {
      blockRef.current.style.height = `${snappedHeight}px`
    }
  }

  // Handle the end of resizing
  const handleResizeEnd = () => {
    setIsResizing(false)

    // Calculate the new duration in hours and call the onResize callback
    if (blockRef.current) {
      const newHeight = blockRef.current.offsetHeight
      const newDuration = newHeight / 30 // 30px corresponds to 1 hour
      onResize(scheduleBlock.id, newDuration)
    }

    // Stop the eventlisteners for mouse move and mouse up
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

  return (
    <div
      ref={blockRef}
      className={`${block.color} text-gray-900 absolute left-0 right-0 rounded pointer-events-auto ${
        isResizing ? 'ring-2 ring-blue-500' : ''
      }`}
      style={style}
    >
      {/* Block content */}
      <div className="p-2 h-full flex flex-col">
        {/* Header with block name and delete button */}
        <div className="flex justify-between items-start">
          <div className="font-medium truncate">{block.name}</div>
          <button onClick={() => onDelete(scheduleBlock.id)} className="text-gray-700 hover:text-gray-900">
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
        className="absolute bottom-0 left-0 right-0 h-4 bg-gray-800/30 hover:bg-gray-800/50 cursor-ns-resize rounded-b flex items-center justify-center group"
        onMouseDown={handleResizeStart}
      >
        <div className="w-12 h-1 bg-gray-600 rounded-full group-hover:bg-gray-400 transition-colors" />
      </div>
    </div>
  )
}