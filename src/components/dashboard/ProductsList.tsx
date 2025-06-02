
import { GumroadProduct } from "@/services/GumroadService";
import ProductCard from "./ProductCard";

interface ProductsListProps {
  products: GumroadProduct[];
  isLoading: boolean;
  migratingProducts: string[];
  completedProducts: string[];
  isWebhookTested: boolean;
  onMigrate: (productId: string) => void;
}

const ProductsList = ({
  products,
  isLoading,
  migratingProducts,
  completedProducts,
  isWebhookTested,
  onMigrate
}: ProductsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-coral border-r-transparent"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-lg text-coolGray">No products found in your Gumroad account.</p>
      </div>
    );
  }

  return (
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
          onMigrate={() => onMigrate(product.id)}
          webhookReady={isWebhookTested}
        />
      ))}
    </div>
  );
};

export default ProductsList;
