"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Settings } from "lucide-react"
import type { Node } from "@xyflow/react"

interface NodeConfigPanelProps {
  node: Node
  onUpdateNode: (nodeId: string, data: any) => void
  onClose: () => void
}

export function NodeConfigPanel({ node, onUpdateNode, onClose }: NodeConfigPanelProps) {
  const handleInputChange = (field: string, value: string) => {
    onUpdateNode(node.id, { [field]: value })
  }

  const renderTriggerConfig = () => {
    if (node.data.triggerType === "webhook") {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              value={node.data.url || ""}
              onChange={(e) => handleInputChange("url", e.target.value)}
              placeholder="https://api.example.com/webhook"
            />
          </div>
          <div>
            <Label htmlFor="method">HTTP Method</Label>
            <Select value={node.data.method || "POST"} onValueChange={(value) => handleInputChange("method", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    return (
      <div className="text-sm text-muted-foreground">
        Manual triggers don't require additional configuration. Click the Execute button to run the workflow.
      </div>
    )
  }

  const renderTelegramConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="botToken">Bot Token</Label>
        <Input
          id="botToken"
          type="password"
          value={node.data.botToken || ""}
          onChange={(e) => handleInputChange("botToken", e.target.value)}
          placeholder="Your Telegram bot token"
        />
      </div>
      <div>
        <Label htmlFor="chatId">Chat ID</Label>
        <Input
          id="chatId"
          value={node.data.chatId || ""}
          onChange={(e) => handleInputChange("chatId", e.target.value)}
          placeholder="Telegram chat ID"
        />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={node.data.message || ""}
          onChange={(e) => handleInputChange("message", e.target.value)}
          placeholder="Enter your message here..."
          rows={4}
        />
      </div>
    </div>
  )

  const renderGmailConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="from">From Email</Label>
        <Input
          id="from"
          type="email"
          value={node.data.from || ""}
          onChange={(e) => handleInputChange("from", e.target.value)}
          placeholder="sender@example.com"
        />
      </div>
      <div>
        <Label htmlFor="to">To Email</Label>
        <Input
          id="to"
          type="email"
          value={node.data.to || ""}
          onChange={(e) => handleInputChange("to", e.target.value)}
          placeholder="recipient@example.com"
        />
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={node.data.subject || ""}
          onChange={(e) => handleInputChange("subject", e.target.value)}
          placeholder="Email subject"
        />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={node.data.message || ""}
          onChange={(e) => handleInputChange("message", e.target.value)}
          placeholder="Enter your email content here..."
          rows={6}
        />
      </div>
    </div>
  )

  const renderConfigContent = () => {
    switch (node.type) {
      case "trigger":
        return renderTriggerConfig()
      case "telegram":
        return renderTelegramConfig()
      case "gmail":
        return renderGmailConfig()
      default:
        return <div>No configuration available for this node type.</div>
    }
  }

  return (
    <div className="w-80 bg-card border-l border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h3 className="font-semibold">Node Configuration</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-medium mb-2">{node.data.label}</h4>
          <p className="text-sm text-muted-foreground">{node.data.description || "Configure this node's settings"}</p>
        </div>

        {renderConfigContent()}
      </div>
    </div>
  )
}
