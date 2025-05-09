import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MoreHorizontal, 
  PlusCircle, 
  Copy, 
  CheckCircle,
  X,
  Trash,
  RefreshCw,
  Key,
  Eye,
  EyeOff
} from "lucide-react";

type ApiKey = {
  id: number;
  name: string;
  key: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  expiresAt: string | null;
};

export function ApiKeyManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isShowKeyDialogOpen, setIsShowKeyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [showFullKey, setShowFullKey] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    name: "",
    type: "read_only",
    expiresAt: "30"  // days until expiration
  });
  
  // Clipboard copy function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "API key copied to clipboard successfully.",
        });
      },
      () => {
        toast({
          title: "Failed to copy",
          description: "Could not copy API key to clipboard.",
          variant: "destructive",
        });
      }
    );
  };

  // Fetch API keys
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/api-keys'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/api-keys');
      return response;
    }
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async () => {
      const expiresIn = formState.expiresAt === "never" 
        ? null 
        : parseInt(formState.expiresAt, 10);
      
      return apiRequest('POST', '/api/admin/api-keys', {
        name: formState.name,
        type: formState.type,
        expiresInDays: expiresIn
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      setIsCreateDialogOpen(false);
      setCreatedApiKey(response.key);
      setIsShowKeyDialogOpen(true);
      setFormState({
        name: "",
        type: "read_only",
        expiresAt: "30"
      });
    },
    onError: () => {
      toast({
        title: "Failed to create API key",
        description: "There was an error creating the API key. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Toggle API key status mutation
  const toggleApiKeyMutation = useMutation({
    mutationFn: async (apiKey: ApiKey) => {
      return apiRequest('PATCH', `/api/admin/api-keys/${apiKey.id}/toggle`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      toast({
        title: "API key updated",
        description: "API key status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update API key",
        description: "There was an error updating the API key. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete API key mutation
  const deleteApiKeyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedApiKey) return;
      
      return apiRequest('DELETE', `/api/admin/api-keys/${selectedApiKey.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      setIsDeleteDialogOpen(false);
      setSelectedApiKey(null);
      toast({
        title: "API key deleted",
        description: "API key has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete API key",
        description: "There was an error deleting the API key. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Create new API key
  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    createApiKeyMutation.mutate();
  };

  // Toggle API key active status
  const handleToggleApiKey = (apiKey: ApiKey) => {
    toggleApiKeyMutation.mutate(apiKey);
  };

  // Delete API key
  const handleDeleteApiKey = () => {
    deleteApiKeyMutation.mutate();
  };

  // Format API key for display
  const formatApiKey = (key: string) => {
    if (showFullKey) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  // Get API key type badge
  const getApiKeyTypeBadge = (type: string) => {
    switch (type) {
      case "read_only":
        return <Badge variant="outline">Read Only</Badge>;
      case "read_write":
        return <Badge variant="default">Read & Write</Badge>;
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>Manage API keys for external integrations</CardDescription>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Create API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <RefreshCw className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading API keys...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <X className="h-8 w-8 mx-auto text-destructive" />
              <p className="mt-2 text-muted-foreground">Failed to load API keys. Please try again.</p>
            </div>
          ) : data && data.length > 0 ? (
            <Table>
              <TableCaption>A list of all API keys for your application.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Expires At</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((apiKey: ApiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">
                      {apiKey.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center gap-1">
                        {formatApiKey(apiKey.key)}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getApiKeyTypeBadge(apiKey.type)}
                    </TableCell>
                    <TableCell>
                      {apiKey.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {apiKey.expiresAt 
                        ? new Date(apiKey.expiresAt).toLocaleDateString()
                        : "Never"
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy API Key
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleApiKey(apiKey)}
                          >
                            {apiKey.isActive ? (
                              <>
                                <X className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedApiKey(apiKey);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete API Key
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <Key className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No API keys found. Create your first API key to get started.</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="mt-4"
                variant="outline"
              >
                Create API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for external integrations. Keep your API keys secure.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateApiKey}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My API Key"
                  className="col-span-3"
                  value={formState.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Permission
                </Label>
                <select
                  id="type"
                  name="type"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formState.type}
                  onChange={handleInputChange}
                >
                  <option value="read_only">Read Only</option>
                  <option value="read_write">Read & Write</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiresAt" className="text-right">
                  Expires In
                </Label>
                <select
                  id="expiresAt"
                  name="expiresAt"
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formState.expiresAt}
                  onChange={handleInputChange}
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                  <option value="never">Never (Not recommended)</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!formState.name || createApiKeyMutation.isPending}>
                {createApiKeyMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create API Key"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Show Created API Key Dialog */}
      <Dialog open={isShowKeyDialogOpen} onOpenChange={setIsShowKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won't be able to see the full key again.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <Input
                value={createdApiKey || ""}
                className="pr-10 font-mono text-sm"
                readOnly
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setShowFullKey(!showFullKey)}
              >
                {showFullKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Save this API key in a secure location. For security reasons, you will not be able to view it again.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(createdApiKey || "")}
              className="mr-auto"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
            <Button 
              onClick={() => {
                setIsShowKeyDialogOpen(false);
                setCreatedApiKey(null);
                setShowFullKey(false);
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Dialog */}
      {selectedApiKey && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete API Key</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this API key? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3 font-medium">{selectedApiKey.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label className="text-right">Type</Label>
                <div className="col-span-3">{getApiKeyTypeBadge(selectedApiKey.type)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4 mt-2">
                <Label className="text-right">Created</Label>
                <div className="col-span-3">{new Date(selectedApiKey.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-4 text-sm text-destructive">
                <p>Deleting this API key will immediately revoke access for any services using it.</p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteApiKey}
                disabled={deleteApiKeyMutation.isPending}
              >
                {deleteApiKeyMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete API Key"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}