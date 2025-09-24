import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Eye, MoreHorizontal, Settings, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface INode {
  id: string;
  type: "TRIGGER" | "ACTION";
  triggerType?: string;
  position: { x: string; y: string };
  actionPlatform: "MANUAL" | "WEBHOOK" | "CRON";
  action?: any;
  data?: any;
  workflowId: string;
}

interface IConnection {
  id: string;
  sourceId: string;
  targetId: string;
  workflowId: string;
}

interface IWorkflow {
  id: string;
  title: string;
  enabled: boolean;
  userId: string;
  connections: IConnection[];
  nodes: INode[];
  updatedAt?: string;
  createdAt?: string;
}

const WorkflowCard = ({
  workflow,
  onToggleWorkflow,
  onDeleteWorkflow,
}: {
  workflow: IWorkflow;
  onToggleWorkflow: (id: string, enabled: boolean) => void;
  onDeleteWorkflow: (id: string) => void;
}) => {
  const router = useRouter();
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div
          onClick={() => router.push(`/workflows/${workflow.id}`)}
          className="flex-1 min-w-0 cursor-pointer"
        >
          <h3 className="text-white font-semibold text-lg truncate group-hover:text-orange-400 transition-colors">
            {workflow.title}
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant={workflow.enabled ? "default" : "secondary"}
              className={
                workflow.enabled
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
                  : "bg-slate-600/50 text-slate-400 border-slate-600/50"
              }
            >
              {workflow.enabled ? "Active" : "Inactive"}
            </Badge>
            <span className="text-slate-400 text-sm">
              {workflow.nodes?.length || 0} nodes
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-slate-800 border-slate-700 shadow-xl">
            <DropdownMenuItem
              onClick={() => router.push(`/workflows/${workflow.id}`)}
              className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={() => onDeleteWorkflow(workflow.id)}
              className="text-red-400 hover:bg-red-500/20 focus:bg-red-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-slate-400 text-sm space-y-1">
          <div>Updated {formatDate(workflow.updatedAt)}</div>
          <div>Created {formatDate(workflow.createdAt)}</div>
        </div>
        <Switch
          checked={workflow.enabled}
          onCheckedChange={(enabled) => onToggleWorkflow(workflow.id, enabled)}
          className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-slate-600"
        />
      </div>
    </div>
  );
};

export default WorkflowCard;
