"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import type { Block, ScheduleBlock } from "./time-blocking-planner"

interface ActivityBlockProps {
  scheduleBlock: ScheduleBlock
  block: Block
  style: React.CSSProperties
  onResize: (id: string, newDuration: number) => void
  onDelete: (id: string) => void
}

export function ActivityBlock({ scheduleBlock, block, style, onResize, onDelete }: ActivityBlockProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startHeight, setStartHeight] = useState(0)
  const blockRef = useRef<HTMLDivElement>(null)

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsResizing(true)
    setStartY(e.clientY)
    setStartHeight(blockRef.current?.offsetHeight || 0)

    // Add event listeners for mouse move and up
    document.addEventListener("mousemove", handleResizeMove)
    document.addEventListener("mouseup", handleResizeEnd)
  }

  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return

    const deltaY = e.clientY - startY
    const newHeight = Math.max(30, startHeight + deltaY) // Minimum 30px (0.5 hour)

    // Snap to 30px increments (0.5 hour)
    const snappedHeight = Math.round(newHeight / 30) * 30

    if (blockRef.current) {
      blockRef.current.style.height = `${snappedHeight}px`
    }
  }

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false)

    // Calculate new duration in hours
    if (blockRef.current) {
      const newHeight = blockRef.current.offsetHeight
      const newDuration = newHeight / 60 // 60px per hour
      onResize(scheduleBlock.id, newDuration)
    }

    // Remove event listeners
    document.removeEventListener("mousemove", handleResizeMove)
    document.removeEventListener("mouseup", handleResizeEnd)
  }

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleResizeMove)
      document.removeEventListener("mouseup", handleResizeEnd)
    }
  }, [isResizing])

  return (
    <div
      ref={blockRef}
      className={`${block.color} text-gray-900 absolute left-0 right-0 mx-2 rounded pointer-events-auto`}
      style={style}
    >
      <div className="p-2 h-full flex flex-col">
        <div className="flex justify-between items-start">
          <div className="font-medium truncate">{block.name}</div>
          <button onClick={() => onDelete(scheduleBlock.id)} className="text-gray-700 hover:text-gray-900">
            <X size={16} />
          </button>
        </div>
        <div className="text-xs truncate">{block.description}</div>

        {/* Time display */}
        <div className="text-xs mt-auto">
          {`${Math.floor(scheduleBlock.startHour)}:${scheduleBlock.startHour % 1 ? "30" : "00"} - ${Math.floor(
            scheduleBlock.startHour + scheduleBlock.duration,
          )}:${(scheduleBlock.startHour + scheduleBlock.duration) % 1 ? "30" : "00"}`}
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 bg-gray-800 opacity-50 cursor-ns-resize rounded-b"
        onMouseDown={handleResizeStart}
      />
    </div>
  )
}

