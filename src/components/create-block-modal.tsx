"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Block } from "./time-blocking-planner"

interface CreateBlockModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateBlock: (block: Block) => void
}

const PASTEL_COLORS = [
  "bg-red-200",
  "bg-orange-200",
  "bg-yellow-200",
  "bg-lime-200",
  "bg-green-200",
  "bg-green-200",
  "bg-cyan-200",
  "bg-blue-200",
  "bg-violet-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-rose-200",
]



export function CreateBlockModal({ isOpen, onClose, onCreateBlock }: CreateBlockModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedColor, setSelectedColor] = useState(PASTEL_COLORS[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateBlock({
        id: "", // Will be set by parent component
        name: name.trim(),
        description: description.trim(),
        color: selectedColor,
      })

      // Reset form
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
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Block</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

