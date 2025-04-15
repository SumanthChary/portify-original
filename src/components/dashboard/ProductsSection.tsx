
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Info } from "lucide-react";
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
  const pendingProducts = products.filter(
    product => !migratingProducts.includes(product.id) && !completedProducts.includes(product.id)
  );
  
  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold">Your Gumroad Products</h2>
        <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
          {!webhookReady && (
            <div className="text-sm text-amber-600 flex items-center mr-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              Connect n8n webhook first
            </div>
          )}
          <Button 
            onClick={onMigrateAll}
            disabled={pendingProducts.length === 0 || !webhookReady}
            className="bg-cta-gradient hover:opacity-90"
          >
            Migrate All Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
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
        <>
          {/* Migration status summary */}
          {products.length > 0 && (
            <div className="flex mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-coolGray">Total Products</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-mint">{migratingProducts.length}</div>
                <div className="text-sm text-coolGray">Migrating</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-lushGreen">{completedProducts.length}</div>
                <div className="text-sm text-coolGray">Completed</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-coral">{pendingProducts.length}</div>
                <div className="text-sm text-coolGray">Pending</div>
              </div>
            </div>
          )}
          
          {!webhookReady && products.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center text-amber-700">
              <Info className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">
                Before migrating products, set up and test your n8n webhook connection above. 
                This ensures the migration data has somewhere to go.
              </p>
            </div>
          )}
          
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
        </>
      )}
    </div>
  );
};

export default ProductsSection;
