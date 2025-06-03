
import { Button } from "@/components/ui/button";
import { ProductsDisplayToggle } from "@/components/products/ProductsDisplayToggle";
import { RefreshCw } from "lucide-react";

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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-coral to-mint bg-clip-text text-transparent">
          Products ({productCount})
        </h1>
        <p className="text-coolGray mt-1">
          Manage and migrate your digital products seamlessly
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={refreshProducts} variant="outline" className="border-coral text-coral hover:bg-coral hover:text-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <ProductsDisplayToggle 
          displayMode={displayMode} 
          setDisplayMode={setDisplayMode} 
        />
      </div>
    </div>
  );
};
