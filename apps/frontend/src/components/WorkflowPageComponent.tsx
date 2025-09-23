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
} from "lucide-react";
import Modal from "@/components/Modal";
import TriggerForm from "@/components/forms/TriggerForm";
import TelegramActionForm from "@/components/forms/TelegramActionForm";
import ResendActionForm from "@/components/forms/ResentActionForm";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const TriggerNode = ({ data, selected } : { data : any, selected : boolean}) => {
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

const ActionNode = ({ data, selected } : {data : any, selected : boolean}) => {
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

type ModalType = "trigger" | "action-select" | "resend" | "telegram"

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
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { data } = useSession();
  const router = useRouter();

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId || !data?.accessToken) return;

      setIsLoadingWorkflow(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/workflow/${workflowId}`, {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });

        const workflowData = response.data.data;
        setOriginalWorkflow(workflowData);
        setWorkflowTitle(workflowData.title);
        setIsEnabled(workflowData.enabled);

        const reactFlowNodes = workflowData.nodes.map((dbNode: any) => ({
          id: dbNode.id, 
          type: dbNode.type.toLowerCase(),
          position: dbNode.position,
          data: {
            ...dbNode.data,
            triggerType: dbNode.triggerType,
            actionPlatform: dbNode.actionPlatform,
            action: dbNode.action || {},
            label: dbNode.type === "TRIGGER" ? "Trigger Node" : "Action Node",
          },
        }));

        const reactFlowEdges = workflowData.connections.map((conn: any, index: number) => ({
          id: conn.id || `edge-${index}`,
          source: conn.sourceId,
          target: conn.targetId,
          type: 'default',
        }));

        setNodes(reactFlowNodes);
        setEdges(reactFlowEdges);

      } catch (error) {
        console.error("Error loading workflow:", error);
        toast.error("Failed to load workflow");
        router.push('/dashboard');
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

  const onNodeDoubleClick = useCallback((event : any, node : any) => {
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

  const handleNodeSave = (data : any) => {
    if (selectedNode) {
      updateNodeData(selectedNode.id, data);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedNode(null);
  };

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const updateWorkflow = async () => {
    if (!workflowTitle.trim()) {
      toast.warning("Please enter a workflow title", { position : "top-center"});
      return;
    }

    if (nodes.length === 0) {
      toast.warning("Please add at least one node to the workflow", { position : "top-center"});
      return;
    }

    const triggerNodes = nodes.filter((n) => n.type === "trigger");
    if (triggerNodes.length === 0) {
      toast.warning("Please add at least one trigger node", { position : "top-center"});
      return;
    }

    setIsLoading(true);

    try {
      const existingNodes = nodes.filter(node => 
        originalWorkflow?.nodes?.some((dbNode: any) => dbNode.id === node.id)
      );
      const newNodes = nodes.filter(node => 
        !originalWorkflow?.nodes?.some((dbNode: any) => dbNode.id === node.id)
      );

      const workflowData = {
        title: workflowTitle,
        enabled: isEnabled,
        nodes: nodes.map((node) => {
          const isExistingNode = originalWorkflow?.nodes?.some((dbNode: any) => dbNode.id === node.id);
          
          return {
            ...(isExistingNode ? { id: node.id } : { tempId: node.id }),
            type: node.type?.toUpperCase() as 'TRIGGER' | 'ACTION',
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
        deletedNodeIds: originalWorkflow?.nodes
          ?.filter((dbNode: any) => !nodes.some(node => node.id === dbNode.id))
          ?.map((dbNode: any) => dbNode.id) || [],
      };

      console.log("Updating workflow data:", workflowData);

      const response = await axios.put(`${BACKEND_URL}/api/v1/workflow/${workflowId}`, workflowData, {
        headers : {
          Authorization : `Bearer ${data?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Workflow updated successfully:", response.data);
      toast.success("Workflow Successfully Updated");
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error updating workflow:", error);
      
      if (error.response?.data?.message) {
        toast.error(`Failed to update workflow: ${error.response.data.message}`);
      } else if (error.response?.data?.error) {
        toast.error(`Failed to update workflow: ${error.response.data.error}`);
      } else {
        toast.error("Failed to update workflow. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
    <div className="h-screen bg-slate-800/50 relative">
      <div className="bg-card/50 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-foreground">
              Edit Workflow
            </h1>
            <input
              type="text"
              placeholder="Enter workflow title..."
              value={workflowTitle}
              onChange={(e) => setWorkflowTitle(e.target.value)}
              className="px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary w-64 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary bg-input"
              />
              <span className="text-sm text-foreground">Enabled</span>
            </label>

            <button
              onClick={updateWorkflow}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Updating..." : "Update Workflow"}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex h-full">
        <div className="w-64 bg-card/30 backdrop-blur-sm border-r border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Add Nodes
          </h3>

          <div className="space-y-2">
            <button
              onClick={addTriggerNode}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-muted/50 rounded-lg border border-border transition-colors group"
            >
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">
                  Trigger
                </div>
                <div className="text-xs text-muted-foreground">
                  Start workflow
                </div>
              </div>
            </button>

            <button
              onClick={addActionNode}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-muted/50 rounded-lg border border-border transition-colors group"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30 group-hover:bg-blue-500/30 transition-colors">
                <Settings className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">
                  Action
                </div>
                <div className="text-xs text-muted-foreground">
                  Perform action
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Workflow Info
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Nodes: {nodes.length}</div>
              <div>Connections: {edges.length}</div>
              <div>Status: {isEnabled ? "Enabled" : "Disabled"}</div>
            </div>
          </div>

          <div className="mt-8 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary">
              💡 <strong>Tip:</strong> Double-click on any node to configure it. Right-click to delete.
            </p>
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
              if (window.confirm('Are you sure you want to delete this node?')) {
                deleteNode(node.id);
              }
            }}
            // onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-800/50"
          >
            <Background color="#374151" gap={20} />
            <Controls />
            <MiniMap
              className="!bg-card !border !border-border"
              maskColor="rgb(15, 23, 42, 0.6)"
            />

            <Panel
              position="top-center"
              className="bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border px-4 py-2"
            >
              <div className="text-sm text-muted-foreground">
                {nodes.length === 0
                  ? "Add nodes from the sidebar to get started"
                  : "Double-click nodes to configure them • Right-click to delete"}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      <TriggerForm
        isOpen={modalType === "trigger"}
        onClose={closeModal}
        triggerData={selectedNode?.data}
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
    </div>
  );
};

export default EditWorkflowPage;