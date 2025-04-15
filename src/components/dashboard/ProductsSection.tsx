import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GumroadProduct } from "@/types/gumroad.types";
import ProductCard from "./ProductCard";

interface ProductsSectionProps {
  products: GumroadProduct[];
  isLoading: boolean;
  migratingProducts: string[];
  completedProducts: string[];
  onMigrate: (product: GumroadProduct) => void;
  onMigrateAll: () => void;
  webhookReady: boolean;
}

const ProductsSection = ({
  products,
  isLoading,
  migratingProducts,
  completedProducts,
  onMigrate,
  onMigrateAll,
  webhookReady
}: ProductsSectionProps) => {
  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold">Your Gumroad Products</h2>
        <Button 
          onClick={onMigrateAll}
          disabled={products.length === 0 || !webhookReady}
          className="mt-2 sm:mt-0 bg-cta-gradient hover:opacity-90"
        >
          Migrate All Products
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-coral border-r-transparent"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-coolGray">No products found in your Gumroad account.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              status={
                completedProducts.includes(product.id)
                  ? "completed"
                  : migratingProducts.includes(product.id)
                  ? "migrating"
                  : "pending"
              }
              onMigrate={() => onMigrate(product)}
              webhookReady={webhookReady}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
