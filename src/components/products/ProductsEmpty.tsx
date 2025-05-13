
import { Button } from "@/components/ui/button";

interface ProductsEmptyProps {
  refreshProducts: () => void;
}

export const ProductsEmpty = ({ refreshProducts }: ProductsEmptyProps) => {
  return (
    <div className="text-center p-8 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">No products found</h2>
      <p className="text-muted-foreground mb-4">Products will appear here after migration</p>
      <Button onClick={refreshProducts}>Refresh</Button>
    </div>
  );
};
