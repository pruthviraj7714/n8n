import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  ChevronDown,
  ChevronRight,
  Zap,
  MessageSquare,
  Send,
  Calendar,
  Webhook,
  AlertTriangle
} from 'lucide-react';

interface ILog {
  message: string;
  nodeId: string;
  type: "NODE_EXECUTED" | "TRIGGER_EXECUTED" | "ERROR" | "COMPLETED";
  timestamp?: string;
}

interface ExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isExecuting: boolean;
  logs: ILog[];
  workflowTitle: string;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  isOpen,
  onClose,
  isExecuting,
  logs,
  workflowTitle
}) => {
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  const toggleLogExpansion = (index: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const getStatusIcon = () => {
    if (isExecuting) {
      return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
    }
    
    const hasErrors = logs.some(log => log.type === 'ERROR');
    const isCompleted = logs.some(log => log.type === 'COMPLETED');
    
    if (hasErrors) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isExecuting) return "Executing...";
    
    const hasErrors = logs.some(log => log.type === 'ERROR');
    const isCompleted = logs.some(log => log.type === 'COMPLETED');
    
    if (hasErrors) return "Failed";
    if (isCompleted) return "Completed";
    return "Ready";
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'TRIGGER_EXECUTED':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'NODE_EXECUTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ERROR':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'TRIGGER_EXECUTED':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'NODE_EXECUTED':
        return 'border-green-500/20 bg-green-500/5';
      case 'ERROR':
        return 'border-red-500/20 bg-red-500/5';
      case 'COMPLETED':
        return 'border-emerald-500/20 bg-emerald-500/5';
      default:
        return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return new Date().toLocaleTimeString();
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h2 className="text-lg font-semibold text-white">Execution Panel</h2>
            <p className="text-sm text-slate-400">{workflowTitle}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-300">Status:</span>
            <span className={`text-sm font-medium ${
              isExecuting ? 'text-blue-400' :
              logs.some(log => log.type === 'ERROR') ? 'text-red-400' :
              logs.some(log => log.type === 'COMPLETED') ? 'text-green-400' :
              'text-slate-400'
            }`}>
              {getStatusText()}
            </span>
          </div>
          <div className="text-sm text-slate-400">
            {logs.length} events
          </div>
        </div>
        
        {isExecuting && (
          <div className="mt-3">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-blue-400">Processing workflow...</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{width: '60%'}}></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Play className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No execution logs yet</p>
            <p className="text-slate-500 text-xs mt-1">Execute the workflow to see logs here</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 transition-all duration-200 ${getLogColor(log.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getLogIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white capitalize">
                      {log.type.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-2">
                    {log.message}
                  </p>
                  
                  {log.nodeId && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLogExpansion(index)}
                        className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {expandedLogs.has(index) ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                        <span>Node Details</span>
                      </button>
                    </div>
                  )}
                  
                  {expandedLogs.has(index) && log.nodeId && (
                    <div className="mt-2 p-2 bg-slate-800/50 rounded border border-slate-600">
                      <div className="text-xs text-slate-400 mb-1">Node ID:</div>
                      <code className="text-xs text-slate-300 font-mono break-all">
                        {log.nodeId}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Real-time execution logs</span>
          {isExecuting && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <span>Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionPanel;