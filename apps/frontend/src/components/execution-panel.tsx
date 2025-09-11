"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import type { ExecutionLog } from "./workflow-builder" 

interface ExecutionPanelProps {
  logs: ExecutionLog[]
  isExecuting: boolean
  onClose: () => void
}

export function ExecutionPanel({ logs, isExecuting, onClose }: ExecutionPanelProps) {
  const getStatusIcon = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: ExecutionLog["status"]) => {
    switch (status) {
      case "success":
        return "text-green-700 dark:text-green-400"
      case "error":
        return "text-red-700 dark:text-red-400"
      case "running":
        return "text-blue-700 dark:text-blue-400"
      default:
        return "text-gray-700 dark:text-gray-400"
    }
  }

  const successCount = logs.filter((log) => log.status === "success").length
  const errorCount = logs.filter((log) => log.status === "error").length
  const runningCount = logs.filter((log) => log.status === "running").length

  return (
    <div className="w-96 bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Execution Log</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              {runningCount > 0 && <span className="text-blue-600">{runningCount} running</span>}
              {successCount > 0 && <span className="text-green-600">{successCount} success</span>}
              {errorCount > 0 && <span className="text-red-600">{errorCount} errors</span>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-4 space-y-3">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {isExecuting ? "Starting execution..." : "No execution logs yet"}
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border border-border rounded-lg p-3">
                <div className="flex items-start gap-3">
                  {getStatusIcon(log.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">{log.nodeName}</h4>
                      <span className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className={`text-sm mt-1 ${getStatusColor(log.status)}`}>{log.message}</p>
                    {log.duration && <p className="text-xs text-muted-foreground mt-1">Duration: {log.duration}ms</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
