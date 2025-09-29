import { useEffect, useState } from "react";
import Modal from "../Modal";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface ITriggerFormProps {
  isOpen: boolean;
  onClose: () => void;
  triggerData: any;
  webhookData?: any;
  onSave: (data: any) => void;
}

const TriggerForm = ({
  isOpen,
  onClose,
  triggerData,
  webhookData,
  onSave,
}: ITriggerFormProps) => {
  const [formData, setFormData] = useState({
    triggerType: triggerData?.triggerType || "MANUAL",
    cronExpression: triggerData?.data?.cronExpression || "",
    webhookData: webhookData || {},
    ...triggerData?.data,
  });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && triggerData) {
      setFormData({
        triggerType: triggerData?.triggerType || "MANUAL",
        cronExpression: triggerData?.data?.cronExpression || "",
        webhookData: webhookData || {},
        ...triggerData?.data,
      });
    } else if (isOpen && !triggerData) {
      setFormData({
        triggerType: "MANUAL",
        cronExpression: "",
        webhookData: {},
      });
    }
  }, [isOpen, triggerData]);

  useEffect(() => {
    let timeout = setTimeout(() => {
      setIsCopied(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isCopied]);

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
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Webhook Configuration</h3>

              {webhookData?.path ? (
                <div className="flex items-center justify-between rounded-lg border border-muted bg-muted/40 gap-1.5 px-4 py-3">
                  <p className="text-sm font-mono w-full overflow-x-auto text-primary">
                    {webhookData.path}
                  </p>
                  <Button
                    disabled={isCopied}
                    className="ml-3 cursor-pointer rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground shadow hover:bg-primary/90"
                    onClick={() => {
                      setIsCopied(true);
                      navigator.clipboard.writeText(webhookData.path);
                    }}
                  >
                    {isCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 px-4 py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    A unique webhook URL will be generated automatically when
                    you save this workflow.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    🔗 Webhook URL will be available after saving
                  </p>
                </div>
              )}
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

export default TriggerForm;
