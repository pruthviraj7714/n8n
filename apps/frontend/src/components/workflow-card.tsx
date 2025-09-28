import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MoreHorizontal,
  Trash2,
  Zap,
  Activity,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  status?: string;
}

const WorkflowCard = ({
  workflow,
  onToggleWorkflow,
  onDeleteWorkflow,
  onView,
}: {
  workflow: IWorkflow;
  onToggleWorkflow: (id: string, enabled: boolean) => void;
  onDeleteWorkflow: (id: string) => void;
  onView: (id: string) => void;
}) => {
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
    <div className="bg-gradient-to-br from-card/80 to-card/40 border border-border/30 backdrop-blur-sm rounded-2xl p-6 hover:shadow-accent/20 hover:border-accent/50 transition-all duration-300 hover:scale-105 group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div
            onClick={() => onView(workflow.id)}
            className="flex-1 min-w-0 cursor-pointer space-y-3"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                workflow.enabled
                  ? "bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30 group-hover:from-accent/30 group-hover:to-primary/30 group-hover:scale-110"
                  : "bg-muted/20 border border-border/30 group-hover:bg-muted/30"
              }`}
            >
              <Zap
                className={`w-6 h-6 transition-all duration-300 ${
                  workflow.enabled
                    ? "text-accent animate-pulse"
                    : "text-muted-foreground"
                }`}
              />
            </div>

            <div>
              <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors duration-300 truncate mb-3">
                {workflow.title}
              </h3>
              <div className="flex items-center gap-3">
                <Badge
                  className={`font-semibold transition-all duration-300 ${
                    workflow.enabled
                      ? "bg-gradient-to-r from-accent/20 to-primary/20 text-accent border border-accent/30"
                      : "bg-muted/20 text-muted-foreground border border-border/30"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      workflow.enabled
                        ? "bg-accent animate-pulse"
                        : "bg-muted-foreground"
                    }`}
                  ></div>
                  {workflow.enabled ? "Active" : "Inactive"}
                </Badge>
                <span className="text-muted-foreground text-sm flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {workflow.nodes?.length || 0} nodes
                </span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-card/60 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl p-2"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card/95 backdrop-blur-lg border-border/30 shadow-2xl shadow-primary/10 rounded-xl">
              <DropdownMenuItem
                onClick={() => onView(workflow.id)}
                className="text-foreground hover:bg-primary/10 focus:bg-primary/10 rounded-lg mx-2 my-1 transition-all duration-200 cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-3 text-primary" />
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/30 mx-2" />
              <DropdownMenuItem
                onClick={() => onDeleteWorkflow(workflow.id)}
                className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 rounded-lg mx-2 my-1 transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm space-y-1">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2" />
              Updated {formatDate(workflow.updatedAt)}
            </div>
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-2" />
              Created {formatDate(workflow.createdAt)}
            </div>
          </div>
          <Switch
            checked={workflow.enabled}
            onCheckedChange={(enabled) =>
              onToggleWorkflow(workflow.id, enabled)
            }
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-accent data-[state=checked]:to-primary data-[state=unchecked]:bg-muted/50 transition-all duration-300"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-chart-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};

export default WorkflowCard;
