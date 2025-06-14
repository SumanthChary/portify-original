
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MigrationDashboard from "@/components/dashboard/MigrationDashboard";
import { ProductManager } from "@/components/products/ProductManager";
import { toast } from "sonner";
import gumroadService from "@/services/GumroadService";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { user } = useAuth();
  const [isGumroadConnected, setIsGumroadConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Test Gumroad connection by trying to fetch products
    const testGumroadConnection = async () => {
      try {
        await gumroadService.getProducts();
        setIsGumroadConnected(true);
      } catch (error) {
        console.log('Gumroad connection test failed:', error);
        setIsGumroadConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    testGumroadConnection();
  }, []);

  const handleTestConnection = async () => {
    setIsLoading(true);
    toast.loading("Testing Gumroad connection...");
    
    try {
      await gumroadService.getProducts();
      setIsGumroadConnected(true);
      toast.success("Successfully connected to Gumroad!");
    } catch (error) {
      setIsGumroadConnected(false);
      toast.error("Failed to connect to Gumroad. Please check your API configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-offwhite">
        <div className="section-container py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-coolGray">
              Welcome, {user?.email}! Manage your product migrations here.
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="section-container flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-coral border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
              <p className="text-lg text-coolGray">Testing Gumroad connection...</p>
            </div>
          </div>
        ) : (
          <div className="section-container">
            <Tabs defaultValue="products" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="products">My Products</TabsTrigger>
                <TabsTrigger value="migration" disabled={!isGumroadConnected}>
                  {isGumroadConnected ? 'Gumroad Migration' : 'Connect Gumroad First'}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="products">
                <ProductManager 
                  title="My Products"
                  showAddButton={true}
                />
              </TabsContent>
              
              <TabsContent value="migration">
                {isGumroadConnected ? (
                  <MigrationDashboard />
                ) : (
                  <div className="text-center py-16">
                    <h1 className="text-3xl md:text-4xl font-bold mb-6">Gumroad API Connection</h1>
                    <p className="text-lg text-coolGray max-w-2xl mx-auto mb-8">
                      To start migrating your products, we need to connect to your Gumroad account using the configured API key.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> The Gumroad API key is already configured in the service. 
                        Click the button below to test the connection.
                      </p>
                    </div>
                    <button 
                      onClick={handleTestConnection}
                      disabled={isLoading}
                      className="bg-cta-gradient text-white px-6 py-3 rounded-md hover:opacity-90 font-medium inline-flex items-center disabled:opacity-50"
                    >
                      {isLoading ? 'Testing...' : 'Test Gumroad Connection'}
                    </button>
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
