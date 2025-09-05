
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MigrationDashboard from "@/components/dashboard/MigrationDashboard";
import { ProductManager } from "@/components/products/ProductManager";
import { toast } from "sonner";
import gumroadService from "@/services/GumroadService";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [isGumroadConnected, setIsGumroadConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Connection testing is now done through the SimpleMigration flow
    // with user-provided API keys
    setIsLoading(false);
  }, []);

  const handleTestConnection = async () => {
    setIsLoading(true);
    toast.info("Please use the Simple Migration page to test your Gumroad connection with your API key");
    
    try {
      // Redirect users to the simple migration flow for proper connection testing
      setIsGumroadConnected(false);
      toast.info("Use the Simple Migration flow to connect with your Gumroad API key");
    } catch (error) {
      setIsGumroadConnected(false);
      toast.error("Please provide your Gumroad API key in the Simple Migration flow");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Hero Section */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-darktext mb-4">
              Your Migration Dashboard
            </h1>
            <p className="text-lg lg:text-xl text-coolGray max-w-3xl mx-auto">
              Welcome back, {user?.email}! Manage your product migrations and monitor your progress.
            </p>
          </div>

          {/* Connection Status Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 text-coral animate-spin" />
                ) : isGumroadConnected ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                )}
                <div>
                  <h3 className="font-semibold text-darktext">
                    {isLoading ? "Testing Connection..." : isGumroadConnected ? "Gumroad Connected" : "Connection Required"}
                  </h3>
                  <p className="text-sm text-coolGray">
                    {isLoading ? "Verifying your Gumroad API connection" : isGumroadConnected ? "Your Gumroad account is successfully connected" : "Connect to Gumroad to start migrating"}
                  </p>
                </div>
              </div>
              {!isLoading && !isGumroadConnected && (
                <button 
                  onClick={handleTestConnection}
                  disabled={isLoading}
                  className="bg-cta-gradient text-white px-6 py-2 rounded-lg hover:opacity-90 font-medium transition-all disabled:opacity-50"
                >
                  Test Connection
                </button>
              )}
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-coral animate-spin mx-auto mb-4" />
                <p className="text-lg text-coolGray">Testing Gumroad connection...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-sm">
                <TabsTrigger value="products" className="data-[state=active]:bg-coral data-[state=active]:text-white">
                  My Products
                </TabsTrigger>
                <TabsTrigger 
                  value="migration" 
                  disabled={!isGumroadConnected}
                  className="data-[state=active]:bg-coral data-[state=active]:text-white disabled:opacity-50"
                >
                  {isGumroadConnected ? 'Gumroad Migration' : 'Connect Gumroad First'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="products" className="mt-0">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <ProductManager 
                    title="My Products"
                    showAddButton={true}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="migration" className="mt-0">
                {isGumroadConnected ? (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <MigrationDashboard />
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 lg:p-12">
                    <div className="text-center max-w-2xl mx-auto">
                      <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
                      <h2 className="text-2xl lg:text-3xl font-bold text-darktext mb-4">
                        Gumroad API Connection Required
                      </h2>
                      <p className="text-lg text-coolGray mb-8">
                        To start migrating your products, we need to connect to your Gumroad account using the configured API key.
                      </p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> The Gumroad API key is already configured in the service. 
                          Click the button below to test the connection.
                        </p>
                      </div>
                      <button 
                        onClick={handleTestConnection}
                        disabled={isLoading}
                        className="bg-cta-gradient text-white px-8 py-3 rounded-lg hover:opacity-90 font-medium inline-flex items-center disabled:opacity-50 shadow-lg transition-all"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          'Test Gumroad Connection'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
