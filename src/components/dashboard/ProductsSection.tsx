
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, Info, RefreshCw } from "lucide-react";
import { GumroadProduct } from "@/types/gumroad.types";
import ProductCard from "./ProductCard";

interface ProductsSectionProps {
  products: GumroadProduct[];
  isLoading: boolean;
  migratingProducts: string[];
  completedProducts: string[];
  failedProducts?: string[];
  onMigrate: (product: GumroadProduct) => void;
  onMigrateAll: () => void;
  onResetStatus?: (productId: string) => void;
  webhookReady: boolean;
  retryCount?: Record<string, number>;
}

const ProductsSection = ({
  products,
  isLoading,
  migratingProducts,
  completedProducts,
  failedProducts = [],
  onMigrate,
  onMigrateAll,
  onResetStatus,
  webhookReady,
  retryCount = {}
}: ProductsSectionProps) => {
  const pendingProducts = products.filter(
    product => !migratingProducts.includes(product.id) && 
               !completedProducts.includes(product.id) &&
               !failedProducts.includes(product.id)
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
            <div className="flex flex-wrap mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 text-center min-w-[100px] mb-2 sm:mb-0">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-coolGray">Total Products</div>
              </div>
              <div className="flex-1 text-center min-w-[100px] mb-2 sm:mb-0">
                <div className="text-2xl font-bold text-amber-500">{migratingProducts.length}</div>
                <div className="text-sm text-coolGray">Migrating</div>
              </div>
              <div className="flex-1 text-center min-w-[100px] mb-2 sm:mb-0">
                <div className="text-2xl font-bold text-lushGreen">{completedProducts.length}</div>
                <div className="text-sm text-coolGray">Completed</div>
              </div>
              <div className="flex-1 text-center min-w-[100px] mb-2 sm:mb-0">
                <div className="text-2xl font-bold text-red-500">{failedProducts.length}</div>
                <div className="text-sm text-coolGray">Failed</div>
              </div>
              <div className="flex-1 text-center min-w-[100px]">
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
          
          {failedProducts.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                <h3 className="font-medium text-red-800">Migration Errors</h3>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Some products failed to migrate. This could be due to connection issues with n8n. 
                Make sure your n8n instance is running and the webhook is active.
              </p>
              <div className="flex flex-wrap gap-2">
                {products
                  .filter(product => failedProducts.includes(product.id))
                  .map(product => (
                    <div key={product.id} className="bg-white px-3 py-1 rounded border border-red-200 text-sm flex items-center">
                      {product.name}
                      {onResetStatus && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 h-6 w-6 p-0" 
                          onClick={() => onResetStatus(product.id)}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
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
                    : failedProducts.includes(product.id)
                    ? "failed"
                    : "pending"
                }
                onMigrate={() => onMigrate(product)}
                onReset={onResetStatus ? () => onResetStatus(product.id) : undefined}
                webhookReady={webhookReady}
                retryCount={retryCount[product.id] || 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsSection;
