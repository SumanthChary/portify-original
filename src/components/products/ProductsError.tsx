
import { Button } from "@/components/ui/button";

interface ProductsErrorProps {
  error: string;
  refreshProducts: () => void;
}

export const ProductsError = ({ error, refreshProducts }: ProductsErrorProps) => {
  return (
    <div className="text-center p-8 border rounded-lg bg-red-50">
      <h2 className="text-xl font-semibold mb-2 text-red-600">Error Loading Products</h2>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={refreshProducts}>Try Again</Button>
    </div>
  );
};
