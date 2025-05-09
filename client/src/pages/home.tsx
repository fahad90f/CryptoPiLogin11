import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Clock, RefreshCcw, Link2, BarChart3, Wallet, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, navigate] = useLocation();
  
  return (
    <>
      <Helmet>
        <title>CryptoPilot - Advanced AI-Powered Cryptocurrency Platform</title>
        <meta name="description" content="Flash and test the top 500 cryptocurrencies with our advanced AI-powered platform. Secure, fast, and built for fintech applications." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-[#070714]">
        {/* Header */}
        <header className="w-full py-4 px-6 flex justify-between items-center">
          <div className="text-[#6366F1] font-bold text-2xl">CryptoPilot</div>
          <div className="flex gap-4">
            <Link href="/register">
              <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                Register
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row px-6 lg:px-20 py-16 lg:py-24 items-center justify-between">
          <div className="lg:w-1/2 space-y-6 max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">
              Pilot Your <span className="text-[#6366F1]">Crypto</span> Through The Financial Universe
            </h1>
            <p className="text-gray-300 text-lg">
              Flash and test the top 500 cryptocurrencies with our advanced AI-powered platform. Secure, fast, and built for fintech applications.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-6"
                onClick={() => navigate("/register")}
              >
                Start Flashing
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-700 text-white hover:bg-gray-800 px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center">
            <div className="bg-[#2D2A66] p-10 rounded-xl w-full max-w-sm flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[#3D3A76] flex items-center justify-center mb-4">
                <Clock className="text-[#77E9EC] h-12 w-12" />
              </div>
              <div className="text-center">
                <h3 className="text-white text-2xl font-bold">USDT</h3>
                <p className="text-[#77E9EC] font-bold">$1.00</p>
                <p className="text-gray-400 mt-4">Ready for Testing</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-6 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">
              <span className="text-[#6366F1]">AI-Powered</span> <span className="text-white">Flash Cryptocurrency Platform</span>
            </h2>
            <p className="text-gray-300 mt-4 max-w-3xl mx-auto">
              Experience the next generation of cryptocurrency testing with the highest level of security and functionality.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#181830] p-8 rounded-xl border border-[#2D2A66]">
              <div className="w-12 h-12 rounded-full bg-[#2D2A66] flex items-center justify-center mb-6">
                <RefreshCcw className="text-[#77E9EC] h-6 w-6" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Generate Tokens</h3>
              <p className="text-gray-400">
                Generate flash tokens for the top 500 cryptocurrencies that adhere to their specific blockchain standards.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#181830] p-8 rounded-xl border border-[#2D2A66]">
              <div className="w-12 h-12 rounded-full bg-[#2D2A66] flex items-center justify-center mb-6">
                <RefreshCcw className="text-[#77E9EC] h-6 w-6" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Convert Seamlessly</h3>
              <p className="text-gray-400">
                Convert flash tokens to real cryptocurrencies with secure and transparent smart contracts at real-time market rates.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-[#181830] p-8 rounded-xl border border-[#2D2A66]">
              <div className="w-12 h-12 rounded-full bg-[#2D2A66] flex items-center justify-center mb-6">
                <Link2 className="text-[#77E9EC] h-6 w-6" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Transfer Securely</h3>
              <p className="text-gray-400">
                Transfer tokens to any wallet with secure, fast, and cost-effective transactions with complete tracking history.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-[#181830] p-8 rounded-xl border border-[#2D2A66]">
              <div className="w-12 h-12 rounded-full bg-[#2D2A66] flex items-center justify-center mb-6">
                <BarChart3 className="text-[#77E9EC] h-6 w-6" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Track Analytics</h3>
              <p className="text-gray-400">
                Powerful analytics dashboard to track campaigns and tokens with real-time updates on balances and transaction status.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-[#181830] p-8 rounded-xl border border-[#2D2A66]">
              <div className="w-12 h-12 rounded-full bg-[#2D2A66] flex items-center justify-center mb-6">
                <Wallet className="text-[#77E9EC] h-6 w-6" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Wallet Integration</h3>
              <p className="text-gray-400">
                Integrate with popular cryptocurrency wallets like MetaMask and Trust Wallet to view balances and history.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-[#181830] p-8 rounded-xl border border-[#2D2A66]">
              <div className="w-12 h-12 rounded-full bg-[#2D2A66] flex items-center justify-center mb-6">
                <Shield className="text-[#77E9EC] h-6 w-6" />
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">AI Security</h3>
              <p className="text-gray-400">
                DeepSeek's AI infrastructure ensures the highest level of security for all transactions and conversions.
              </p>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-6 lg:px-20">
          <div className="bg-[#2D2A66] rounded-xl p-12 text-center">
            <h2 className="text-white text-3xl font-bold mb-4">Ready to Become a Crypto Test Pilot?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Take control of your fintech testing with CryptoPilot's advanced cryptocurrency flashing platform.
            </p>
            <Button 
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-6 text-lg"
              onClick={() => navigate("/register")}
            >
              Launch CryptoPilot
            </Button>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8 px-6 lg:px-20 mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-[#6366F1] font-bold text-xl">CryptoPilot</div>
              <p className="text-gray-500 text-sm mt-1">© 2025 CryptoPilot. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}