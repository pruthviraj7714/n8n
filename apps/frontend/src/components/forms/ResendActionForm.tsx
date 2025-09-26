import { useEffect, useState } from "react";
import Modal from "../Modal";
import { Send, X } from "lucide-react";

interface IResendActionFormProps {
  isOpen: boolean;
  onClose: () => void;
  actionData: any;
  onSave: (data : any) => void;
}

const ResendActionForm = ({
  isOpen,
  onClose,
  actionData,
  onSave,
}: IResendActionFormProps) => {
  const [formData, setFormData] = useState({
    to: actionData?.to || "",
    from: actionData?.from || "",
    subject: actionData?.subject || "",
    html: actionData?.html || "",
  });

  useEffect(() => {
    if (isOpen && actionData) {
      setFormData({
        to: actionData?.to || "",
        from: actionData?.from || "",
        subject: actionData?.subject || "",
        html: actionData?.html || "",
      });
    } else if (isOpen && !actionData) {
      setFormData({
        to: actionData?.to || "",
        from: actionData?.from || "",
        subject: actionData?.subject || "",
        html: actionData?.html || "",
      });
    }
  }, [isOpen, actionData]);

  const handleSave = () => {
    const data = {
      actionPlatform: "RESEND",
        to: formData.to,
        from: formData.from,
        subject: formData.subject,
        html: formData.html,
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-foreground">
              Resend Email Action
            </h2>
          </div>
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
              From Email
            </label>
            <input
              type="email"
              value={formData.from}
              onChange={(e) =>
                setFormData({ ...formData, from: e.target.value })
              }
              placeholder="noreply@yourdomain.com"
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              To Email
            </label>
            <input
              type="email"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              placeholder="recipient@example.com"
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Email Subject"
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              HTML Content
            </label>
            <textarea
              value={formData.html}
              onChange={(e) =>
                setFormData({ ...formData, html: e.target.value })
              }
              placeholder="<h1>Hello World</h1><p>Your email content here...</p>"
              rows={6}
              className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground font-mono text-sm resize-none"
            />
          </div>
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
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Save Action
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResendActionForm;
