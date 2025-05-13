
import { Button } from "@/components/ui/button";
import { ProductsDisplayToggle } from "@/components/products/ProductsDisplayToggle";

interface ProductsHeaderProps {
  productCount: number;
  refreshProducts: () => void;
  displayMode: 'grid' | 'table';
  setDisplayMode: (mode: 'grid' | 'table') => void;
}

export const ProductsHeader = ({ 
  productCount, 
  refreshProducts, 
  displayMode, 
  setDisplayMode 
}: ProductsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Products ({productCount})</h1>
      <div className="flex gap-4">
        <Button onClick={refreshProducts}>Refresh</Button>
        <ProductsDisplayToggle 
          displayMode={displayMode} 
          setDisplayMode={setDisplayMode} 
        />
      </div>
    </div>
  );
};
