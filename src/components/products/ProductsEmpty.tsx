
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ProductsEmptyProps {
  refreshProducts: () => void;
}

export const ProductsEmpty = ({ refreshProducts }: ProductsEmptyProps) => {
  const handleRefresh = () => {
    refreshProducts();
    toast({
      title: "Refreshing products",
      description: "Checking for new products in the database."
    });
  };

  return (
    <div className="text-center p-8 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">No products found</h2>
      <p className="text-muted-foreground mb-4">No products are available in the database</p>
      <Button onClick={handleRefresh}>Refresh</Button>
    </div>
  );
};
