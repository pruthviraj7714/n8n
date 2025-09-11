"use client"
import { Handle, Position } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { Mail, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GmailNodeProps {
  data: {
    label: string
    action: string
    to: string
    subject: string
    message: string
  }
  selected?: boolean
}

export function GmailNode({ data, selected }: GmailNodeProps) {
  return (
    <Card className={`min-w-[240px] ${selected ? "ring-2 ring-primary" : ""}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Mail className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">{data.label}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{data.action}:</span> {data.message || "message"}
          </div>
          {data.to && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">to:</span> {data.to}
            </div>
          )}
          {data.subject && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">subject:</span> {data.subject}
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary border-2 border-background" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary border-2 border-background" />
    </Card>
  )
}
