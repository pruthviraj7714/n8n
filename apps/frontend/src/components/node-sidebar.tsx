"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MousePointer, Webhook, Send, Mail, Zap } from "lucide-react"

interface NodeSidebarProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void
}

export function NodeSidebar({ onAddNode }: NodeSidebarProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType)
    event.dataTransfer.effectAllowed = "move"
  }

  const handleAddNode = (type: string) => {
    // Add node at center of viewport
    onAddNode(type, { x: 400, y: 300 })
  }

  return (
    <div className="w-80 bg-card border-r border-border p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5" />
        Workflow Nodes
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Triggers</h3>
          <div className="space-y-2">
            <Card
              className="p-3 cursor-pointer hover:bg-accent transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, "manual")}
              onClick={() => handleAddNode("manual")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <MousePointer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Manual Trigger</div>
                  <div className="text-xs text-muted-foreground">Execute manually</div>
                </div>
              </div>
            </Card>

            <Card
              className="p-3 cursor-pointer hover:bg-accent transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, "webhook")}
              onClick={() => handleAddNode("webhook")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Webhook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Webhook</div>
                  <div className="text-xs text-muted-foreground">HTTP trigger</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Actions</h3>
          <div className="space-y-2">
            <Card
              className="p-3 cursor-pointer hover:bg-accent transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, "telegram")}
              onClick={() => handleAddNode("telegram")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/20 rounded-lg">
                  <Send className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Telegram</div>
                  <div className="text-xs text-muted-foreground">Send message</div>
                </div>
              </div>
            </Card>

            <Card
              className="p-3 cursor-pointer hover:bg-accent transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, "gmail")}
              onClick={() => handleAddNode("gmail")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <Mail className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="font-medium text-sm">Gmail</div>
                  <div className="text-xs text-muted-foreground">Send email</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
