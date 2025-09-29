"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  type Node,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type NodeTypes,
  Panel,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Save,
  Play,
  Settings,
  Webhook,
  Calendar,
  Zap,
  Send,
  MessageSquare,
  X,
  Loader2,
  Sparkles,
  Badge,
  Activity,
  Layers,
  Copy,
} from "lucide-react";
import Modal from "@/components/Modal";
import TriggerForm from "@/components/forms/TriggerForm";
import TelegramActionForm from "@/components/forms/TelegramActionForm";
import ResendActionForm from "@/components/forms/ResendActionForm";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ExecutionPanel from "./ExecutionPanel";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const TriggerNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getTriggerIcon = () => {
    switch (data.triggerType) {
      case "WEBHOOK":
        return <Webhook className="w-4 h-4" />;
      case "CRON":
        return <Calendar className="w-4 h-4" />;
      case "MANUAL":
        return <Play className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getTriggerColor = () => {
    switch (data.triggerType) {
      case "WEBHOOK":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CRON":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "MANUAL":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-xl rounded-xl bg-card/80 backdrop-blur-sm border-2 ${selected ? "border-primary shadow-primary/20" : "border-border"} min-w-[180px] transition-all duration-200`}
    >
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg border ${getTriggerColor()}`}>
          {getTriggerIcon()}
        </div>
        <div>
          <div className="font-medium text-sm text-foreground">Trigger</div>
          <div className="text-xs text-muted-foreground capitalize">
            {data.triggerType?.toLowerCase() || "Manual"}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
      />
    </div>
  );
};

const ActionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getActionIcon = () => {
    switch (data.actionPlatform) {
      case "TELEGRAM":
        return <MessageSquare className="w-4 h-4" />;
      case "RESEND":
        return <Send className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getActionColor = () => {
    switch (data.actionPlatform) {
      case "TELEGRAM":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "RESEND":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-xl rounded-xl bg-card/80 backdrop-blur-sm border-2 ${selected ? "border-primary shadow-primary/20" : "border-border"} min-w-[180px] transition-all duration-200`}
    >
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg border ${getActionColor()}`}>
          {getActionIcon()}
        </div>
        <div>
          <div className="font-medium text-sm text-foreground">Action</div>
          <div className="text-xs text-muted-foreground">
            {data.actionPlatform || "Select Platform"}
          </div>
        </div>
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

type ModalType = "trigger" | "action-select" | "resend" | "telegram";

interface ILog {
  message: string;
  nodeId: string;
  type: "NODE_EXECUTED" | "TRIGGER_EXECUTED" | "ERROR" | "COMPLETED";
}

interface EditWorkflowPageProps {
  workflowId: string;
}

const EditWorkflowPage = ({ workflowId }: EditWorkflowPageProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(true);
  const [originalWorkflow, setOriginalWorkflow] = useState<any>(null);
  const reactFlowWrapper = useRef(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);
  const [logs, setLogs] = useState<ILog[]>([]);
  const [webhookData, setWebhookData] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { data } = useSession();
  const router = useRouter();

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId || !data?.accessToken) return;

      setIsLoadingWorkflow(true);
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/v1/workflow/${workflowId}`,
          {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          }
        );

        const workflowData = response.data.data;
        setOriginalWorkflow(workflowData);
        setWorkflowTitle(workflowData.title);
        setIsEnabled(workflowData.enabled);

        setWebhookUrl(
          workflowData.webhook ? workflowData?.webhook?.path : null
        );

        setWebhookData(workflowData.webhook || null);

        const reactFlowNodes = workflowData.nodes.map((dbNode: any) => ({
          id: dbNode.id,
          type: dbNode.type.toLowerCase(),
          position: dbNode.position,
          data: {
            triggerType: dbNode.data.triggerType,
            actionPlatform: dbNode.data.actionPlatform,
            action: dbNode.data.action || {},
            label: dbNode.type === "TRIGGER" ? "Trigger Node" : "Action Node",
            ...dbNode.data,
          },
        }));

        const reactFlowEdges = workflowData.connections.map(
          (conn: any, index: number) => ({
            id: conn.id || `edge-${index}`,
            source: conn.sourceId,
            target: conn.targetId,
            type: "default",
          })
        );

        setNodes(reactFlowNodes);
        setEdges(reactFlowEdges);
      } catch (error) {
        console.error("Error loading workflow:", error);
        toast.error("Failed to load workflow");
        router.push("/dashboard");
      } finally {
        setIsLoadingWorkflow(false);
      }
    };

    loadWorkflow();
  }, [workflowId, data?.accessToken, setNodes, setEdges, router]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onNodeDoubleClick = useCallback((event: any, node: any) => {
    setSelectedNode(node);
    if (node.type === "trigger") {
      setModalType("trigger");
    } else if (node.type === "action") {
      if (node.data.actionPlatform === "TELEGRAM") {
        setModalType("telegram");
      } else if (node.data.actionPlatform === "RESEND") {
        setModalType("resend");
      } else {
        setModalType("action-select");
      }
    }
  }, []);

  const addTriggerNode = useCallback(() => {
    const newNode: Node = {
      id: `trigger-${Date.now()}`,
      type: "trigger",
      position: { x: 250, y: 100 },
      data: {
        triggerType: "MANUAL",
        label: "Trigger Node",
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addActionNode = useCallback(() => {
    const newNode: Node = {
      id: `action-${Date.now()}`,
      type: "action",
      position: { x: 250, y: 250 },
      data: {
        actionPlatform: null,
        label: "Action Node",
        action: {},
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...newData } }
            : node
        )
      );
    },
    [setNodes]
  );

  const handleNodeSave = (data: any) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, data);
    }
  };

  const handleCopy = () => {
    if (webhookUrl) {
      navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedNode(null);
  };

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
    },
    [setNodes, setEdges]
  );

  const updateWorkflow = async () => {
    if (!workflowTitle.trim()) {
      toast.warning("Please enter a workflow title", {
        position: "top-center",
      });
      return;
    }

    if (nodes.length === 0) {
      toast.warning("Please add at least one node to the workflow", {
        position: "top-center",
      });
      return;
    }

    const triggerNodes = nodes.filter((n) => n.type === "trigger");
    if (triggerNodes.length === 0) {
      toast.warning("Please add at least one trigger node", {
        position: "top-center",
      });
      return;
    }

    setIsLoading(true);

    try {
      const existingNodes = nodes.filter((node) =>
        originalWorkflow?.nodes?.some((dbNode: any) => dbNode.id === node.id)
      );
      const newNodes = nodes.filter(
        (node) =>
          !originalWorkflow?.nodes?.some((dbNode: any) => dbNode.id === node.id)
      );

      const workflowData = {
        title: workflowTitle,
        enabled: isEnabled,
        nodes: nodes.map((node) => {
          const isExistingNode = originalWorkflow?.nodes?.some(
            (dbNode: any) => dbNode.id === node.id
          );

          return {
            ...(isExistingNode ? { id: node.id } : { tempId: node.id }),
            type: node.type?.toUpperCase() as "TRIGGER" | "ACTION",
            position: node.position,
            triggerType: node.data.triggerType || null,
            actionPlatform: node.data.actionPlatform || null,
            action: node.data.action || {},
            data: {
              ...node.data,
              label: undefined,
            },
          };
        }),
        connections: edges.map((edge) => ({
          sourceTempId: edge.source,
          targetTempId: edge.target,
        })),
        deletedNodeIds:
          originalWorkflow?.nodes
            ?.filter(
              (dbNode: any) => !nodes.some((node) => node.id === dbNode.id)
            )
            ?.map((dbNode: any) => dbNode.id) || [],
      };

      console.log("Updating workflow data:", workflowData);

      const response = await axios.put(
        `${BACKEND_URL}/api/v1/workflow/${workflowId}`,
        workflowData,
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Workflow updated successfully:", response.data);
      toast.success("Workflow Successfully Updated");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error updating workflow:", error);

      if (error.response?.data?.message) {
        toast.error(
          `Failed to update workflow: ${error.response.data.message}`
        );
      } else if (error.response?.data?.error) {
        toast.error(`Failed to update workflow: ${error.response.data.error}`);
      } else {
        toast.error("Failed to update workflow. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const executeWorkflow = async () => {
    if (!data || !data.accessToken) return;
    setIsExecuting(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/workflow/execute-workflow/${workflowId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        }
      );
      setIsExecutionPanelOpen(true);
      setLogs([]);
      toast.success("Workflow Initiated");
    } catch (error: any) {
      toast.error(error.response.data.message || error.message);
      setIsExecuting(false);
    }
  };

  const PlatformSelectModal = () => (
    <Modal isOpen={modalType === "action-select"} onClose={closeModal}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Select Action Platform
          </h2>
          <button
            onClick={closeModal}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              updateNodeData(selectedNode.id, { actionPlatform: "TELEGRAM" });
              setModalType("telegram");
            }}
            className="w-full flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <div className="text-left">
              <div className="font-medium text-foreground">Telegram</div>
              <div className="text-sm text-muted-foreground">
                Send messages to Telegram
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              updateNodeData(selectedNode.id, { actionPlatform: "RESEND" });
              setModalType("resend");
            }}
            className="w-full flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Send className="w-6 h-6 text-orange-500" />
            <div className="text-left">
              <div className="font-medium text-foreground">Resend</div>
              <div className="text-sm text-muted-foreground">
                Send emails via Resend
              </div>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );

  useEffect(() => {
    if (!isExecuting) return;

    const eventSrc = new EventSource(
      `${BACKEND_URL}/api/v1/stream/workflow/${workflowId}`
    );

    eventSrc.onopen = () => {
      console.log("connected with sse");
    };

    eventSrc.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      switch (data.type) {
        case "COMPLETED": {
          setIsExecuting(false);
          toast.success("Workflow Successfully Executed ✅");
          setLogs((prev) => [...prev, data]);
          break;
        }
        case "TRIGGER_EXECUTED": {
          setLogs((prev) => [...prev, data]);
          break;
        }
        case "NODE_EXECUTED": {
          setLogs((prev) => [...prev, data]);
          break;
        }
        case "ERROR": {
          setIsExecuting(false);
          toast.error("Error while Executing Workflow ❌", {
            description: data.message,
          });
          setLogs((prev) => [...prev, data]);
          break;
        }
      }
    };

    eventSrc.onerror = (error) => {
      toast.error("Error while Connecting With Stream:");
    };

    return () => eventSrc.close();
  }, [workflowId, isExecuting]);

  if (isLoadingWorkflow) {
    return (
      <div className="h-screen bg-slate-800/50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading workflow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[130vh] bg-gradient-to-br from-background via-background to-card/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-chart-2/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border-b border-border/40 px-6 py-4 relative z-10 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6 flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent whitespace-nowrap">
                  Edit Workflow
                </h1>
                <Badge className="bg-gradient-to-r from-chart-2/20 to-primary/20 text-chart-2 border border-chart-2/30 px-2 py-0.5 text-xs">
                  <Settings className="w-3 h-3 mr-1" />
                  Live Editor
                </Badge>
              </div>
            </div>

            <input
              type="text"
              placeholder="Enter workflow title..."
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              className="px-4 py-3 bg-input/80 border border-border/40 rounded-xl focus:ring-2 focus:ring-accent/50 focus:border-accent/50 w-full max-w-80 text-foreground placeholder:text-muted-foreground backdrop-blur-sm transition-all duration-300 text-base"
            />
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0">
            {nodes &&
            nodes.length > 0 &&
            nodes.find((node) => node.data.triggerType === "MANUAL") ? (
              <button
                onClick={executeWorkflow}
                disabled={isExecuting}
                className="bg-gradient-to-r from-chart-3 to-chart-3/90 hover:from-chart-3/90 hover:to-chart-3/80 text-primary-foreground px-4 py-2.5 rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 shadow-lg shadow-chart-3/20 font-medium whitespace-nowrap"
              >
                <Play className="w-4 h-4" />
                <span>{isExecuting ? "Executing..." : "Execute Workflow"}</span>
              </button>
            ) : webhookUrl ? (
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="w-64 bg-background text-primary-foreground px-4 py-3 rounded-xl font-medium shadow-lg shadow-chart-3/30 transition-all duration-300 hover:scale-[1.02] focus:outline-none cursor-text"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleCopy}
                  className="rounded-xl shadow-md transition-all duration-300 hover:scale-110 flex-shrink-0"
                >
                  <Copy className="h-5 w-5" />
                </Button>
                {copied && (
                  <span className="text-sm text-green-500 font-medium animate-pulse whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </div>
            ) : null}

            <label className="flex items-center space-x-3 cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded-lg border-border/40 text-accent focus:ring-accent bg-input/80 w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                Enabled
              </span>
            </label>

            <button
              onClick={updateWorkflow}
              disabled={isLoading}
              className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground px-6 py-2.5 rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all duration-300 hover:scale-105 shadow-2xl shadow-accent/30 hover:shadow-accent/50 font-semibold whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Updating..." : "Update Workflow"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full relative z-10">
        <div className="w-80 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg border-r border-border/40 p-6 shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Add Nodes
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Enhance your workflow with additional nodes
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={addTriggerNode}
              className="w-full flex items-center space-x-4 p-4 text-left hover:bg-card/50 rounded-xl border border-border/40 transition-all duration-300 group hover:scale-105 hover:border-primary/40 backdrop-blur-sm"
            >
              <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/30 rounded-xl border border-primary/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-base text-foreground">
                  Trigger
                </div>
                <div className="text-sm text-muted-foreground">
                  Start your workflow automation
                </div>
              </div>
            </button>

            <button
              onClick={addActionNode}
              className="w-full flex items-center space-x-4 p-4 text-left hover:bg-card/50 rounded-xl border border-border/40 transition-all duration-300 group hover:scale-105 hover:border-accent/40 backdrop-blur-sm"
            >
              <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/30 rounded-xl border border-accent/30 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent/10">
                <Settings className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-semibold text-base text-foreground">
                  Action
                </div>
                <div className="text-sm text-muted-foreground">
                  Perform automated actions
                </div>
              </div>
            </button>
          </div>

          <div className="mt-12">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Workflow Stats
            </h3>
            <div className="bg-gradient-to-br from-muted/10 to-muted/5 rounded-xl p-4 border border-border/30 backdrop-blur-sm">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nodes:</span>
                  <span className="font-medium text-foreground">
                    {nodes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connections:</span>
                  <span className="font-medium text-foreground">
                    {edges.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    className={`text-xs ${isEnabled ? "bg-chart-3/20 text-chart-3 border-chart-3/30" : "bg-muted/20 text-muted-foreground border-muted/30"}`}
                  >
                    {isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  Editor Tips
                </p>
                <p className="text-xs text-muted-foreground">
                  Double-click nodes to configure • Right-click to delete • Drag
                  to connect nodes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeContextMenu={(event, node) => {
              event.preventDefault();
              if (
                window.confirm("Are you sure you want to delete this node?")
              ) {
                deleteNode(node.id);
              }
            }}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gradient-to-br from-background/50 to-card/20"
          >
            <Background color="oklch(1 0 0 / 8%)" gap={24} size={1} />
            <Controls className="!bg-card/90 !border !border-border/40 !backdrop-blur-lg" />
            <MiniMap
              className="!bg-card/90 !border !border-border/40 !backdrop-blur-lg !rounded-xl"
              maskColor="oklch(0.14 0 0 / 0.8)"
              nodeColor="oklch(0.65 0.22 264)"
            />

            <Panel
              position="top-center"
              className="bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-lg rounded-xl shadow-2xl border border-border/40 px-6 py-3 mx-4"
            >
              <div className="text-sm text-muted-foreground font-medium">
                {nodes.length === 0
                  ? "Add nodes from the sidebar to enhance your workflow"
                  : "Double-click nodes to configure • Right-click to delete"}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      <TriggerForm
        isOpen={modalType === "trigger"}
        onClose={closeModal}
        triggerData={selectedNode?.data}
        webhookData={webhookData}
        onSave={handleNodeSave}
      />

      <TelegramActionForm
        isOpen={modalType === "telegram"}
        onClose={closeModal}
        actionData={selectedNode?.data}
        onSave={handleNodeSave}
      />

      <ResendActionForm
        isOpen={modalType === "resend"}
        onClose={closeModal}
        actionData={selectedNode?.data}
        onSave={handleNodeSave}
      />

      <PlatformSelectModal />

      <ExecutionPanel
        isOpen={isExecutionPanelOpen}
        onClose={() => setIsExecutionPanelOpen(false)}
        isExecuting={isExecuting}
        logs={logs}
        workflowTitle="My Automation Workflow"
      />
    </div>
  );
};

export default EditWorkflowPage;
