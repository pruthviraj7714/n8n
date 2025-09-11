"use client"

import type React from "react"

import { useCallback, useState } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { NodeSidebar } from "./node-sidebar"
import { WorkflowToolbar } from "./workflow-toolbar" 
import { NodeConfigPanel } from "./node-config-panel"
import { ExecutionPanel } from "./execution-panel"
import { TriggerNode } from "./nodes/trigger-node" 
import { TelegramNode } from "./nodes/telegram-node" 
import { GmailNode } from "./nodes/gmail-node" 

const nodeTypes = {
  trigger: TriggerNode,
  telegram: TelegramNode,
  gmail: GmailNode,
}

const initialNodes = [
  {
    id: "1",
    type: "trigger",
    position: { x: 250, y: 250 },
    data: {
      label: "Manual Trigger",
      triggerType: "manual",
      description: "When clicking 'Execute workflow'",
    },
  },
]

const initialEdges: Edge[] = []

export interface ExecutionLog {
  id: string
  nodeId: string
  nodeName: string
  status: "pending" | "running" | "success" | "error"
  message: string
  timestamp: Date
  duration?: number
}

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [showExecutionPanel, setShowExecutionPanel] = useState(false)

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
    setSelectedNode(node.id)
    setShowConfigPanel(true)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setShowConfigPanel(false)
  }, [])

  const addNode = useCallback(
    (type: string, position?: { x: number; y: number }) => {
      const id = `${type}-${Date.now()}`
      let nodeData = {}
      let nodeType = type

      switch (type) {
        case "telegram":
          nodeData = {
            label: "Send Telegram Message",
            action: "sendMessage",
            message: "",
            chatId: "",
            botToken: "",
          }
          break
        case "gmail":
          nodeData = {
            label: "Send Gmail",
            action: "sendEmail",
            to: "",
            subject: "",
            message: "",
            from: "",
          }
          break
        case "webhook":
          nodeType = "trigger"
          nodeData = {
            label: "Webhook Trigger",
            triggerType: "webhook",
            description: "Triggered by HTTP request",
            url: `https://api.example.com/webhook/${id}`,
            method: "POST",
          }
          break
        case "manual":
          nodeType = "trigger"
          nodeData = {
            label: "Manual Trigger",
            triggerType: "manual",
            description: "When clicking 'Execute workflow'",
          }
          break
      }

      const newNode = {
        id,
        type: nodeType,
        position: position || { x: Math.random() * 400 + 200, y: Math.random() * 300 + 200 },
        data: nodeData,
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes],
  )

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...newData } }
          }
          return node
        }),
      )
    },
    [setNodes],
  )

  const clearWorkflow = useCallback(() => {
    setNodes([])
    setEdges([])
    setSelectedNode(null)
    setShowConfigPanel(false)
  }, [setNodes, setEdges, setSelectedNode, setShowConfigPanel])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData("application/reactflow")
      if (type) {
        const position = ReactFlow.getPointer(event)
        addNode(type, position)
      }
    },
    [addNode],
  )

  const selectedNodeData = selectedNode ? nodes.find((node) => node.id === selectedNode) : null

  const executeWorkflow = useCallback(async () => {
    if (isExecuting) return

    setIsExecuting(true)
    setExecutionLogs([])
    setShowExecutionPanel(true)

    const triggerNodes = nodes.filter((node) => node.type === "trigger")
    if (triggerNodes.length === 0) {
      setExecutionLogs([
        {
          id: "error-1",
          nodeId: "system",
          nodeName: "System",
          status: "error",
          message: "No trigger nodes found in workflow",
          timestamp: new Date(),
        },
      ])
      setIsExecuting(false)
      return
    }

    for (const triggerNode of triggerNodes) {
      await executeNodeChain(triggerNode.id)
    }

    setIsExecuting(false)
  }, [nodes, edges, isExecuting])

  const executeNodeChain = async (startNodeId: string) => {
    const visited = new Set<string>()
    const queue = [startNodeId]

    while (queue.length > 0) {
      const nodeId = queue.shift()!
      if (visited.has(nodeId)) continue

      visited.add(nodeId)
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) continue

      await executeNode(node)

      const connectedEdges = edges.filter((edge) => edge.source === nodeId)
      for (const edge of connectedEdges) {
        queue.push(edge.target)
      }
    }
  }

  const executeNode = async (node: any): Promise<void> => {
    const startTime = Date.now()
    const logId = `${node.id}-${Date.now()}`

    const pendingLog: ExecutionLog = {
      id: logId,
      nodeId: node.id,
      nodeName: node.data.label,
      status: "running",
      message: "Executing...",
      timestamp: new Date(),
    }

    setExecutionLogs((logs) => [...logs, pendingLog])

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

      let result: { success: boolean; message: string }

      switch (node.type) {
        case "trigger":
          result = await executeTriggerNode(node)
          break
        case "telegram":
          result = await executeTelegramNode(node)
          break
        case "gmail":
          result = await executeGmailNode(node)
          break
        default:
          result = { success: false, message: "Unknown node type" }
      }

      const duration = Date.now() - startTime
      const status = result.success ? "success" : "error"

      setExecutionLogs((logs) =>
        logs.map((log) =>
          log.id === logId
            ? {
                ...log,
                status,
                message: result.message,
                duration,
              }
            : log,
        ),
      )
    } catch (error) {
      const duration = Date.now() - startTime
      setExecutionLogs((logs) =>
        logs.map((log) =>
          log.id === logId
            ? {
                ...log,
                status: "error" as const,
                message: `Execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                duration,
              }
            : log,
        ),
      )
    }
  }

  const executeTriggerNode = async (node: any): Promise<{ success: boolean; message: string }> => {
    if (node.data.triggerType === "manual") {
      return { success: true, message: "Manual trigger executed successfully" }
    } else if (node.data.triggerType === "webhook") {
      return { success: true, message: `Webhook trigger ready at ${node.data.url}` }
    }
    return { success: false, message: "Unknown trigger type" }
  }

  const executeTelegramNode = async (node: any): Promise<{ success: boolean; message: string }> => {
    const { botToken, chatId, message } = node.data

    if (!botToken) {
      return { success: false, message: "Bot token is required" }
    }
    if (!chatId) {
      return { success: false, message: "Chat ID is required" }
    }
    if (!message) {
      return { success: false, message: "Message is required" }
    }

    // Simulate Telegram API call
    try {
      // In a real implementation, you would make an actual API call here
      // const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ chat_id: chatId, text: message })
      // })

      return { success: true, message: `Message sent to Telegram chat ${chatId}` }
    } catch (error) {
      return { success: false, message: `Failed to send Telegram message: ${error}` }
    }
  }

  const executeGmailNode = async (node: any): Promise<{ success: boolean; message: string }> => {
    const { from, to, subject, message } = node.data

    if (!from) {
      return { success: false, message: "From email is required" }
    }
    if (!to) {
      return { success: false, message: "To email is required" }
    }
    if (!subject) {
      return { success: false, message: "Subject is required" }
    }
    if (!message) {
      return { success: false, message: "Message is required" }
    }

    // Simulate Gmail API call
    try {
      // In a real implementation, you would use Gmail API here
      return { success: true, message: `Email sent from ${from} to ${to}` }
    } catch (error) {
      return { success: false, message: `Failed to send email: ${error}` }
    }
  }

  return (
    <div className="h-full w-full flex bg-background">
      <NodeSidebar onAddNode={addNode} />

      <div className="flex-1 flex flex-col">
        <WorkflowToolbar
          selectedNode={selectedNode}
          nodes={nodes}
          edges={edges}
          setNodes={setNodes}
          setEdges={setEdges}
          onClearWorkflow={clearWorkflow}
          onExecuteWorkflow={executeWorkflow}
          isExecuting={isExecuting}
        />

        <div className="flex-1 flex">
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onDragOver={onDragOver}
              onDrop={onDrop}
              nodeTypes={nodeTypes}
              className="bg-background"
              fitView
            >
              <Controls className="bg-card border-border" />
              <MiniMap className="bg-card border-border" nodeColor="#374151" maskColor="rgba(0, 0, 0, 0.2)" />
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="opacity-30" />
            </ReactFlow>
          </div>

          {showConfigPanel && selectedNodeData && (
            <NodeConfigPanel
              node={selectedNodeData}
              onUpdateNode={updateNodeData}
              onClose={() => setShowConfigPanel(false)}
            />
          )}

          {showExecutionPanel && (
            <ExecutionPanel
              logs={executionLogs}
              isExecuting={isExecuting}
              onClose={() => setShowExecutionPanel(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
 