
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProductsData } from "@/hooks/useProductsData";
import { ProductsGrid } from "./ProductsGrid";
import { ProductsHeader } from "./ProductsHeader";
import { ProductsLoading } from "./ProductsLoading";
import { ProductsError } from "./ProductsError";
import { ProductsEmpty } from "./ProductsEmpty";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductForm } from "./ProductForm";

interface ProductManagerProps {
  showAddButton?: boolean;
  displayMode?: 'grid' | 'table';
  title?: string;
}

export const ProductManager = ({ 
  showAddButton = true, 
  displayMode: initialDisplayMode = 'grid',
  title = "Products"
}: ProductManagerProps) => {
  const { user } = useAuth();
  const { products, loading, error, refreshProducts, addProduct } = useProductsData({
    userEmail: user?.email
  });
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>(initialDisplayMode);
  const [showProductForm, setShowProductForm] = useState(false);

  const handleAddProduct = async (productData: any) => {
    try {
      await addProduct({
        ...productData,
        user_email: user?.email || 'unknown@email.com',
        status: 'pending',
        created_at: new Date().toISOString()
      });
      setShowProductForm(false);
      refreshProducts();
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  if (loading) {
    return <ProductsLoading />;
  }

  if (error) {
    return <ProductsError error={error} refreshProducts={refreshProducts} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <ProductsHeader
          productCount={products.length}
          refreshProducts={refreshProducts}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
          title={title}
        />
        
        {showAddButton && (
          <Button 
            onClick={() => setShowProductForm(true)}
            className="bg-coral hover:bg-coral/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {showProductForm && (
        <ProductForm
          onSubmit={handleAddProduct}
          onCancel={() => setShowProductForm(false)}
        />
      )}

      {products.length === 0 ? (
        <ProductsEmpty refreshProducts={refreshProducts} />
      ) : (
        <ProductsGrid 
          products={products} 
          onProductUpdated={refreshProducts}
          displayMode={displayMode}
        />
      )}
    </div>
  );
};
