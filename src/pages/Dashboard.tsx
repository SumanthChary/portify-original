
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MigrationDashboard from "@/components/dashboard/MigrationDashboard";
import { toast } from "sonner";
import gumroadService from "@/services/GumroadService";

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is authenticated with Gumroad
    const authenticated = gumroadService.isAuthenticated();
    
    // For demo purposes, we'll auto-authenticate if not authenticated
    if (!authenticated) {
      toast.success("Demo mode: Auto-connecting to Gumroad for preview");
      gumroadService.simulateAuth();
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }
    
    setIsAuthenticated(authenticated);
    setIsLoading(false);
    
    // Check if this is a redirect from OAuth flow
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      setIsLoading(true);
      toast.loading("Connecting to Gumroad...");
      
      gumroadService.handleAuthCallback(code).then((success) => {
        setIsAuthenticated(success);
        setIsLoading(false);
        
        if (success) {
          toast.success("Successfully connected to Gumroad!");
        } else {
          toast.error("Failed to connect to Gumroad. Please try again.");
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow bg-offwhite">
        {isLoading ? (
          <div className="section-container flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-coral border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
              <p className="text-lg text-coolGray">Loading...</p>
            </div>
          </div>
        ) : isAuthenticated ? (
          <MigrationDashboard />
        ) : (
          <div className="section-container text-center py-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Connect Your Gumroad Account</h1>
            <p className="text-lg text-coolGray max-w-2xl mx-auto mb-8">
              To start migrating your products, you'll need to connect your Gumroad account first.
            </p>
            <button 
              onClick={() => gumroadService.startOAuthFlow()}
              className="bg-cta-gradient text-white px-6 py-3 rounded-md hover:opacity-90 font-medium inline-flex items-center"
            >
              Connect with Gumroad
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
