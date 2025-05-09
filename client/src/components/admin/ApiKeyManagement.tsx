import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, Copy, Check, Trash2, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<number, boolean>>({});
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    type: "coinmarketcap",
    expiresAt: ""
  });
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);

  // Fetch API keys from API
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['/api/admin/api-keys'],
    queryFn: async () => {
      return await apiRequest<ApiKey[]>('/api/admin/api-keys');
    }
  });

  // Create API key mutation
  const createApiKey = useMutation({
    mutationFn: async (formData: typeof newKeyData) => {
      return await apiRequest<ApiKey>('/api/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      toast({
        title: "API Key Created",
        description: "New API key has been created successfully",
      });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive"
      });
    }
  });

  // Toggle API key status mutation
  const toggleApiKeyStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      return await apiRequest<ApiKey>(`/api/admin/api-keys/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      toast({
        title: "API Key Updated",
        description: "API key status has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update API key status",
        variant: "destructive"
      });
    }
  });

  // Delete API key mutation
  const deleteApiKey = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/api-keys/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      toast({
        title: "API Key Deleted",
        description: "API key has been deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setSelectedKeyId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    }
  });

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    createApiKey.mutate(newKeyData);
  };

  const handleToggleKeyStatus = (id: number, currentStatus: boolean) => {
    toggleApiKeyStatus.mutate({ id, isActive: !currentStatus });
  };

  const handleDeleteApiKey = () => {
    if (selectedKeyId !== null) {
      deleteApiKey.mutate(selectedKeyId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: "API key copied to clipboard",
        });
      },
      () => {
        toast({
          title: "Failed to copy",
          description: "Could not copy API key to clipboard",
          variant: "destructive"
        });
      }
    );
  };

  const resetForm = () => {
    setNewKeyData({
      name: "",
      type: "coinmarketcap",
      expiresAt: ""
    });
  };

  const getApiTypeLabel = (type: string) => {
    switch (type) {
      case 'coinmarketcap':
        return 'CoinMarketCap';
      case 'coingecko':
        return 'CoinGecko';
      case 'blockchain_ethereum':
        return 'Ethereum RPC';
      case 'blockchain_binance':
        return 'Binance Smart Chain';
      case 'blockchain_tron':
        return 'Tron';
      case 'blockchain_solana':
        return 'Solana';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const toggleKeyVisibility = (id: number) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatExpiryDate = (expiresAt: string | null) => {
    if (!expiresAt) return "Never";
    const date = new Date(expiresAt);
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>API Key Management</CardTitle>
            <CardDescription>
              Manage API keys for external service integrations
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Key
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading API keys...
                  </TableCell>
                </TableRow>
              ) : !apiKeys || apiKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No API keys found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <code className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">
                          {showKeys[apiKey.id] ? apiKey.key : "•••••••••••••••••••••••••"}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getApiTypeLabel(apiKey.type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={apiKey.isActive}
                          onCheckedChange={() => 
                            handleToggleKeyStatus(apiKey.id, apiKey.isActive)
                          }
                        />
                        <Badge
                          variant={apiKey.isActive ? "success" : "secondary"}
                        >
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatExpiryDate(apiKey.expiresAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setSelectedKeyId(apiKey.id);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {/* Create API Key Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for external service integration
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateApiKey}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Key Name</label>
                <Input
                  id="name"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  placeholder="Production CoinMarketCap Key"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="type" className="text-sm font-medium">API Type</label>
                <Select
                  value={newKeyData.type}
                  onValueChange={(value) => setNewKeyData({ ...newKeyData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select API type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coinmarketcap">CoinMarketCap</SelectItem>
                    <SelectItem value="coingecko">CoinGecko</SelectItem>
                    <SelectItem value="blockchain_ethereum">Ethereum RPC</SelectItem>
                    <SelectItem value="blockchain_binance">Binance Smart Chain</SelectItem>
                    <SelectItem value="blockchain_tron">Tron</SelectItem>
                    <SelectItem value="blockchain_solana">Solana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="expiresAt" className="text-sm font-medium">Expiration Date (Optional)</label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={newKeyData.expiresAt}
                  onChange={(e) => setNewKeyData({ ...newKeyData, expiresAt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createApiKey.isPending}>
                {createApiKey.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Key
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete API Key Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this API key. Any services using this key will stop working immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApiKey}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteApiKey.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Key"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}