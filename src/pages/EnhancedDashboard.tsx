
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EnhancedMigrationDashboard } from "@/components/migration/EnhancedMigrationDashboard";
import N8nSetupGuide from "@/components/setup/N8nSetupGuide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Settings } from "lucide-react";

const EnhancedDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Hero Section */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-redAccent shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-darktext mb-4">
              Enhanced Migration Center
            </h1>
            <p className="text-lg lg:text-xl text-coolGray max-w-3xl mx-auto">
              Advanced tools and automation workflows for seamless product migration between platforms.
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white shadow-lg border border-gray-100">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-coral data-[state=active]:text-white flex items-center space-x-2"
              >
                <Zap className="h-4 w-4" />
                <span>Migration Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="setup"
                className="data-[state=active]:bg-coral data-[state=active]:text-white flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Setup Guide</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-0">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <EnhancedMigrationDashboard />
              </div>
            </TabsContent>
            
            <TabsContent value="setup" className="mt-0">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <N8nSetupGuide />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedDashboard;
