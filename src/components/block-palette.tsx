"use client"


import { useState } from "react"
import { DndContext, DragOverlay, useDraggable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Block} from "@/lib/types"
import { v4 as uuidv4 } from "uuid";


interface BlockPaletteProps {
  blocks: Block[]
  addNewBlock: (block: Block) => void
}

export const BlockPalette = ({ blocks, addNewBlock }: BlockPaletteProps) => {
  const [activeBlock, setActiveBlock] = useState<Block | null>(null)
  const [open, setOpen] = useState(false)
  const [newBlock, setNewBlock] = useState<Omit<Block, "id">>({
    name: "",
    description: "",
    color: "bg-yellow-300",
  })

  const handleCreateBlock = () => {
    if (newBlock.name.trim()) {
      addNewBlock({
        id: `custom-${uuidv4()}`,
        ...newBlock,
      })
      setNewBlock({
        name: "",
        description: "",
        color: "bg-yellow-300",
      })
      setOpen(false)
    }
  }

  const colorOptions = [
    "bg-red-300",
    "bg-orange-300",
    "bg-yellow-300",
    "bg-green-300",
    "bg-teal-300",
    "bg-blue-300",
    "bg-indigo-300",
    "bg-purple-300",
    "bg-pink-300",
  ]

  return (
    <DndContext
      onDragStart={({ active }) => {
        const block = blocks.find((b) => `template-${b.id}` === active.id)
        setActiveBlock(block || null)
      }}
      onDragEnd={() => setActiveBlock(null)}
      onDragCancel={() => setActiveBlock(null)}
    >
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Block Palette</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Block</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newBlock.name}
                    onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })}
                    placeholder="Block name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newBlock.description}
                    onChange={(e) => setNewBlock({ ...newBlock, description: e.target.value })}
                    placeholder="Block description"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${color} ${
                          newBlock.color === color ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                        }`}
                        onClick={() => setNewBlock({ ...newBlock, color })}
                        type="button"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={handleCreateBlock}>Create Block</Button>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {blocks.map((block) => (
            <DraggableBlock key={block.id} block={block} />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeBlock ? (
          <div
            className={`${activeBlock.color} p-3 rounded-md shadow-sm`}
            style={{ touchAction: "none" }}
          >
            <div className="font-medium">{activeBlock.name}</div>
            {activeBlock.description && (
              <div className="text-xs mt-1 text-gray-700">{activeBlock.description}</div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

const DraggableBlock = ({ block }: { block: Block }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${block.id}`,
  })

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