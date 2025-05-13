
import { useNavigate } from "react-router-dom";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { type Product } from "@/hooks/useProductsData";

interface ProductsGridProps {
  products: Product[];
  isPreviewMode?: boolean;
  onProductUpdated?: () => void;
}

export const ProductsGrid = ({ products, isPreviewMode = false, onProductUpdated }: ProductsGridProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            showDetailsButton={!isPreviewMode}
            onTransferSuccess={onProductUpdated}
          />
        ))}
      </div>
      {isPreviewMode && (
        <div className="mt-8">
          <Button onClick={() => navigate('/products')}>Back to All Products</Button>
        </div>
      )}
    </>
  );
};
