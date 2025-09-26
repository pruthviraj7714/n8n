import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Activity,
  Zap,
  AlertTriangle,
  Calendar,
  Timer,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";

type STATUS = "SUCCESS" | "FAILED" | "RUNNING";

interface NodeExecution {
  id: string;
  nodeId: string;
  status: STATUS
  startedAt: Date;
  finishedAt: Date;
  result?: string;
  error?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflow: {
    title: string;
  };
  status: STATUS;
  startedAt: Date;
  finishedAt: Date;
  nodes: NodeExecution[];
}

const ExecutionsTab = () => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const { data } = useSession();

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/v1/executions`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });
      setExecutions(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data && data.accessToken) fetchExecutions();
  }, [data]);

  const formatTime = (dateString: Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString: Date) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (start: Date, end: Date) => {
    if (!start || !end) return "In progress";
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diff = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
  
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.round(diff / 60)}m`;
    return `${Math.round(diff / 3600)}h`;
  };
  
  const getStatusBadge = (status : STATUS, isNode : boolean = false) => {
    const baseClasses = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${isNode ? "text-xs px-2 py-0.5" : ""}`;

    switch (status) {
      case "SUCCESS":
        return (
          <div
            className={`${baseClasses} bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5`}
          >
            <CheckCircle className={`${isNode ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
            <span>Success</span>
          </div>
        );
      case "FAILED":
        return (
          <div
            className={`${baseClasses} bg-red-500/10 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/5`}
          >
            <XCircle className={`${isNode ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
            <span>Failed</span>
          </div>
        );
      case "RUNNING":
        return (
          <div
            className={`${baseClasses} bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5`}
          >
            <Loader2
              className={`${isNode ? "w-3 h-3" : "w-3.5 h-3.5"} animate-spin`}
            />
            <span>Running</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: STATUS) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "RUNNING":
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-amber-400" />;
    }
  };

  const filteredExecutions = executions.filter((exec) => {
    if (filter === "ALL") return true;
    return exec.status === filter;
  });

  const getFilterCount = (status: string) => {
    if (status === "ALL") return executions.length;
    return executions.filter((exec) => exec.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Workflow Executions
          </h1>
        </div>
        <p className="text-slate-400 text-lg">
          Monitor and track your workflow execution history
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {["ALL", "SUCCESS", "FAILED", "RUNNING"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                filter === status
                  ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-700/50 text-xs">
                {getFilterCount(status)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading executions...</span>
          </div>
        </div>
      ) : filteredExecutions.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center">
              <Activity className="w-8 h-8 text-slate-500" />
            </div>
          </div>
          <p className="text-slate-400 text-lg">No executions found</p>
          <p className="text-slate-500 text-sm mt-1">
            Your workflow executions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExecutions.map((exec, index) => (
            <div
              key={exec.id}
              className="group relative bg-gradient-to-r from-slate-800/40 to-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-slate-600/50"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "slideInUp 0.5s ease-out forwards",
              }}
            >
              <div
                className={`absolute inset-0 opacity-5 pointer-events-none ${
                  exec.status === "SUCCESS"
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20"
                    : exec.status === "FAILED"
                      ? "bg-gradient-to-r from-red-500/20 to-rose-500/20"
                      : "bg-gradient-to-r from-blue-500/20 to-indigo-500/20"
                }`}
              />

              <div
                className="p-6 cursor-pointer"
                onClick={() =>
                  setExpanded(expanded === exec.id ? null : exec.id)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {expanded === exec.id ? (
                        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400 transition-transform duration-200" />
                      )}
                      {getStatusIcon(exec.status)}
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                        {exec.workflow.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm">
                        {getStatusBadge(exec.status)}
                        <div className="flex items-center gap-1 text-slate-400">
                          <Timer className="w-3.5 h-3.5" />
                          <span>
                            {getDuration(exec.startedAt, exec.finishedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-slate-300 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {formatDate(exec.startedAt)}
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      {formatTime(exec.startedAt)} →{" "}
                      {formatTime(exec.finishedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {expanded === exec.id && (
                <div className="border-t border-slate-700/50 bg-slate-900/20">
                  <div className="p-6 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      <span className="text-sm font-medium text-slate-300">
                        Execution Steps ({exec.nodes?.length || 0})
                      </span>
                    </div>

                    {exec.nodes && exec.nodes.length > 0 ? (
                      <div className="space-y-3">
                        {exec.nodes.map((node, nodeIndex) => (
                          <div
                            key={node.id}
                            className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 hover:bg-slate-700/30 transition-all duration-200"
                            style={{
                              animationDelay: `${nodeIndex * 50}ms`,
                              animation: "slideInRight 0.3s ease-out forwards",
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <PlayCircle className="w-4 h-4 text-indigo-400" />
                                  <span className="font-medium text-slate-200">
                                    Node {nodeIndex + 1}
                                  </span>
                                </div>
                                {getStatusBadge(node.status, true)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatTime(node.startedAt)} →{" "}
                                {formatTime(node.finishedAt)}
                              </div>
                            </div>

                            {node.result && (
                              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 mb-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs font-medium text-emerald-400">
                                    Result
                                  </span>
                                </div>
                                <p className="text-sm text-slate-300">
                                  {node.result}
                                </p>
                              </div>
                            )}

                            {node.error && (
                              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                  <span className="text-xs font-medium text-red-400">
                                    Error
                                  </span>
                                </div>
                                <p className="text-sm text-red-300">
                                  {node.error}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No execution steps available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ExecutionsTab;
