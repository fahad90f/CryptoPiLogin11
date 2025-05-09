import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lock, Shield, Bell, Eye, EyeOff, Brain, Globe, Key } from "lucide-react";

export function SettingsForm() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // Security Settings
    twoFactorEnabled: true,
    biometricEnabled: false,
    activityNotifications: true,
    advancedSecurity: true,
    
    // Interface Settings
    theme: "dark",
    currency: "USD",
    defaultCrypto: "USDT",
    
    // Notification Settings
    emailNotifications: true,
    priceAlerts: true,
    securityAlerts: true,
    newsletterSubscription: false,
    
    // API Settings
    apiKeysEnabled: false,
    
    // Current Password (for security tab)
    currentPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    }, 1000);
  };

  return (
    <Card className="border border-muted/30">
      <CardHeader>
        <CardTitle className="text-xl font-space">Settings</CardTitle>
        <CardDescription>
          Configure your account preferences and security options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid grid-cols-4 bg-muted/20">
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="interface">Interface</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSaveSettings}>
            <TabsContent value="security" className="mt-6 space-y-4">
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/10 border border-muted/30">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => handleChange("twoFactorEnabled", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/10 border border-muted/30">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Activity Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get notified about important account activities</p>
                  </div>
                </div>
                <Switch
                  checked={settings.activityNotifications}
                  onCheckedChange={(checked) => handleChange("activityNotifications", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">AI-Enhanced Security</h4>
                    <p className="text-sm text-muted-foreground">Use DeepSeek AI to analyze and prevent suspicious activities</p>
                  </div>
                </div>
                <Switch
                  checked={settings.advancedSecurity}
                  onCheckedChange={(checked) => handleChange("advancedSecurity", checked)}
                />
              </div>
              
              <div className="grid gap-3 mt-6">
                <Label htmlFor="currentPassword">Confirm with current password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={settings.currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    className="bg-muted/40 border border-muted/60 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full p-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="interface" className="mt-6 space-y-6">
              <div className="grid gap-3">
                <Label>Theme</Label>
                <Select 
                  value={settings.theme} 
                  onValueChange={(value) => handleChange("theme", value)}
                >
                  <SelectTrigger className="bg-muted/40 border border-muted/60">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-3">
                <Label>Display Currency</Label>
                <Select 
                  value={settings.currency} 
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger className="bg-muted/40 border border-muted/60">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    <SelectItem value="JPY">JPY (Japanese Yen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-3">
                <Label>Default Cryptocurrency</Label>
                <Select 
                  value={settings.defaultCrypto} 
                  onValueChange={(value) => handleChange("defaultCrypto", value)}
                >
                  <SelectTrigger className="bg-muted/40 border border-muted/60">
                    <SelectValue placeholder="Select cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT (Tether)</SelectItem>
                    <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                    <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                    <SelectItem value="SOL">SOL (Solana)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/10 border border-muted/30">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">Language</h4>
                    <p className="text-sm text-muted-foreground">Select your preferred language</p>
                  </div>
                </div>
                <Select 
                  value="en-US" 
                  onValueChange={(value) => console.log(value)}
                >
                  <SelectTrigger className="w-[140px] bg-muted/40 border border-muted/60">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6 space-y-4">
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/10 border border-muted/30">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive important alerts via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/10 border border-muted/30">
                <div>
                  <h4 className="font-medium">Price Alerts</h4>
                  <p className="text-sm text-muted-foreground">Get notified about significant price changes</p>
                </div>
                <Switch
                  checked={settings.priceAlerts}
                  onCheckedChange={(checked) => handleChange("priceAlerts", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/10 border border-muted/30">
                <div>
                  <h4 className="font-medium">Security Alerts</h4>
                  <p className="text-sm text-muted-foreground">Receive alerts about security-related events</p>
                </div>
                <Switch
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) => handleChange("securityAlerts", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/10 border border-muted/30">
                <div>
                  <h4 className="font-medium">Newsletter</h4>
                  <p className="text-sm text-muted-foreground">Receive updates about new features and tips</p>
                </div>
                <Switch
                  checked={settings.newsletterSubscription}
                  onCheckedChange={(checked) => handleChange("newsletterSubscription", checked)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="mt-6 space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg bg-muted/10 border border-muted/30">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium">API Access</h4>
                    <p className="text-sm text-muted-foreground">Enable programmatic access to your account</p>
                  </div>
                </div>
                <Switch
                  checked={settings.apiKeysEnabled}
                  onCheckedChange={(checked) => handleChange("apiKeysEnabled", checked)}
                />
              </div>
              
              {settings.apiKeysEnabled && (
                <>
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label>Active API Keys</Label>
                      <Button variant="outline" size="sm" className="h-8">Generate New</Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/10 border border-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Development Key</div>
                          <Badge variant="outline" className="ml-2">Read-Only</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: May 15, 2023 • Last used: 2 days ago
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                          <Button variant="ghost" size="sm">Revoke</Button>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted/10 border border-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">Production Key</div>
                          <Badge variant="outline" className="ml-2">Full Access</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: June 3, 2023 • Last used: 6 hours ago
                        </div>
                        <div className="mt-2 flex justify-end gap-2">
                          <Button variant="ghost" size="sm">Revoke</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Rate Limits</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Read Requests:</span>
                        <span>1,000 per minute</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Write Requests:</span>
                        <span>100 per minute</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      ></circle>
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
