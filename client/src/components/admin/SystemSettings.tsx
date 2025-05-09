import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Shield,
  Settings2,
  Bell,
  Database,
  RefreshCw,
  Check,
  Info,
} from "lucide-react";

type SystemConfig = {
  key: string;
  value: any;
  description: string | null;
};

export function SystemSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("security");
  const [isConfigModified, setIsConfigModified] = useState(false);
  
  // State for each settings category
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireUppercase: true,
    requireNumbers: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableCaptcha: false,
    twoFactorDefault: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    loginAlerts: true,
    securityAlerts: true,
    priceAlerts: true,
    transactionAlerts: true,
    marketingEmails: false,
    adminAlerts: true,
  });

  const [featureSettings, setFeatureSettings] = useState({
    enableRegistration: true,
    enableTokenGeneration: true,
    enableTokenConversion: true,
    enableTokenTransfer: true,
    enableApiAccess: true,
    maintenanceMode: false,
    enableAiFeatures: true,
    betaFeatures: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    cacheTimeout: 15,
    apiRateLimit: 100,
    adminApiRateLimit: 500,
    maxFileSize: 5,
    logRetentionDays: 30,
    backupFrequency: 1,
    maxResultsPerPage: 50,
  });

  // Fetch system config from API
  const { data: config, isLoading } = useQuery({
    queryKey: ['/api/admin/config'],
    queryFn: async () => {
      return await apiRequest<SystemConfig[]>('/api/admin/config');
    },
    onSuccess: (data) => {
      // Parse config values and set appropriate state
      data.forEach((item) => {
        if (item.key.startsWith("security.")) {
          const settingKey = item.key.replace("security.", "");
          setSecuritySettings(prev => ({
            ...prev,
            [settingKey]: item.value
          }));
        } else if (item.key.startsWith("notification.")) {
          const settingKey = item.key.replace("notification.", "");
          setNotificationSettings(prev => ({
            ...prev,
            [settingKey]: item.value
          }));
        } else if (item.key.startsWith("feature.")) {
          const settingKey = item.key.replace("feature.", "");
          setFeatureSettings(prev => ({
            ...prev,
            [settingKey]: item.value
          }));
        } else if (item.key.startsWith("system.")) {
          const settingKey = item.key.replace("system.", "");
          setSystemSettings(prev => ({
            ...prev,
            [settingKey]: item.value
          }));
        }
      });
    }
  });

  // Update system config mutation
  const updateConfig = useMutation({
    mutationFn: async (configData: Record<string, any>) => {
      return await apiRequest('/api/admin/config', {
        method: 'PATCH',
        body: JSON.stringify(configData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully",
      });
      setIsConfigModified(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive"
      });
    }
  });

  const saveSettings = () => {
    // Combine all settings into one object with proper keys
    const configData: Record<string, any> = {};
    
    // Security settings
    Object.entries(securitySettings).forEach(([key, value]) => {
      configData[`security.${key}`] = value;
    });
    
    // Notification settings
    Object.entries(notificationSettings).forEach(([key, value]) => {
      configData[`notification.${key}`] = value;
    });
    
    // Feature settings
    Object.entries(featureSettings).forEach(([key, value]) => {
      configData[`feature.${key}`] = value;
    });
    
    // System settings
    Object.entries(systemSettings).forEach(([key, value]) => {
      configData[`system.${key}`] = value;
    });
    
    updateConfig.mutate(configData);
  };

  const handleSecurityChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    setIsConfigModified(true);
  };

  const handleNotificationChange = (key: string, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    setIsConfigModified(true);
  };

  const handleFeatureChange = (key: string, value: any) => {
    setFeatureSettings(prev => ({ ...prev, [key]: value }));
    setIsConfigModified(true);
  };

  const handleSystemChange = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    setIsConfigModified(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure platform behavior, security, and features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span>Features</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>System</span>
            </TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading settings...</span>
            </div>
          ) : (
            <>
              {/* Security Settings */}
              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                      <span className="text-sm font-medium">{securitySettings.passwordMinLength} characters</span>
                    </div>
                    <Slider
                      id="passwordMinLength"
                      min={4}
                      max={20}
                      step={1}
                      value={[securitySettings.passwordMinLength]}
                      onValueChange={([value]) => handleSecurityChange("passwordMinLength", value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="sessionTimeout">Session Timeout</Label>
                      <span className="text-sm font-medium">{securitySettings.sessionTimeout} minutes</span>
                    </div>
                    <Slider
                      id="sessionTimeout"
                      min={15}
                      max={240}
                      step={15}
                      value={[securitySettings.sessionTimeout]}
                      onValueChange={([value]) => handleSecurityChange("sessionTimeout", value)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                      <span className="text-sm font-medium">{securitySettings.maxLoginAttempts} attempts</span>
                    </div>
                    <Slider
                      id="maxLoginAttempts"
                      min={3}
                      max={10}
                      step={1}
                      value={[securitySettings.maxLoginAttempts]}
                      onValueChange={([value]) => handleSecurityChange("maxLoginAttempts", value)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireSpecialChars"
                      checked={securitySettings.requireSpecialChars}
                      onCheckedChange={(checked) => handleSecurityChange("requireSpecialChars", checked)}
                    />
                    <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireUppercase"
                      checked={securitySettings.requireUppercase}
                      onCheckedChange={(checked) => handleSecurityChange("requireUppercase", checked)}
                    />
                    <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireNumbers"
                      checked={securitySettings.requireNumbers}
                      onCheckedChange={(checked) => handleSecurityChange("requireNumbers", checked)}
                    />
                    <Label htmlFor="requireNumbers">Require Numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableCaptcha"
                      checked={securitySettings.enableCaptcha}
                      onCheckedChange={(checked) => handleSecurityChange("enableCaptcha", checked)}
                    />
                    <Label htmlFor="enableCaptcha">Enable CAPTCHA on Login</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="twoFactorDefault"
                      checked={securitySettings.twoFactorDefault}
                      onCheckedChange={(checked) => handleSecurityChange("twoFactorDefault", checked)}
                    />
                    <Label htmlFor="twoFactorDefault">Enable 2FA by Default</Label>
                  </div>
                </div>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableEmailNotifications"
                      checked={notificationSettings.enableEmailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange("enableEmailNotifications", checked)}
                    />
                    <Label htmlFor="enableEmailNotifications">Enable Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="loginAlerts"
                      checked={notificationSettings.loginAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("loginAlerts", checked)}
                    />
                    <Label htmlFor="loginAlerts">Login Attempt Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="securityAlerts"
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("securityAlerts", checked)}
                    />
                    <Label htmlFor="securityAlerts">Security Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="priceAlerts"
                      checked={notificationSettings.priceAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("priceAlerts", checked)}
                    />
                    <Label htmlFor="priceAlerts">Price Change Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transactionAlerts"
                      checked={notificationSettings.transactionAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("transactionAlerts", checked)}
                    />
                    <Label htmlFor="transactionAlerts">Transaction Alerts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
                    />
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="adminAlerts"
                      checked={notificationSettings.adminAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("adminAlerts", checked)}
                    />
                    <Label htmlFor="adminAlerts">Admin Notifications</Label>
                  </div>
                </div>
              </TabsContent>
              
              {/* Feature Settings */}
              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableRegistration"
                      checked={featureSettings.enableRegistration}
                      onCheckedChange={(checked) => handleFeatureChange("enableRegistration", checked)}
                    />
                    <Label htmlFor="enableRegistration">Enable User Registration</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableTokenGeneration"
                      checked={featureSettings.enableTokenGeneration}
                      onCheckedChange={(checked) => handleFeatureChange("enableTokenGeneration", checked)}
                    />
                    <Label htmlFor="enableTokenGeneration">Enable Token Generation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableTokenConversion"
                      checked={featureSettings.enableTokenConversion}
                      onCheckedChange={(checked) => handleFeatureChange("enableTokenConversion", checked)}
                    />
                    <Label htmlFor="enableTokenConversion">Enable Token Conversion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableTokenTransfer"
                      checked={featureSettings.enableTokenTransfer}
                      onCheckedChange={(checked) => handleFeatureChange("enableTokenTransfer", checked)}
                    />
                    <Label htmlFor="enableTokenTransfer">Enable Token Transfer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableApiAccess"
                      checked={featureSettings.enableApiAccess}
                      onCheckedChange={(checked) => handleFeatureChange("enableApiAccess", checked)}
                    />
                    <Label htmlFor="enableApiAccess">Enable API Access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableAiFeatures"
                      checked={featureSettings.enableAiFeatures}
                      onCheckedChange={(checked) => handleFeatureChange("enableAiFeatures", checked)}
                    />
                    <Label htmlFor="enableAiFeatures">Enable AI Features</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="betaFeatures"
                      checked={featureSettings.betaFeatures}
                      onCheckedChange={(checked) => handleFeatureChange("betaFeatures", checked)}
                    />
                    <Label htmlFor="betaFeatures">Enable Beta Features</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={featureSettings.maintenanceMode}
                      onCheckedChange={(checked) => handleFeatureChange("maintenanceMode", checked)}
                    />
                    <Label htmlFor="maintenanceMode" className="text-destructive font-medium">
                      Maintenance Mode
                    </Label>
                  </div>
                </div>
                
                {featureSettings.maintenanceMode && (
                  <Card className="border-destructive">
                    <CardContent className="p-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-destructive" />
                      <p className="text-sm">
                        Maintenance mode will prevent all non-admin users from accessing the system.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* System Settings */}
              <TabsContent value="system" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="cacheTimeout">Cache Timeout</Label>
                      <span className="text-sm font-medium">{systemSettings.cacheTimeout} minutes</span>
                    </div>
                    <Slider
                      id="cacheTimeout"
                      min={5}
                      max={60}
                      step={5}
                      value={[systemSettings.cacheTimeout]}
                      onValueChange={([value]) => handleSystemChange("cacheTimeout", value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="apiRateLimit">API Rate Limit</Label>
                      <span className="text-sm font-medium">{systemSettings.apiRateLimit} req/min</span>
                    </div>
                    <Slider
                      id="apiRateLimit"
                      min={30}
                      max={500}
                      step={10}
                      value={[systemSettings.apiRateLimit]}
                      onValueChange={([value]) => handleSystemChange("apiRateLimit", value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="adminApiRateLimit">Admin API Rate Limit</Label>
                      <span className="text-sm font-medium">{systemSettings.adminApiRateLimit} req/min</span>
                    </div>
                    <Slider
                      id="adminApiRateLimit"
                      min={100}
                      max={1000}
                      step={50}
                      value={[systemSettings.adminApiRateLimit]}
                      onValueChange={([value]) => handleSystemChange("adminApiRateLimit", value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="maxFileSize">Max File Upload Size</Label>
                      <span className="text-sm font-medium">{systemSettings.maxFileSize} MB</span>
                    </div>
                    <Slider
                      id="maxFileSize"
                      min={1}
                      max={20}
                      step={1}
                      value={[systemSettings.maxFileSize]}
                      onValueChange={([value]) => handleSystemChange("maxFileSize", value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="logRetentionDays">Log Retention Period</Label>
                      <span className="text-sm font-medium">{systemSettings.logRetentionDays} days</span>
                    </div>
                    <Slider
                      id="logRetentionDays"
                      min={7}
                      max={365}
                      step={7}
                      value={[systemSettings.logRetentionDays]}
                      onValueChange={([value]) => handleSystemChange("logRetentionDays", value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <span className="text-sm font-medium">{systemSettings.backupFrequency} days</span>
                    </div>
                    <Slider
                      id="backupFrequency"
                      min={1}
                      max={14}
                      step={1}
                      value={[systemSettings.backupFrequency]}
                      onValueChange={([value]) => handleSystemChange("backupFrequency", value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="maxResultsPerPage">Results Per Page</Label>
                      <span className="text-sm font-medium">{systemSettings.maxResultsPerPage} items</span>
                    </div>
                    <Slider
                      id="maxResultsPerPage"
                      min={10}
                      max={100}
                      step={10}
                      value={[systemSettings.maxResultsPerPage]}
                      onValueChange={([value]) => handleSystemChange("maxResultsPerPage", value)}
                    />
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={updateConfig.isPending || !isConfigModified}
        >
          {updateConfig.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}