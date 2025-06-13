
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EnhancedMigrationDashboard } from "@/components/migration/EnhancedMigrationDashboard";
import N8nSetupGuide from "@/components/setup/N8nSetupGuide";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EnhancedDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Migration Dashboard</TabsTrigger>
            <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <EnhancedMigrationDashboard />
          </TabsContent>
          
          <TabsContent value="setup">
            <N8nSetupGuide />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedDashboard;
