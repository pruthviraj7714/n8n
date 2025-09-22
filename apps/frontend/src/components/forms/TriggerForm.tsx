import { useState } from "react";
import Modal from "../Modal";
import { X } from "lucide-react";


interface ITriggerFormProps {
    isOpen: boolean;
    onClose: () => void;
    triggerData: any;
    onSave: (data : any) => void;
  }

const TriggerForm = ({ isOpen, onClose, triggerData, onSave } : ITriggerFormProps) => {
    const [formData, setFormData] = useState({
      triggerType: triggerData?.triggerType || "MANUAL",
      cronExpression: triggerData?.data?.cronExpression || "",
      webhookData: triggerData?.data?.webhookData || {},
      ...triggerData?.data,
    });
  
    const handleSave = () => {
      const data = {
        triggerType: formData.triggerType,
        data: {
          cronExpression: formData.cronExpression,
          webhookData: formData.webhookData,
        },
      };
      onSave(data);
      onClose();
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Configure Trigger
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
  
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Trigger Type
              </label>
              <select
                value={formData.triggerType}
                onChange={(e) =>
                  setFormData({ ...formData, triggerType: e.target.value })
                }
                className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
              >
                <option value="MANUAL">Manual Trigger</option>
                <option value="WEBHOOK">Webhook Trigger</option>
                <option value="CRON">Scheduled Trigger</option>
              </select>
            </div>
  
            {formData.triggerType === "WEBHOOK" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Webhook Configuration
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  A unique webhook URL will be generated automatically when you
                  save this workflow.
                </p>
                <div className="p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground">
                    🔗 Webhook URL will be available after saving
                  </p>
                </div>
              </div>
            )}
  
            {formData.triggerType === "CRON" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cron Expression
                </label>
                <input
                  type="text"
                  value={formData.cronExpression}
                  onChange={(e) =>
                    setFormData({ ...formData, cronExpression: e.target.value })
                  }
                  placeholder="0 */5 * * * (every 5 minutes)"
                  className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Use cron format: minute hour day month weekday
                </p>
              </div>
            )}
  
            {formData.triggerType === "MANUAL" && (
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-primary">
                  ⚡ This workflow can be triggered manually from the dashboard
                </p>
              </div>
            )}
          </div>
  
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Trigger
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  export default TriggerForm