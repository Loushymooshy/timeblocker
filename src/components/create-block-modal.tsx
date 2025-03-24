"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Block, ScheduleBlock } from "@/lib/types"

// Props interface for the CreateBlockModal component
interface CreateBlockModalProps {
  isOpen: boolean // Whether the modal is open
  onClose: () => void // Callback to close the modal
  onCreateBlock: (block: Block) => void // Callback to create a new block
}

// List of pastel colors for block selection
const PASTEL_COLORS = [
  "bg-red-200",
  "bg-orange-200",
  "bg-yellow-200",
  "bg-lime-200",
  "bg-green-200",
  "bg-cyan-200",
  "bg-blue-200",
  "bg-violet-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-rose-200",
]

export function CreateBlockModal({ isOpen, onClose, onCreateBlock }: CreateBlockModalProps) {
  // State variables for form inputs
  const [name, setName] = useState("") // Block name
  const [description, setDescription] = useState("") // Block description
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0]) // Selected block color

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure the block name is not empty
    if (name.trim()) {
      // Call the onCreateBlock callback with the new block data
      onCreateBlock({
        id: "", // ID will be set by the parent component
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
      })

      // Reset form fields
      setName("")
      setDescription("")
      setSelectedColor(PASTEL_COLORS[0])
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-gray-100 border-gray-800">
        <DialogHeader>
          <DialogTitle>Create New Block</DialogTitle>
          <DialogDescription>
            Create a new time block by filling out the form below. Each block can have a name, description, and color.
          </DialogDescription>
        </DialogHeader>

        {/* Form for creating a new block */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Block name input */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Block name"
              className="bg-gray-800 border-gray-700"
              required
            />
          </div>

          {/* Block description input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Block description"
              className="bg-gray-800 border-gray-700"
            />
          </div>

          {/* Block color selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-6 gap-4">
              {PASTEL_COLORS.map((color) => (
                <div
                  key={color}
                  className={`${color} w-10 h-10 rounded-full cursor-pointer ${
                    selectedColor === color ? "ring-2 ring-white" : ""
                  }`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="destructive" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary">Create Block</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}