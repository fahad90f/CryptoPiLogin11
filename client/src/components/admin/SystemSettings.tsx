import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Save, 
  PlusCircle, 
  Trash,
  RefreshCw,
  Settings,
  X,
  AlertTriangle,
} from "lucide-react";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

type SystemConfig = {
  key: string;
  value: any;
  description: string | null;
};

export function SystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddConfigDialogOpen, setIsAddConfigDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<string | null>(null);
  const [newConfig, setNewConfig] = useState({
    key: "",
    value: "",
    description: "",
  });
  const [editedConfigs, setEditedConfigs] = useState<Record<string, any>>({});
  
  // Fetch system configuration
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/system/config'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/system/config');
      return response.json();
    }
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (params: { key: string; value: any }) => {
      return apiRequest('PATCH', `/api/admin/system/config/${params.key}`, {
        value: params.value
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/config'] });
      setEditedConfigs({});
      toast({
        title: "Configuration updated",
        description: "System configuration has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update configuration",
        description: "There was an error updating the configuration. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add config mutation
  const addConfigMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/system/config', newConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/config'] });
      setIsAddConfigDialogOpen(false);
      setNewConfig({
        key: "",
        value: "",
        description: "",
      });
      toast({
        title: "Configuration added",
        description: "New system configuration has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add configuration",
        description: "There was an error adding the configuration. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete config mutation
  const deleteConfigMutation = useMutation({
    mutationFn: async (key: string) => {
      return apiRequest('DELETE', `/api/admin/system/config/${key}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/config'] });
      setConfigToDelete(null);
      toast({
        title: "Configuration deleted",
        description: "System configuration has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete configuration",
        description: "There was an error deleting the configuration. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Reset system mutation
  const resetSystemMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/system/reset');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system/config'] });
      setIsResetDialogOpen(false);
      toast({
        title: "System reset",
        description: "System settings have been reset to defaults successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to reset system",
        description: "There was an error resetting the system. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle input change for editing configs
  const handleConfigChange = (key: string, value: any) => {
    setEditedConfigs({ ...editedConfigs, [key]: value });
  };

  // Handle input change for new config
  const handleNewConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewConfig(prev => ({ ...prev, [name]: value }));
  };

  // Save edited configs
  const handleSaveConfig = (key: string) => {
    if (editedConfigs[key] !== undefined) {
      updateConfigMutation.mutate({ key, value: editedConfigs[key] });
    }
  };

  // Add new config
  const handleAddConfig = (e: React.FormEvent) => {
    e.preventDefault();
    addConfigMutation.mutate();
  };

  // Delete config
  const handleDeleteConfig = () => {
    if (configToDelete) {
      deleteConfigMutation.mutate(configToDelete);
    }
  };

  // Reset system
  const handleResetSystem = () => {
    resetSystemMutation.mutate();
  };

  // Group configs by category (based on prefix before first '.')
  const groupConfigs = (configs: SystemConfig[]) => {
    const groups: Record<string, SystemConfig[]> = {
      general: [],
    };

    configs.forEach(config => {
      const parts = config.key.split('.');
      let category = 'general';
      
      if (parts.length > 1) {
        category = parts[0].toLowerCase();
      }
      
      if (!groups[category]) {
        groups[category] = [];
      }
      
      groups[category].push(config);
    });
    
    return groups;
  };

  // Format category names
  const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Get input type based on value
  const getInputType = (config: SystemConfig) => {
    const value = config.value;
    
    if (typeof value === 'boolean') {
      return 'boolean';
    } else if (!isNaN(Number(value))) {
      return 'number';
    } else {
      return 'string';
    }
  };

  // Render config input based on type
  const renderConfigInput = (config: SystemConfig) => {
    const type = getInputType(config);
    const value = editedConfigs[config.key] !== undefined 
      ? editedConfigs[config.key] 
      : config.value;
    
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={`config-${config.key}`}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleConfigChange(config.key, checked)}
            />
            <Label htmlFor={`config-${config.key}`}>{value ? 'Enabled' : 'Disabled'}</Label>
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleConfigChange(config.key, Number(e.target.value))}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleConfigChange(config.key, e.target.value)}
          />
        );
    }
  };

  // Check if config has been edited
  const isConfigEdited = (key: string) => {
    return editedConfigs[key] !== undefined;
  };

  const configGroups = data ? groupConfigs(data) : {};
  const categories = Object.keys(configGroups).sort();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and parameters</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsAddConfigDialogOpen(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" />
                Add Setting
              </Button>
              <Button 
                onClick={() => setIsResetDialogOpen(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <RefreshCw className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading system settings...</p>
            </div>
          ) : isError ? (
            <div className="py-8 text-center">
              <X className="h-8 w-8 mx-auto text-destructive" />
              <p className="mt-2 text-muted-foreground">Failed to load system settings. Please try again.</p>
            </div>
          ) : data && data.length > 0 ? (
            <Tabs defaultValue={categories[0]}>
              <TabsList className="mb-4">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {formatCategoryName(category)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <Accordion type="single" collapsible className="w-full">
                    {configGroups[category].map((config) => (
                      <AccordionItem key={config.key} value={config.key}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex justify-between items-center w-full pr-4">
                            <div className="text-left">
                              <span className="font-medium">{config.key}</span>
                              {config.description && (
                                <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                              )}
                            </div>
                            {isConfigEdited(config.key) && (
                              <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                                Modified
                              </span>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 gap-2">
                              <div className="flex flex-col space-y-1.5">
                                <Label htmlFor={`config-${config.key}`}>Value</Label>
                                {renderConfigInput(config)}
                              </div>
                              
                              <div className="flex justify-between mt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setConfigToDelete(config.key)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                                
                                <Button
                                  size="sm"
                                  disabled={!isConfigEdited(config.key)}
                                  onClick={() => handleSaveConfig(config.key)}
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="py-8 text-center">
              <Settings className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No system settings found. Add your first setting to get started.</p>
              <Button 
                onClick={() => setIsAddConfigDialogOpen(true)} 
                className="mt-4"
                variant="outline"
              >
                Add Setting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Config Dialog */}
      <Dialog open={isAddConfigDialogOpen} onOpenChange={setIsAddConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add System Setting</DialogTitle>
            <DialogDescription>
              Create a new system configuration parameter.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddConfig}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="config-key" className="text-right">
                  Key
                </Label>
                <Input
                  id="config-key"
                  name="key"
                  placeholder="category.setting_name"
                  className="col-span-3"
                  value={newConfig.key}
                  onChange={handleNewConfigChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="config-value" className="text-right">
                  Value
                </Label>
                <Input
                  id="config-value"
                  name="value"
                  placeholder="setting value"
                  className="col-span-3"
                  value={newConfig.value}
                  onChange={handleNewConfigChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="config-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="config-description"
                  name="description"
                  placeholder="What does this setting control?"
                  className="col-span-3"
                  value={newConfig.description}
                  onChange={handleNewConfigChange}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!newConfig.key || !newConfig.value}>
                Add Setting
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Config Dialog */}
      <AlertDialog open={!!configToDelete} onOpenChange={() => setConfigToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete System Setting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the setting "{configToDelete}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfig}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset System Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reset System Settings
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all system settings to their default values. This action cannot be undone and may affect the functionality of the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetSystem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset All Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}