import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Rocket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for instructions to reset your password."
      });
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Forgot Password | CryptoPilot</title>
        <meta name="description" content="Reset your CryptoPilot account password to regain access to your cryptocurrency management tools." />
      </Helmet>
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-background to-card">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <Rocket className="text-accent-foreground h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold font-space">CryptoPilot</h1>
            <p className="text-muted-foreground mt-2">Reset your password</p>
          </div>
          
          <Card className="border border-muted/30">
            <CardHeader>
              <CardTitle className="text-xl">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address to receive password reset instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isSuccess ? (
                <div className="space-y-4">
                  <Alert className="mb-4 border-green-600/20 text-green-600 bg-green-600/10">
                    <AlertDescription>
                      We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center mt-4">
                    <Link href="/login">
                      <Button variant="link" className="font-medium">
                        Return to login
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted/40 border border-muted/60"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href="/login" className="flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-3 w-3" />
                Back to login
              </Link>
            </CardFooter>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2023 CryptoPilot. All rights reserved.</p>
            <p className="mt-1">Secured by DeepSeek AI Technology</p>
          </div>
        </div>
      </div>
    </>
  );
}