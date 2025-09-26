"use client";

import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, Grid3x3, List } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WorkflowCard from "@/components/workflow-card";
import CredentialsTab from "@/components/tabs/CredentialsTab";
import ExecutionsTab from "@/components/ExecutionsTab";

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

interface IWorkflow {
  id: string;
  title: string;
  enabled: boolean;
  userId: string;
  connections: any;
  nodes: INode[];
  updatedAt?: string;
  createdAt?: string;
}

type TABS = "WORKFLOWS" | "CREDENTIALS" | "EXECUTIONS";

const tabs: TABS[] = ["WORKFLOWS", "CREDENTIALS", "EXECUTIONS"];

const Dashboard = () => {
  const { data } = useSession();
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TABS>("WORKFLOWS");
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/v1/workflow`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      setWorkflows(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (id: string, enabled: boolean) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/api/v1/workflow/toggle/${id}`,
        { enabled },
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );

      setWorkflows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, enabled } : w))
      );
      toast.success(`Workflow ${enabled ? "activated" : "deactivated"}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/workflow/${id}`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      toast.success(`Workflow Successfully Removed!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? error.message);
    }
  };

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (data && data.accessToken) {
      fetchWorkflows();
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Personal Workspace
            </h1>
            <p className="text-slate-400">
              Manage your workflows, credentials, and executions
            </p>
          </div>
          <Link href="/workflow/create">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-orange-500/25 transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-1 mb-8 bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        {activeTab === "WORKFLOWS" ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 w-80 focus:border-orange-500/50 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Select defaultValue="last-updated">
                  <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="last-updated">
                      Sort by last updated
                    </SelectItem>
                    <SelectItem value="name">Sort by name</SelectItem>
                    <SelectItem value="created">Sort by created</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className={`${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}`}
            >
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-800/30 rounded-xl p-6">
                      <div className="h-6 bg-slate-700/50 rounded-lg mb-4"></div>
                      <div className="h-4 bg-slate-700/50 rounded-lg mb-2"></div>
                      <div className="h-4 bg-slate-700/50 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : filteredWorkflows.length > 0 ? (
                filteredWorkflows.map((workflow) => (
                  <WorkflowCard key={workflow.id} workflow={workflow} onDeleteWorkflow={handleDeleteWorkflow} onToggleWorkflow={handleToggleWorkflow} />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-lg">No workflows found</p>
                  <p className="text-slate-500 text-sm mt-2">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Create your first workflow to get started"}
                  </p>
                </div>
              )}
            </div>

            {filteredWorkflows.length > 0 && (
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">
                    Total workflows
                  </span>
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    {filteredWorkflows.length}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">Items per page</span>
                  <Select defaultValue="50">
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "CREDENTIALS" ? (
          <CredentialsTab />
        ) : activeTab === "EXECUTIONS" ? (
            <ExecutionsTab />
        ) : (
          <div>
            Invalid Tab Selectedj
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
