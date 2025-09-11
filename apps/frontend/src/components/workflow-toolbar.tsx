"use client"

import { Button } from "@/components/ui/button"
import { Play, Trash2, RotateCcw, Download, Upload, Loader2 } from "lucide-react"
import type { Node, Edge } from "@xyflow/react"
import { Badge } from "@/components/ui/badge"

interface WorkflowToolbarProps {
  selectedNode: string | null
  nodes: Node[]
  edges: Edge[]
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void
  onClearWorkflow: () => void
  onExecuteWorkflow: () => void
  isExecuting: boolean
}

export function WorkflowToolbar({
  selectedNode,
  nodes,
  edges,
  setNodes,
  setEdges,
  onClearWorkflow,
  onExecuteWorkflow,
  isExecuting,
}: WorkflowToolbarProps) {
  const executeWorkflow = () => {
    console.log("Executing workflow with nodes:", nodes)
    console.log("Edges:", edges)
    // TODO: Implement workflow execution logic
  }

  const saveWorkflow = () => {
    const workflow = { nodes, edges }
    const dataStr = JSON.stringify(workflow, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `workflow-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const loadWorkflow = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const workflow = JSON.parse(e.target?.result as string)
            setNodes(workflow.nodes || [])
            setEdges(workflow.edges || [])
          } catch (error) {
            console.error("Error loading workflow:", error)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode))
      setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode && edge.target !== selectedNode))
    }
  }

  const nodeCount = nodes.length
  const connectionCount = edges.length

  return (
    <div className="h-14 bg-card border-b border-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Workflow Builder</h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {nodeCount} nodes
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {connectionCount} connections
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={loadWorkflow} disabled={isExecuting}>
          <Upload className="h-4 w-4 mr-2" />
          Load
        </Button>

        <Button variant="outline" size="sm" onClick={saveWorkflow} disabled={isExecuting}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        <Button variant="outline" size="sm" onClick={onClearWorkflow} disabled={isExecuting}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear
        </Button>

        {selectedNode && (
          <Button variant="outline" size="sm" onClick={deleteSelectedNode} disabled={isExecuting}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}

        <Button size="sm" onClick={onExecuteWorkflow} disabled={nodeCount === 0 || isExecuting}>
          {isExecuting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          {isExecuting ? "Executing..." : "Execute"}
        </Button>
      </div>
    </div>
  )
}
