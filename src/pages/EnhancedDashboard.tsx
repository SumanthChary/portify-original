
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { EnhancedMigrationDashboard } from "@/components/migration/EnhancedMigrationDashboard";

const EnhancedDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <EnhancedMigrationDashboard />
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedDashboard;
