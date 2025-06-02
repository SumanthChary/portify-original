
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GumroadProduct } from "@/services/GumroadService";

interface MigrationControlsProps {
  products: GumroadProduct[];
  migratingProducts: string[];
  completedProducts: string[];
  isWebhookTested: boolean;
  onMigrateAll: () => void;
}

const MigrationControls = ({ 
  products, 
  migratingProducts, 
  completedProducts, 
  isWebhookTested, 
  onMigrateAll 
}: MigrationControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <h2 className="text-xl font-semibold">Your Gumroad Products</h2>
      <Button 
        onClick={onMigrateAll}
        disabled={products.length === 0 || !isWebhookTested}
        className="mt-2 sm:mt-0 bg-cta-gradient hover:opacity-90"
      >
        Migrate All Products
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};

export default MigrationControls;
