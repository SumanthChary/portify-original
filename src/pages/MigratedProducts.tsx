
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductManager } from "@/components/products/ProductManager";
import { Package } from "lucide-react";

const MigratedProducts = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Hero Section */}
          <div className="text-center mb-8 lg:mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-coral to-redAccent shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-darktext mb-4">
              Products Gallery
            </h1>
            <p className="text-lg lg:text-xl text-coolGray max-w-3xl mx-auto">
              Manage and view all your products in one centralized location. Track migrations and monitor your portfolio.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <ProductManager 
              title="All Products"
              showAddButton={true}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MigratedProducts;
