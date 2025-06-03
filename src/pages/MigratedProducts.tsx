
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { ProductsTable } from "@/components/products/ProductsTable";
import { ProductsHeader } from "@/components/products/ProductsHeader";
import { ProductsLoading } from "@/components/products/ProductsLoading";
import { ProductsError } from "@/components/products/ProductsError";
import { ProductsEmpty } from "@/components/products/ProductsEmpty";
import { useProductsData } from "@/hooks/useProductsData";

const MigratedProducts = () => {
  const { products, loading, error, refreshProducts } = useProductsData();
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-coral to-mint bg-clip-text text-transparent">All Products</h1>
          <ProductsLoading />
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <ProductsError error={error} refreshProducts={refreshProducts} />
        </main>
        <Footer />
      </div>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-coral to-mint bg-clip-text text-transparent">Products (0)</h1>
            <Button onClick={refreshProducts} className="bg-coral hover:bg-coral/90">Refresh</Button>
          </div>
          <ProductsEmpty refreshProducts={refreshProducts} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ProductsHeader
          productCount={products.length}
          refreshProducts={refreshProducts}
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
        />

        {displayMode === 'grid' ? (
          <ProductsGrid products={products} onProductUpdated={refreshProducts} />
        ) : (
          <ProductsTable products={products} onProductUpdated={refreshProducts} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MigratedProducts;
