import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Bell, 
  Shield, 
  Key, 
  Wallet, 
  Globe, 
  Moon, 
  Eye, 
  EyeOff,
  Save,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({
    transactionAlerts: true,
    priceAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
    newsUpdates: true
  });
  
  // Get user's initials for avatar
  const getInitials = () => {
    if (!user) return "?";
    
    if (user.displayName) {
      return user.displayName.split(" ")
        .map(name => name[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    
    return user.username.substring(0, 2).toUpperCase();
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Settings | CryptoPilot</title>
        <meta name="description" content="Configure your CryptoPilot account settings. Manage security, notifications, API access, and preferences for cryptocurrency flash token operations." />
      </Helmet>
      
      <div className="min-h-screen bg-[#070714] text-white">
        {/* Header Navigation */}
        <header className="border-b border-gray-800 flex items-center justify-between p-4">
          <div className="text-[#6366F1] font-bold text-2xl">CryptoPilot</div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</a>
            <a href="/generate" className="text-gray-400 hover:text-white">Generate</a>
            <a href="/convert" className="text-gray-400 hover:text-white">Convert</a>
            <a href="/transfer" className="text-gray-400 hover:text-white">Transfer</a>
            <a href="/settings" className="text-white font-medium">Settings</a>
          </nav>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 rounded-full bg-[#5355D8] flex items-center justify-center">
              <span className="font-medium text-sm">{getInitials()}</span>
            </div>
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-400 hover:text-white flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            )}
          </div>
        </header>
        
        <main className="p-6">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="bg-[#181830] border-[#2D2A66] mb-6 grid grid-cols-5 lg:w-[600px]">
                <TabsTrigger value="profile" className="data-[state=active]:bg-[#2D2A66]">
                  <User className="h-4 w-4 mr-2" /> Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-[#2D2A66]">
                  <Shield className="h-4 w-4 mr-2" /> Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-[#2D2A66]">
                  <Bell className="h-4 w-4 mr-2" /> Alerts
                </TabsTrigger>
                <TabsTrigger value="api" className="data-[state=active]:bg-[#2D2A66]">
                  <Key className="h-4 w-4 mr-2" /> API
                </TabsTrigger>
                <TabsTrigger value="preferences" className="data-[state=active]:bg-[#2D2A66]">
                  <Globe className="h-4 w-4 mr-2" /> Preferences
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card className="bg-[#181830] border-[#2D2A66]">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-bold mb-4">Profile Information</h2>
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="h-20 w-20 rounded-full bg-[#2D2A66] flex items-center justify-center text-2xl">
                        {getInitials()}
                      </div>
                      <Button className="bg-[#6366F1] hover:bg-[#5355D8] text-white">
                        Change Avatar
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          defaultValue={user?.displayName || ''} 
                          placeholder="Enter your display name"
                          className="bg-[#0F0F1A] border-[#2D2A66]" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          defaultValue={user?.username} 
                          className="bg-[#0F0F1A] border-[#2D2A66]"
                          disabled 
                        />
                        <p className="text-xs text-gray-400">Username cannot be changed</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          defaultValue={user?.email || ''} 
                          placeholder="Enter your email address"
                          className="bg-[#0F0F1A] border-[#2D2A66]" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          defaultValue={user?.phoneNumber || ''} 
                          placeholder="Enter your phone number"
                          className="bg-[#0F0F1A] border-[#2D2A66]" 
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                      <Button className="bg-[#6366F1] hover:bg-[#5355D8] text-white">
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Settings */}
              <TabsContent value="security">
                <Card className="bg-[#181830] border-[#2D2A66]">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-bold mb-4">Security Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" className="bg-[#0F0F1A] border-[#2D2A66]" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" className="bg-[#0F0F1A] border-[#2D2A66]" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" className="bg-[#0F0F1A] border-[#2D2A66]" />
                      </div>
                      
                      <div className="flex items-center justify-between pt-4">
                        <div className="space-y-0.5">
                          <div className="font-medium">Two-Factor Authentication</div>
                          <div className="text-sm text-gray-400">Add an extra layer of security to your account</div>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Login Notifications</div>
                          <div className="text-sm text-gray-400">Receive alerts for new login attempts</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button className="bg-[#6366F1] hover:bg-[#5355D8] text-white">
                          Update Security Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card className="bg-[#181830] border-[#2D2A66]">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Transaction Alerts</div>
                          <div className="text-sm text-gray-400">Receive notifications for transactions</div>
                        </div>
                        <Switch 
                          checked={notifications.transactionAlerts} 
                          onCheckedChange={(checked) => setNotifications({...notifications, transactionAlerts: checked})} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Price Alerts</div>
                          <div className="text-sm text-gray-400">Notifications when price thresholds are met</div>
                        </div>
                        <Switch 
                          checked={notifications.priceAlerts} 
                          onCheckedChange={(checked) => setNotifications({...notifications, priceAlerts: checked})} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Security Alerts</div>
                          <div className="text-sm text-gray-400">Notifications about security events</div>
                        </div>
                        <Switch 
                          checked={notifications.securityAlerts} 
                          onCheckedChange={(checked) => setNotifications({...notifications, securityAlerts: checked})} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Marketing Emails</div>
                          <div className="text-sm text-gray-400">Receive promotional emails from us</div>
                        </div>
                        <Switch 
                          checked={notifications.marketingEmails} 
                          onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">News & Updates</div>
                          <div className="text-sm text-gray-400">Stay informed about platform updates</div>
                        </div>
                        <Switch 
                          checked={notifications.newsUpdates} 
                          onCheckedChange={(checked) => setNotifications({...notifications, newsUpdates: checked})} 
                        />
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button className="bg-[#6366F1] hover:bg-[#5355D8] text-white">
                          Save Notification Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* API Settings */}
              <TabsContent value="api">
                <Card className="bg-[#181830] border-[#2D2A66]">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-bold mb-4">API Access</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="apiKey">API Key</Label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="h-6 text-[#6366F1]"
                          >
                            {showApiKey ? (
                              <><EyeOff className="h-3 w-3 mr-1" /> Hide</>
                            ) : (
                              <><Eye className="h-3 w-3 mr-1" /> Show</>
                            )}
                          </Button>
                        </div>
                        <div className="flex">
                          <Input 
                            id="apiKey" 
                            type={showApiKey ? "text" : "password"} 
                            defaultValue="sk_test_51Lz3MdCjWRTXXXXXXXXXXXXXX" 
                            className="bg-[#0F0F1A] border-[#2D2A66] rounded-r-none"
                            readOnly
                          />
                          <Button className="rounded-l-none bg-[#2D2A66]">Copy</Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Keep your API key secret. Don't share it in client-side code.
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <div className="font-medium mb-2">API Access Controls</div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Read-only access</div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Transaction access</div>
                            <Switch />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Webhook integrations</div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <Button className="bg-[#6366F1] hover:bg-[#5355D8] text-white">
                          Generate New Key
                        </Button>
                        <Button variant="outline" className="border-[#2D2A66] hover:bg-[#2D2A66]/50">
                          Revoke All Keys
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Preferences */}
              <TabsContent value="preferences">
                <Card className="bg-[#181830] border-[#2D2A66]">
                  <CardContent className="p-6 space-y-6">
                    <h2 className="text-xl font-bold mb-4">App Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Dark Mode</div>
                          <div className="text-sm text-gray-400">Use dark theme throughout the app</div>
                        </div>
                        <Switch 
                          checked={darkMode} 
                          onCheckedChange={setDarkMode} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Advanced Analytics</div>
                          <div className="text-sm text-gray-400">Show detailed analytics in dashboard</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Auto-Refresh Data</div>
                          <div className="text-sm text-gray-400">Automatically refresh market data</div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="pt-6">
                        <div className="font-medium mb-3">Default Currency</div>
                        <div className="grid grid-cols-4 gap-2">
                          {["USD", "EUR", "GBP", "JPY"].map((currency) => (
                            <div 
                              key={currency}
                              className={`
                                flex items-center justify-center p-2 rounded cursor-pointer
                                ${currency === "USD" 
                                  ? "bg-[#6366F1] text-white" 
                                  : "bg-[#0F0F1A] text-gray-400 hover:bg-[#2D2A66]/50"}
                              `}
                            >
                              {currency}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button className="bg-[#6366F1] hover:bg-[#5355D8] text-white">
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            © 2025 CryptoPilot. All rights reserved.
          </div>
        </main>
      </div>
    </>
  );
}
