"use client"

import { useDraggable } from "@dnd-kit/core"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Block } from "./time-blocking-planner"

interface BlockPaletteProps {
  blocks: Block[]
  onCreateClick: () => void
}

export function BlockPalette({ blocks, onCreateClick }: BlockPaletteProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg w-full lg:w-64">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Block Palette</h2>
        <Button size="sm" onClick={onCreateClick} variant="secondary">
          <Plus className="h-4 w-4 mr-1" />
          Create
        </Button>
      </div>

      <div className="space-y-3">
        {blocks.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}

function DraggableBlock({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id,
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`${block.color} text-gray-900 p-3 rounded cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="font-medium">{block.name}</div>
      <div className="text-xs">{block.description}</div>
    </div>
  )
}

