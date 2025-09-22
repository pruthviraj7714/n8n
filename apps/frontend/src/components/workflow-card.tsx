"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Play, Pause, MoreHorizontal, Clock, Webhook, Calendar, MousePointer, Activity } from "lucide-react"

interface INode {
  id: string
  type: "TRIGGER" | "ACTION"
  triggerType?: string
  position: { x: string; y: string }
  actionPlatform: "MANUAL" | "WEBHOOK" | "CRON"
  action?: any
  data?: any
  workflowId: string
}

interface IWorkflow {
  id: string
  title: string
  enabled: boolean
  userId: string
  connections: any
  nodes: INode[]
}

interface WorkflowCardProps {
  workflow: IWorkflow
  onToggle: (id: string, enabled: boolean) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function WorkflowCard({ workflow, onToggle, onEdit, onDelete }: WorkflowCardProps) {
  const triggerNode = workflow.nodes.find((node) => node.type === "TRIGGER")
  const actionNodes = workflow.nodes.filter((node) => node.type === "ACTION")

  const getTriggerIcon = (platform: string) => {
    switch (platform) {
      case "WEBHOOK":
        return <Webhook className="h-4 w-4" />
      case "CRON":
        return <Calendar className="h-4 w-4" />
      case "MANUAL":
        return <MousePointer className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getTriggerLabel = (platform: string) => {
    switch (platform) {
      case "WEBHOOK":
        return "Webhook"
      case "CRON":
        return "Schedule"
      case "MANUAL":
        return "Manual"
      default:
        return "Trigger"
    }
  }

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
              {workflow.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant={workflow.enabled ? "default" : "secondary"}
                className={workflow.enabled ? "bg-success text-success-foreground" : ""}
              >
                {workflow.enabled ? "Active" : "Inactive"}
              </Badge>
              {triggerNode && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {getTriggerIcon(triggerNode.actionPlatform)}
                  {getTriggerLabel(triggerNode.actionPlatform)}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(workflow.id)}>Edit workflow</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggle(workflow.id, !workflow.enabled)}>
                {workflow.enabled ? "Disable" : "Enable"} workflow
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(workflow.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete workflow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last run: 2h ago
            </div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {actionNodes.length} action{actionNodes.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={workflow.enabled ? "secondary" : "default"}
              onClick={() => onToggle(workflow.id, !workflow.enabled)}
              className="flex items-center gap-1"
            >
              {workflow.enabled ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Activate
                </>
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(workflow.id)}>
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
