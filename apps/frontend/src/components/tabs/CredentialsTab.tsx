import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Mail,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useSession } from "next-auth/react";

const PLATFORMS = {
  TELEGRAM: {
    name: "Telegram",
    icon: MessageSquare,
    color: "bg-purple-500",
    fields: [
      {
        name: "accessToken",
        label: "Access Token",
        type: "password",
        required: true,
      },
    ],
  },
  GMAIL: {
    name: "Gmail",
    icon: Mail,
    color: "bg-red-500",
    fields: [
      { name: "email", label: "Email Address", type: "email", required: true },
      {
        name: "appPassword",
        label: "App Password",
        type: "password",
        required: true,
      },
      { name: "clientId", label: "Client ID", type: "text", required: false },
      {
        name: "clientSecret",
        label: "Client Secret",
        type: "password",
        required: false,
      },
    ],
  },
};

interface Credential {
  id: string;
  platform: keyof typeof PLATFORMS;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

const CredentialsTab = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});
  const { data } = useSession();

  const filteredCredentials = credentials.filter((credential) => {
    const matchesPlatform =
      selectedPlatform === "all" || credential.platform === selectedPlatform;
    return matchesPlatform;
  });

  const handleAddCredential = async (credentialData: any) => {
    if (!data || !data.accessToken) {
      toast.warning("Invalid Session", { position: "top-center" });
      return;
    }
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/credentials`,
        {
          data: credentialData.data,
          platform: credentialData.platform,
        },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        }
      );

      toast.success(res.data.message);
      setCredentials([...credentials, res.data.credential]);
      setShowAddDialog(false);
    } catch (error: any) {
      toast.error("Error while adding credentials:", error);
    }
  };

  const handleEditCredential = async (credentialData: any) => {
    if (!editingCredential) return;

    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/credentials/${editingCredential.id}`,
          credentialData.data,
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      setCredentials(credentials.filter((c) => c.id !== editingCredential.id));
      const updatedCredential = {
        ...editingCredential,
        data: credentialData.data,
      };

      setCredentials(
        credentials.map((c) =>
          c.id === editingCredential.id ? updatedCredential : c
        )
      );
      setEditingCredential(null);
      toast.success(res.data.message);
    } catch (error: any) {
      toast.error("Error while editing Credentials", error);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    try {
      const res = await axios.delete(
        `${BACKEND_URL}/api/v1/credentials/${id}`,
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      toast.success(res.data.message);
      setCredentials(credentials.filter((c) => c.id !== id));
    } catch (error: any) {
      toast.error("Error while deleting Credentials", error);
    }
  };

  const togglePasswordVisibility = (credentialId: string, field: string) => {
    const key = `${credentialId}-${field}`;
    setVisiblePasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchCredentials = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/credentials`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      const creds = res.data.creds;
      setCredentials(creds);
    } catch (error: any) {
      toast.error("Error while fetching credentials: ", error);
    }
  };

  useEffect(() => {
    if (data && data.accessToken) {
      fetchCredentials();
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Credentials</h2>
          <p className="text-slate-400">
            Manage your platform credentials and API keys
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-orange-500/25 transition-all duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Add Credential
            </Button>
          </DialogTrigger>
          <CredentialDialog
            onSubmit={handleAddCredential}
            onCancel={() => setShowAddDialog(false)}
          />
        </Dialog>
      </div>

      <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search credentials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400 focus:border-orange-500/50 focus:ring-orange-500/20"
          />
        </div>

        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white w-48">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Platforms</SelectItem>
            {Object.entries(PLATFORMS).map(([key, platform]) => (
              <SelectItem key={key} value={key}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="bg-slate-800/30 border-slate-700/50 animate-pulse"
            >
              <CardHeader>
                <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-slate-700/50 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCredentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCredentials.map((credential) => {
            const platform = PLATFORMS[credential.platform];
            const IconComponent = platform.icon;

            return (
              <Card
                key={credential.id}
                className="bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 transition-all duration-200 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardDescription className="text-slate-400">
                          {platform.name}
                        </CardDescription>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-slate-800 border-slate-700"
                        align="end"
                      >
                        <DropdownMenuItem
                          onClick={() => setEditingCredential(credential)}
                          className="text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCredential(credential.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {platform.fields.slice(0, 2).map((field) => {
                      const value = credential.data[field.name];
                      if (!value) return null;

                      const isPassword = field.type === "password";
                      const visibilityKey = `${credential.id}-${field.name}`;
                      const isVisible = visiblePasswords[visibilityKey];

                      return (
                        <div
                          key={field.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-slate-400">{field.label}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 font-mono text-xs">
                              {isPassword && !isVisible
                                ? "••••••••"
                                : typeof value === "string" && value.length > 20
                                  ? `${value.substring(0, 20)}...`
                                  : value}
                            </span>
                            {isPassword && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  togglePasswordVisibility(
                                    credential.id,
                                    field.name
                                  )
                                }
                                className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                              >
                                {isVisible ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-700/50 space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Created: {formatDate(credential.createdAt)}</span>
                      {credential.lastUsed && (
                        <Badge
                          variant="outline"
                          className="border-green-500/30 text-green-400 text-xs"
                        >
                          Recently used
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-400 text-lg">No credentials found</p>
          <p className="text-slate-500 text-sm mt-2">
            {searchQuery || selectedPlatform !== "all"
              ? "Try adjusting your search or filter"
              : "Add your first credential to get started"}
          </p>
        </div>
      )}

      {editingCredential && (
        <Dialog open={true} onOpenChange={() => setEditingCredential(null)}>
          <CredentialDialog
            credential={editingCredential}
            onSubmit={handleEditCredential}
            onCancel={() => setEditingCredential(null)}
          />
        </Dialog>
      )}
    </div>
  );
};

const CredentialDialog = ({
  credential,
  onSubmit,
  onCancel,
}: {
  credential?: Credential;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<
    keyof typeof PLATFORMS | ""
  >(credential?.platform || "");
  const [formData, setFormData] = useState<Record<string, any>>(
    credential?.data || {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedPlatform) {
      newErrors.platform = "Please select a platform";
    }

    if (selectedPlatform) {
      const platform = PLATFORMS[selectedPlatform];
      platform.fields.forEach((field) => {
        if (field.required && !formData[field.name]?.trim()) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        platform: selectedPlatform,
        data: formData,
      });
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const selectedPlatformConfig = selectedPlatform
    ? PLATFORMS[selectedPlatform]
    : null;

  return (
    <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {credential ? "Edit Credential" : "Add New Credential"}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          {credential
            ? "Update your credential information"
            : "Add credentials for a platform to use in your workflows"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Platform *</Label>
          <Select
            value={selectedPlatform}
            onValueChange={setSelectedPlatform}
            disabled={!!credential}
          >
            <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Select a platform" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {Object.entries(PLATFORMS).map(([key, platform]) => {
                const IconComponent = platform.icon;
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded ${platform.color} flex items-center justify-center`}
                      >
                        <IconComponent className="w-2.5 h-2.5 text-white" />
                      </div>
                      {platform.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.platform && (
            <p className="text-red-400 text-sm">{errors.platform}</p>
          )}
        </div>

        {selectedPlatformConfig && (
          <div className="space-y-4">
            <div className="border-t border-slate-700 pt-4">
              <h4 className="font-medium text-slate-300 mb-3">
                Platform Configuration
              </h4>
              <div className="space-y-3">
                {selectedPlatformConfig.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-slate-300">
                      {field.label} {field.required && "*"}
                    </Label>

                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.name, e.target.value)
                        }
                        className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={
                          field.type === "password" ? "password" : field.type
                        }
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.name, e.target.value)
                        }
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}

                    {errors[field.name] && (
                      <p className="text-red-400 text-sm">
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
          >
            {credential ? "Update" : "Add"} Credential
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};

export default CredentialsTab;
