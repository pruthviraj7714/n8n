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
  CardTitle,
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
  Shield,
  Sparkles,
  Database,
  Lock,
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
  RESEND: {
    name: "Resend",
    icon: Mail,
    color: "bg-red-500",
    fields: [
      {
        name: "resendAPIKey",
        label: "Resend API Key",
        type: "password",
        required: true,
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
      toast.error("Error while adding credentials:", {
        description : error.response.data.message || error.message
      });
    }
  };

  const handleEditCredential = async (credentialData: any) => {
    if (!editingCredential) return;

    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/credentials/${editingCredential.id}`,
        {
          data : credentialData.data,
        },
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

  interface Credential {
    id: string;
    platform: keyof typeof PLATFORMS;
    data: Record<string, any>;
    createdAt: string;
    lastUsed?: string;
    updatedAt : string;
  }
  
    return (
      <div className="space-y-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
  
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Credentials
              </h2>
              <Badge className="bg-gradient-to-r from-accent/20 to-primary/20 text-accent border border-accent/30 px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                Secure
              </Badge>
            </div>
            <p className="text-xl text-muted-foreground">
              Manage your platform credentials and API keys with enterprise-grade security
            </p>
          </div>
  
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Add Credential
              </Button>
            </DialogTrigger>
            <CredentialDialog
              onSubmit={handleAddCredential}
              onCancel={() => setShowAddDialog(false)}
            />
          </Dialog>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <Card className="bg-gradient-to-br from-card/80 to-card/40 border border-border/30 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-accent/20 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle  className="text-sm font-medium text-muted-foreground">Total Credentials</CardTitle>
                <div className="p-2 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors duration-300">
                  <Key className="h-4 w-4 text-accent" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{credentials.length}</div>
              <p className="text-xs text-accent flex items-center">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse mr-2"></span>
                All secured
              </p>
            </CardContent>
          </Card>
  
          <Card className="bg-gradient-to-br from-card/80 to-card/40 border border-border/30 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-primary/20 transition-all duration-300 hover:scale-105 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Platforms</CardTitle>
                <div className="p-2 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors duration-300">
                  <Database className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {new Set(credentials.map(c => c.platform)).size}
              </div>
              <p className="text-xs text-primary">Connected services</p>
            </CardContent>
          </Card>
        </div>
  
        <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/30 shadow-lg shadow-primary/5 relative z-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search credentials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-card/50 border-border/30 text-foreground placeholder-muted-foreground h-12 rounded-xl backdrop-blur-sm focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
            />
          </div>
  
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="bg-card/50 border-border/30 text-foreground w-56 h-12 rounded-xl backdrop-blur-sm">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-border/30 rounded-xl">
              <SelectItem value="all">All Platforms</SelectItem>
              {Object.entries(PLATFORMS).map(([key, platform]) => (
                <SelectItem key={key} value={key}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
  
        <div className="relative z-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-card/30 border-border/20 animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-border/40 rounded w-3/4"></div>
                    <div className="h-4 bg-border/40 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-border/40 rounded w-full mb-2"></div>
                    <div className="h-4 bg-border/40 rounded w-2/3"></div>
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
                    className="bg-gradient-to-br from-card/80 to-card/40 border border-border/30 backdrop-blur-sm shadow-xl shadow-primary/5 hover:shadow-accent/20 transition-all duration-300 hover:scale-105 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
  
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl ${platform.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-foreground group-hover:text-accent transition-colors duration-300">
                              {platform.name}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              Configured credential
                            </CardDescription>
                          </div>
                        </div>
  
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-card/60 rounded-xl p-2"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-card/95 backdrop-blur-lg border-border/30 shadow-2xl shadow-primary/10 rounded-xl">
                            <DropdownMenuItem
                              onClick={() => setEditingCredential(credential)}
                              className="text-foreground hover:bg-accent/10 focus:bg-accent/10 rounded-lg mx-2 my-1 transition-all duration-200 cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-3 text-accent" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCredential(credential.id)}
                              className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 rounded-lg mx-2 my-1 transition-all duration-200 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
  
                    <CardContent className="space-y-4 relative z-10">
                      <div className="space-y-3">
                        {platform.fields.slice(0, 2).map((field) => {
                          const value = credential.data[field.name];
                          if (!value) return null;
  
                          const isPassword = field.type === "password";
                          const visibilityKey = `${credential.id}-${field.name}`;
                          const isVisible = visiblePasswords[visibilityKey];
  
                          return (
                            <div key={field.name} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground font-medium">{field.label}:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-foreground font-mono bg-card/50 px-2 py-1 rounded-lg">
                                  {isPassword && !isVisible
                                    ? "••••••••"
                                    : typeof value === "string" && value.length > 15
                                      ? `${value.substring(0, 15)}...`
                                      : value}
                                </span>
                                {isPassword && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePasswordVisibility(credential.id, field.name)}
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-card/60 rounded-lg transition-all duration-300"
                                  >
                                    {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
  
                      <div className="pt-4 border-t border-border/30 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Created: {formatDate(credential.createdAt)}</span>
                          {credential.lastUsed && (
                            <Badge className="bg-gradient-to-r from-accent/20 to-primary/20 text-accent border border-accent/30 px-2 py-1 text-xs font-medium">
                              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse mr-1.5"></div>
                              Recently used
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
  
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-chart-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-card/50 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-border/30">
                <Key className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No credentials found</h3>
              <p className="text-muted-foreground text-lg mb-6">
                {searchQuery || selectedPlatform !== "all"
                  ? "Try adjusting your search or filter"
                  : "Add your first credential to get started"}
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Credential
              </Button>
            </div>
          )}
        </div>
  
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
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof PLATFORMS | "">(
    credential?.platform || ""
  );
  const [formData, setFormData] = useState<Record<string, any>>(credential?.data || {});
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

  const selectedPlatformConfig = selectedPlatform ? PLATFORMS[selectedPlatform] : null;

  return (
    <DialogContent className="bg-card/95 backdrop-blur-lg border-border/30 text-foreground max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl shadow-primary/10">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {credential ? "Edit Credential" : "Add New Credential"}
        </DialogTitle>
        <DialogDescription className="text-muted-foreground text-lg">
          {credential
            ? "Update your credential information with secure encryption"
            : "Add credentials for a platform to use in your automated workflows"}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-foreground font-semibold">Platform *</Label>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform} disabled={!!credential}>
            <SelectTrigger className="bg-card/50 border-border/30 text-foreground h-12 rounded-xl backdrop-blur-sm">
              <SelectValue placeholder="Select a platform" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-lg border-border/30 rounded-xl">
              {Object.entries(PLATFORMS).map(([key, platform]) => {
                const IconComponent = platform.icon;
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg ${platform.color} flex items-center justify-center`}>
                        <IconComponent className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.platform && <p className="text-destructive text-sm font-medium">{errors.platform}</p>}
        </div>

        {selectedPlatformConfig && (
          <div className="space-y-6">
            <div className="border-t border-border/30 pt-6">
              <div className="flex items-center space-x-2 mb-6">
                <Lock className="w-5 h-5 text-accent" />
                <h4 className="text-lg font-semibold text-foreground">Platform Configuration</h4>
              </div>
              <div className="space-y-4">
                {selectedPlatformConfig.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-foreground font-semibold">
                      {field.label} {field.required && <span className="text-accent">*</span>}
                    </Label>

                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="bg-card/50 border-border/30 text-foreground min-h-[100px] rounded-xl backdrop-blur-sm focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type === "password" ? "password" : field.type}
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="bg-card/50 border-border/30 text-foreground h-12 rounded-xl backdrop-blur-sm focus:border-accent/50 focus:ring-accent/20 transition-all duration-300"
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                      />
                    )}

                    {errors[field.name] && (
                      <p className="text-destructive text-sm font-medium">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border/30 text-foreground hover:bg-card/60 rounded-xl px-6 py-3 font-medium transition-all duration-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 font-semibold"
          >
            {credential ? "Update" : "Add"} Credential
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  );
};

export default CredentialsTab;
