"use client"

import { useDraggable } from "@dnd-kit/core" 
import { Button } from "@/components/ui/button" 
import { Plus, X } from "lucide-react" 
import type { Block, ScheduleBlock } from "@/lib/types"

// Props interface for the BlockPalette component
interface BlockPaletteProps {
  blocks: Block[] // Type definition for a Block
  onCreateClick: () => void // Callback for the "Create" button click
  onDeleteBlock: (blockId: string) => void // Callback for deleting a block
}

// BlockPalette component: Displays a list of draggable activity blocks and a "Create" button to create new blocks
export function BlockPalette({ blocks, onCreateClick, onDeleteBlock }: BlockPaletteProps) {
  return (
    <div className="bg-gray-900 p-4 rounded-lg w-full lg:w-64 min-h-fit">
      {/* Header with title and "Create" button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Block Palette</h2>
        <Button size="sm" onClick={onCreateClick} variant="secondary">
          <Plus className="h-4 w-4 mr-1" />
          Create
        </Button>
      </div>

      {/* List of draggable blocks */}
      <div className="space-y-3">
        {blocks.map((block) => (
          <DraggableBlock key={block.id} block={block} onDelete={onDeleteBlock} />
        ))}
      </div>
    </div>
  )
}

// DraggableBlock component: Represents a single draggable block. 
// useDraggable hook provides drag-and-drop functionality
function DraggableBlock({ block, onDelete }: { block: Block; onDelete: (blockId: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: block.id, 
  })

  return (
    <div // dnd-kit draggable element 
      ref={setNodeRef} // Reference to the DOM element for drag-and-drop
      {...listeners} 
      {...attributes} 
      className={`${block.color} text-gray-900 p-3 rounded cursor-grab active:cursor-grabbing relative ${
        isDragging ? "opacity-50" : "" // Reduce opacity while dragging
      }`}
    >
      {/* Block name */}
      <div className="font-medium">{block.name}</div>
      {/* Block description */}
      <div className="text-xs">{block.description}</div>
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(block.id);
        }}
        className="absolute top-1 right-1 p-1 hover:bg-gray-800/30 rounded-full"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}