"use client"
import { Handle, Position } from "@xyflow/react"
import { Card } from "@/components/ui/card"
import { MousePointer, Webhook, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TriggerNodeProps {
  data: {
    label: string
    triggerType: "manual" | "webhook"
    description: string
    url?: string
  }
  selected?: boolean
}

export function TriggerNode({ data, selected }: TriggerNodeProps) {
  const Icon = data.triggerType === "manual" ? MousePointer : Webhook
  const iconColor =
    data.triggerType === "manual" ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
  const bgColor =
    data.triggerType === "manual" ? "bg-orange-100 dark:bg-orange-900/20" : "bg-blue-100 dark:bg-blue-900/20"

  return (
    <Card className={`min-w-[200px] ${selected ? "ring-2 ring-primary" : ""}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 ${bgColor} rounded-lg`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <h3 className="font-medium text-sm">{data.label}</h3>
          <p className="text-xs text-muted-foreground">{data.description}</p>
          {data.url && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-muted px-2 py-1 rounded">{data.url}</p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary border-2 border-background" />
    </Card>
  )
}
