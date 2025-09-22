"use client"

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Save, Trash2, Mail, MessageCircle, Zap, Clock, Globe, Hand, Settings, X, Eye, EyeOff } from 'lucide-react';

const ConfigModal = ({ isOpen, onClose, node, onSave }) => {
  const [config, setConfig] = useState(node?.data?.config || {});
  const [showPassword, setShowPassword] = useState({});

  if (!isOpen || !node) return null;

  const handleSave = () => {
    onSave(node.id, config);
    onClose();
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderEmailForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
        <input
          type="text"
          value={config.smtpHost || ''}
          onChange={(e) => setConfig({...config, smtpHost: e.target.value})}
          placeholder="smtp.gmail.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
          <input
            type="number"
            value={config.port || ''}
            onChange={(e) => setConfig({...config, port: e.target.value})}
            placeholder="587"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Security</label>
          <select
            value={config.security || 'TLS'}
            onChange={(e) => setConfig({...config, security: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="TLS">TLS</option>
            <option value="SSL">SSL</option>
            <option value="None">None</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username/Email</label>
        <input
          type="email"
          value={config.username || ''}
          onChange={(e) => setConfig({...config, username: e.target.value})}
          placeholder="your-email@gmail.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password/App Password</label>
        <div className="relative">
          <input
            type={showPassword.password ? 'text' : 'password'}
            value={config.password || ''}
            onChange={(e) => setConfig({...config, password: e.target.value})}
            placeholder="Your app password"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('password')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword.password ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <hr className="my-4" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To Email</label>
        <input
          type="email"
          value={config.toEmail || ''}
          onChange={(e) => setConfig({...config, toEmail: e.target.value})}
          placeholder="recipient@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          type="text"
          value={config.subject || ''}
          onChange={(e) => setConfig({...config, subject: e.target.value})}
          placeholder="Email subject"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={config.message || ''}
          onChange={(e) => setConfig({...config, message: e.target.value})}
          placeholder="Your email message..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderTelegramForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
        <div className="relative">
          <input
            type={showPassword.botToken ? 'text' : 'password'}
            value={config.botToken || ''}
            onChange={(e) => setConfig({...config, botToken: e.target.value})}
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('botToken')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword.botToken ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Get this from @BotFather on Telegram</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
        <input
          type="text"
          value={config.chatId || ''}
          onChange={(e) => setConfig({...config, chatId: e.target.value})}
          placeholder="123456789 or @channel_name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">User ID, group ID, or channel username</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={config.message || ''}
          onChange={(e) => setConfig({...config, message: e.target.value})}
          placeholder="Your Telegram message..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="parseMode"
          checked={config.parseMode === 'Markdown'}
          onChange={(e) => setConfig({...config, parseMode: e.target.checked ? 'Markdown' : 'none'})}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="parseMode" className="text-sm text-gray-700">Enable Markdown formatting</label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="disableWebPagePreview"
          checked={config.disableWebPagePreview || false}
          onChange={(e) => setConfig({...config, disableWebPagePreview: e.target.checked})}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="disableWebPagePreview" className="text-sm text-gray-700">Disable web page preview</label>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Configure {node.data.type === 'email' ? 'Email' : 'Telegram'} Node
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {node.data.type === 'email' ? renderEmailForm() : renderTelegramForm()}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

const TriggerNode = ({ data, id }) => {
  const [triggerType, setTriggerType] = useState(data.triggerType || 'manual');

  const handleTriggerTypeChange = (newType) => {
    setTriggerType(newType);
    if (data.onTriggerTypeChange) {
      data.onTriggerTypeChange(id, newType);
    }
  };

  const getTriggerIcon = () => {
    switch (triggerType) {
      case 'manual': return <Hand size={16} />;
      case 'webhook': return <Globe size={16} />;
      case 'cron': return <Clock size={16} />;
      default: return <Hand size={16} />;
    }
  };

  const getTriggerColor = () => {
    switch (triggerType) {
      case 'manual': return 'bg-green-500';
      case 'webhook': return 'bg-blue-500';
      case 'cron': return 'bg-purple-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg border-2 border-white ${getTriggerColor()} text-white min-w-48`}>
      <div className="flex items-center gap-2 mb-2">
        {getTriggerIcon()}
        <div className="text-sm font-bold">TRIGGER</div>
      </div>
      <select
        value={triggerType}
        onChange={(e) => handleTriggerTypeChange(e.target.value)}
        className="w-full bg-white/20 text-white text-sm rounded px-2 py-1 border-none outline-none"
      >
        <option value="manual" className="text-black">Manual Trigger</option>
        <option value="webhook" className="text-black">Webhook</option>
        <option value="cron" className="text-black">CRON Schedule</option>
      </select>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

const ActionNode = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleLabelSave = () => {
    if (data.onLabelChange) {
      data.onLabelChange(id, label);
    }
    setIsEditing(false);
  };

  const handleConfigClick = (e) => {
    e.stopPropagation();
    if (data.onConfigClick) {
      data.onConfigClick(id);
    }
  };

  const getNodeIcon = () => {
    switch (data.type) {
      case 'email': return <Mail size={16} />;
      case 'telegram': return <MessageCircle size={16} />;
      default: return <Zap size={16} />;
    }
  };

  const getNodeColor = () => {
    switch (data.type) {
      case 'email': return 'bg-red-500';
      case 'telegram': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  const isConfigured = data.config && Object.keys(data.config).length > 0;

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 ${isConfigured ? 'border-green-300' : 'border-white'} ${getNodeColor()} text-white min-w-32 relative`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {getNodeIcon()}
          {isEditing ? (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyPress={(e) => e.key === 'Enter' && handleLabelSave()}
              className="bg-transparent border-b border-white text-white text-sm outline-none w-16"
              autoFocus
            />
          ) : (
            <div 
              className="text-sm font-medium cursor-pointer"
              onDoubleClick={() => setIsEditing(true)}
            >
              {data.label}
            </div>
          )}
        </div>
        <button
          onClick={handleConfigClick}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          title="Configure node"
        >
          <Settings size={14} />
        </button>
      </div>
      {isConfigured && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

const initialNodes = [
  {
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 250, y: 100 },
    data: { 
      triggerType: 'manual'
    },
    deletable: false,
  },
];

const initialEdges = [];

const CreateWorkflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(2);
  const [configModal, setConfigModal] = useState({ isOpen: false, node: null });

  const handleTriggerTypeChange = useCallback((id, newType) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, triggerType: newType } }
          : node
      )
    );
  }, [setNodes]);

  const handleLabelChange = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
  }, [setNodes]);

  const handleConfigClick = useCallback((id) => {
    const node = nodes.find(n => n.id === id);
    setConfigModal({ isOpen: true, node });
  }, [nodes]);

  const handleConfigSave = useCallback((id, config) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  }, [setNodes]);

  const stableCallbacks = React.useMemo(() => ({
    onLabelChange: handleLabelChange,
    onTriggerTypeChange: handleTriggerTypeChange,
    onConfigClick: handleConfigClick
  }), [handleLabelChange, handleTriggerTypeChange, handleConfigClick]);

  React.useEffect(() => {
    setNodes((nds) => nds.map((node) => ({
      ...node,
      data: { ...node.data, ...stableCallbacks }
    })));
  }, []); 

  const onConnect = useCallback((params) => {
    if (params.source === 'trigger-1') {
      setEdges((eds) => {
        const filteredEdges = eds.filter(edge => edge.source !== 'trigger-1');
        return addEdge(params, filteredEdges);
      });
    } else {
      setEdges((eds) => addEdge(params, eds));
    }
  }, [setEdges]);

  const addActionNode = (type) => {
    const newNode = {
      id: nodeId.toString(),
      type: 'action',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 200 },
      data: { 
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${nodeId}`,
        type: type,
        config: {},
        ...stableCallbacks
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNodeId(nodeId + 1);
  };

  const clearWorkflow = () => {
    setNodes([{
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 250, y: 100 },
      data: { 
        triggerType: 'manual',
        ...stableCallbacks
      },
      deletable: false,
    }]);
    setEdges([]);
    setNodeId(2);
  };

  const saveWorkflow = () => {
    const workflow = { nodes, edges };
    console.log('Saving workflow:', workflow);
    alert('Workflow saved to console! Check browser console for details.');
  };

  const executeWorkflow = () => {
    const triggerNode = nodes.find(n => n.type === 'trigger');
    const actionNodes = nodes.filter(n => n.type === 'action');
    const configuredNodes = actionNodes.filter(n => n.data.config && Object.keys(n.data.config).length > 0);
    
    console.log('Executing workflow:', {
      trigger: triggerNode?.data.triggerType,
      totalActions: actionNodes.length,
      configuredActions: configuredNodes.length,
      configurations: configuredNodes.map(n => ({
        id: n.id,
        type: n.data.type,
        config: n.data.config
      }))
    });
    
    alert(`Executing workflow with ${triggerNode?.data.triggerType} trigger and ${configuredNodes.length}/${actionNodes.length} configured action nodes!`);
  };

  const getTriggerNodeData = () => {
    const triggerNode = nodes.find(n => n.type === 'trigger');
    return triggerNode?.data.triggerType || 'manual';
  };

  const getConfiguredNodesCount = () => {
    return nodes.filter(n => n.type === 'action' && n.data.config && Object.keys(n.data.config).length > 0).length;
  };

  return (
    <div className="h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Workflow Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={saveWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={executeWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play size={16} />
              Execute
            </button>
            <button
              onClick={clearWorkflow}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        <div className="w-64 bg-white shadow-sm border-r p-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-900">Trigger</h2>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap size={14} />
                <span className="capitalize">{getTriggerNodeData()} Trigger</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Configure trigger in canvas</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4 text-gray-900">Action Nodes</h2>
          <div className="space-y-2">
            <button
              onClick={() => addActionNode('email')}
              className="w-full flex items-center gap-3 p-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-red-500 text-white rounded-md group-hover:bg-red-600">
                <Mail size={16} />
              </div>
              <div>
                <div className="font-medium text-gray-900">Email</div>
                <div className="text-sm text-gray-600">Send emails</div>
              </div>
            </button>

            <button
              onClick={() => addActionNode('telegram')}
              className="w-full flex items-center gap-3 p-3 text-left bg-cyan-50 hover:bg-cyan-100 rounded-lg transition-colors group"
            >
              <div className="p-2 bg-cyan-500 text-white rounded-md group-hover:bg-cyan-600">
                <MessageCircle size={16} />
              </div>
              <div>
                <div className="font-medium text-gray-900">Telegram</div>
                <div className="text-sm text-gray-600">Send messages</div>
              </div>
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Workflow Stats</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>Total Nodes: {nodes.length}</div>
              <div>Action Nodes: {nodes.filter(n => n.type === 'action').length}</div>
              <div>Configured: {getConfiguredNodesCount()}</div>
              <div>Connections: {edges.length}</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-50"
          >
            <Controls className="bg-white shadow-lg" />
            <MiniMap 
              className="bg-white shadow-lg"
              nodeColor={(node) => {
                if (node.type === 'trigger') {
                  switch (node.data.triggerType) {
                    case 'manual': return '#10b981';
                    case 'webhook': return '#3b82f6';
                    case 'cron': return '#8b5cf6';
                    default: return '#10b981';
                  }
                }
                switch (node.data.type) {
                  case 'email': return '#ef4444';
                  case 'telegram': return '#06b6d4';
                  default: return '#6b7280';
                }
              }}
            />
            <Background color="#e5e7eb" gap={20} />
          </ReactFlow>
        </div>
      </div>

      <ConfigModal
        isOpen={configModal.isOpen}
        onClose={() => setConfigModal({ isOpen: false, node: null })}
        node={configModal.node}
        onSave={handleConfigSave}
      />
    </div>
  );
};

export default CreateWorkflow;